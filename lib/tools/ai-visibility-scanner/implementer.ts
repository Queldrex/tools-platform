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

  // 2. Create mu-plugin for JSON-LD via WordPress File API
  // mu-plugins auto-load without activation — safest WP injection method
  try {
    const pluginContent = buildWordPressPlugin(scan.generatedJsonLd, scan.businessInfo.domain)

    // WordPress doesn't have a REST endpoint to write plugin files — note limitation
    files.push({
      path: `wp-content/mu-plugins/queldrex-ai.php`,
      action: 'skipped',
      note: 'Upload queldrex-ai.php to wp-content/mu-plugins/ via FTP or File Manager — it will auto-activate',
    })
    // Attach the plugin file content so the admin email can include it
    ;(files[files.length - 1] as ImplementedFile & { content?: string }).content = pluginContent
  } catch (err) {
    errors.push(`WordPress plugin build failed: ${err instanceof Error ? err.message : 'unknown'}`)
  }

  // 3. Check if llms.txt already exists
  try {
    const llmsCheck = await fetch(`${base}/llms.txt`)
    if (llmsCheck.ok) {
      files.push({ path: `${base}/llms.txt`, action: 'skipped', note: 'Already exists — no action needed' })
    } else {
      files.push({
        path: `${base}/llms.txt`,
        action: 'skipped',
        note: 'Upload llms.txt to your WordPress root directory via FTP or cPanel File Manager',
      })
      errors.push('llms.txt requires FTP/File Manager upload to WordPress root — cannot be written via REST API')
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

// ─── GitHub API Implementation (Vercel, Netlify, GitHub Pages) ──────────────

const GITHUB_PUBLIC_DIR_CANDIDATES = ['public', 'static', 'docs', 'dist', 'out', '']

async function githubRequest(token: string, path: string, method = 'GET', body?: unknown) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      'User-Agent': 'Queldrex-AI-Scanner/1.0',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`GitHub API ${method} ${path}: ${res.status} — ${(err as { message?: string }).message || 'error'}`)
  }
  return res.json()
}

async function githubGetFileSha(token: string, repo: string, branch: string, path: string): Promise<string | null> {
  try {
    const data = await githubRequest(token, `/repos/${repo}/contents/${path}?ref=${branch}`) as { sha?: string }
    return data.sha || null
  } catch {
    return null
  }
}

async function githubUpsertFile(
  token: string,
  repo: string,
  branch: string,
  path: string,
  content: string,
  message: string
): Promise<'created' | 'updated'> {
  const existingSha = await githubGetFileSha(token, repo, branch, path)
  const encoded = Buffer.from(content, 'utf-8').toString('base64')

  await githubRequest(token, `/repos/${repo}/contents/${path}`, 'PUT', {
    message,
    content: encoded,
    branch,
    ...(existingSha ? { sha: existingSha } : {}),
  })

  return existingSha ? 'updated' : 'created'
}

async function detectGitHubPublicDir(token: string, repo: string, branch: string): Promise<string> {
  for (const dir of GITHUB_PUBLIC_DIR_CANDIDATES) {
    try {
      const path = dir ? `/repos/${repo}/contents/${dir}?ref=${branch}` : `/repos/${repo}/contents?ref=${branch}`
      const contents = await githubRequest(token, path) as unknown[]
      if (Array.isArray(contents)) return dir
    } catch {
      // not found — try next
    }
  }
  return 'public'
}

