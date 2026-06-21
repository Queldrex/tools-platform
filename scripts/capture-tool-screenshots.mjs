/**
 * Captures real screenshots of every tool page on queldrex.com
 * Run: node scripts/capture-tool-screenshots.mjs
 * Output: public/tool-previews/<tool-slug>.png
 */

import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'tool-previews')
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

const BASE = 'https://queldrex.com'

const TOOLS = [
  { slug: 'scanner',              path: '/scanner' },
  { slug: 'citation-tracker',     path: '/tools/citation-tracker' },
  { slug: 'schema-generator',     path: '/tools/schema-generator' },
  { slug: 'robots-generator',     path: '/tools/robots-generator' },
  { slug: 'vibe-security',        path: '/tools/vibe-security' },
  { slug: 'api-schema-drift',     path: '/tools/api-schema-drift' },
  { slug: 'database-migration',   path: '/tools/database-migration' },
  { slug: 'breach-lookup',        path: '/tools/breach-lookup' },
  { slug: 'threat-feed',          path: '/tools/threat-feed' },
  { slug: 'password-generator',   path: '/tools/password-generator' },
  { slug: 'hash-generator',       path: '/tools/hash-generator' },
  { slug: 'json-formatter',       path: '/tools/json-formatter' },
  { slug: 'jwt-decoder',          path: '/tools/jwt-decoder' },
  { slug: 'base64',               path: '/tools/base64' },
  { slug: 'cron-builder',         path: '/tools/cron-builder' },
  { slug: 'tech-stack',           path: '/tools/tech-stack' },
  { slug: 'api-rate-limit',       path: '/tools/api-rate-limit' },
  { slug: 'directory-extractor',  path: '/tools/directory-extractor' },
  { slug: 'invoice-generator',    path: '/tools/invoice-generator' },
  { slug: 'url-shortener',        path: '/tools/url-shortener' },
  { slug: 'meeting-cost',         path: '/tools/meeting-cost' },
  { slug: 'uptime-calculator',    path: '/tools/uptime-calculator' },
  { slug: 'email-signature',      path: '/tools/email-signature' },
  { slug: 'color-palette',        path: '/tools/color-palette' },
  { slug: 'gdpr-generator',       path: '/tools/gdpr-generator' },
]

async function capture() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2, // retina quality
  })

  let ok = 0
  let fail = 0

  for (const tool of TOOLS) {
    const url = `${BASE}${tool.path}`
    const outPath = join(OUT_DIR, `${tool.slug}.png`)
    try {
      const page = await context.newPage()
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
      // Dismiss any overlays, wait for content to settle
      await page.waitForTimeout(1500)
      // Capture just the viewport (not full page) — shows the "above the fold" tool UI
      await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: 1280, height: 900 } })
      await page.close()
      console.log(`✓ ${tool.slug}`)
      ok++
    } catch (err) {
      console.error(`✗ ${tool.slug}: ${err.message}`)
      fail++
    }
  }

  await browser.close()
  console.log(`\nDone: ${ok} captured, ${fail} failed`)
  console.log(`Output: ${OUT_DIR}`)
}

capture().catch(err => { console.error(err); process.exit(1) })
