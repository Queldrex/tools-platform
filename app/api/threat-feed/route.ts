import { NextRequest } from 'next/server'
import { getRedis } from '@/lib/store/redis'
import { hasToolAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'

export interface ThreatEntry {
  id: string
  indicator: string
  indicatorType: 'URL' | 'IP'
  category: 'MALWARE' | 'C2' | 'BOTNET'
  severity: 'critical' | 'high' | 'medium'
  source: string
  status: 'active' | 'inactive'
  malwareFamily?: string
  firstSeen: string
}

const CACHE_KEY = 'threat:feed:cache'
const CACHE_TTL = 900 // 15 minutes

const BOTNET_FAMILIES = ['Emotet', 'Trickbot', 'QakBot', 'Dridex']

async function fetchURLhaus(): Promise<ThreatEntry[]> {
  const body = new URLSearchParams({ limit: '100' })
  const res = await fetch('https://urlhaus-api.abuse.ch/v1/urls/recent/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`URLhaus ${res.status}`)
  const data = await res.json()
  if (!data.urls || !Array.isArray(data.urls)) return []

  return data.urls.map((u: Record<string, string>, i: number): ThreatEntry => {
    const online = u.url_status === 'online'
    const isBotnet = u.threat === 'botnet_cc'
    return {
      id: `urlhaus-${i}-${Date.now()}`,
      indicator: u.url,
      indicatorType: 'URL',
      category: isBotnet ? 'C2' : 'MALWARE',
      severity: online && !isBotnet ? 'critical' : online && isBotnet ? 'high' : 'medium',
      source: 'URLhaus',
      status: online ? 'active' : 'inactive',
      malwareFamily: Array.isArray(u.tags) && u.tags.length > 0 ? u.tags[0] : undefined,
      firstSeen: u.dateadded || new Date().toISOString(),
    }
  })
}

async function fetchFeodo(): Promise<ThreatEntry[]> {
  const res = await fetch('https://feodotracker.abuse.ch/downloads/ipblocklist.json', {
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`Feodo ${res.status}`)
  const data: Array<Record<string, string>> = await res.json()
  if (!Array.isArray(data)) return []

  return data.slice(0, 100).map((entry, i): ThreatEntry => {
    const online = entry.status === 'online'
    const isBotnet = BOTNET_FAMILIES.includes(entry.malware)
    return {
      id: `feodo-${i}-${Date.now()}`,
      indicator: entry.ip_address,
      indicatorType: 'IP',
      category: isBotnet ? 'BOTNET' : 'C2',
      severity: online ? 'critical' : 'medium',
      source: 'Feodo Tracker',
      status: online ? 'active' : 'inactive',
      malwareFamily: entry.malware || undefined,
      firstSeen: entry.first_seen || new Date().toISOString(),
    }
  })
}

export async function GET(request: NextRequest) {
  if (!await hasToolAccess(request)) return Response.json({ paywall: true }, { status: 402 })
  const redis = getRedis()

  // Cache hit
  const cached = await redis.get<string>(CACHE_KEY)
  if (cached) {
    const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached
    return Response.json({ ok: true, entries: parsed, cached: true })
  }

  // Fetch both feeds concurrently
  const [urlhausResult, feodoResult] = await Promise.allSettled([fetchURLhaus(), fetchFeodo()])

  const entries: ThreatEntry[] = []
  if (urlhausResult.status === 'fulfilled') entries.push(...urlhausResult.value)
  if (feodoResult.status === 'fulfilled') entries.push(...feodoResult.value)

  if (entries.length === 0) {
    return Response.json({ ok: false, error: 'Feed temporarily unavailable', entries: [] }, { status: 503 })
  }

  // Sort newest first
  entries.sort((a, b) => new Date(b.firstSeen).getTime() - new Date(a.firstSeen).getTime())

  await redis.set(CACHE_KEY, JSON.stringify(entries), { ex: CACHE_TTL })

  return Response.json({ ok: true, entries, cached: false })
}