async function implementViaGitHub(
  scan: ScanResult,
  creds: Extract<ImplementationCredentials, { platform: 'github' }>
): Promise<{ files: ImplementedFile[]; errors: string[] }> {
  const files: ImplementedFile[] = []
  const errors: string[] = []
  const branch = creds.branch || 'main'

  try {
    // Verify token + repo access
    await githubRequest(creds.token, `/repos/${creds.repo}`)
  } catch (err) {
    errors.push(`Cannot access ${creds.repo}: ${err instanceof Error ? err.message : 'check your token and repo name'}`)
    return { files, errors }
  }

  const publicDir = creds.publicDir !== undefined
    ? creds.publicDir
    : await detectGitHubPublicDir(creds.token, creds.repo, branch)

  const rootPrefix = publicDir ? `${publicDir}/` : ''

  // 1. llms.txt → /public/llms.txt (or repo root)
  try {
    const action = await githubUpsertFile(
      creds.token, creds.repo, branch,
      `${rootPrefix}llms.txt`,
      scan.generatedLlmsTxt,
      'feat: add llms.txt for AI search discoverability (Queldrex)'
    )
    files.push({ path: `${rootPrefix}llms.txt`, action, note: `Deployed to ${scan.url}/llms.txt` })
  } catch (err) {
    errors.push(`llms.txt upload failed: ${err instanceof Error ? err.message : 'unknown'}`)
  }

  // 2. robots.txt
  try {
    const existingRobotsRes = await fetch(`${scan.url}/robots.txt`)
    const existingRobots = existingRobotsRes.ok ? await existingRobotsRes.text() : null
    const { content: robotsContent, action: robotsAction } = buildRobotsTxt(existingRobots, scan.url)

    const action = await githubUpsertFile(
      creds.token, creds.repo, branch,
      `${rootPrefix}robots.txt`,
      robotsContent,
      'feat: add/update robots.txt with sitemap reference (Queldrex)'
    )
    files.push({ path: `${rootPrefix}robots.txt`, action: action === 'updated' ? 'updated' : robotsAction, note: 'Sitemap reference added' })
  } catch (err) {
    errors.push(`robots.txt failed: ${err instanceof Error ? err.message : 'unknown'}`)
  }

  // 3. JSON-LD — inject into layout file if detectable, else create schema snippet
  // Try common layout files
  const layoutCandidates = [
    'app/layout.tsx', 'app/layout.jsx', 'app/layout.js',
    'pages/_document.tsx', 'pages/_document.jsx', 'pages/_document.js',
    'src/app/layout.tsx', 'src/pages/_document.tsx',
  ]

  let injectedLayout = false
  for (const layoutPath of layoutCandidates) {
    try {
      const existing = await githubRequest(creds.token, `/repos/${creds.repo}/contents/${layoutPath}?ref=${branch}`) as { content?: string; sha?: string }
      if (!existing.content) continue

      const currentCode = Buffer.from(existing.content.replace(/\n/g, ''), 'base64').toString('utf-8')
      if (currentCode.includes('application/ld+json')) {
        files.push({ path: layoutPath, action: 'skipped', note: 'JSON-LD already present' })
        injectedLayout = true
        break
      }

      // Inject before </head> or return statement
      const jsonLdSnippet = `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(${scan.generatedJsonLd}) }} />`
      let modified: string | null = null

      if (currentCode.includes('</head>')) {
        modified = currentCode.replace('</head>', `${jsonLdSnippet}\n</head>`)
      } else if (currentCode.includes('<head>')) {
        modified = currentCode.replace('<head>', `<head>\n${jsonLdSnippet}`)
      }

      if (modified) {
        await githubUpsertFile(
          creds.token, creds.repo, branch,
          layoutPath, modified,
          'feat: inject LocalBusiness JSON-LD schema (Queldrex)'
        )
        files.push({ path: layoutPath, action: 'updated', note: 'Injected LocalBusiness JSON-LD into <head>' })
        injectedLayout = true
        break
      }
    } catch {
      // file not found — try next
    }
  }

  if (!injectedLayout) {
    // Create a standalone schema snippet file with instructions
    const schemaSnippet = `<!-- Paste this into your site's <head> section -->\n<script type="application/ld+json">\n${scan.generatedJsonLd}\n</script>`
    try {
      await githubUpsertFile(
        creds.token, creds.repo, branch,
        'queldrex-schema.html',
        schemaSnippet,
        'feat: add JSON-LD schema snippet (Queldrex) — paste into <head>'
      )
      files.push({ path: 'queldrex-schema.html', action: 'created', note: 'Paste contents into your site <head> — could not auto-inject' })
    } catch (err) {
      errors.push(`JSON-LD schema file failed: ${err instanceof Error ? err.message : 'unknown'}`)
    }
  }

  return { files, errors }
}

// ─── Shopify Implementation ──────────────────────────────────────────────────

