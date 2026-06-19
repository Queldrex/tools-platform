import { parse } from 'node-html-parser'
import type { ScanChecks, BusinessInfo, ExtendedChecks } from '@/lib/framework/types'

const FETCH_TIMEOUT = 5000

async function fetchWithTimeout(url: string): Promise<{ text: string | null; ms: number }> {
  const start = Date.now()
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Queldrex-AIScanner/1.0 (+https://queldrex.com/bot)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })
    clearTimeout(timer)
    if (!res.ok) return { text: null, ms: Date.now() - start }
    return { text: await res.text(), ms: Date.now() - start }
  } catch {
    return { text: null, ms: Date.now() - start }
  }
}

async function fetchText(url: string): Promise<string | null> {
  return (await fetchWithTimeout(url)).text
}

// ─── Extended check helpers ────────────────────────────────────────────────────

function checkFaqSchema(ldScripts: string[]): boolean {
  for (const script of ldScripts) {
    try {
      const parsed = JSON.parse(script)
      const items = Array.isArray(parsed) ? parsed : [parsed]
      for (const item of items) {
        if (item['@type'] === 'FAQPage') return true
        if (Array.isArray(item['@graph'])) {
          if (item['@graph'].some((n: Record<string, unknown>) => n['@type'] === 'FAQPage')) return true
        }
      }
    } catch { continue }
  }
  return false
}

function checkReviewSchema(ldScripts: string[]): boolean {
  for (const script of ldScripts) {
    try {
      const parsed = JSON.parse(script)
      const items = Array.isArray(parsed) ? parsed : [parsed]
      for (const item of items) {
        if (item['aggregateRating'] || item['review']) return true
        if (item['@type'] === 'AggregateRating') return true
        if (Array.isArray(item['@graph'])) {
          if (item['@graph'].some((n: Record<string, unknown>) => n['aggregateRating'] || n['@type'] === 'AggregateRating')) return true
        }
      }
    } catch { continue }
  }
  return false
}

function checkAboutPage(root: ReturnType<typeof parse> | null): boolean {
  if (!root) return false
  const ABOUT_PATTERNS = /\/(about|about-us|about_us|our-story|team|who-we-are|our-team)(\/|$|\?)/i
  const ABOUT_TEXT = /^(about|about us|our story|our team|who we are|meet the team)$/i
  for (const link of root.querySelectorAll('a[href]')) {
    const href = link.getAttribute('href') || ''
    const text = link.text.trim()
    if (ABOUT_PATTERNS.test(href) || ABOUT_TEXT.test(text)) return true
  }
  if (root.querySelector('[rel="author"], [itemprop="author"], [name="author"]')) return true
  return false
}

function checkContentFresh(root: ReturnType<typeof parse> | null, ldScripts: string[]): boolean {
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  if (root) {
    const modifiedOg = root.querySelector('meta[property="article:modified_time"]')?.getAttribute('content')
    if (modifiedOg && new Date(modifiedOg) > oneYearAgo) return true
    const publishedOg = root.querySelector('meta[property="article:published_time"]')?.getAttribute('content')
    if (publishedOg && new Date(publishedOg) > oneYearAgo) return true
  }

  for (const script of ldScripts) {
    try {
      const parsed = JSON.parse(script)
      const items = Array.isArray(parsed) ? parsed : [parsed]
      for (const item of items) {
        const d = item.dateModified || item.datePublished
        if (d && new Date(d) > oneYearAgo) return true
        if (Array.isArray(item['@graph'])) {
          for (const node of item['@graph']) {
            const nd = node.dateModified || node.datePublished
            if (nd && new Date(nd) > oneYearAgo) return true
          }
        }
      }
    } catch { continue }
  }
  return false
}

function detectJsHeavy(html: string): boolean {
  // Strip all scripts, styles, and HTML tags, count remaining readable text
  const readable = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  // Less than 400 chars of readable text but has scripts = likely JS-rendered SPA
  if (readable.length < 400 && html.includes('<script')) {
    return html.length > 2000  // Not just a 404/empty page
  }
  return false
}

