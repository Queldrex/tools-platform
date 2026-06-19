import { Redis } from '@upstash/redis'
import type { ScanResult } from '@/lib/framework/types'

export interface DfySession {
  token: string
  scanId: string
  emailAddress: string
  domain: string
  score: number
  status: 'pending_payment' | 'paid' | 'booked' | 'credentials_submitted' | 'implementing' | 'complete'
  bookedAt?: string
  credentials?: string
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

export async function updateDfySession(token: string, updates: Partial<DfySession>): Promise<void> {
  const existing = await getDfySession(token)
  if (!existing) return
  await saveDfySession({ ...existing, ...updates })
}

// ── Permanent scan log ────────────────────────────────────────────────────────
// Storage: sorted set `scanlog` (score=timestamp, member=scanId)
//          + string `scanlog:entry:{scanId}` (full JSON)
// Updates are O(1) — only the entry string is rewritten, sorted set untouched.

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
const entryKey = (scanId: string) => `scanlog:entry:${scanId}`

export async function appendScanLog(entry: ScanLogEntry): Promise<void> {
  const redis = getRedis()
  const score = Date.now()
  await Promise.all([
    redis.zadd(LOG_KEY, { score, member: entry.scanId }),
    redis.set(entryKey(entry.scanId), JSON.stringify(entry)),
  ])
}

export async function updateScanLog(scanId: string, updates: Partial<ScanLogEntry>): Promise<void> {
  const redis = getRedis()
  const raw = await redis.get<string>(entryKey(scanId))
  if (!raw) return
  const existing: ScanLogEntry = typeof raw === 'string' ? JSON.parse(raw) : raw
  await redis.set(entryKey(scanId), JSON.stringify({ ...existing, ...updates }))
}

export async function getScanLog(limit = 200, offset = 0): Promise<ScanLogEntry[]> {
  const redis = getRedis()
  const scanIds = await redis.zrange(LOG_KEY, offset, offset + limit - 1, { rev: true }) as string[]
  if (scanIds.length === 0) return []
  const raws = await Promise.all(scanIds.map(id => redis.get<string>(entryKey(id))))
  return raws
    .map(r => {
      if (!r) return null
      try { return typeof r === 'string' ? JSON.parse(r) : r }
      catch { return null }
    })
    .filter(Boolean) as ScanLogEntry[]
}

export async function getScanLogCount(): Promise<number> {
  return getRedis().zcard(LOG_KEY)
}

// ── Feedback log ──────────────────────────────────────────────────────────────

export interface FeedbackEntry {
  id: string
  category: string
  name: string
  email: string
  message: string
  createdAt: string
}

const FB_KEY = 'feedbacklog'
const fbEntryKey = (id: string) => `feedback:entry:${id}`

export async function saveFeedback(entry: FeedbackEntry): Promise<void> {
  const redis = getRedis()
  await Promise.all([
    redis.zadd(FB_KEY, { score: Date.now(), member: entry.id }),
    redis.set(fbEntryKey(entry.id), JSON.stringify(entry)),
  ])
}

export async function getFeedbackLog(limit = 100): Promise<FeedbackEntry[]> {
  const redis = getRedis()
  const ids = await redis.zrange(FB_KEY, 0, limit - 1, { rev: true }) as string[]
  if (ids.length === 0) return []
  const raws = await Promise.all(ids.map(id => redis.get<string>(fbEntryKey(id))))
  return raws.map(r => {
    if (!r) return null
    try { return typeof r === 'string' ? JSON.parse(r) : r }
    catch { return null }
  }).filter(Boolean) as FeedbackEntry[]
}
