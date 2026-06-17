import { parse } from 'node-html-parser'
import type { ScanChecks, BusinessInfo } from '@/lib/framework/types'

const FETCH_TIMEOUT = 8000

async function fetchWithTimeout(url: string): Promise<string | null> {
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
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
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

  // Email: skip noreply, support@ type addresses, prefer contact/info
  const emailMatches = root.innerHTML.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []
  const contactEmail = emailMatches.find(e =>
    /^(contact|info|hello|hi|enquiries|sales)@/.test(e)
  ) || emailMatches[0] || ''

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

  return { name, description, url, domain, title, phone, email: contactEmail, address: '', image, social, pages }
}

export async function scanWebsite(rawUrl: string): Promise<{
  checks: ScanChecks
  businessInfo: BusinessInfo
  score: number
}> {
  const url = normalizeUrl(rawUrl)

  if (isPrivateUrl(url)) {
    throw new Error('Private or local addresses are not allowed.')
  }

  // Fetch all signals in parallel for speed
  const [homepageHtml, robotsText, sitemapText, llmsText] = await Promise.all([
    fetchWithTimeout(url),
    fetchWithTimeout(`${url}/robots.txt`),
    fetchWithTimeout(`${url}/sitemap.xml`),
    fetchWithTimeout(`${url}/llms.txt`),
  ])

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
  }

  const businessInfo = extractBusinessInfo(root, url)
  const score = calculateScore(checks)

  return { checks, businessInfo, score }
}

function calculateScore(checks: ScanChecks): number {
  let score = 0
  if (checks.robotsTxt) score += 10
  if (checks.sitemapXml) score += 15
  if (checks.openGraph) score += 15
  if (checks.jsonLd) score += 20
  if (checks.localBusinessSchema) score += 15
  if (checks.llmsTxt) score += 25
  return score
}
