import { NextRequest, NextResponse } from 'next/server'
import { hasFreeOrProAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'

interface Detection {
  category: string
  name: string
  confidence: 'high' | 'medium' | 'low'
  evidence: string
}

const SIGNATURES: { category: string; name: string; patterns: RegExp[]; headerPatterns?: Record<string, RegExp> }[] = [
  // Frameworks / CMS
  { category: 'CMS', name: 'WordPress', patterns: [/wp-content\/themes\//i, /wp-json\//i, /wp-includes\//i], headerPatterns: { 'x-powered-by': /WordPress/i } },
  { category: 'CMS', name: 'Shopify', patterns: [/cdn\.shopify\.com/i, /shopify\.com\/s\/files/i, /"shopify"/i] },
  { category: 'CMS', name: 'Webflow', patterns: [/webflow\.io/i, /\.webflow\.com/i, /"webflow"/i] },
  { category: 'CMS', name: 'Squarespace', patterns: [/squarespace\.com/i, /static\.squarespace\.com/i] },
  { category: 'CMS', name: 'Wix', patterns: [/wix\.com/i, /wixstatic\.com/i, /parastorage\.com/i] },
  { category: 'CMS', name: 'Ghost', patterns: [/ghost\.io/i, /ghost\.org/i, /"ghost-(?:blog|theme)"/i] },
  // JS Frameworks
  { category: 'Framework', name: 'Next.js', patterns: [/__NEXT_DATA__/i, /_next\/static\//i, /next\/dist\//i], headerPatterns: { 'x-powered-by': /Next\.js/i } },
  { category: 'Framework', name: 'Nuxt.js', patterns: [/__nuxt/i, /_nuxt\//i] },
  { category: 'Framework', name: 'React', patterns: [/react(?:\.min)?\.js/i, /__reactFiber/i, /data-reactroot/i] },
  { category: 'Framework', name: 'Vue.js', patterns: [/vue(?:\.min)?\.js/i, /__vue__/i, /v-bind:|v-if|v-for/i] },
  { category: 'Framework', name: 'Angular', patterns: [/ng-version/i, /angular(?:\.min)?\.js/i, /ng\-app=/i] },
  { category: 'Framework', name: 'Svelte', patterns: [/svelte/i, /__svelte/i] },
  // Hosting / CDN
  { category: 'Hosting', name: 'Vercel', patterns: [], headerPatterns: { 'server': /Vercel/i, 'x-vercel-id': /.+/ } },
  { category: 'Hosting', name: 'Netlify', patterns: [], headerPatterns: { 'x-nf-request-id': /.+/, 'server': /Netlify/i } },
  { category: 'Hosting', name: 'Cloudflare', patterns: [], headerPatterns: { 'cf-ray': /.+/, 'server': /cloudflare/i } },
  { category: 'Hosting', name: 'AWS', patterns: [], headerPatterns: { 'x-amz-cf-id': /.+/, 'x-amzn-requestid': /.+/ } },
  { category: 'Hosting', name: 'GitHub Pages', patterns: [/github\.io/i], headerPatterns: { 'x-github-request-id': /.+/ } },
  // Analytics
  { category: 'Analytics', name: 'Google Analytics', patterns: [/google-analytics\.com\/analytics\.js/i, /gtag\/js/i, /ga\('create'/i, /googletagmanager\.com/i] },
  { category: 'Analytics', name: 'Plausible', patterns: [/plausible\.io\/js/i] },
  { category: 'Analytics', name: 'Hotjar', patterns: [/hotjar\.com/i, /hjSetting/i] },
  { category: 'Analytics', name: 'Mixpanel', patterns: [/mixpanel\.com/i, /mixpanel\.init/i] },
  { category: 'Analytics', name: 'Segment', patterns: [/segment\.io/i, /segment\.com\/analytics/i] },
  // E-commerce
  { category: 'E-commerce', name: 'Stripe', patterns: [/js\.stripe\.com/i, /stripe\.js/i] },
  { category: 'E-commerce', name: 'WooCommerce', patterns: [/woocommerce/i, /wc-ajax/i] },
  // Marketing
  { category: 'Marketing', name: 'HubSpot', patterns: [/hs-scripts\.com/i, /hubspot\.com/i] },
  { category: 'Marketing', name: 'Intercom', patterns: [/intercomcdn\.com/i, /widget\.intercom\.io/i] },
  { category: 'Marketing', name: 'Drift', patterns: [/drift\.com\/drift\.js/i] },
  // Language/runtime
  { category: 'Language', name: 'PHP', patterns: [], headerPatterns: { 'x-powered-by': /PHP/i } },
  { category: 'Language', name: 'ASP.NET', patterns: [], headerPatterns: { 'x-powered-by': /ASP\.NET/i, 'x-aspnet-version': /.+/ } },
  { category: 'Language', name: 'Ruby on Rails', patterns: [/csrf-token/i], headerPatterns: { 'x-powered-by': /Phusion Passenger/i } },
]

export async function POST(req: NextRequest) {
  const access = await hasFreeOrProAccess(req, 'tech-stack', 5)
  if (!access.allowed) return NextResponse.json({ paywall: true, remaining: 0 }, { status: 402 })
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

    let cleanUrl = url.trim()
    if (!/^https?:\/\//i.test(cleanUrl)) cleanUrl = `https://${cleanUrl}`

    const parsed = new URL(cleanUrl)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return NextResponse.json({ error: 'Only http and https URLs are supported' }, { status: 400 })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    let html = ''
    let responseHeaders: Record<string, string> = {}
    let statusCode = 0
    let finalUrl = cleanUrl

    try {
      const res = await fetch(cleanUrl, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; QueldrexBot/1.0; Tech Stack Detector)' },
        redirect: 'follow',
      })
      clearTimeout(timeout)
      statusCode = res.status
      finalUrl = res.url || cleanUrl

      res.headers.forEach((val, key) => { responseHeaders[key.toLowerCase()] = val })
      html = await res.text().catch(() => '')
    } catch (err: unknown) {
      clearTimeout(timeout)
      if (err instanceof Error && err.name === 'AbortError') {
        return NextResponse.json({ error: 'Request timed out (10s). The site may be slow or blocking bots.' }, { status: 408 })
      }
      throw err
    }

    const detections: Detection[] = []
    const seen = new Set<string>()

    for (const sig of SIGNATURES) {
      if (seen.has(sig.name)) continue

      let matched = false
      let evidence = ''
      let confidence: Detection['confidence'] = 'medium'

      // Check HTML patterns
      for (const pattern of sig.patterns) {
        if (pattern.test(html)) {
          matched = true
          const match = html.match(pattern)
          evidence = match ? `Found in page source: "${match[0].slice(0, 60)}"` : 'Found in page source'
          confidence = 'high'
          break
        }
      }

      // Check response headers
      if (!matched && sig.headerPatterns) {
        for (const [header, pattern] of Object.entries(sig.headerPatterns)) {
          const val = responseHeaders[header]
          if (val && pattern.test(val)) {
            matched = true
            evidence = `Response header ${header}: "${val}"`
            confidence = 'high'
            break
          }
        }
      }

      if (matched) {
        seen.add(sig.name)
        detections.push({ category: sig.category, name: sig.name, confidence, evidence })
      }
    }

    // Group by category
    const grouped: Record<string, Detection[]> = {}
    for (const d of detections) {
      if (!grouped[d.category]) grouped[d.category] = []
      grouped[d.category].push(d)
    }

    const securityHeaders = {
      https: cleanUrl.startsWith('https'),
      hsts: !!responseHeaders['strict-transport-security'],
      xframe: !!responseHeaders['x-frame-options'],
      csp: !!responseHeaders['content-security-policy'],
      xcontenttype: !!responseHeaders['x-content-type-options'],
    }

    return NextResponse.json({
      url: finalUrl,
      statusCode,
      detections,
      grouped,
      securityHeaders,
      responseHeaders: Object.fromEntries(
        Object.entries(responseHeaders).filter(([k]) =>
          ['server', 'x-powered-by', 'content-type', 'x-frame-options', 'strict-transport-security', 'content-security-policy', 'x-content-type-options', 'cache-control'].includes(k)
        )
      ),
      scannedAt: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json({ error: 'Scan failed. The site may be unreachable or blocking requests.' }, { status: 500 })
  }
}
