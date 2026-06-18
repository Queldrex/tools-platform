import { Client as FtpClient } from 'basic-ftp'
import { parse as parseHtml } from 'node-html-parser'
import { v4 as uuidv4 } from 'uuid'
import type {
  ScanResult,
  ImplementationCredentials,
  ImplementationResult,
  ImplementedFile,
} from '@/lib/framework/types'

// ─── Robots.txt builder ────────────────────────────────────────────────────────

function buildRobotsTxt(existingContent: string | null, siteUrl: string): { content: string; action: 'created' | 'updated' } {
  const sitemapLine = `Sitemap: ${siteUrl}/sitemap.xml`

  if (!existingContent) {
    return {
      content: `User-agent: *\nAllow: /\n\n${sitemapLine}\n`,
      action: 'created',
    }
  }

  // Already has sitemap directive?
  if (existingContent.toLowerCase().includes('sitemap:')) {
    return { content: existingContent, action: 'updated' }
  }

  return {
    content: existingContent.trimEnd() + `\n\n${sitemapLine}\n`,
    action: 'updated',
  }
}

// ─── HTML JSON-LD injector ────────────────────────────────────────────────────

function injectJsonLd(html: string, jsonLd: string): string | null {
  const jsonLdScript = `<script type="application/ld+json">\n${jsonLd}\n</script>`

  // Inject before </head>
  if (html.includes('</head>')) {
    return html.replace('</head>', `${jsonLdScript}\n</head>`)
  }
  // Fallback: inject before </body>
  if (html.includes('</body>')) {
    return html.replace('</body>', `${jsonLdScript}\n</body>`)
  }
  return null
}

// ─── FTP Implementation ───────────────────────────────────────────────────────

const WEBROOT_CANDIDATES = [
  '/public_html',
  '/public_html/public',
  '/www',
  '/htdocs',
  '/web',
  '/html',
  '/',
]

async function detectWebRoot(client: FtpClient, providedRoot?: string): Promise<string> {
  if (providedRoot) return providedRoot

  for (const candidate of WEBROOT_CANDIDATES) {
    try {
      const list = await client.list(candidate)
      // Check for common web root indicators
      const names = list.map(f => f.name.toLowerCase())
      if (
        names.includes('index.html') ||
        names.includes('index.php') ||
        names.includes('wp-config.php') ||
        names.includes('robots.txt')
      ) {
        return candidate
      }
    } catch {
      // Not accessible — try next
    }
  }

  // Default to root if we can't detect
  return '/'
}

async function ftpReadFile(client: FtpClient, path: string): Promise<string | null> {
  try {
    const chunks: Buffer[] = []
    const stream = new (await import('stream')).PassThrough()
    stream.on('data', (chunk: Buffer) => chunks.push(chunk))

    const result = await client.downloadTo(stream, path)
    if (result.code >= 400) return null

    return Buffer.concat(chunks).toString('utf-8')
  } catch {
    return null
  }
}

async function ftpWriteFile(client: FtpClient, path: string, content: string): Promise<boolean> {
  try {
    const { Readable } = await import('stream')
    const stream = Readable.from([Buffer.from(content, 'utf-8')])
    const result = await client.uploadFrom(stream, path)
    return result.code < 400
  } catch {
    return false
  }
}

