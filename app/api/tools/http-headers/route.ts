import { NextRequest, NextResponse } from 'next/server'
import { hasFreeOrProAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 15

const HEADER_DOCS: Record<string, { purpose: string; good?: string; bad?: string; security?: boolean }> = {
  'content-security-policy': { purpose: 'Restricts which resources the browser can load. Protects against XSS attacks.', good: 'Strict policy with no unsafe-inline or unsafe-eval', bad: "Missing or allows 'unsafe-inline'/'unsafe-eval'", security: true },
  'strict-transport-security': { purpose: 'Forces HTTPS for future visits. Prevents protocol downgrade attacks and cookie hijacking.', good: 'max-age≥31536000 with includeSubDomains', bad: 'Missing or max-age too short (<1 year)', security: true },
  'x-frame-options': { purpose: 'Prevents the page from being embedded in an iframe on other sites. Protects against clickjacking.', good: 'DENY or SAMEORIGIN', bad: 'Missing or ALLOW-FROM *', security: true },
  'x-content-type-options': { purpose: "Prevents browsers from MIME-sniffing the content type. Stops browsers from interpreting files as something other than what's declared.", good: 'nosniff', bad: 'Missing', security: true },
  'referrer-policy': { purpose: 'Controls how much referrer information is sent when navigating away from your site.', good: 'strict-origin-when-cross-origin or no-referrer', bad: 'unsafe-url (sends full URL including path/query to all sites)', security: true },
  'permissions-policy': { purpose: 'Controls which browser features (camera, microphone, geolocation) can be used by your page and embedded content.', good: 'Explicit per-feature allowlist (e.g. camera=(), microphone=())', bad: 'Missing — defaults allow all features', security: true },
  'cache-control': { purpose: 'Tells browsers and CDNs how long to cache this response. Affects performance and freshness of content.' },
  'content-type': { purpose: 'The MIME type of the response body (e.g. text/html; charset=utf-8, application/json). Browsers use this to decide how to render the content.' },
  'server': { purpose: 'Identifies the web server software and version. Consider removing or obscuring to reduce fingerprinting surface.' },
  'x-powered-by': { purpose: 'Reveals the backend framework (e.g. Express, Next.js). Remove this header to reduce technology fingerprinting.', bad: 'Present — reveals tech stack to attackers' },
  'set-cookie': { purpose: 'Sets a cookie on the client. Check for Secure (HTTPS only), HttpOnly (no JS access), and SameSite (CSRF protection) flags.' },
  'access-control-allow-origin': { purpose: 'CORS header controlling which origins can make cross-origin requests to this resource.' },
  'vary': { purpose: 'Tells caches which request headers affect the response content. Important for content negotiation.' },
  'etag': { purpose: 'A fingerprint of the response content used for cache validation. Allows conditional requests (304 Not Modified).' },
  'last-modified': { purpose: 'When the content was last changed. Used alongside ETags for cache validation.' },
  'content-encoding': { purpose: 'Compression applied to the response body (e.g. gzip, br). Brotli (br) is preferred over gzip.' },
  'transfer-encoding': { purpose: 'How the response body is encoded for transfer (e.g. chunked). Different from content-encoding.' },
  'location': { purpose: 'Redirect target URL. Present on 3xx responses.' },
  'x-xss-protection': { purpose: 'Legacy XSS filter for older browsers. Deprecated — use Content-Security-Policy instead.', bad: 'Set to 1 on modern sites — CSP is the correct replacement' },
  'cross-origin-opener-policy': { purpose: "Isolates your browsing context from cross-origin documents. Enables SharedArrayBuffer and prevents Spectre-style attacks.", security: true },
  'cross-origin-embedder-policy': { purpose: "Controls which cross-origin resources can be embedded. Required alongside COOP to enable high-resolution timers.", security: true },
  'cross-origin-resource-policy': { purpose: "Restricts which sites can load your resources (images, scripts) cross-origin.", security: true },
}

const SECURITY_HEADERS = ['content-security-policy', 'strict-transport-security', 'x-frame-options', 'x-content-type-options', 'referrer-policy', 'permissions-policy']

export async function POST(request: NextRequest) {
  const access = await hasFreeOrProAccess(request, 'http-headers', 10)
  if (!access.allowed) return NextResponse.json({ paywall: true }, { status: 402 })

  try {
    const { url } = await request.json()
    if (!url || typeof url !== 'string') return NextResponse.json({ error: 'URL required' }, { status: 400 })

    let fetchUrl = url.trim()
    if (!/^https?:\/\//i.test(fetchUrl)) fetchUrl = 'https://' + fetchUrl

    const res = await fetch(fetchUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; QueldrexBot/1.0)' },
      signal: AbortSignal.timeout(8000),
      redirect: 'follow',
    })

    const headers: { name: string; value: string; purpose: string; grade: 'good' | 'warn' | 'info'; good?: string; bad?: string }[] = []
    const presentSecurity = new Set<string>()

    for (const [name, value] of res.headers.entries()) {
      const lower = name.toLowerCase()
      const doc = HEADER_DOCS[lower]
      let grade: 'good' | 'warn' | 'info' = 'info'

      if (doc?.security) {
        presentSecurity.add(lower)
        grade = 'good'
      }
      if (lower === 'x-powered-by' || lower === 'server') grade = 'warn'
      if (lower === 'x-xss-protection') grade = 'warn'

      headers.push({
        name,
        value,
        purpose: doc?.purpose || 'Custom or non-standard header.',
        grade,
        good: doc?.good,
        bad: doc?.bad,
      })
    }

    // Add missing security headers as warnings
    const missingSecurity = SECURITY_HEADERS.filter(h => !presentSecurity.has(h))
    const missingHeaders = missingSecurity.map(name => ({
      name,
      value: '(not set)',
      purpose: HEADER_DOCS[name]?.purpose || '',
      grade: 'warn' as const,
      bad: HEADER_DOCS[name]?.bad || 'Missing — recommended for security',
      good: HEADER_DOCS[name]?.good,
    }))

    const securityScore = presentSecurity.size
    const securityMax = SECURITY_HEADERS.length

    return NextResponse.json({
      url: fetchUrl,
      status: res.status,
      statusText: res.statusText,
      headers,
      missingSecurityHeaders: missingHeaders,
      securityScore,
      securityMax,
      securityGrade: securityScore >= 5 ? 'A' : securityScore >= 4 ? 'B' : securityScore >= 3 ? 'C' : securityScore >= 2 ? 'D' : 'F',
      remaining: access.remaining,
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to fetch URL' }, { status: 500 })
  }
}