function checkExtended(
  root: ReturnType<typeof parse> | null,
  ldScripts: string[],
  rawHtml: string | null
): ExtendedChecks {
  return {
    faqSchema: checkFaqSchema(ldScripts),
    reviewSchema: checkReviewSchema(ldScripts),
    aboutPage: checkAboutPage(root),
    contactPage: checkContactPage(root),
    contentFresh: checkContentFresh(root, ldScripts),
    jsHeavy: rawHtml ? detectJsHeavy(rawHtml) : false,
  }
}

// Parse robots.txt and return names of AI crawlers that are fully blocked (Disallow: /)
// Handles: specific bot rules, wildcard User-agent: *, and Allow: / overrides
function parseBlockedAiBots(robotsText: string | null): string[] {
  if (!robotsText) return []

  const AI_BOTS: { name: string; id: string }[] = [
    { name: 'ChatGPT (GPTBot)', id: 'gptbot' },
    { name: 'Claude (ClaudeBot)', id: 'claudebot' },
    { name: 'Perplexity (PerplexityBot)', id: 'perplexitybot' },
    { name: 'Bing / Copilot (Bingbot)', id: 'bingbot' },
    { name: 'Common Crawl (CCBot)', id: 'ccbot' },
    { name: 'Meta AI', id: 'meta-externalagent' },
    { name: 'ByteDance AI (Bytespider)', id: 'bytespider' },
    { name: 'Google AI (Google-Extended)', id: 'google-extended' },
  ]

  // Parse into rule groups: each group has agents + their disallow/allow rules
  type RuleGroup = { agents: string[]; disallows: string[]; allows: string[] }
  const groups: RuleGroup[] = []
  let current: RuleGroup = { agents: [], disallows: [], allows: [] }

  for (const rawLine of robotsText.split('\n')) {
    const line = rawLine.trim().toLowerCase()
    if (line === '' || line.startsWith('#')) {
      if (current.agents.length > 0) { groups.push(current); current = { agents: [], disallows: [], allows: [] } }
      continue
    }
    if (line.startsWith('user-agent:')) {
      const agent = line.slice('user-agent:'.length).trim()
      // New user-agent after directives = new group
      if (current.disallows.length > 0 || current.allows.length > 0) {
        groups.push(current)
        current = { agents: [], disallows: [], allows: [] }
      }
      current.agents.push(agent)
    } else if (line.startsWith('disallow:')) {
      current.disallows.push(line.slice('disallow:'.length).trim())
    } else if (line.startsWith('allow:')) {
      current.allows.push(line.slice('allow:'.length).trim())
    }
  }
  if (current.agents.length > 0) groups.push(current)

  const wildcardGroup = groups.find(g => g.agents.includes('*'))

  const blocked: string[] = []
  for (const bot of AI_BOTS) {
    // Specific rule takes precedence over wildcard
    const specific = groups.find(g => g.agents.includes(bot.id))
    const applicable = specific ?? wildcardGroup
    if (!applicable) continue
    const siteBlocked = applicable.disallows.includes('/') && !applicable.allows.includes('/')
    if (siteBlocked && !blocked.includes(bot.name)) blocked.push(bot.name)
  }

  return blocked
}

function checkContactPage(root: ReturnType<typeof parse> | null): boolean {
  if (!root) return false
  const CONTACT_PATH = /\/(contact|contact-us|contact_us|reach-us|get-in-touch|reach-out)(\/|$|\?)/i
  const CONTACT_TEXT = /^(contact|contact us|reach us|get in touch|talk to us|reach out)$/i
  for (const link of root.querySelectorAll('a[href]')) {
    const href = link.getAttribute('href') || ''
    const text = link.text.trim()
    if (CONTACT_PATH.test(href) || CONTACT_TEXT.test(text)) return true
  }
  return false
}

export function normalizeUrl(input: string): string {
  let url = input.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }
  return url.replace(/\/$/, '')
}

function isPrivateUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname
    if (hostname === 'localhost' || hostname === '0.0.0.0') return true
    // Full RFC-1918 + loopback + link-local
    const privateRanges = [
      /^127\./,
      /^10\./,
      /^192\.168\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^169\.254\./,
      /^::1$/,
      /^fc00:/,
      /^fd/,
    ]
    return privateRanges.some(r => r.test(hostname))
  } catch {
    return true
  }
}

