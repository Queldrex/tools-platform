import { NextRequest } from 'next/server'
import { hasFreeOrProAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

interface DoHAnswer { name: string; type: number; TTL: number; data: string }
interface DoHResponse { Status: number; Answer?: DoHAnswer[]; Authority?: DoHAnswer[] }

async function cfDoh(name: string, type: string): Promise<DoHResponse> {
  const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`,
    { headers: { Accept: 'application/dns-json' }, signal: AbortSignal.timeout(7000) })
  if (!r.ok) return { Status: 2 }
  return r.json()
}

async function gDoh(name: string, type: string): Promise<DoHResponse> {
  const r = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`,
    { signal: AbortSignal.timeout(7000) })
  if (!r.ok) return { Status: 2 }
  return r.json()
}

function extractData(r: DoHResponse, typeNum: number): string[] {
  return (r.Answer ?? []).filter(a => a.type === typeNum).map(a => a.data.replace(/\.$/, ''))
}

function getTTL(r: DoHResponse, typeNum: number): number {
  return (r.Answer ?? []).find(a => a.type === typeNum)?.TTL ?? 0
}

function arraysEqual(a: string[], b: string[]): boolean {
  const sa = [...a].sort().join('\n')
  const sb = [...b].sort().join('\n')
  return sa === sb
}

function parseMx(data: string): { priority: number; exchange: string } {
  const parts = data.trim().split(/\s+/)
  if (parts.length >= 2) return { priority: parseInt(parts[0]) || 10, exchange: parts.slice(1).join(' ').replace(/\.$/, '') }
  return { priority: 10, exchange: data.replace(/\.$/, '') }
}

function parseSoa(data: string): Record<string, string | number> {
  const parts = data.trim().split(/\s+/)
  return { mname: (parts[0] ?? '').replace(/\.$/, ''), rname: (parts[1] ?? '').replace(/\.$/, ''), serial: parseInt(parts[2]) || 0, refresh: parseInt(parts[3]) || 0, retry: parseInt(parts[4]) || 0, expire: parseInt(parts[5]) || 0, minimum: parseInt(parts[6]) || 0 }
}

function parseCaa(data: string): { flag: number; tag: string; value: string } {
  const parts = data.trim().split(/\s+/, 3)
  return { flag: parseInt(parts[0]) || 0, tag: parts[1] ?? '', value: (parts[2] ?? '').replace(/^"|"$/g, '') }
}

export async function POST(request: NextRequest) {
  const access = await hasFreeOrProAccess(request, 'dns-health', 5)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  let body: { domain?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  let domain = (body.domain || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/:\d+$/, '')
  if (!domain || !/^[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?)+$/.test(domain)) {
    return Response.json({ error: 'Enter a valid domain name (e.g. example.com)' }, { status: 400 })
  }

  const [cfA, gA, cfAAAA, gAAAA, cfMX, cfNS, cfTXT, cfSOA, cfCAA, cfDMARC, cfWWW] = await Promise.all([
    cfDoh(domain, 'A'), gDoh(domain, 'A'),
    cfDoh(domain, 'AAAA'), gDoh(domain, 'AAAA'),
    cfDoh(domain, 'MX'),
    cfDoh(domain, 'NS'),
    cfDoh(domain, 'TXT'),
    cfDoh(domain, 'SOA'),
    cfDoh(domain, 'CAA'),
    cfDoh(`_dmarc.${domain}`, 'TXT'),
    cfDoh(`www.${domain}`, 'A'),
  ])

  const aData = extractData(cfA, 1)
  const aDataG = extractData(gA, 1)
  const aPropagated = arraysEqual(aData, aDataG)

  const aaaaData = extractData(cfAAAA, 28)
  const mxRaw = (cfMX.Answer ?? []).filter(a => a.type === 15).map(a => parseMx(a.data)).sort((a, b) => a.priority - b.priority)
  const nsData = extractData(cfNS, 2)
  const txtData = (cfTXT.Answer ?? []).filter(a => a.type === 16).map(a => a.data.replace(/^"|"$/g, '').replace(/"\s*"/g, ''))
  const soaRaw = (cfSOA.Answer ?? []).find(a => a.type === 6)
  const soaParsed = soaRaw ? parseSoa(soaRaw.data) : null
  const caaRaw = (cfCAA.Answer ?? []).filter(a => a.type === 257).map(a => parseCaa(a.data))
  const dmarcData = (cfDMARC.Answer ?? []).filter(a => a.type === 16).map(a => a.data.replace(/^"|"$/g, '').replace(/"\s*"/g, ''))
  const wwwData = extractData(cfWWW, 1)

  const propagationStatus = aData.length === 0 ? 'not-found' : aPropagated ? 'propagated' : 'propagating'

  return Response.json({
    domain,
    records: {
      A: { found: aData.length > 0, data: aData, ttl: getTTL(cfA, 1), propagated: aPropagated },
      AAAA: { found: aaaaData.length > 0, data: aaaaData, ttl: getTTL(cfAAAA, 28) },
      MX: { found: mxRaw.length > 0, data: mxRaw, ttl: getTTL(cfMX, 15) },
      NS: { found: nsData.length > 0, data: nsData, ttl: getTTL(cfNS, 2) },
      TXT: { found: txtData.length > 0, data: txtData, ttl: getTTL(cfTXT, 16) },
      SOA: { found: !!soaParsed, data: soaParsed, ttl: soaRaw?.TTL ?? 0 },
      CAA: { found: caaRaw.length > 0, data: caaRaw, ttl: getTTL(cfCAA, 257) },
      DMARC: { found: dmarcData.length > 0, data: dmarcData },
      WWW: { found: wwwData.length > 0, data: wwwData },
    },
    propagationStatus,
    hasIPv6: aaaaData.length > 0,
    hasCAA: caaRaw.length > 0,
    checkedAt: new Date().toISOString(),
  })
}
