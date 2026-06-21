// Takes real browser screenshots of every tool page on queldrex.com
// Run: node scripts/screenshot-tools.js
// Output: public/tool-previews/*.png

const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')

const BASE_URL = 'https://queldrex.com'
const OUT_DIR = path.join(__dirname, '..', 'public', 'tool-previews')

const TOOLS = [
  // Security
  { slug: 'ssl-inspector',        file: 'ssl-inspector' },
  { slug: 'dep-scanner',          file: 'dep-scanner' },
  { slug: 'prompt-injection',     file: 'prompt-injection' },
  { slug: 'vibe-security',        file: 'vibe-security' },
  { slug: 'api-schema-drift',     file: 'api-schema-drift' },
  { slug: 'database-migration',   file: 'database-migration' },
  { slug: 'contract-scanner',     file: 'contract-scanner' },
  { slug: 'package-hallucination',file: 'package-hallucination' },
  { slug: 'breach-lookup',        file: 'breach-lookup' },
  { slug: 'threat-feed',          file: 'threat-feed' },
  { slug: 'password-generator',   file: 'password-generator' },
  { slug: 'hash-generator',       file: 'hash-generator' },
  // Developer
  { slug: 'dns-health',           file: 'dns-health' },
  { slug: 'email-deliverability', file: 'email-deliverability' },
  { slug: 'privacy-analyzer',     file: 'privacy-analyzer' },
  { slug: 'schema-validator',     file: 'schema-validator' },
  { slug: 'json-formatter',       file: 'json-formatter' },
  { slug: 'jwt-decoder',          file: 'jwt-decoder' },
  { slug: 'base64',               file: 'base64' },
  { slug: 'cron-builder',         file: 'cron-builder' },
  { slug: 'tech-stack',           file: 'tech-stack' },
  { slug: 'api-rate-limit',       file: 'api-rate-limit' },
  { slug: 'directory-extractor',  file: 'directory-extractor' },
  // Business
  { slug: 'business-name',        file: 'business-name' },
  { slug: 'saas-metrics',         file: 'saas-metrics' },
  { slug: 'break-even',           file: 'break-even' },
  { slug: 'roi-calculator',       file: 'roi-calculator' },
  { slug: 'cashflow',             file: 'cashflow' },
  { slug: 'saas-spend',           file: 'saas-spend' },
  { slug: 'invoice-fraud',        file: 'invoice-fraud' },
  { slug: 'agency-report',        file: 'agency-report' },
  { slug: 'ad-grader',            file: 'ad-grader' },
  { slug: 'subject-line',         file: 'subject-line' },
  { slug: 'invoice-generator',    file: 'invoice-generator' },
  { slug: 'url-shortener',        file: 'url-shortener' },
  { slug: 'meeting-cost',         file: 'meeting-cost' },
  { slug: 'uptime-calculator',    file: 'uptime-calculator' },
  { slug: 'email-signature',      file: 'email-signature' },
  { slug: 'color-palette',        file: 'color-palette' },
  { slug: 'gdpr-generator',       file: 'gdpr-generator' },
  // Documents
  { slug: 'nda-generator',        file: 'nda-generator' },
  { slug: 'tos-generator',        file: 'tos-generator' },
  { slug: 'refund-policy',        file: 'refund-policy' },
  { slug: 'proposal-generator',   file: 'proposal-generator' },
  { slug: 'job-description',      file: 'job-description' },
  // AI Visibility
  { slug: 'schema-generator',     file: 'schema-generator' },
  { slug: 'robots-generator',     file: 'robots-generator' },
]

async function shot(page, slug, file) {
  const url = `${BASE_URL}/tools/${slug}`
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 })
    // Wait for header to be visible so the page is rendered
    await page.waitForSelector('header', { timeout: 8000 }).catch(() => {})
    // Small settle delay for fonts/images
    await page.waitForTimeout(800)
    // Screenshot the top 500px — shows the tool form/hero, not empty space below
    await page.screenshot({
      path: path.join(OUT_DIR, `${file}.png`),
      clip: { x: 0, y: 0, width: 1280, height: 500 },
    })
    console.log(`✓ ${slug}`)
  } catch (e) {
    console.error(`✗ ${slug}: ${e.message}`)
  }
}

;(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1.5,  // retina — sharper screenshots
  })
  const page = await context.newPage()

  // Also screenshot the scanner landing page
  try {
    await page.goto(`${BASE_URL}/scanner`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(800)
    await page.screenshot({
      path: path.join(OUT_DIR, 'scanner.png'),
      clip: { x: 0, y: 0, width: 1280, height: 500 },
    })
    console.log('✓ scanner')
  } catch (e) {
    console.error(`✗ scanner: ${e.message}`)
  }

  for (const tool of TOOLS) {
    await shot(page, tool.slug, tool.file)
  }

  await browser.close()
  console.log(`\nDone. Screenshots saved to public/tool-previews/`)
})()