function isValidLlmsTxt(content: string): boolean {
  const trimmed = content.trim()
  // Must start with a markdown H1 heading and have meaningful content
  return trimmed.startsWith('#') && trimmed.length > 20
}

function checkLocalBusinessSchema(scriptContents: string[]): boolean {
  // All schema.org types that count as a LocalBusiness signal
  const LOCAL_BUSINESS_TYPES = new Set([
    'LocalBusiness',
    'Restaurant',
    'MedicalBusiness',
    'Physician',
    'Dentist',
    'LegalService',
    'Attorney',
    'HomeAndConstructionBusiness',
    'Plumber',
    'RoofingContractor',
    'HVACBusiness',
    'AutoRepair',
    'AutomotiveBusiness',
    'HealthAndBeautyBusiness',
    'SalonOrBarber',
    'FoodEstablishment',
    'CafeOrCoffeeShop',
    'FinancialService',
    'RealEstateAgent',
    'Store',
    'Organization',
    'ProfessionalService',
  ])

  for (const content of scriptContents) {
    try {
      const parsed = JSON.parse(content)
      const items = Array.isArray(parsed) ? parsed : [parsed]
      for (const item of items) {
        const type = item['@type']
        if (typeof type === 'string' && LOCAL_BUSINESS_TYPES.has(type)) return true
        if (Array.isArray(type) && type.some(t => LOCAL_BUSINESS_TYPES.has(t))) return true
        // Handle @graph pattern
        if (Array.isArray(item['@graph'])) {
          for (const node of item['@graph']) {
            const nodeType = node['@type']
            if (typeof nodeType === 'string' && LOCAL_BUSINESS_TYPES.has(nodeType)) return true
          }
        }
      }
    } catch {
      continue
    }
  }
  return false
}