async function implementViaFtp(
  scan: ScanResult,
  creds: Extract<ImplementationCredentials, { platform: 'ftp' }>
): Promise<{ files: ImplementedFile[]; errors: string[] }> {
  const files: ImplementedFile[] = []
  const errors: string[] = []
  const client = new FtpClient(15000)

  try {
    await client.access({
      host: creds.host,
      port: creds.port ?? 21,
      user: creds.username,
      password: creds.password,
      secure: creds.secure ?? false,
    })

    const webRoot = await detectWebRoot(client, creds.webRoot)

    // 1. Upload llms.txt
    const llmsPath = `${webRoot}/llms.txt`.replace('//', '/')
    const llmsOk = await ftpWriteFile(client, llmsPath, scan.generatedLlmsTxt)
    files.push({
      path: llmsPath,
      action: llmsOk ? 'created' : 'skipped',
      note: llmsOk ? undefined : 'Upload failed',
    })
    if (!llmsOk) errors.push(`Failed to upload llms.txt to ${llmsPath}`)

    // 2. robots.txt
    const robotsPath = `${webRoot}/robots.txt`.replace('//', '/')
    const existingRobots = await ftpReadFile(client, robotsPath)
    const { content: robotsContent, action: robotsAction } = buildRobotsTxt(existingRobots, scan.url)
    const robotsOk = await ftpWriteFile(client, robotsPath, robotsContent)
    files.push({
      path: robotsPath,
      action: robotsOk ? robotsAction : 'skipped',
      note: robotsOk ? undefined : 'Upload failed',
    })
    if (!robotsOk) errors.push(`Failed to write robots.txt to ${robotsPath}`)

    // 3. Detect if WordPress — if so, upload JSON-LD as a mu-plugin instead of editing HTML
    const wpConfig = await ftpReadFile(client, `${webRoot}/wp-config.php`.replace('//', '/'))
    const isWordPress = wpConfig !== null

    if (isWordPress) {
      const pluginDir = `${webRoot}/wp-content/mu-plugins`.replace('//', '/')
      const pluginPath = `${pluginDir}/queldrex-ai.php`
      const pluginContent = buildWordPressPlugin(scan.generatedJsonLd, scan.businessInfo.domain)

      // Create mu-plugins dir if needed (FTP ignores errors if it exists)
      try { await client.ensureDir(pluginDir) } catch { /* may already exist */ }

      const pluginOk = await ftpWriteFile(client, pluginPath, pluginContent)
      files.push({
        path: pluginPath,
        action: pluginOk ? 'created' : 'skipped',
        note: pluginOk ? 'Auto-loaded WordPress mu-plugin — no activation needed' : 'Upload failed',
      })
      if (!pluginOk) errors.push(`Failed to upload WordPress plugin to ${pluginPath}`)
    } else {
      // 4. Inject JSON-LD into homepage HTML
      for (const indexFile of ['index.html', 'index.htm']) {
        const indexPath = `${webRoot}/${indexFile}`.replace('//', '/')
        const html = await ftpReadFile(client, indexPath)
        if (!html) continue

        // Skip if JSON-LD already present
        if (html.includes('application/ld+json')) {
          files.push({ path: indexPath, action: 'skipped', note: 'JSON-LD already present' })
          break
        }

        const modified = injectJsonLd(html, scan.generatedJsonLd)
        if (!modified) {
          errors.push(`Could not find </head> or </body> in ${indexPath}`)
          break
        }

        const uploadOk = await ftpWriteFile(client, indexPath, modified)
        files.push({
          path: indexPath,
          action: uploadOk ? 'updated' : 'skipped',
          note: uploadOk ? 'Injected LocalBusiness JSON-LD into <head>' : 'Upload failed',
        })
        if (!uploadOk) errors.push(`Failed to re-upload ${indexPath} after JSON-LD injection`)
        break
      }
    }
  } catch (err) {
    errors.push(err instanceof Error ? err.message : 'FTP connection failed')
  } finally {
    client.close()
  }

  return { files, errors }
}

// ─── WordPress REST API Implementation ───────────────────────────────────────

async function implementViaWordPress(
  scan: ScanResult,
  creds: Extract<ImplementationCredentials, { platform: 'wordpress' }>
): Promise<{ files: ImplementedFile[]; errors: string[] }> {
  const files: ImplementedFile[] = []
  const errors: string[] = []

  const base = creds.siteUrl.replace(/\/$/, '')
  const auth = Buffer.from(`${creds.username}:${creds.appPassword}`).toString('base64')
  const headers = {
    Authorization: `Basic ${auth}`,
    'Content-Type': 'application/json',
  }

  // 1. Check WP REST API is accessible
  try {
    const check = await fetch(`${base}/wp-json/wp/v2/`, { headers })
    if (!check.ok) {
      errors.push(`WordPress REST API not accessible at ${base}/wp-json/ (${check.status})`)
      return { files, errors }
    }
  } catch (err) {
    errors.push(`Cannot reach WordPress site: ${err instanceof Error ? err.message : 'connection failed'}`)
    return { files, errors }
  }

  // 2. Inject JSON-LD via wp_head using custom settings
  // We store the JSON-LD in a WP option and output it via REST API settings
  try {
    const optRes = await fetch(`${base}/wp-json/wp/v2/settings`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        queldrex_json_ld: scan.generatedJsonLd,
      }),
    })

    if (optRes.ok) {
      files.push({
        path: `${base}/ (wp_options: queldrex_json_ld)`,
        action: 'created',
        note: 'JSON-LD stored in WordPress options — requires Queldrex plugin to output to <head>',
      })
    } else {
      // Settings API doesn't support custom keys by default — fall back to creating a custom plugin note
      files.push({
        path: `${base}/ (JSON-LD)`,
        action: 'skipped',
        note: 'WordPress Settings API requires a registered option. Upload the plugin ZIP manually.',
      })
    }
  } catch (err) {
    errors.push(`WordPress settings API error: ${err instanceof Error ? err.message : 'unknown'}`)
  }

  // 3. Check if llms.txt exists (WordPress can serve static files from root)
  try {
    const llmsCheck = await fetch(`${base}/llms.txt`)
    if (llmsCheck.ok && llmsCheck.status === 200) {
      files.push({ path: `${base}/llms.txt`, action: 'skipped', note: 'Already exists' })
    } else {
      // Cannot upload llms.txt via WP REST API — instruct manual upload or FTP
      files.push({
        path: `${base}/llms.txt`,
        action: 'skipped',
        note: 'llms.txt cannot be uploaded via WordPress REST API — use FTP credentials or the manual package',
      })
      errors.push('llms.txt requires FTP access or manual upload to WordPress root directory')
    }
  } catch {
    errors.push('Could not check llms.txt status')
  }

  return { files, errors }
}

