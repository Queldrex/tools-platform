import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

interface CheckResult {
  label: string
  pass: boolean
  detail: string
}

async function checkDomain(domain: string): Promise<CheckResult[]> {
  const results: CheckResult[] = []
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].trim()

  // 1. HTTPS check + security headers
  try {
    const res = await fetch(`https://${cleanDomain}`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
      redirect: 'follow',
    })
    results.push({ label: 'HTTPS', pass: true, detail: `Responds on HTTPS (${res.status})` })

    const headers = Object.fromEntries(res.headers.entries())
    const hsts = headers['strict-transport-security']
    const xfo = headers['x-frame-options']
    const xcto = headers['x-content-type-options']
    const csp = headers['content-security-policy']

    results.push({
      label: 'HSTS (Strict-Transport-Security)',
      pass: !!hsts,
      detail: hsts ? `Set: ${hsts.slice(0, 60)}` : 'Header missing — browsers may downgrade to HTTP',
    })
    results.push({
      label: 'X-Frame-Options',
      pass: !!xfo,
      detail: xfo ? `Set: ${xfo}` : 'Missing — site may be embeddable in iframes (clickjacking risk)',
    })
    results.push({
      label: 'X-Content-Type-Options',
      pass: !!xcto,
      detail: xcto ? `Set: ${xcto}` : 'Missing — browser may MIME-sniff responses',
    })
    results.push({
      label: 'Content-Security-Policy',
      pass: !!csp,
      detail: csp ? 'CSP header present' : 'Missing — no XSS protection policy set',
    })
  } catch {
    results.push({ label: 'HTTPS', pass: false, detail: 'Domain did not respond on HTTPS' })
    results.push({ label: 'HSTS (Strict-Transport-Security)', pass: false, detail: 'Could not check — HTTPS unavailable' })
    results.push({ label: 'X-Frame-Options', pass: false, detail: 'Could not check — HTTPS unavailable' })
    results.push({ label: 'X-Content-Type-Options', pass: false, detail: 'Could not check — HTTPS unavailable' })
    results.push({ label: 'Content-Security-Policy', pass: false, detail: 'Could not check — HTTPS unavailable' })
  }

  // 2. DMARC
  try {
    const dmarcRes = await fetch(`https://dns.google/resolve?name=_dmarc.${cleanDomain}&type=TXT`, {
      signal: AbortSignal.timeout(4000),
    })
    const dmarcData = await dmarcRes.json()
    const hasDmarc = dmarcData.Answer?.some((r: { data: string }) => r.data?.includes('v=DMARC1'))
    results.push({
      label: 'DMARC',
      pass: !!hasDmarc,
      detail: hasDmarc ? 'DMARC record found — email spoofing protection active' : 'No DMARC record — domain emails can be spoofed',
    })
  } catch {
    results.push({ label: 'DMARC', pass: false, detail: 'Could not check DMARC record' })
  }

  // 3. SPF
  try {
    const spfRes = await fetch(`https://dns.google/resolve?name=${cleanDomain}&type=TXT`, {
      signal: AbortSignal.timeout(4000),
    })
    const spfData = await spfRes.json()
    const hasSpf = spfData.Answer?.some((r: { data: string }) => r.data?.includes('v=spf1'))
    results.push({
      label: 'SPF',
      pass: !!hasSpf,
      detail: hasSpf ? 'SPF record found — authorized mail servers declared' : 'No SPF record — anyone can send email as your domain',
    })
  } catch {
    results.push({ label: 'SPF', pass: false, detail: 'Could not check SPF record' })
  }

  return results
}

export async function POST(request: NextRequest) {
  let body: { type?: string; query?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { type, query } = body
  if (!type || !query) return Response.json({ error: 'type and query required' }, { status: 400 })

  if (type === 'domain') {
    if (!query.match(/^[a-zA-Z0-9][a-zA-Z0-9-_.]{1,253}[a-zA-Z0-9]$/)) {
      return Response.json({ error: 'Invalid domain format' }, { status: 400 })
    }
    const checks = await checkDomain(query)
    const passed = checks.filter(c => c.pass).length
    return Response.json({ ok: true, domain: query.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0], checks, passed, total: checks.length })
  }

  return Response.json({ error: 'Unknown type' }, { status: 400 })
}
