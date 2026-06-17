import { Redis } from '@upstash/redis'
import type { ScanResult } from '@/lib/framework/types'

let _redis: Redis | null = null
function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  }
  return _redis
}

const SCAN_TTL = 60 * 60 * 48 // 48 hours

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
