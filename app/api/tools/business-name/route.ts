import { NextRequest } from 'next/server'
import { hasFreeOrProAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

async function dohQuery(name: string, type: string): Promise<{ status: number; hasAnswers: boolean }> {
  try {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`, {
      headers: { Accept: 'application/dns-json' },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return { status: -1, hasAnswers: false }
    const data = await res.json()
    return { status: data.Status ?? -1, hasAnswers: Array.isArray(data.Answer) && data.Answer.length > 0 }
  } catch {
    return { status: -1, hasAnswers: false }
  }
}

async function checkDomainAvailability(domain: string): Promise<{ domain: string; available: boolean | null }> {
  try {
    const [aResult, nsResult] = await Promise.all([
      dohQuery(domain, 'A'),
      dohQuery(domain, 'NS'),
    ])
    // NXDOMAIN (status 3) on both = very likely available
    if (aResult.status === 3 && nsResult.status === 3) return { domain, available: true }
    // Has A or NS records = taken
    if (aResult.hasAnswers || nsResult.hasAnswers) return { domain, available: false }
    // Other status codes = uncertain
    return { domain, available: aResult.status === 3 ? true : null }
  } catch {
    return { domain, available: null }
  }
}

async function checkSocial(platform: string, url: string, handle: string): Promise<{ platform: string; handle: string; url: string; available: boolean | null }> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; QueldrexBot/1.0)' },
    })
    // 404 = available, 200 = taken, others = unknown
    if (res.status === 404) return { platform, handle, url, available: true }
    if (res.status === 200) return { platform, handle, url, available: false }
    return { platform, handle, url, available: null }
  } catch {
    return { platform, handle, url, available: null }
  }
}

export async function POST(request: NextRequest) {
  const access = await hasFreeOrProAccess(request, 'business-name', 5)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  let body: { name?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const name = (body.name ?? '').trim()
  if (!name || name.length < 2) return Response.json({ error: 'Business name must be at least 2 characters' }, { status: 400 })
  if (name.length > 60) return Response.json({ error: 'Business name too long (max 60 characters)' }, { status: 400 })

  // Build slug: lowercase, replace spaces/special chars with hyphens, collapse multiple hyphens
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  // Domain variations to check
  const domainVariants = [
    `${slug}.com`,
    `${slug}.io`,
    `${slug}.co`,
    `${slug}.net`,
    `${slug}.app`,
    `${slug}.ai`,
    `get${slug}.com`,
    `try${slug}.com`,
    `use${slug}.com`,
  ]

  // Social handles
  const socialHandle = slug.replace(/-/g, '')
  const socialChecks = [
    { platform: 'X (Twitter)', url: `https://twitter.com/${socialHandle}`, handle: `@${socialHandle}` },
    { platform: 'GitHub', url: `https://github.com/${socialHandle}`, handle: `@${socialHandle}` },
    { platform: 'LinkedIn', url: `https://www.linkedin.com/company/${socialHandle}`, handle: socialHandle },
  ]

  // Run domain and social checks in parallel
  const [domainResults, socialResults] = await Promise.all([
    Promise.all(domainVariants.map(checkDomainAvailability)),
    Promise.allSettled(socialChecks.map(s => checkSocial(s.platform, s.url, s.handle))),
  ])

  const socials = socialResults.map((r, i) =>
    r.status === 'fulfilled' ? r.value : { platform: socialChecks[i].platform, handle: socialChecks[i].handle, url: socialChecks[i].url, available: null }
  )

  // Build recommendations
  const recommendations: string[] = []
  const available = domainResults.filter(d => d.available === true)
  const taken = domainResults.filter(d => d.available === false)

  if (available.find(d => d.domain === `${slug}.com`)) {
    recommendations.push(`${slug}.com is available — register it immediately, .com is the gold standard`)
  } else if (taken.find(d => d.domain === `${slug}.com`)) {
    const altCom = available.find(d => d.domain !== `${slug}.com` && d.domain.endsWith('.com'))
    const ioOption = available.find(d => d.domain.endsWith('.io'))
    if (altCom) recommendations.push(`${slug}.com is taken — ${altCom.domain} is available as an alternative`)
    else if (ioOption) recommendations.push(`${slug}.com is taken — ${ioOption.domain} is a strong alternative for tech/SaaS`)
  }

  const dotAi = available.find(d => d.domain.endsWith('.ai'))
  if (dotAi) recommendations.push(`${dotAi.domain} is available — strong choice for AI-focused businesses`)

  if (available.length === 0) {
    recommendations.push('All checked domains appear to be taken — consider a slightly different business name variation')
  }

  return Response.json({
    name,
    slug,
    domains: domainResults,
    socials,
    recommendations,
    availableCount: available.length,
    checkedAt: new Date().toISOString(),
  })
}
