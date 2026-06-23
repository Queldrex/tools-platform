import { NextRequest } from 'next/server'
import { hasFreeOrProAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

interface UrlEntry {
  url: string
  priority?: number
  changefreq?: string
  lastmod?: string
}

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
    return true
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

function parseUrlsFromXml(xml: string): UrlEntry[] {
  const urlBlocks = xml.match(/<url>[\s\S]*?<\/url>/gi) || []
  if (urlBlocks.length > 0) {
    const results: UrlEntry[] = []
    for (const block of urlBlocks) {
      const locMatch = block.match(/<loc>\s*([^<]+)\s*<\/loc>/i)
      const url = locMatch ? locMatch[1].trim() : ''
      if (!url.startsWith('http')) continue
      const priorityMatch = block.match(/<priority>\s*([\d.]+)\s*<\/priority>/i)
      const changefreqMatch = block.match(/<changefreq>\s*([a-z]+)\s*<\/changefreq>/i)
      const lastmodMatch = block.match(/<lastmod>\s*([^<]+)\s*<\/lastmod>/i)
      const entry: UrlEntry = { url }
      if (priorityMatch) entry.priority = parseFloat(priorityMatch[1])
      if (changefreqMatch) entry.changefreq = changefreqMatch[1]
      if (lastmodMatch) entry.lastmod = lastmodMatch[1].trim().slice(0, 10)
      results.push(entry)
    }
    return results
  }
  const matches = xml.match(/<loc>\s*([^<]+)\s*<\/loc>/gi) || []
  return matches.map(m => ({ url: m.replace(/<\/?loc>/gi, '').trim() })).filter(e => e.url.startsWith('http'))
}

function buildTree(entries: UrlEntry[]): PathNode {
  const root: PathNode = { path: '/', children: {}, isLeaf: false }
  for (const entry of entries) {
    try {
      const parsed = new URL(entry.url)
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
  const access = await hasFreeOrProAccess(request, 'directory-extractor', 3)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })
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
  let allEntries: UrlEntry[] = []

  try {
    const robotsRes = await fetchWithTimeout(`${base}/robots.txt`)
    if (robotsRes.ok) {
      const robotsTxt = await robotsRes.text()
      const sitemapLines = robotsTxt.match(/^Sitemap:\s*(.+)$/gim) || []
      for (const line of sitemapLines) {
        const u = line.replace(/^Sitemap:\s*/i, '').trim()
        if (u) attempts.unshift(u)
      }
    }
  } catch { /* ignore */ }

  for (const attempt of attempts) {
    try {
      const res = await fetchWithTimeout(attempt)
      if (res.ok) {
        const text = await res.text()
        const found = parseUrlsFromXml(text)
        const subSitemaps = text.match(/<loc>\s*(https?:\/\/[^<]*sitemap[^<]*)\s*<\/loc>/gi) || []
        if (subSitemaps.length > 0 && found.filter(e => !e.url.includes('sitemap')).length < 5) {
          for (const sub of subSitemaps.slice(0, 5)) {
            const subUrl = sub.replace(/<\/?loc>/gi, '').trim()
            try {
              const subRes = await fetchWithTimeout(subUrl)
              if (subRes.ok) {
                const subText = await subRes.text()
                allEntries.push(...parseUrlsFromXml(subText))
              }
            } catch { /* ignore */ }
          }
        } else {
          allEntries.push(...found)
        }
        if (allEntries.length > 0) { sitemapUrl = attempt; break }
      }
    } catch { /* try next */ }
  }

  if (allEntries.length === 0) {
    return Response.json({ error: 'No sitemap found', domain, totalUrls: 0, urlData: [], urls: [], tree: null, sitemapUrl: '', topPrefixes: [], depthDist: {}, fetchedAt: new Date().toISOString() })
  }

  const seen = new Set<string>()
  const uniqueEntries: UrlEntry[] = []
  for (const entry of allEntries) {
    if (!seen.has(entry.url)) {
      seen.add(entry.url)
      uniqueEntries.push(entry)
    }
  }
  uniqueEntries.sort((a, b) => a.url.localeCompare(b.url))

  const tree = buildTree(uniqueEntries)

  const depthDist: Record<number, number> = {}
  for (const entry of uniqueEntries) {
    try {
      const depth = new URL(entry.url).pathname.split('/').filter(Boolean).length
      depthDist[depth] = (depthDist[depth] || 0) + 1
    } catch {}
  }

  const prefixCount: Record<string, number> = {}
  for (const entry of uniqueEntries) {
    try {
      const parts = new URL(entry.url).pathname.split('/').filter(Boolean)
      if (parts.length > 0) prefixCount[parts[0]] = (prefixCount[parts[0]] || 0) + 1
    } catch {}
  }
  const topPrefixes = Object.entries(prefixCount).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([prefix, count]) => ({ prefix, count }))

  return Response.json({
    domain,
    totalUrls: uniqueEntries.length,
    urlData: uniqueEntries.slice(0, 2000),
    urls: uniqueEntries.slice(0, 2000).map(e => e.url),
    tree,
    sitemapUrl,
    topPrefixes,
    depthDist,
    fetchedAt: new Date().toISOString(),
  })
}
