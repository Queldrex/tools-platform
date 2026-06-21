import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

interface PathNode {
  path: string
  children: Record<string, PathNode>
  isLeaf: boolean
}

function isPrivateHost(host: string): boolean {
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) {
    const parts = host.split('.').map(Number)
    const [a, b] = parts
    if (a === 10) return true
    if (a === 127) return true
    if (a === 169 && b === 254) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    return true // block all bare IPs
  }
  if (host === 'localhost' || host === '::1') return true
  return false
}

function normalizeDomain(input: string): string {
  let u = input.trim()
  if (!u.startsWith('http')) u = 'https://' + u
  try {
    const parsed = new URL(u)
    return parsed.hostname.replace(/^www\./, '')
  } catch {
    return u.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
  }
}

function parseUrlsFromXml(xml: string): string[] {
  const matches = xml.match(/<loc>\s*([^<]+)\s*<\/loc>/gi) || []
  return matches.map(m => m.replace(/<\/?loc>/gi, '').trim()).filter(u => u.startsWith('http'))
}

function buildTree(urls: string[]): PathNode {
  const root: PathNode = { path: '/', children: {}, isLeaf: false }
  for (const url of urls) {
    try {
      const parsed = new URL(url)
      const parts = parsed.pathname.split('/').filter(Boolean)
      let node = root
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        if (!node.children[part]) {
          node.children[part] = { path: '/' + parts.slice(0, i + 1).join('/'), children: {}, isLeaf: false }
        }
        node = node.children[part]
      }
      node.isLeaf = true
    } catch { /* skip invalid */ }
  }
  return root
}

async function fetchWithTimeout(url: string, ms = 10000): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), ms)
  try {
    return await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'Queldrex-DirectoryExtractor/1.0 (queldrex.com)' } })
  } finally {
    clearTimeout(id)
  }
}

export async function POST(request: NextRequest) {
  let body: { url?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const raw = (body.url || '').trim()
  if (!raw) return Response.json({ error: 'URL required' }, { status: 400 })

  const domain = normalizeDomain(raw)
  if (!domain || domain.length < 3) return Response.json({ error: 'Invalid domain' }, { status: 400 })
  if (isPrivateHost(domain)) return Response.json({ error: 'Private or internal addresses are not allowed' }, { status: 400 })

  const base = `https://${domain}`
  const attempts = [`${base}/sitemap.xml`, `${base}/sitemap_index.xml`]

  let sitemapUrl = ''
  let urls: string[] = []

  // Try robots.txt for sitemap hints
  try {
    const robotsRes = await fetchWithTimeout(`${base}/robots.txt`)
    if (robotsRes.ok) {
      const robotsTxt = await robotsRes.text()
      const sitemapLines = robotsTxt.match(/^Sitemap:\s*(.+)$/gim) || []
      for (const line of sitemapLines) {
        const url = line.replace(/^Sitemap:\s*/i, '').trim()
        if (url) attempts.unshift(url)
      }
    }
  } catch { /* ignore */ }

  for (const attempt of attempts) {
    try {
      const res = await fetchWithTimeout(attempt)
      if (res.ok) {
        const text = await res.text()
        const found = parseUrlsFromXml(text)
        // Handle sitemap index — fetch sub-sitemaps
        const subSitemaps = text.match(/<loc>\s*(https?:\/\/[^<]*sitemap[^<]*)\s*<\/loc>/gi) || []
        if (subSitemaps.length > 0 && found.filter(u => !u.includes('sitemap')).length < 5) {
          for (const sub of subSitemaps.slice(0, 5)) {
            const subUrl = sub.replace(/<\/?loc>/gi, '').trim()
            try {
              const subRes = await fetchWithTimeout(subUrl)
              if (subRes.ok) {
                const subText = await subRes.text()
                urls.push(...parseUrlsFromXml(subText))
              }
            } catch { /* ignore */ }
          }
        } else {
          urls.push(...found)
        }
        if (urls.length > 0) { sitemapUrl = attempt; break }
      }
    } catch { /* try next */ }
  }

  if (urls.length === 0) {
    return Response.json({ error: 'No sitemap found', domain, totalUrls: 0, urls: [], tree: null, sitemapUrl: '', fetchedAt: new Date().toISOString() })
  }

  // Deduplicate and sort
  urls = [...new Set(urls)].sort()
  const tree = buildTree(urls)

  return Response.json({ domain, totalUrls: urls.length, urls: urls.slice(0, 2000), tree, sitemapUrl, fetchedAt: new Date().toISOString() })
}
