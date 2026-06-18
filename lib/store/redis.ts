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
