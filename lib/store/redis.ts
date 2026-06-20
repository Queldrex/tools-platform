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
  credentialsDeletedAt?: string
  credentialsPlatform?: string
  createdAt: string
}

const DFY_TTL = 60 * 60 * 72  // 72 hours
const DFY_COMPLETE_TTL = 60 * 60 * 24 * 90  // 90 days — keep deletion record viewable

let _redis: Redis | null = null
export function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL)!,
      token: (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN)!,
    })
  }
  return _redis
}

const SCAN_TTL = 60 * 60 * 48
const TOKEN_TTL = 60 * 60 * 24 * 7  // 7 days

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
  await getRedis().set(`token:${token}`, scanId, { ex: TOKEN_TTL })
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

export async function deleteDfyCredentials(token: string, platform: string): Promise<string> {
  const redis = getRedis()
  const session = await getDfySession(token)
  const now = new Date().toISOString()
  const updated: DfySession = {
    ...(session ?? { token, scanId: '', emailAddress: '', domain: '', score: 0, createdAt: now }),
    credentials: undefined,
    credentialsDeletedAt: now,
    credentialsPlatform: platform,
    status: 'complete',
  }
  await redis.set(`dfy:${token}`, JSON.stringify(updated), { ex: DFY_COMPLETE_TTL })
  return now
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
  downloadedAt?: string
  downloadToken?: string
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

// ── DFY Applications ─────────────────────────────────────────────────────────

export interface DfyApplication {
  id: string
  scanId?: string
  name: string
  email: string
  url: string
  platform: string
  score?: number
  message: string
  status: 'new' | 'contacted' | 'payment_sent' | 'paid' | 'rejected' | 'complete'
  createdAt: string
  dfyToken?: string        // set when Stripe DFY payment is confirmed
  implemented?: boolean    // set true after admin triggers implementation
}

const APP_KEY = 'dfyapps'
const appEntryKey = (id: string) => `dfyapp:${id}`

export async function saveDfyApplication(app: DfyApplication): Promise<void> {
  const redis = getRedis()
  await Promise.all([
    redis.zadd(APP_KEY, { score: Date.now(), member: app.id }),
    redis.set(appEntryKey(app.id), JSON.stringify(app)),
  ])
}

export async function getDfyApplication(id: string): Promise<DfyApplication | null> {
  const raw = await getRedis().get<string>(appEntryKey(id))
  if (!raw) return null
  try { return typeof raw === 'string' ? JSON.parse(raw) : raw } catch { return null }
}

export async function updateDfyApplication(id: string, updates: Partial<DfyApplication>): Promise<void> {
  const existing = await getDfyApplication(id)
  if (!existing) return
  await getRedis().set(appEntryKey(id), JSON.stringify({ ...existing, ...updates }))
}

export async function getDfyApplications(limit = 100): Promise<DfyApplication[]> {
  const redis = getRedis()
  const ids = await redis.zrange(APP_KEY, 0, limit - 1, { rev: true }) as string[]
  if (ids.length === 0) return []
  const raws = await Promise.all(ids.map(id => redis.get<string>(appEntryKey(id))))
  return raws.map(r => {
    if (!r) return null
    try { return typeof r === 'string' ? JSON.parse(r) : r }
    catch { return null }
  }).filter(Boolean) as DfyApplication[]
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
