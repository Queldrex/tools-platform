import { Redis } from '@upstash/redis'
import type { ScanResult } from '@/lib/framework/types'

export interface DfySession {
  token: string
  scanId: string
  emailAddress: string
  domain: string
  score: number
  status: 'paid' | 'booked' | 'credentials_submitted' | 'implementing' | 'complete'
  bookedAt?: string
  credentials?: string   // JSON string, only populated after client submits form
  createdAt: string
}

const DFY_TTL = 60 * 60 * 72  // 72 hours

let _redis: Redis | null = null
function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL)!,
      token: (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN)!,
    })
  }
  return _redis
}

const SCAN_TTL = 60 * 60 * 48

export async function saveScan(scan: ScanResult): Promise<void> {
  await getRedis().set(`scan:${scan.scanId}`, JSON.stringify(scan), { ex: SCAN_TTL })
}

export async function getScan(scanId: string): Promise<ScanResult | null> {
  const data = await getRedis().get<string>(`scan:${scanId}`)
  if (!data) return null
  return typeof data === 'string' ? JSON.parse(data) : data as ScanResult
}

export async function getScanByToken(token: string): Promise<ScanResult | null> {
  const scanId = await getRedis().get<string>(`token:${token}`)
  if (!scanId) return null
  return getScan(scanId)
}

export async function saveDownloadToken(token: string, scanId: string): Promise<void> {
  await getRedis().set(`token:${token}`, scanId, { ex: SCAN_TTL })
}

export async function saveDfySession(session: DfySession): Promise<void> {
  await getRedis().set(`dfy:${session.token}`, JSON.stringify(session), { ex: DFY_TTL })
}

export async function getDfySession(token: string): Promise<DfySession | null> {
  const data = await getRedis().get<string>(`dfy:${token}`)
  if (!data) return null
  return typeof data === 'string' ? JSON.parse(data) : data as DfySession
}

// ── Permanent scan log ────────────────────────────────────────────────────────

export interface ScanLogEntry {
  scanId: string
  domain: string
  email: string
  score: number
  paid: boolean
  paidAt?: string
  status: string
  createdAt: string
}

const LOG_KEY = 'scanlog'

export async function appendScanLog(entry: ScanLogEntry): Promise<void> {
  const redis = getRedis()
  const score = Date.now()
  // Sorted set: score = unix ms timestamp, member = JSON entry
  await redis.zadd(LOG_KEY, { score, member: JSON.stringify(entry) })
}

export async function updateScanLog(scanId: string, updates: Partial<ScanLogEntry>): Promise<void> {
  const redis = getRedis()
  // Scan the full log to find and replace the entry
  const all = await redis.zrange(LOG_KEY, 0, -1, { withScores: true })
  for (let i = 0; i < all.length; i += 2) {
    const raw = all[i] as string
    const ts = all[i + 1] as number
    try {
      const entry: ScanLogEntry = typeof raw === 'string' ? JSON.parse(raw) : raw
      if (entry.scanId === scanId) {
        const updated = { ...entry, ...updates }
        await redis.zrem(LOG_KEY, raw)
        await redis.zadd(LOG_KEY, { score: ts, member: JSON.stringify(updated) })
        return
      }
    } catch { /* skip malformed entries */ }
  }
}

export async function getScanLog(limit = 200, offset = 0): Promise<ScanLogEntry[]> {
  const redis = getRedis()
  // Return newest first
  const raw = await redis.zrange(LOG_KEY, offset, offset + limit - 1, { rev: true })
  return raw.map(r => {
    try { return typeof r === 'string' ? JSON.parse(r) : r }
    catch { return null }
  }).filter(Boolean) as ScanLogEntry[]
}

export async function getScanLogCount(): Promise<number> {
  return getRedis().zcard(LOG_KEY)
}
