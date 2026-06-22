import { NextRequest } from 'next/server'
import { hasFreeOrProAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'

interface DoHAnswer { name: string; type: number; TTL: number; data: string }
interface DoHResponse { Status: number; Answer?: DoHAnswer[] }

async function dohQuery(name: string, type: string): Promise<DoHResponse> {
  const res = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`,
    { headers: { Accept: 'application/dns-json' }, signal: AbortSignal.timeout(8000) }
  )
  if (!res.ok) throw new Error(`DoH ${res.status}`)
  return res.json()
}

function cleanTxt(s: string): string {
  return s.replace(/^"|"$/g, '').replace(/"\s*"/g, '')
}

async function checkSpf(domain: string) {
  try {
    const r = await dohQuery(domain, 'TXT')
    const txt = (r.Answer ?? []).map(a => cleanTxt(a.data))
    const spf = txt.find(t => t.toLowerCase().startsWith('v=spf1'))
    if (!spf) return { found: false, record: '', policy: 'fail' as const, detail: 'No SPF record found. Emails can be spoofed from your domain.' }
    if (spf.includes('+all')) return { found: true, record: spf, policy: 'fail' as const, detail: '+all allows anyone to send email as your domain — extremely dangerous.' }
    if (spf.includes('-all')) return { found: true, record: spf, policy: 'pass' as const, detail: 'SPF configured with hard fail (-all). Unauthorized senders will be rejected.' }
    if (spf.includes('~all')) return { found: true, record: spf, policy: 'warning' as const, detail: 'SPF uses soft fail (~all). Unauthorized emails may still be delivered. Consider upgrading to -all.' }
    return { found: true, record: spf, policy: 'warning' as const, detail: 'SPF found but missing an "all" mechanism. Add -all to reject unauthorized senders.' }
  } catch {
    return { found: false, record: '', policy: 'fail' as const, detail: 'Could not check SPF record.' }
  }
}

async function checkDmarc(domain: string) {
  try {
    const r = await dohQuery(`_dmarc.${domain}`, 'TXT')
    const txt = (r.Answer ?? []).map(a => cleanTxt(a.data))
    const dmarc = txt.find(t => t.toLowerCase().startsWith('v=dmarc1'))
    if (!dmarc) return { found: false, record: '', policy: 'none', reportingConfigured: false, detail: 'No DMARC record. Your domain has no protection against email spoofing.' }
    const pMatch = dmarc.match(/p=([^;]+)/i)
    const policy = pMatch ? pMatch[1].toLowerCase() : 'none'
    const reportingConfigured = dmarc.includes('rua=')
    const policyLabel = policy === 'reject' ? 'Maximum protection — failing emails rejected.' : policy === 'quarantine' ? 'Good protection — failing emails go to spam.' : 'Monitoring only (p=none) — no enforcement. Upgrade to p=quarantine or p=reject.'
    return { found: true, record: dmarc, policy, reportingConfigured, detail: policyLabel }
  } catch {
    return { found: false, record: '', policy: 'none', reportingConfigured: false, detail: 'Could not check DMARC record.' }
  }
}

async function checkDkim(domain: string) {
  const selectors = ['google', 'default', 'selector1', 'selector2', 'k1', 's1', 's2', 'dkim', 'mail', 'smtp', 'mandrill', 'sendgrid', 'mailchimp', 'protonmail']
  const results = await Promise.allSettled(
    selectors.map(async sel => {
      const r = await dohQuery(`${sel}._domainkey.${domain}`, 'TXT')
      const txt = (r.Answer ?? []).map(a => cleanTxt(a.data)).join('')
      if (r.Status === 0 && r.Answer?.length && (txt.includes('v=DKIM1') || txt.includes('p='))) return sel
      return null
    })
  )
  const found = results.flatMap(r => r.status === 'fulfilled' && r.value ? [r.value] : [])
  return { foundSelectors: found, hasAny: found.length > 0 }
}

async function checkMx(domain: string) {
  try {
    const r = await dohQuery(domain, 'MX')
    const records = (r.Answer ?? [])
      .filter(a => a.type === 15)
      .map(a => {
        const parts = a.data.split(' ')
        return { priority: parseInt(parts[0]) || 10, exchange: parts[1]?.replace(/\.$/, '') || '' }
      })
      .sort((a, b) => a.priority - b.priority)
    return { records, hasRecords: records.length > 0 }
  } catch {
    return { records: [], hasRecords: false }
  }
}

async function checkBlacklist(mx: { records: Array<{ priority: number; exchange: string }>; hasRecords: boolean }) {
  if (!mx.hasRecords || !mx.records[0]) return { ip: '', checked: [], listed: [], clean: true }
  const host = mx.records[0].exchange
  let ip = ''
  try {
    const r = await dohQuery(host, 'A')
    ip = r.Answer?.[0]?.data ?? ''
  } catch { return { ip: '', checked: [], listed: [], clean: true } }
  if (!ip || !ip.match(/^\d+\.\d+\.\d+\.\d+$/)) return { ip, checked: [], listed: [], clean: true }

  const reversed = ip.split('.').reverse().join('.')
  const rbls = ['zen.spamhaus.org', 'bl.spamcop.net', 'b.barracudacentral.org']
  const results = await Promise.allSettled(
    rbls.map(async rbl => {
      const r = await dohQuery(`${reversed}.${rbl}`, 'A')
      return { rbl, listed: r.Status === 0 && (r.Answer?.length ?? 0) > 0 }
    })
  )
  const listed = results.flatMap(r => r.status === 'fulfilled' && r.value.listed ? [r.value.rbl] : [])
  return { ip, checked: rbls, listed, clean: listed.length === 0 }
}

export async function POST(request: NextRequest) {
  const access = await hasFreeOrProAccess(request, 'email-deliverability', 3)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  let body: { domain?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  let domain = (body.domain || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  if (!domain || !/^[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?)+$/.test(domain)) {
    return Response.json({ error: 'Enter a valid domain name (e.g. example.com)' }, { status: 400 })
  }

  const [spf, dmarc, dkim, mx] = await Promise.all([checkSpf(domain), checkDmarc(domain), checkDkim(domain), checkMx(domain)])
  const blacklist = await checkBlacklist(mx)

  let score = 0
  if (spf.found) { score += 20; if (spf.policy === 'pass') score += 5 }
  if (dmarc.found) { score += 25; if (dmarc.policy === 'reject') score += 10 }
  if (dkim.hasAny) score += 25
  if (mx.hasRecords) score += 15
  if (blacklist.clean) score += 10
  if (!blacklist.clean && blacklist.listed.includes('zen.spamhaus.org')) score -= 30
  score = Math.max(0, Math.min(100, score))

  const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : 'F'

  return Response.json({ domain, score, grade, spf, dmarc, dkim, mx, blacklist, checkedAt: new Date().toISOString() })
}