async function implementViaShopify(
  scan: ScanResult,
  creds: Extract<ImplementationCredentials, { platform: 'shopify' }>
): Promise<{ files: ImplementedFile[]; errors: string[] }> {
  const files: ImplementedFile[] = []
  const errors: string[] = []
  const store = creds.storeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const headers = {
    'X-Shopify-Access-Token': creds.apiToken,
    'Content-Type': 'application/json',
  }

  // 1. Get active theme
  let themeId: string
  try {
    const themes = await fetch(`https://${store}/admin/api/2024-01/themes.json`, { headers })
    if (!themes.ok) throw new Error(`${themes.status} — check your API token and store URL`)
    const data = await themes.json() as { themes: { id: number; role: string }[] }
    const active = data.themes.find(t => t.role === 'main')
    if (!active) throw new Error('No active theme found')
    themeId = String(active.id)
  } catch (err) {
    errors.push(`Shopify theme access failed: ${err instanceof Error ? err.message : 'unknown'}`)
    return { files, errors }
  }

  // 2. Get theme.liquid and inject JSON-LD
  try {
    const assetRes = await fetch(`https://${store}/admin/api/2024-01/themes/${themeId}/assets.json?asset[key]=layout/theme.liquid`, { headers })
    if (!assetRes.ok) throw new Error('Could not read theme.liquid')

    const assetData = await assetRes.json() as { asset?: { value?: string } }
    const themeLiquid = assetData.asset?.value || ''

    if (themeLiquid.includes('application/ld+json')) {
      files.push({ path: 'layout/theme.liquid', action: 'skipped', note: 'JSON-LD already present' })
    } else {
      const jsonLdTag = `<script type="application/ld+json">{{ ${JSON.stringify(scan.generatedJsonLd)} | json }}</script>`
      const modified = themeLiquid.includes('</head>')
        ? themeLiquid.replace('</head>', `${jsonLdTag}\n</head>`)
        : themeLiquid

      const updateRes = await fetch(`https://${store}/admin/api/2024-01/themes/${themeId}/assets.json`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ asset: { key: 'layout/theme.liquid', value: modified } }),
      })
      if (!updateRes.ok) throw new Error('Could not update theme.liquid')
      files.push({ path: 'layout/theme.liquid', action: 'updated', note: 'Injected JSON-LD into <head>' })
    }
  } catch (err) {
    errors.push(`theme.liquid update failed: ${err instanceof Error ? err.message : 'unknown'}`)
  }

  // 3. llms.txt on Shopify — Shopify cannot serve files at domain root (/llms.txt).
  // Best available option: create a page template served at /pages/llms-txt.
  // AI bots that check /llms.txt won't find it, but we document the limitation clearly.
  try {
    const llmsPageRes = await fetch(`https://${store}/admin/api/2024-01/themes/${themeId}/assets.json`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        asset: {
          key: 'templates/page.llms-txt.liquid',
          value: `<pre>{{ page.content }}</pre>`,
        },
      }),
    })
    if (llmsPageRes.ok) {
      files.push({
        path: 'templates/page.llms-txt.liquid',
        action: 'created',
        note: 'Shopify cannot serve /llms.txt from domain root. Create a Page in Shopify Admin with handle "llms-txt" and paste your llms.txt content there. It will be accessible at /pages/llms-txt. Consider Cloudflare Workers to proxy /llms.txt if needed.',
      })
      errors.push('Shopify limitation: /llms.txt cannot be served from the domain root — a page template was created as the closest alternative')
    }
  } catch {
    errors.push('llms.txt page template upload failed — Shopify does not support serving files from domain root')
  }

  return { files, errors }
}

// ─── Manual Package (Wix, Squarespace, Webflow, etc.) ────────────────────

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
   File: schema-install.html (included in your ZIP — paste the <script> tag)

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
  } else if (credentials.platform === 'github') {
    const result = await implementViaGitHub(scan, credentials)
    files = result.files
    errors = result.errors
  } else if (credentials.platform === 'shopify') {
    const result = await implementViaShopify(scan, credentials)
    files = result.files
    errors = result.errors
  } else {
    // Manual package
    const instructions = buildManualInstructions(scan)
    files = [
      { path: 'DEPLOYMENT.md', action: 'created', note: 'Step-by-step deployment guide' },
      { path: 'llms.txt', action: 'created', note: `Upload to ${scan.url}/llms.txt` },
      { path: 'schema-install.html', action: 'created', note: 'Paste <script> tag into your <head>' },
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