function extractBusinessInfo(root: ReturnType<typeof parse> | null, url: string): BusinessInfo {
  const domain = new URL(url).hostname.replace(/^www\./, '')

  if (!root) {
    return { name: domain, description: '', url, domain, title: domain, phone: '', email: '', address: '', image: '', social: [], pages: [] }
  }

  const ogTitle = root.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim()
  const rawTitle = root.querySelector('title')?.text?.trim()
  const title = ogTitle || rawTitle || domain

  // Clean business name: strip site suffix patterns like " | Acme" or " - Home"
  const name = title
    .split(/\s*[|\-–—]\s*/)[0]
    .replace(/\s*(home|welcome|official site|official website)$/i, '')
    .trim() || domain

  const description =
    root.querySelector('meta[property="og:description"]')?.getAttribute('content')?.trim() ||
    root.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ||
    ''

  const image = root.querySelector('meta[property="og:image"]')?.getAttribute('content')?.trim() || ''

  // Phone: international and US formats
  const phoneMatch = root.innerHTML.match(
    /(?:tel:|phone:|call us:?\s*)?(\+?1?\s*[-.]?\s*\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/i
  )
  const phone = phoneMatch ? phoneMatch[1].replace(/\s+/g, ' ').trim() : ''

  // Email: prefer contact/info addresses over generic ones
  const emailMatches = root.innerHTML.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []
  const contactEmail = emailMatches.find(e =>
    /^(contact|info|hello|hi|enquiries|sales)@/.test(e)
  ) || emailMatches[0] || ''

  // Address: extract from JSON-LD streetAddress first, then itemprop, then schema markup
  let address = ''
  const ldScriptsForAddress = root.querySelectorAll('script[type="application/ld+json"]')
  for (const el of ldScriptsForAddress) {
    try {
      const parsed = JSON.parse(el.text)
      const items = Array.isArray(parsed) ? parsed : [parsed]
      for (const item of items) {
        const addr = item.address?.streetAddress || item.location?.address?.streetAddress
        if (addr) { address = String(addr); break }
        if (Array.isArray(item['@graph'])) {
          for (const node of item['@graph']) {
            const nodeAddr = node.address?.streetAddress
            if (nodeAddr) { address = String(nodeAddr); break }
          }
        }
      }
      if (address) break
    } catch { continue }
  }
  if (!address) {
    const addrEl = root.querySelector('[itemprop="streetAddress"]')
    if (addrEl) address = addrEl.text.trim()
  }

  const social: string[] = []
  const seenSocial = new Set<string>()
  const SOCIAL_DOMAINS = ['facebook.com', 'twitter.com', 'x.com', 'instagram.com', 'linkedin.com', 'youtube.com', 'tiktok.com']
  for (const link of root.querySelectorAll('a[href]')) {
    const href = link.getAttribute('href') || ''
    if (SOCIAL_DOMAINS.some(d => href.includes(d))) {
      try {
        const normalized = new URL(href).href
        if (!seenSocial.has(normalized)) { seenSocial.add(normalized); social.push(normalized) }
      } catch { continue }
    }
  }

  const pages: string[] = []
  const seenPages = new Set<string>()
  const SKIP_PATTERNS = /\.(jpg|jpeg|png|gif|svg|webp|pdf|zip|css|js)$/i
  for (const link of root.querySelectorAll('a[href]')) {
    const href = link.getAttribute('href') || ''
    if (!href.startsWith('/') || href === '/' || href.startsWith('//')) continue
    const clean = href.split('?')[0].split('#')[0]
    if (SKIP_PATTERNS.test(clean)) continue
    if (!seenPages.has(clean) && pages.length < 12) { seenPages.add(clean); pages.push(clean) }
  }

  return { name, description, url, domain, title, phone, email: contactEmail, address, image, social, pages }
}

export async function scanWebsite(rawUrl: string): Promise<{
  checks: ScanChecks
  extendedChecks: ExtendedChecks
  businessInfo: BusinessInfo
  score: number
  blockedAiBots: string[]
  responseTimeMs: number
}> {
  const url = normalizeUrl(rawUrl)

  if (isPrivateUrl(url)) {
    throw new Error('Private or local addresses are not allowed.')
  }

  // Fetch all signals in parallel for speed
  const [homepageResult, robotsText, sitemapText, llmsText] = await Promise.all([
    fetchWithTimeout(url),
    fetchText(`${url}/robots.txt`),
    fetchText(`${url}/sitemap.xml`),
    fetchText(`${url}/llms.txt`),
  ])

  const homepageHtml = homepageResult.text
  const responseTimeMs = homepageResult.ms

  const root = homepageHtml ? parse(homepageHtml) : null
  const ldScripts = root
    ? root.querySelectorAll('script[type="application/ld+json"]').map(el => el.text)
    : []

  const checks: ScanChecks = {
    robotsTxt: !!robotsText && robotsText.toLowerCase().includes('user-agent'),
    sitemapXml: !!sitemapText && (sitemapText.includes('<urlset') || sitemapText.includes('<sitemapindex')),
    llmsTxt: !!llmsText && isValidLlmsTxt(llmsText),
    openGraph:
      !!root &&
      (!!root.querySelector('meta[property="og:title"]') ||
        !!root.querySelector('meta[property="og:description"]') ||
        !!root.querySelector('meta[property="og:url"]')),
    jsonLd: ldScripts.length > 0,
    localBusinessSchema: checkLocalBusinessSchema(ldScripts),
    httpsEnabled: url.startsWith('https://'),
    canonicalTag: !!root && !!root.querySelector('link[rel="canonical"]'),
  }

  const blockedAiBots = parseBlockedAiBots(robotsText)
  const extendedChecks = checkExtended(root, ldScripts, homepageHtml)
  const businessInfo = extractBusinessInfo(root, url)
  const score = calculateScore(checks)

  return { checks, extendedChecks, businessInfo, score, blockedAiBots, responseTimeMs }
}

function calculateScore(checks: ScanChecks): number {
  let score = 0
  if (checks.httpsEnabled) score += 10
  if (checks.robotsTxt) score += 5
  if (checks.sitemapXml) score += 10
  if (checks.canonicalTag) score += 5
  if (checks.openGraph) score += 10
  if (checks.jsonLd) score += 15
  if (checks.localBusinessSchema) score += 20
  if (checks.llmsTxt) score += 25
  return score
}
