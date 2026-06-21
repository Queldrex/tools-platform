#!/usr/bin/env node
/**
 * Queldrex tool smoke-test suite.
 * Usage: node scripts/test-tools.mjs [base-url]
 * Default base URL: http://localhost:3000
 * Production:       node scripts/test-tools.mjs https://queldrex.com
 */

const BASE = process.argv[2] ?? 'http://localhost:3000'

const GREEN  = '\x1b[32m'
const RED    = '\x1b[31m'
const YELLOW = '\x1b[33m'
const DIM    = '\x1b[2m'
const RESET  = '\x1b[0m'
const BOLD   = '\x1b[1m'

let passed = 0, failed = 0, skipped = 0

async function hit(method, path, body, { expectField = null } = {}) {
  const url = `${BASE}${path}`
  const opts = { method, headers: { 'Content-Type': 'application/json' } }
  if (body) opts.body = JSON.stringify(body)
  const t0 = Date.now()
  try {
    const res = await fetch(url, opts)
    const ms  = Date.now() - t0
    let json
    try { json = JSON.parse(await res.text()) } catch { /* not json */ }
    if (res.status !== 200) return { ok: false, reason: `HTTP ${res.status}`, ms, json }
    if (expectField && (!json || !(expectField in json))) return { ok: false, reason: `Missing field "${expectField}"`, ms, json }
    if (json?.error) return { ok: false, reason: `API error: ${json.error}`, ms, json }
    return { ok: true, ms, json }
  } catch (e) {
    return { ok: false, reason: e.message, ms: Date.now() - t0 }
  }
}