// ─── WordPress mu-plugin builder ─────────────────────────────────────────────

function buildWordPressPlugin(jsonLd: string, domain: string): string {
  const escaped = jsonLd.replace(/'/g, "\\'").replace(/\n/g, '\\n')
  return `<?php
/**
 * Plugin Name: Queldrex AI Visibility
 * Description: Outputs LocalBusiness JSON-LD schema for AI search discoverability
 * Version: 1.0
 * Auto-generated by Queldrex AI Visibility Scanner for ${domain}
 */

add_action('wp_head', 'queldrex_output_json_ld', 1);
function queldrex_output_json_ld() {
  $json_ld = '${escaped}';
  echo '<script type="application/ld+json">' . $json_ld . '</script>' . "\\n";
}
`
}

// ─── Manual Package (Vercel, Netlify, GitHub Pages, etc.) ────────────────────

function buildManualInstructions(scan: ScanResult): string {
  return `# Queldrex AI Visibility Fix Package
# Generated: ${new Date().toISOString()}
# Site: ${scan.url}
# Score before: ${scan.score}/100

## What to do

### 1. llms.txt — Upload to your web root
   File: llms.txt (included in your ZIP)
   Deploy to: ${scan.url}/llms.txt

   For Vercel/Next.js:   place in /public/llms.txt
   For Netlify:          place in /public/llms.txt or /static/llms.txt
   For GitHub Pages:     place in repo root /llms.txt
   For Cloudflare Pages: place in /public/llms.txt

### 2. JSON-LD Schema — Add to your <head>
   File: schema.json (included in your ZIP — paste the <script> tag)

   For Next.js App Router: paste in app/layout.tsx inside <head>
   For Next.js Pages:      paste in pages/_document.tsx inside <Head>
   For HTML sites:         paste before </head> in every page
   For WordPress:          use SEOPress or paste into theme header.php

### 3. robots.txt — Create or update
   Add this to your existing robots.txt (or create it at ${scan.url}/robots.txt):

   User-agent: *
   Allow: /
   Sitemap: ${scan.url}/sitemap.xml

After deploying, re-scan at https://queldrex.com/scanner to verify your score improved.
Questions? hello@queldrex.com
`
}

// ─── Main implementation entry point ─────────────────────────────────────────

export async function implementFixes(
  scan: ScanResult,
  credentials: ImplementationCredentials
): Promise<ImplementationResult> {
  const implementationId = uuidv4()
  const startedAt = new Date().toISOString()

  let files: ImplementedFile[] = []
  let errors: string[] = []

  if (credentials.platform === 'ftp') {
    const result = await implementViaFtp(scan, credentials)
    files = result.files
    errors = result.errors
  } else if (credentials.platform === 'wordpress') {
    const result = await implementViaWordPress(scan, credentials)
    files = result.files
    errors = result.errors
  } else {
    // Manual package
    const instructions = buildManualInstructions(scan)
    files = [
      { path: 'DEPLOYMENT.md', action: 'created', note: 'Step-by-step deployment guide' },
      { path: 'llms.txt', action: 'created', note: `Upload to ${scan.url}/llms.txt` },
      { path: 'schema.json', action: 'created', note: 'Paste <script> tag into your <head>' },
      { path: 'robots.txt', action: 'created', note: 'Add Sitemap directive to your robots.txt' },
    ]
    // Return instructions in the result for the caller to include in the ZIP
    ;(files as (ImplementedFile & { content?: string })[]).forEach(f => {
      if (f.path === 'DEPLOYMENT.md') (f as ImplementedFile & { content?: string }).content = instructions
    })
  }

  const implementedCount = files.filter(f => f.action !== 'skipped').length
  const status = errors.length === 0
    ? 'success'
    : implementedCount > 0
      ? 'partial'
      : 'failed'

  return {
    implementationId,
    scanId: scan.scanId,
    platform: credentials.platform,
    domain: scan.businessInfo.domain,
    beforeScore: scan.score,
    filesImplemented: files,
    errors,
    startedAt,
    completedAt: new Date().toISOString(),
    status,
  }
}
