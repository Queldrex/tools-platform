import { Redis } from '@upstash/redis'
import { randomUUID } from 'crypto'
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

const DFY_TTL = 60 * 60 * 24 * 30  // 30 days
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
const TOKEN_TTL = 60 * 60 * 24 * 30  // 30 days

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

const SCANLOG_ENTRY_TTL = 60 * 60 * 24 * 90  // 90 days

export async function appendScanLog(entry: ScanLogEntry): Promise<void> {
  const redis = getRedis()
  const score = Date.now()
  await Promise.all([
    redis.zadd(LOG_KEY, { score, member: entry.scanId }),
    redis.set(entryKey(entry.scanId), JSON.stringify(entry), { ex: SCANLOG_ENTRY_TTL }),
  ])
  await redis.zremrangebyrank(LOG_KEY, 0, -2001)  // keep latest 2000
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
  ticketNumber?: number
  priority?: 'critical' | 'high' | 'medium' | 'low'
  notes?: string
  statusHistory?: Array<{ status: string; at: string }>
}

export async function getNextTicketNumber(): Promise<number> {
  return getRedis().incr('dfy:ticket_counter')
}

const APP_KEY = 'dfyapps'
const appEntryKey = (id: string) => `dfyapp:${id}`

export async function saveDfyApplication(app: DfyApplication): Promise<void> {
  const redis = getRedis()
  await Promise.all([
    redis.zadd(APP_KEY, { score: Date.now(), member: app.id }),
    redis.set(appEntryKey(app.id), JSON.stringify(app)),
  ])
  await redis.zremrangebyrank(APP_KEY, 0, -201)  // keep latest 200
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

const FB_ENTRY_TTL = 60 * 60 * 24 * 180  // 180 days

export async function saveFeedback(entry: FeedbackEntry): Promise<void> {
  const redis = getRedis()
  await Promise.all([
    redis.zadd(FB_KEY, { score: Date.now(), member: entry.id }),
    redis.set(fbEntryKey(entry.id), JSON.stringify(entry), { ex: FB_ENTRY_TTL }),
  ])
  await redis.zremrangebyrank(FB_KEY, 0, -501)  // keep latest 500
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

// ── Security Log ──────────────────────────────────────────────────────────────

export interface SecurityLogEntry {
  id: string
  ip: string
  path: string
  method: string
  success: boolean
  action?: string
  userAgent?: string
  createdAt: string
}

const SEC_KEY = 'securitylog'
const secEntryKey = (id: string) => `securitylog:entry:${id}`
const SEC_TTL = 60 * 60 * 24 * 30

export async function logSecurityEvent(entry: Omit<SecurityLogEntry, 'id' | 'createdAt'>): Promise<void> {
  const redis = getRedis()
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const full: SecurityLogEntry = { ...entry, id, createdAt: new Date().toISOString() }
  await Promise.all([
    redis.zadd(SEC_KEY, { score: Date.now(), member: id }),
    redis.set(secEntryKey(id), JSON.stringify(full), { ex: SEC_TTL }),
  ])
  await redis.zremrangebyrank(SEC_KEY, 0, -501)
}

export async function getSecurityLog(limit = 100): Promise<SecurityLogEntry[]> {
  const redis = getRedis()
  const ids = await redis.zrange(SEC_KEY, 0, limit - 1, { rev: true }) as string[]
  if (ids.length === 0) return []
  const raws = await Promise.all(ids.map(id => redis.get<string>(secEntryKey(id))))
  return raws.map(r => {
    if (!r) return null
    try { return typeof r === 'string' ? JSON.parse(r) : r } catch { return null }
  }).filter(Boolean) as SecurityLogEntry[]
}

// ── AI Visibility Monitor Subscriptions ───────────────────────────────────────

export interface MonitorSubscription {
  id: string
  email: string
  domain: string
  stripeSubscriptionId: string
  stripeCustomerId: string
  status: 'active' | 'cancelled' | 'past_due'
  lastScore?: number
  lastScanAt?: string
  scoreHistory?: Array<{ score: number; scannedAt: string }>
  createdAt: string
}

const MON_KEY = 'monitors'
const monEntryKey = (id: string) => `monitor:entry:${id}`
const monStripeKey = (subId: string) => `monitor:by:stripe:${subId}`
const monEmailKey = (email: string) => `monitor:by:email:${email}`

export async function saveMonitor(m: MonitorSubscription): Promise<void> {
  const redis = getRedis()
  await Promise.all([
    redis.zadd(MON_KEY, { score: Date.now(), member: m.id }),
    redis.set(monEntryKey(m.id), JSON.stringify(m)),
    redis.set(monStripeKey(m.stripeSubscriptionId), m.id),
    redis.zadd(monEmailKey(m.email), { score: Date.now(), member: m.id }),
  ])
}

export async function getMonitor(id: string): Promise<MonitorSubscription | null> {
  const r = await getRedis().get<string>(monEntryKey(id))
  if (!r) return null
  try { return typeof r === 'string' ? JSON.parse(r) : r } catch { return null }
}

export async function getMonitorByStripe(stripeSubId: string): Promise<MonitorSubscription | null> {
  const id = await getRedis().get<string>(monStripeKey(stripeSubId))
  if (!id) return null
  return getMonitor(typeof id === 'string' ? id : String(id))
}

export async function getMonitorsByEmail(email: string): Promise<MonitorSubscription[]> {
  const redis = getRedis()
  const ids = await redis.zrange(monEmailKey(email), 0, -1, { rev: true }) as string[]
  if (!ids.length) return []
  const raws = await Promise.all(ids.map(id => redis.get<string>(monEntryKey(id))))
  return raws.map(r => {
    if (!r) return null
    try { return typeof r === 'string' ? JSON.parse(r) : r } catch { return null }
  }).filter(Boolean) as MonitorSubscription[]
}

export async function getAllActiveMonitors(): Promise<MonitorSubscription[]> {
  const redis = getRedis()
  const ids = await redis.zrange(MON_KEY, 0, -1, { rev: true }) as string[]
  if (!ids.length) return []
  const raws = await Promise.all(ids.map(id => redis.get<string>(monEntryKey(id))))
  const all = raws.map(r => {
    if (!r) return null
    try { return typeof r === 'string' ? JSON.parse(r) : r } catch { return null }
  }).filter(Boolean) as MonitorSubscription[]
  return all.filter(m => m.status === 'active')
}

export async function updateMonitor(id: string, updates: Partial<MonitorSubscription>): Promise<void> {
  const existing = await getMonitor(id)
  if (!existing) return
  const updated = { ...existing, ...updates }
  await getRedis().set(monEntryKey(id), JSON.stringify(updated))
  if (updates.stripeSubscriptionId && updates.stripeSubscriptionId !== existing.stripeSubscriptionId) {
    await getRedis().set(monStripeKey(updates.stripeSubscriptionId), id)
  }
}

// ── Admin Sessions ────────────────────────────────────────────────────────────

export async function createAdminSession(): Promise<string> {
  const token = randomUUID()
  await getRedis().set(`admin:session:${token}`, 'active', { ex: 60 * 60 * 4 })
  return token
}

export async function validateAdminSession(token: string): Promise<boolean> {
  const val = await getRedis().get(`admin:session:${token}`)
  return !!val
}

export async function deleteAdminSession(token: string): Promise<void> {
  await getRedis().del(`admin:session:${token}`)
}

// ── IP Lockout ────────────────────────────────────────────────────────────────

export async function getIpFailures(ip: string): Promise<number> {
  const val = await getRedis().get<string>(`admin:lockout:${ip}`)
  return val ? parseInt(val, 10) : 0
}

export async function incrementIpFailures(ip: string): Promise<number> {
  const redis = getRedis()
  const key = `admin:lockout:${ip}`
  const count = await redis.incr(key)
  if (count === 1) await redis.expire(key, 3600)
  return count
}

export async function isIpLocked(ip: string): Promise<boolean> {
  return (await getIpFailures(ip)) >= 5
}

export async function clearIpFailures(ip: string): Promise<void> {
  await getRedis().del(`admin:lockout:${ip}`)
}

// ── Tool Requests ─────────────────────────────────────────────────────────────

export interface ToolRequest {
  id: string
  name: string
  email: string
  description: string
  status: 'new' | 'reviewed' | 'building' | 'shipped' | 'declined'
  createdAt: string
}

const TR_KEY = 'toolrequests'
const trEntryKey = (id: string) => `toolrequest:${id}`

export async function saveToolRequest(req: ToolRequest): Promise<void> {
  const redis = getRedis()
  await Promise.all([
    redis.zadd(TR_KEY, { score: Date.now(), member: req.id }),
    redis.set(trEntryKey(req.id), JSON.stringify(req)),
  ])
  await redis.zremrangebyrank(TR_KEY, 0, -201)  // keep latest 200
}

export async function getToolRequests(limit = 100): Promise<ToolRequest[]> {
  const redis = getRedis()
  const ids = await redis.zrange(TR_KEY, 0, limit - 1, { rev: true }) as string[]
  if (!ids.length) return []
  const raws = await Promise.all(ids.map(id => redis.get<string>(trEntryKey(id))))
  return raws.map(r => {
    if (!r) return null
    try { return typeof r === 'string' ? JSON.parse(r) : r } catch { return null }
  }).filter(Boolean) as ToolRequest[]
}

export async function updateToolRequest(id: string, updates: Partial<ToolRequest>): Promise<void> {
  const redis = getRedis()
  const raw = await redis.get<string>(trEntryKey(id))
  if (!raw) return
  const existing: ToolRequest = typeof raw === 'string' ? JSON.parse(raw) : raw
  await redis.set(trEntryKey(id), JSON.stringify({ ...existing, ...updates }))
}

// ── Build Requests ────────────────────────────────────────────────────────────

export interface BuildRequest {
  id: string
  name: string
  email: string
  service: string
  description: string
  budget?: string
  status: 'new' | 'contacted' | 'proposal_sent' | 'active' | 'complete' | 'declined'
  createdAt: string
}

const BR_KEY = 'buildrequests'
const brEntryKey = (id: string) => `buildrequest:${id}`

export async function saveBuildRequest(req: BuildRequest): Promise<void> {
  const redis = getRedis()
  await Promise.all([
    redis.zadd(BR_KEY, { score: Date.now(), member: req.id }),
    redis.set(brEntryKey(req.id), JSON.stringify(req)),
  ])
  await redis.zremrangebyrank(BR_KEY, 0, -201)  // keep latest 200
}

export async function getBuildRequests(limit = 100): Promise<BuildRequest[]> {
  const redis = getRedis()
  const ids = await redis.zrange(BR_KEY, 0, limit - 1, { rev: true }) as string[]
  if (!ids.length) return []
  const raws = await Promise.all(ids.map(id => redis.get<string>(brEntryKey(id))))
  return raws.map(r => {
    if (!r) return null
    try { return typeof r === 'string' ? JSON.parse(r) : r } catch { return null }
  }).filter(Boolean) as BuildRequest[]
}

export async function updateBuildRequest(id: string, updates: Partial<BuildRequest>): Promise<void> {
  const redis = getRedis()
  const raw = await redis.get<string>(brEntryKey(id))
  if (!raw) return
  const existing: BuildRequest = typeof raw === 'string' ? JSON.parse(raw) : raw
  await redis.set(brEntryKey(id), JSON.stringify({ ...existing, ...updates }))
}

// ── Agency Subscriptions ──────────────────────────────────────────────────────

export interface AgencyClient {
  id: string
  domain: string
  contactEmail?: string
  label?: string
  addedAt: string
  lastScanAt?: string
  lastScore?: number
  scoreHistory?: Array<{ date: string; score: number }>
}

export interface AgencySubscription {
  id: string
  email: string
  agencyName: string
  stripeCustomerId: string
  stripeSubscriptionId: string
  status: 'active' | 'canceled' | 'past_due'
  scansUsedThisMonth: number
  scansLimit: number
  clients: AgencyClient[]
  createdAt: string
}

const AGY_KEY = 'agencies'
const agyEntryKey = (id: string) => `agency:${id}`
const agyStripeKey = (subId: string) => `agency:by:stripe:${subId}`
const agyEmailKey = (email: string) => `agency:by:email:${email}`

export async function saveAgency(agency: AgencySubscription): Promise<void> {
  const redis = getRedis()
  await Promise.all([
    redis.zadd(AGY_KEY, { score: Date.now(), member: agency.id }),
    redis.set(agyEntryKey(agency.id), JSON.stringify(agency)),
    redis.set(agyStripeKey(agency.stripeSubscriptionId), agency.id),
    redis.set(agyEmailKey(agency.email.toLowerCase()), agency.id),
  ])
}

export async function getAgency(id: string): Promise<AgencySubscription | null> {
  const r = await getRedis().get<string>(agyEntryKey(id))
  if (!r) return null
  try { return typeof r === 'string' ? JSON.parse(r) : r } catch { return null }
}

export async function getAgencyByEmail(email: string): Promise<AgencySubscription | null> {
  const id = await getRedis().get<string>(agyEmailKey(email.toLowerCase()))
  if (!id) return null
  return getAgency(typeof id === 'string' ? id : String(id))
}

export async function getAgencyByStripe(subscriptionId: string): Promise<AgencySubscription | null> {
  const id = await getRedis().get<string>(agyStripeKey(subscriptionId))
  if (!id) return null
  return getAgency(typeof id === 'string' ? id : String(id))
}

export async function updateAgency(id: string, updates: Partial<AgencySubscription>): Promise<void> {
  const existing = await getAgency(id)
  if (!existing) return
  const updated = { ...existing, ...updates }
  await getRedis().set(agyEntryKey(id), JSON.stringify(updated))
  if (updates.stripeSubscriptionId && updates.stripeSubscriptionId !== existing.stripeSubscriptionId) {
    await getRedis().set(agyStripeKey(updates.stripeSubscriptionId), id)
  }
  if (updates.email && updates.email.toLowerCase() !== existing.email.toLowerCase()) {
    await getRedis().set(agyEmailKey(updates.email.toLowerCase()), id)
  }
}

// ── Referral Program ──────────────────────────────────────────────────────────

export interface ReferralCode {
  code: string
  ownerEmail: string
  createdAt: string
  uses: number
  creditsEarned: number
}

const refKey = (code: string) => `referral:${code}`
const refEmailKey = (email: string) => `referral:by:email:${email.toLowerCase()}`

export async function createReferralCode(email: string): Promise<string> {
  const redis = getRedis()
  // Return existing code if already created
  const existingId = await redis.get<string>(refEmailKey(email))
  if (existingId) return typeof existingId === 'string' ? existingId : String(existingId)

  const prefix = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()
  const suffix = Math.floor(1000 + Math.random() * 9000).toString()
  const code = `${prefix}${suffix}`

  const record: ReferralCode = {
    code,
    ownerEmail: email.toLowerCase(),
    createdAt: new Date().toISOString(),
    uses: 0,
    creditsEarned: 0,
  }
  const REF_TTL = 60 * 60 * 24 * 365  // 1 year
  await Promise.all([
    redis.set(refKey(code), JSON.stringify(record), { ex: REF_TTL }),
    redis.set(refEmailKey(email), code, { ex: REF_TTL }),
    redis.zadd('referrals', { score: Date.now(), member: code }),
  ])
  await redis.zremrangebyrank('referrals', 0, -1001)  // keep latest 1000
  return code
}

export async function getReferralCode(code: string): Promise<ReferralCode | null> {
  const r = await getRedis().get<string>(refKey(code.toUpperCase()))
  if (!r) return null
  try { return typeof r === 'string' ? JSON.parse(r) : r } catch { return null }
}

export async function recordReferralUse(code: string, newUserEmail: string, product: string): Promise<void> {
  const redis = getRedis()
  const ref = await getReferralCode(code)
  if (!ref) return
  const updated: ReferralCode = { ...ref, uses: ref.uses + 1, creditsEarned: ref.creditsEarned + 10 }
  await Promise.all([
    redis.set(refKey(code.toUpperCase()), JSON.stringify(updated), { ex: 60 * 60 * 24 * 365 }),
    redis.set(`referraluse:${Date.now()}`, JSON.stringify({ code, referrerEmail: ref.ownerEmail, newUserEmail, product, creditAmount: 10, usedAt: new Date().toISOString() }), { ex: 60 * 60 * 24 * 90 }),
  ])
}

// ── Pro Tool Sessions ─────────────────────────────────────────────────────────
// Used to grant unlimited Pro tool access to Monitor/Agency subscribers.

const PRO_SESSION_TTL = 60 * 60 * 24 * 30 // 30 days

export async function saveProSession(sessionId: string): Promise<void> {
  await getRedis().set(`pro_session:${sessionId}`, '1', { ex: PRO_SESSION_TTL })
}

export async function checkProSession(sessionId: string): Promise<boolean> {
  if (!sessionId || sessionId.length < 10) return false
  const val = await getRedis().get(`pro_session:${sessionId}`)
  return !!val
}

export async function checkDownloadAccess(token: string): Promise<boolean> {
  if (!token || token.length < 10) return false
  const val = await getRedis().get(`token:${token}`)
  return !!val
}

// ── Individual Tool Purchases ─────────────────────────────────────────────────
const TOOL_PURCHASE_TTL = 60 * 60 * 24 * 31  // 31 days

export async function saveToolPurchase(token: string, toolId: string): Promise<void> {
  await getRedis().set(`tool_purchase:${token}`, toolId, { ex: TOOL_PURCHASE_TTL })
}

export async function checkToolPurchase(token: string, toolId: string): Promise<boolean> {
  if (!token || token.length < 10) return false
  const stored = await getRedis().get<string>(`tool_purchase:${token}`)
  return stored === toolId
}
