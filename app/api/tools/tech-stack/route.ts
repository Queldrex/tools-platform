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
  { category: 'CMS', name: 'Drupal', patterns: [/drupal\.js/i, /\/sites\/default\/files\//i, /drupalSettings/i], headerPatterns: { 'x-drupal-cache': /.+/, 'x-drupal-dynamic-cache': /.+/ } },
  { category: 'CMS', name: 'Joomla', patterns: [/joomla/i, /\/media\/jui\//i, /\/components\/com_/i] },
  { category: 'CMS', name: 'Hugo', patterns: [/generator.*Hugo/i, /hugo-/i] },
  { category: 'CMS', name: 'Jekyll', patterns: [/generator.*Jekyll/i, /jekyll/i] },
  { category: 'CMS', name: 'Contentful', patterns: [/ctfassets\.net/i, /contentful\.com/i] },
  { category: 'CMS', name: 'Sanity', patterns: [/sanity\.io/i, /cdn\.sanity\.io/i] },
  // JS Frameworks
  { category: 'Framework', name: 'Next.js', patterns: [/__NEXT_DATA__/i, /_next\/static\//i, /next\/dist\//i], headerPatterns: { 'x-powered-by': /Next\.js/i } },
  { category: 'Framework', name: 'Nuxt.js', patterns: [/__nuxt/i, /_nuxt\//i] },
  { category: 'Framework', name: 'React', patterns: [/react(?:\.min)?\.js/i, /__reactFiber/i, /data-reactroot/i] },
  { category: 'Framework', name: 'Vue.js', patterns: [/vue(?:\.min)?\.js/i, /__vue__/i, /v-bind:|v-if|v-for/i] },
  { category: 'Framework', name: 'Angular', patterns: [/ng-version/i, /angular(?:\.min)?\.js/i, /ng\-app=/i] },
  { category: 'Framework', name: 'Svelte', patterns: [/svelte/i, /__svelte/i] },
  { category: 'Framework', name: 'Remix', patterns: [/__remixContext/i, /\/build\/entry\.client\./i] },
  { category: 'Framework', name: 'Astro', patterns: [/astro-island/i, /@astrojs\//i, /astro\/client/i] },
  { category: 'Framework', name: 'SvelteKit', patterns: [/__sveltekit/i, /\/_app\/immutable\//i] },
  { category: 'Framework', name: 'Gatsby', patterns: [/___gatsby/i, /gatsby-chunk-mapping/i, /page-data\.json/i] },
  { category: 'Framework', name: 'Alpine.js', patterns: [/alpinejs/i, /x-data=/i, /x-bind:/i] },
  { category: 'Framework', name: 'htmx', patterns: [/htmx\.org/i, /hx-get=/i, /hx-post=/i] },
  { category: 'Framework', name: 'Ember.js', patterns: [/ember\.js/i, /ember-application/i] },
  // Hosting / CDN
  { category: 'Hosting', name: 'Vercel', patterns: [], headerPatterns: { 'server': /Vercel/i, 'x-vercel-id': /.+/ } },
  { category: 'Hosting', name: 'Netlify', patterns: [], headerPatterns: { 'x-nf-request-id': /.+/, 'server': /Netlify/i } },
  { category: 'Hosting', name: 'Cloudflare', patterns: [], headerPatterns: { 'cf-ray': /.+/, 'server': /cloudflare/i } },
  { category: 'Hosting', name: 'AWS', patterns: [], headerPatterns: { 'x-amz-cf-id': /.+/, 'x-amzn-requestid': /.+/ } },
  { category: 'Hosting', name: 'GitHub Pages', patterns: [/github\.io/i], headerPatterns: { 'x-github-request-id': /.+/ } },
  { category: 'Hosting', name: 'Fastly', patterns: [], headerPatterns: { 'x-served-by': /cache-/i, 'via': /fastly/i, 'x-fastly-request-id': /.+/ } },
  { category: 'Hosting', name: 'Heroku', patterns: [], headerPatterns: { 'x-request-id': /.+/, 'via': /heroku/i } },
  { category: 'Hosting', name: 'Firebase', patterns: [/firebase\.google\.com/i, /firebasestorage\.googleapis\.com/i], headerPatterns: { 'x-firebase-appcheck': /.+/ } },
  { category: 'Hosting', name: 'Fly.io', patterns: [], headerPatterns: { 'fly-request-id': /.+/ } },
  // Analytics
  { category: 'Analytics', name: 'Google Analytics', patterns: [/google-analytics\.com\/analytics\.js/i, /gtag\/js/i, /ga\('create'/i, /googletagmanager\.com/i] },
  { category: 'Analytics', name: 'Plausible', patterns: [/plausible\.io\/js/i] },
  { category: 'Analytics', name: 'Hotjar', patterns: [/hotjar\.com/i, /hjSetting/i] },
  { category: 'Analytics', name: 'Mixpanel', patterns: [/mixpanel\.com/i, /mixpanel\.init/i] },
  { category: 'Analytics', name: 'Segment', patterns: [/segment\.io/i, /segment\.com\/analytics/i] },
  { category: 'Analytics', name: 'Meta Pixel', patterns: [/connect\.facebook\.net/i, /fbq\(/i, /facebook-jssdk/i] },
  { category: 'Analytics', name: 'PostHog', patterns: [/posthog\.com/i, /posthog\.init/i] },
  { category: 'Analytics', name: 'Amplitude', patterns: [/amplitude\.com/i, /amplitude\.getInstance/i] },
  // E-commerce
  { category: 'E-commerce', name: 'Stripe', patterns: [/js\.stripe\.com/i, /stripe\.js/i] },
  { category: 'E-commerce', name: 'WooCommerce', patterns: [/woocommerce/i, /wc-ajax/i] },
  { category: 'E-commerce', name: 'BigCommerce', patterns: [/bigcommerce\.com/i, /cdn11\.bigcommerce\.com/i] },
  { category: 'E-commerce', name: 'Magento', patterns: [/mage\/cookies/i, /Magento_/i, /\/pub\/static\//i] },
  // Marketing
  { category: 'Marketing', name: 'HubSpot', patterns: [/hs-scripts\.com/i, /hubspot\.com/i] },
  { category: 'Marketing', name: 'Intercom', patterns: [/intercomcdn\.com/i, /widget\.intercom\.io/i] },
  { category: 'Marketing', name: 'Drift', patterns: [/drift\.com\/drift\.js/i] },
  { category: 'Marketing', name: 'Mailchimp', patterns: [/mailchimp\.com/i, /chimpstatic\.com/i, /mc-api\.net/i] },
  { category: 'Marketing', name: 'Zendesk', patterns: [/zendesk\.com/i, /zdassets\.com/i] },
  // UI Libraries
  { category: 'UI Library', name: 'Bootstrap', patterns: [/bootstrap(?:\.min)?\.css/i, /bootstrap(?:\.min)?\.js/i, /class="(?:container|row|col-)/i] },
  { category: 'UI Library', name: 'Tailwind CSS', patterns: [/tailwindcss/i, /cdn\.tailwindcss\.com/i] },
  { category: 'UI Library', name: 'jQuery', patterns: [/jquery(?:\.min)?\.js/i, /jquery(?:\.slim)?\.min\.js/i, /\$\.ajax\(/i] },
  { category: 'UI Library', name: 'Material UI', patterns: [/mui\.com/i, /material-ui/i, /@mui\//i] },
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

      for (const pattern of sig.patterns) {
        if (pattern.test(html)) {
          matched = true
          const match = html.match(pattern)
          evidence = match ? `Found in page source: "${match[0].slice(0, 60)}"` : 'Found in page source'
          confidence = 'high'
          break
        }
      }

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

    // Meta generator tag detection
    const generatorMatch = html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']generator["']/i)
    if (generatorMatch && !seen.has('__generator')) {
      seen.add('__generator')
      const gen = generatorMatch[1]
      const genLower = gen.toLowerCase()
      const genMap: Record<string, string> = {
        wordpress: 'WordPress', drupal: 'Drupal', joomla: 'Joomla', ghost: 'Ghost',
        wix: 'Wix', webflow: 'Webflow', hugo: 'Hugo', jekyll: 'Jekyll',
        squarespace: 'Squarespace', gatsby: 'Gatsby'
      }
      for (const [key, name] of Object.entries(genMap)) {
        if (genLower.includes(key) && !seen.has(name)) {
          seen.add(name)
          detections.push({ category: 'CMS', name, confidence: 'high', evidence: `meta generator: "${gen.slice(0, 80)}"` })
        }
      }
    }

    // Parallel WordPress confirmation via /wp-json HEAD
    let wpJsonConfirmed = false
    try {
      const parsedFinal = new URL(finalUrl)
      const wpJsonUrl = `${parsedFinal.origin}/wp-json/wp/v2/`
      const wpRes = await fetch(wpJsonUrl, { method: 'HEAD', signal: AbortSignal.timeout(3000), headers: { 'User-Agent': 'Mozilla/5.0 (compatible; QueldrexBot/1.0)' } })
      if (wpRes.ok || wpRes.status === 401) wpJsonConfirmed = true
    } catch { /* ignore */ }

    if (wpJsonConfirmed && !seen.has('WordPress')) {
      seen.add('WordPress')
      detections.push({ category: 'CMS', name: 'WordPress', confidence: 'high', evidence: '/wp-json/wp/v2/ responded (REST API active)' })
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
      referrerPolicy: !!responseHeaders['referrer-policy'],
    }

    return NextResponse.json({
      url: finalUrl,
      statusCode,
      detections,
      grouped,
      securityHeaders,
      techCount: detections.length,
      responseHeaders: Object.fromEntries(
        Object.entries(responseHeaders).filter(([k]) =>
          ['server', 'x-powered-by', 'content-type', 'x-frame-options', 'strict-transport-security', 'content-security-policy', 'x-content-type-options', 'cache-control', 'referrer-policy'].includes(k)
        )
      ),
      scannedAt: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json({ error: 'Scan failed. The site may be unreachable or blocking requests.' }, { status: 500 })
  }
}
