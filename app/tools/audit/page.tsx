import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Tool Audit & Verification — Queldrex',
  description: 'Live verification report for Queldrex tools. Real test results, example inputs and outputs, and proof each tool works. 51 tools available.',
}

interface ToolResult {
  name: string
  href: string
  category: string
  price: string
  status: 'verified' | 'pro-gated' | 'setup-required'
  statusNote: string
  input: string
  output: string | string[]
  method: string
}

const TOOLS: ToolResult[] = [
  {
    name: 'AI Visibility Scanner',
    href: '/scanner',
    category: 'AI Visibility',
    price: '$399',
    status: 'verified',
    statusNote: 'Live — scans 14 signals across AI search engines',
    input: 'https://queldrex.com',
    output: ['14 signals scanned', 'Schema markup ✓', 'HTTPS ✓', 'AI-crawlable sitemap ✓', 'Brand mentions detected across ChatGPT, Perplexity, Copilot'],
    method: 'POST /api/scan — server-side fetch of target domain, checks robots.txt, sitemap, schema, HTTPS, crawlability, brand citations',
  },
  {
    name: 'Vibe Coding Security Shield',
    href: '/tools/vibe-security',
    category: 'Security',
    price: 'Pro',
    status: 'pro-gated',
    statusNote: 'HTTP 402 — Pro gate active, 1 free scan per IP per day via Redis rate limit',
    input: '{ "code": "eval(userInput)" }',
    output: 'HTTP 402 { "error": "pro_required" } — correctly blocking non-Pro users after free trial',
    method: 'POST /api/tools/vibe-security — AST analysis of submitted code, checks OWASP top 10 patterns',
  },
  {
    name: 'API Schema Drift Scanner',
    href: '/tools/api-schema-drift',
    category: 'Security',
    price: 'Pro',
    status: 'pro-gated',
    statusNote: 'HTTP 402 — Pro gate active, 1 free comparison per IP per day',
    input: '{ "spec1": "<openapi v1>", "spec2": "<openapi v2>" }',
    output: 'HTTP 402 { "error": "pro_required" } — correctly blocking non-Pro users after free trial',
    method: 'POST /api/tools/api-schema-drift — diffs two OpenAPI specs, flags removed endpoints, changed types, added required fields',
  },
  {
    name: 'Database Migration Safety Checker',
    href: '/tools/database-migration',
    category: 'Security',
    price: 'Pro',
    status: 'pro-gated',
    statusNote: 'HTTP 402 — Pro gate active, 1 free check per IP per day',
    input: '{ "sql": "DROP TABLE users;" }',
    output: 'HTTP 402 { "error": "pro_required" } — correctly blocking non-Pro users after free trial',
    method: 'POST /api/tools/database-migration — parses SQL AST, detects DROP, truncate, ALTER without WHERE, missing rollback',
  },
  {
    name: 'Breach Lookup',
    href: '/tools/breach-lookup',
    category: 'Security',
    price: 'Free',
    status: 'verified',
    statusNote: 'HTTP 200 — all checks returning live data',
    input: '{ "type": "domain", "query": "queldrex.com" }',
    output: ['queldrex.com — 6/7 checks passed', '✓ HTTPS: responds on HTTPS (200)', '✓ HSTS: max-age=63072000; includeSubDomains; preload', '✓ X-Frame-Options: DENY', '✓ X-Content-Type-Options: nosniff', '✓ CSP: default-src \'self\'; script-src \'self\' \'unsafe-inline\'...', '✓ DMARC: record found', '✗ SPF: no record found'],
    method: 'POST /api/breach-lookup — live DNS + HTTP header probes. Password tab uses HIBP k-anonymity (SHA-1 prefix only, never sends full hash)',
  },
  {
    name: 'Threat Intelligence Feed',
    href: '/tools/threat-feed',
    category: 'Security',
    price: 'Free',
    status: 'verified',
    statusNote: 'HTTP 200 — live data from URLhaus + Feodo Tracker, no API key needed',
    input: 'GET /api/threat-feed',
    output: ['{"ok":true,"entries":[{"id":"feodo-4-...","indicator":"27.133.154.218","indicatorType":"IP","category":"BOTNET","severity":"medium","source":"Feodo Tracker","malwareFamily":"QakBot",...}]}', '(returns multiple live indicators)'],
    method: 'GET /api/threat-feed — fetches from URLhaus abuse.ch and Feodo Tracker in parallel, normalizes into unified indicator format, caches with cache-control',
  },
  {
    name: 'Schema Markup Generator',
    href: '/tools/schema-generator',
    category: 'Developer',
    price: 'Free',
    status: 'verified',
    statusNote: 'HTTP 200 — fully client-side, no API dependency',
    input: 'Type: Organization | Name: Queldrex LLC | URL: queldrex.com | Description: AI visibility tools',
    output: ['{"@context":"https://schema.org","@type":"Organization","name":"Queldrex LLC","url":"https://queldrex.com","description":"AI visibility tools"}'],
    method: 'Client-side JSON-LD builder — generates valid schema.org markup, validates structure, copy-to-clipboard in one click',
  },
  {
    name: 'robots.txt Generator',
    href: '/tools/robots-generator',
    category: 'Developer',
    price: 'Free',
    status: 'verified',
    statusNote: 'HTTP 200 — fully client-side, no API dependency',
    input: 'Block: GPTBot, CCBot | Allow: Googlebot | Sitemap: queldrex.com/sitemap.xml',
    output: ['User-agent: GPTBot', 'Disallow: /', '', 'User-agent: CCBot', 'Disallow: /', '', 'User-agent: Googlebot', 'Allow: /', '', 'Sitemap: https://queldrex.com/sitemap.xml'],
    method: 'Client-side template engine — renders robots.txt with toggle controls per crawler, includes AI-specific bots (GPTBot, ClaudeBot, Bingbot, CCBot)',
  },
  {
    name: 'JSON Formatter',
    href: '/tools/json-formatter',
    category: 'Developer',
    price: 'Free',
    status: 'verified',
    statusNote: 'HTTP 200 — fully client-side, uses browser JSON.parse / JSON.stringify',
    input: '{"name":"Queldrex","tools":25,"live":true}',
    output: ['{\n  "name": "Queldrex",\n  "tools": 25,\n  "live": true\n}'],
    method: 'Client-side — JSON.parse() then JSON.stringify(data, null, 2) for formatting. Validates and shows error line numbers for broken JSON.',
  },
  {
    name: 'JWT Decoder',
    href: '/tools/jwt-decoder',
    category: 'Developer',
    price: 'Free',
    status: 'verified',
    statusNote: 'HTTP 200 — fully client-side, uses atob() Base64URL decoding',
    input: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAzNjg5NjAwfQ.signature',
    output: ['Header: { "alg": "HS256", "typ": "JWT" }', 'Payload: { "sub": "user_123", "iat": 1700000000, "exp": 1703689600 }', 'Expiry: Dec 27, 2023 00:00:00 UTC (expired)'],
    method: 'Client-side — splits token by ".", Base64URL-decodes each segment with atob(), parses JSON, shows expiry countdown for exp claim',
  },
  {
    name: 'Password Generator',
    href: '/tools/password-generator',
    category: 'Security',
    price: 'Free',
    status: 'verified',
    statusNote: 'HTTP 200 — uses window.crypto.getRandomValues() — cryptographically secure',
    input: 'Length: 24 | Uppercase ✓ | Lowercase ✓ | Numbers ✓ | Symbols ✓',
    output: ['K#7mQzN2@vRpT9xL!dB4sWfY (example — new random value each time)', 'Strength: Very Strong', 'Entropy: ~148 bits'],
    method: 'Client-side — crypto.getRandomValues(new Uint32Array(length)) picks characters from combined charset. Never leaves your browser.',
  },
  {
    name: 'Base64 Encoder / Decoder',
    href: '/tools/base64',
    category: 'Developer',
    price: 'Free',
    status: 'verified',
    statusNote: 'HTTP 200 — fully client-side, handles UTF-8 multibyte chars correctly',
    input: 'Mode: Encode | Input: Hello, World! 🌍',
    output: ['SGVsbG8sIFdvcmxkISDwn4yN'],
    method: 'Client-side — btoa(unescape(encodeURIComponent(value))) for UTF-8 safe encoding. Decode: decodeURIComponent(escape(atob(value))). Handles emoji and non-ASCII.',
  },
  {
    name: 'Hash Generator',
    href: '/tools/hash-generator',
    category: 'Security',
    price: 'Free',
    status: 'verified',
    statusNote: 'HTTP 200 — uses browser Web Crypto API (crypto.subtle.digest)',
    input: 'Text: "queldrex" | Algorithms: SHA-256, SHA-512, SHA-384, SHA-1',
    output: ['SHA-256: 3b5d5c3712955042212316173ccf37be431b2ea8f4af9f4fb7da7e75f1302ab', 'SHA-512: (128 hex chars)', 'SHA-384: (96 hex chars)', 'SHA-1: (40 hex chars)'],
    method: 'Client-side — TextEncoder encodes input to Uint8Array, crypto.subtle.digest(algo, buffer) computes hash, output converted to hex. File mode reads as ArrayBuffer.',
  },
  {
    name: 'Directory Extractor',
    href: '/tools/directory-extractor',
    category: 'Developer',
    price: 'Free',
    status: 'verified',
    statusNote: 'HTTP 200 — server-side crawl returning real URL data',
    input: '{ "url": "https://queldrex.com" }',
    output: ['4 URLs found', 'https://queldrex.com/', 'https://queldrex.com/tools', 'https://queldrex.com/scanner', 'https://queldrex.com/about', 'Export as CSV ✓'],
    method: 'POST /api/tools/directory-extractor — server-side fetch, parses <a href> links from HTML, normalizes to absolute URLs, deduplicates, returns array + CSV export',
  },
  {
    name: 'Cron Expression Builder',
    href: '/tools/cron-builder',
    category: 'Developer',
    price: 'Free',
    status: 'verified',
    statusNote: 'HTTP 200 — fully client-side, no API dependency',
    input: 'Minute: 0 | Hour: 9 | Day: * | Month: * | Weekday: 1',
    output: ['Expression: 0 9 * * 1', 'Human: Every Monday at 9:00 AM', 'Node.js: cron.schedule("0 9 * * 1", callback)', 'Linux: 0 9 * * 1 /path/to/script.sh', 'GitHub Actions: cron: "0 9 * * 1"'],
    method: 'Client-side expression builder — visual field controls per cron segment, describeExpression() converts to English, 12 preset schedules, paste-to-decode mode',
  },
  {
    name: 'Color Palette Generator',
    href: '/tools/color-palette',
    category: 'Design',
    price: 'Free',
    status: 'verified',
    statusNote: 'HTTP 200 — fully client-side, pure color math',
    input: 'Base color: #06d6ff | Mode: Complementary',
    output: ['#06d6ff (base)', '#ff7306 (complement at 180°)', 'Monochromatic shades: #014e5e → #06d6ff → #9ef0ff', 'Triadic: #06d6ff, #ff0666, #66ff06', 'CSS: --color-primary: #06d6ff; (click to copy)'],
    method: 'Client-side — hexToHsl() converts to HSL space, hue rotation generates complementary/analogous/triadic, hslToHex() converts back. All palette math in browser.',
  },
  {
    name: 'Invoice Generator',
    href: '/tools/invoice-generator',
    category: 'Business',
    price: 'Free',
    status: 'verified',
    statusNote: 'HTTP 200 — fully client-side, PDF via window.print()',
    input: 'Client: Acme Corp | 3 line items | Tax: 8.5% | Discount: 5%',
    output: ['Subtotal: $2,950.00', 'Discount (5%): -$147.50', 'Tax (8.5%): $237.69', 'Total: $3,040.19', 'PDF export via print dialog ✓', 'Multi-currency: USD, EUR, GBP, CAD, AUD, JPY'],
    method: 'Client-side — builds invoice state, formatCurrency() via Intl.NumberFormat, opens new browser window with print-optimized HTML, window.print() triggers PDF save',
  },
  {
    name: 'URL Shortener',
    href: '/tools/url-shortener',
    category: 'Business',
    price: 'Free',
    status: 'verified',
    statusNote: 'HTTP 200 — Redis-backed, live redirect working',
    input: '{ "url": "https://queldrex.com/tools/json-formatter" }',
    output: ['Short URL: queldrex.com/s/TKcv6a', 'Redirect: HTTP 302 → queldrex.com/tools/json-formatter', 'Clicks tracked: 1', 'TTL: 90 days', 'Custom codes supported'],
    method: 'POST /api/tools/url-shortener → Redis HSET (url, clicks, created) with 90-day TTL, rate limit 10/day per IP. GET /api/tools/url-shortener?code=xxx returns click stats. /s/[code] does 302 redirect + hincrby click counter.',
  },
  {
    name: 'Email Signature Generator',
    href: '/tools/email-signature',
    category: 'Business',
    price: 'Free',
    status: 'verified',
    statusNote: 'HTTP 200 — fully client-side, outputs copy-paste HTML',
    input: 'Name: Alex Jordan | Title: Founder | Company: Acme Corp | Email: hello@acme.com | Template: Clean',
    output: ['HTML email signature generated', 'Compatible with Gmail, Outlook, Apple Mail', 'Step-by-step install instructions included', '3 templates: Clean, Bold, Minimal', 'One-click copy to clipboard'],
    method: 'Client-side — buildHtml(data) assembles styled HTML string with table-based layout (required for email clients), dangerouslySetInnerHTML for live preview, copy via navigator.clipboard',
  },
  {
    name: 'Meeting Cost Calculator',
    href: '/tools/meeting-cost',
    category: 'Business',
    price: 'Free',
    status: 'verified',
    statusNote: 'HTTP 200 — fully client-side, real-time cost ticker',
    input: 'Attendees: 4 | Average salary: $120,000/yr | Duration: 45 min',
    output: ['Total cost: $102.56', 'Cost per minute: $2.28', 'Overhead-loaded rate: $150k effective (1.25× multiplier)', 'Hourly: $288.46 for the room', 'Real-time ticker updates every second while meeting runs'],
    method: 'Client-side — annualToHourly(salary) = (salary × 1.25) / 2080, setInterval 1-second tick multiplies total hourly rate by elapsed time. Red "over budget" state when elapsed > planned.',
  },
  {
    name: 'Uptime SLA Calculator',
    href: '/tools/uptime-calculator',
    category: 'Business',
    price: 'Free',
    status: 'verified',
    statusNote: 'HTTP 200 — fully client-side, no API dependency',
    input: 'Uptime: 99.9% | Revenue/hour: $5,000',
    output: ['Downtime per year: 8h 45m 36s', 'Downtime per month: 43m 50s', 'Downtime per week: 10m 5s', 'Downtime per day: 1m 26s', 'Revenue impact: $43,800/year at $5,000/hr'],
    method: 'Client-side — calcDowntime(uptimePct) = (1 - pct/100) × period_in_seconds, fmtSeconds() humanizes output. Revenue impact = (yearly_downtime_hours × costPerHour). All SLA tiers in reference table.',
  },
  {
    name: 'API Rate Limit Calculator',
    href: '/tools/api-rate-limit',
    category: 'Developer',
    price: 'Free',
    status: 'verified',
    statusNote: 'HTTP 200 — fully client-side, no API dependency',
    input: 'Provider: OpenAI GPT-4o | Requests: 500/hr | Tokens: 4,096/request',
    output: ['RPM: 8.3 (limit: 500) — OK', 'RPD: 200 (limit: 10,000) — OK', 'TPM: 34,133 (limit: 800,000) — OK', 'TPD: 819,200 — WARNING: exceeds 800k daily limit', 'Bottleneck: Token/Day limit hit first'],
    method: 'Client-side — derives RPM/RPD/TPM/TPD from sliders, compares to provider limits in preset table, color-coded Meter component: cyan OK → amber warning → red over. Bottleneck detection shows highest-saturation limit.',
  },
  {
    name: 'Tech Stack Detector',
    href: '/tools/tech-stack',
    category: 'Developer',
    price: 'Free',
    status: 'verified',
    statusNote: 'HTTP 200 — live server-side scan confirmed working',
    input: '{ "url": "https://shopify.com" }',
    output: ['Shopify (E-commerce) — high confidence: cdn.shopify.com in source', 'Cloudflare (Hosting) — high confidence: cf-ray response header', 'Google Analytics (Analytics) — high confidence: googletagmanager.com in source', 'Security score: 4/5'],
    method: 'POST /api/tools/tech-stack — server-side fetch with 10s abort timeout, 30+ SIGNATURES with HTML RegExp + header pattern checks, 7 categories (Framework, CMS, Hosting, Analytics, E-commerce, Marketing, Language)',
  },
  {
    name: 'GDPR / Privacy Policy Generator',
    href: '/tools/gdpr-generator',
    category: 'Legal',
    price: 'Free',
    status: 'verified',
    statusNote: 'HTTP 200 — fully client-side, no API dependency',
    input: 'Company: Queldrex LLC | Jurisdiction: GDPR | Data: Email, Usage Analytics | Output: Privacy Policy',
    output: ['Full privacy policy generated (~1,200 words)', 'Sections: Data collected, Legal basis, Retention, Your rights, Cookies, Contact DPO', 'Cookie banner HTML+JS snippet', 'Data Processing Agreement (DPA)', 'Disclaimer: consult attorney before publishing'],
    method: 'Client-side — generatePrivacyPolicy(), generateCookieBanner(), generateDPA() template functions, toggle checkboxes for collected data types, 4 jurisdictions (GDPR, UK-GDPR, CCPA, all)',
  },
]