function row(label, result) {
  const icon = result.skip ? `${YELLOW}SKIP${RESET}` : result.ok ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`
  const time = result.ms != null ? `${DIM}${result.ms}ms${RESET}` : '    '
  const note = result.skip ? `${DIM}${result.skip}${RESET}` : result.ok ? '' : `${RED}${result.reason}${RESET}`
  console.log(`  ${icon}  ${label.padEnd(44)} ${time}  ${note}`)
  if (result.skip) skipped++
  else if (result.ok) passed++
  else failed++
}

function section(name) {
  console.log(`\n${BOLD}── ${name}${RESET}`)
}

console.log(`\n${BOLD}Queldrex Tool Test Suite${RESET}`)
console.log(`${DIM}Target: ${BASE}${RESET}`)

// ── Client-side pages (just check they load) ──────────────────────────────
section('Client-side tools (page loads)')
for (const p of [
  '/tools/json-formatter', '/tools/jwt-decoder', '/tools/base64',
  '/tools/hash-generator', '/tools/password-generator', '/tools/cron-builder',
  '/tools/color-palette', '/tools/meeting-cost', '/tools/uptime-calculator',
  '/tools/email-signature', '/tools/invoice-generator', '/tools/api-rate-limit',
  '/tools/robots-generator', '/tools/schema-generator', '/tools/gdpr-generator',
]) {
  const t0 = Date.now()
  const r = await fetch(`${BASE}${p}`).catch(e => ({ status: 0, _err: e.message }))
  row(p, { ok: r.status === 200, ms: Date.now() - t0, reason: r.status !== 200 ? `HTTP ${r.status}` : '' })
}

// ── DNS / Network ─────────────────────────────────────────────────────────
section('DNS / Network')
row('dns-health: google.com',
  await hit('POST', '/api/tools/dns-health', { domain: 'google.com' }, { expectField: 'records' }))
row('ssl-inspector: google.com',
  await hit('POST', '/api/tools/ssl-inspector', { hostname: 'google.com' }))
row('email-deliverability: google.com',
  await hit('POST', '/api/tools/email-deliverability', { domain: 'google.com' }))
row('http-headers: queldrex.com',
  await hit('POST', '/api/tools/http-headers', { url: 'https://queldrex.com' }))
row('directory-extractor: queldrex.com',
  await hit('POST', '/api/tools/directory-extractor', { url: 'https://queldrex.com' }))
row('tech-stack: vercel.com',
  await hit('POST', '/api/tools/tech-stack', { url: 'https://vercel.com' }))
row('og-previewer: queldrex.com',
  await hit('POST', '/api/tools/og-previewer', { url: 'https://queldrex.com' }))

// ── Security ──────────────────────────────────────────────────────────────
section('Security')
row('vibe-security: SQL injection code',
  await hit('POST', '/api/tools/vibe-security', {
    code: 'const q = `SELECT * FROM users WHERE id = ${id}`',
    language: 'javascript'
  }))
row('api-schema-drift: identical specs',
  await hit('POST', '/api/tools/api-schema-drift', {
    specA: '{"openapi":"3.0.0","info":{"title":"A","version":"1"},"paths":{}}',
    specB: '{"openapi":"3.0.0","info":{"title":"A","version":"1"},"paths":{}}'
  }))
row('dep-scanner: lodash 4.17.20 (known CVE)',
  await hit('POST', '/api/tools/dep-scanner', {
    manifest: '{"dependencies":{"lodash":"4.17.20"}}', type: 'npm'
  }))
row('prompt-injection: benign prompt',
  await hit('POST', '/api/tools/prompt-injection', { prompt: 'What is the weather today?' }))
row('contract-scanner: IP clause',
  await hit('POST', '/api/tools/contract-scanner', {
    text: 'All intellectual property created by contractor becomes sole property of company.'
  }))
row('package-hallucination: react + fake-pkg',
  await hit('POST', '/api/tools/package-hallucination', {
    packages: [{ name: 'react', ecosystem: 'npm' }, { name: 'totally-fake-pkg-xyz', ecosystem: 'npm' }]
  }))
row('database-migration: DROP TABLE',
  await hit('POST', '/api/tools/database-migration', { sql: 'DROP TABLE users;' }))
row('schema-validator: queldrex.com',
  await hit('POST', '/api/tools/schema-validator', { url: 'https://queldrex.com' }))
row('privacy-analyzer: queldrex.com/privacy',
  await hit('POST', '/api/tools/privacy-analyzer', { url: 'https://queldrex.com/privacy' }))

// ── Breach / Threat ───────────────────────────────────────────────────────
section('Breach / Threat')
row('breach-lookup: test@example.com',
  await hit('POST', '/api/breach-lookup', { email: 'test@example.com' }))
row('threat-feed (GET)',
  await hit('GET', '/api/threat-feed'))

// ── Business / Finance ────────────────────────────────────────────────────
section('Business / Finance')
row('break-even: $10k fixed, $25 var, $75 price',
  await hit('POST', '/api/tools/break-even', { fixedCosts: 10000, variableCost: 25, salePrice: 75 }))
row('roi-calculator: $5k invest, $1.5k/yr return',
  await hit('POST', '/api/tools/roi-calculator', { initialInvestment: 5000, annualReturn: 1500, years: 5 }))
row('cashflow: 3-month projection',
  await hit('POST', '/api/tools/cashflow', {
    months: [{ revenue: 10000, expenses: 8000 }, { revenue: 12000, expenses: 8500 }]
  }))
row('saas-metrics: MRR 50k, churn 3%',
  await hit('POST', '/api/tools/saas-metrics', { mrr: 50000, churnRate: 3, cac: 500, ltv: 2000 }))
row('saas-spend: CSV input',
  await hit('POST', '/api/tools/saas-spend', {
    csv: 'Date,Description,Amount\n2024-01-01,GitHub,21\n2024-01-01,Slack,15'
  }))
row('invoice-fraud: sample invoice',
  await hit('POST', '/api/tools/invoice-fraud', {
    invoiceText: 'Invoice #1001\nABC Corp\nAmount: $1000.00\nBank: 123456789'
  }))

// ── AI / Document generators ──────────────────────────────────────────────
section('AI / Document generators')
row('nda-generator: mutual, CO',
  await hit('POST', '/api/tools/nda-generator', {
    type: 'mutual', party1: 'Acme Corp', party2: 'Beta LLC',
    purpose: 'Software development', state: 'Colorado'
  }))
row('tos-generator: SaaS CO',
  await hit('POST', '/api/tools/tos-generator', {
    companyName: 'Queldrex LLC', productName: 'Queldrex', productType: 'saas', state: 'Colorado'
  }))
row('refund-policy: 7-day SaaS',
  await hit('POST', '/api/tools/refund-policy', {
    companyName: 'Queldrex LLC', productType: 'saas', refundWindow: 7
  }))
row('business-name: queldrex',
  await hit('POST', '/api/tools/business-name', { name: 'queldrex' }))
row('ad-grader: sample headline',
  await hit('POST', '/api/tools/ad-grader', {
    headline: 'Stop Losing Leads to Bad Email Deliverability',
    body: 'Check your DNS records in 10 seconds — free.'
  }))
row('subject-line: test subject',
  await hit('POST', '/api/tools/subject-line', {
    subject: 'Your DNS records are broken — here is how to fix them in 60 seconds'
  }))
row('job-description: senior engineer',
  await hit('POST', '/api/tools/job-description', {
    role: 'Senior Software Engineer', company: 'Queldrex LLC', remote: true
  }))
row('proposal-generator: web dev $15k',
  await hit('POST', '/api/tools/proposal-generator', {
    clientName: 'Acme Corp', projectType: 'Web application', budget: 15000, timeline: '3 months'
  }))
row('agency-report: Jan 2026',
  await hit('POST', '/api/tools/agency-report', {
    clientName: 'Acme Corp', month: 'January 2026',
    wins: ['Improved email deliverability', 'Fixed DNS records', 'Reduced CVEs to 0']
  }))

// ── URL Shortener (full flow) ──────────────────────────────────────────────
section('URL Shortener (full flow)')
const shortResult = await hit('POST', '/api/tools/url-shortener',
  { url: 'https://queldrex.com/tools' }, { expectField: 'shortUrl' })
row('create short URL', shortResult)
if (shortResult.ok && shortResult.json?.code) {
  const code = shortResult.json.code
  const t0 = Date.now()
  const redir = await fetch(`${BASE}/s/${code}`, { redirect: 'manual' })
  row(`redirect /s/${code} → 301/302/307`,
    { ok: [301,302,307].includes(redir.status), ms: Date.now()-t0,
      reason: `Got HTTP ${redir.status}` })
  row('click stats GET',
    await hit('GET', `/api/tools/url-shortener?code=${code}`, null, { expectField: 'clicks' }))
}

// ── Summary ───────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`)
console.log(`${BOLD}Results${RESET}   ${GREEN}${passed} passed${RESET}  ${RED}${failed} failed${RESET}  ${YELLOW}${skipped} skipped${RESET}  ${DIM}(${passed+failed+skipped} total)${RESET}`)
if (failed > 0) {
  console.log(`\n${RED}${BOLD}${failed} test(s) failed.${RESET}`)
  process.exit(1)
}