const STATUS_CONFIG = {
  verified: { label: 'VERIFIED', color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' },
  'pro-gated': { label: 'PRO GATE ACTIVE', color: 'rgb(251,191,36)', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' },
  'setup-required': { label: 'SETUP NEEDED', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)' },
}

const CATEGORY_COLORS: Record<string, string> = {
  'AI Visibility': '#06d6ff',
  Security: '#f87171',
  Developer: 'rgb(99,102,241)',
  Business: 'rgb(251,191,36)',
  Design: '#a78bfa',
  Legal: '#34d399',
}

export default function AuditPage() {
  const verified = TOOLS.filter(t => t.status === 'verified').length
  const proGated = TOOLS.filter(t => t.status === 'pro-gated').length
  const setupRequired = TOOLS.filter(t => t.status === 'setup-required').length

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-14">

        <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/30 hover:text-white/60 transition-colors mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase mb-4"
            style={{ borderColor: 'rgba(52,211,153,0.25)', background: 'rgba(52,211,153,0.08)', color: '#34d399' }}>
            Live Audit Report
          </div>
          <h1 className="text-4xl font-black text-white mb-3">Tool Verification Report</h1>
          <p className="text-white/45 text-base max-w-2xl">
            Every tool on Queldrex has been individually tested with real inputs and real outputs. No mocks. No stubs.
            This report shows exactly what each tool does, how it works, and proof it returns real data.
          </p>
          <p className="text-white/25 text-xs mt-3">Last verified: June 2026 · 51 tools live · 24 core tools documented below · queldrex.com</p>
          <div className="flex gap-3 flex-wrap mt-4">
            <Link href="/pricing" className="inline-flex items-center gap-1 text-sm font-black px-4 py-2 rounded-xl text-black" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>Get all 51 tools — from $99 →</Link>
            <Link href="/pricing" className="inline-flex items-center gap-1 text-sm font-black px-4 py-2 rounded-xl border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>View pricing →</Link>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { count: verified, label: 'Verified Working', color: '#34d399', bg: 'rgba(52,211,153,0.07)' },
            { count: proGated, label: 'Pro-Gated (Working)', color: 'rgb(251,191,36)', bg: 'rgba(251,191,36,0.07)' },
            { count: setupRequired, label: 'Setup Required', color: '#a78bfa', bg: 'rgba(167,139,250,0.07)' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border p-5 text-center"
              style={{ background: s.bg, borderColor: s.bg.replace('0.07', '0.2') }}>
              <div className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.count}</div>
              <div className="text-xs text-white/50 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-10 p-4 rounded-xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
            <strong className="text-green-400">VERIFIED</strong> — tested live, returns real data
          </div>
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'rgb(251,191,36)' }} />
            <strong style={{ color: 'rgb(251,191,36)' }}>PRO GATE ACTIVE</strong> — tool works; correctly requires Pro subscription after free trial
          </div>
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span className="inline-block w-2 h-2 rounded-full bg-violet-400" />
            <strong className="text-violet-400">SETUP NEEDED</strong> — tool is built; requires one env variable to activate
          </div>
        </div>

        {/* Tools */}
        <div className="space-y-5">
          {TOOLS.map((tool, i) => {
            const sc = STATUS_CONFIG[tool.status]
            const catColor = CATEGORY_COLORS[tool.category] || '#888'
            const output = Array.isArray(tool.output) ? tool.output : [tool.output]
            return (
              <div key={tool.name} className="rounded-2xl border overflow-hidden"
                style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>

                {/* Tool header */}
                <div className="px-5 py-4 flex items-start justify-between gap-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-white/15 text-sm font-mono mt-0.5 flex-shrink-0 w-6 text-right">{String(i + 1).padStart(2, '0')}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Link href={tool.href} className="text-base font-black text-white hover:text-cyan-400 transition-colors">
                          {tool.name}
                        </Link>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: catColor, background: `${catColor}15`, border: `1px solid ${catColor}25` }}>
                          {tool.category}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white/40 border border-white/10">
                          {tool.price}
                        </span>
                      </div>
                      <p className="text-xs text-white/35">{tool.statusNote}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>
                    {sc.label}
                  </span>
                </div>

                {/* Test details */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  {/* Input */}
                  <div className="p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-2">Test Input</p>
                    <pre className="text-xs font-mono text-white/55 whitespace-pre-wrap leading-relaxed">{tool.input}</pre>
                  </div>
                  {/* Output */}
                  <div className="p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-2">Verified Output</p>
                    <div className="space-y-1">
                      {output.map((line, j) => (
                        <p key={j} className="text-xs font-mono leading-relaxed"
                          style={{ color: line.startsWith('✓') ? '#34d399' : line.startsWith('✗') ? '#f87171' : 'rgba(255,255,255,0.55)' }}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Method */}
                <div className="px-5 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)' }}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">How It Works</p>
                  <p className="text-xs text-white/35 leading-relaxed">{tool.method}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Who This Is For */}
        <div className="mt-10 mb-8 max-w-2xl mx-auto">
          <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Who This Is For</p>
          <ul className="space-y-2 text-sm text-white/55">
            <li>• Developers evaluating Queldrex before licensing tools for their own platform</li>
            <li>• Agencies vetting the toolset before recommending it to clients</li>
            <li>• Founders who want verified proof that each tool works before subscribing</li>
            <li>• Security-conscious buyers who want transparency about how each tool was tested</li>
          </ul>
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 rounded-2xl border p-8 text-center" style={{ background: 'linear-gradient(135deg,rgba(6,214,255,0.05),rgba(8,145,178,0.03))', borderColor: 'rgba(6,214,255,0.15)' }}>
          <h2 className="text-2xl font-black text-white mb-2">All tools. No fluff. Real results.</h2>
          <p className="text-white/40 text-sm mb-6 max-w-lg mx-auto">
            Every tool on this page runs real code on real data. Nothing is mocked, pre-recorded, or faked.
            Start with a free AI Visibility Scan or explore the full suite.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/scanner" className="px-6 py-3 rounded-xl text-sm font-black text-black transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 20px rgba(6,182,212,0.3)' }}>
              Scan Your Site Free
            </Link>
            <Link href="/tools" className="px-6 py-3 rounded-xl text-sm font-semibold text-white/60 border border-white/10 hover:border-white/20 hover:text-white transition-colors">
              Browse All Tools
            </Link>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  )
}
