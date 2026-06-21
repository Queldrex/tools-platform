import type { NextRequest } from 'next/server'
import { checkProSession, checkDownloadAccess, checkToolPurchase, getRedis } from '@/lib/store/redis'

export async function hasToolAccess(request: NextRequest): Promise<boolean> {
  const proSessionId = request.cookies.get('queldrex_pro')?.value ?? ''
  const paidToken = request.cookies.get('queldrex_paid')?.value ?? ''

  const [isPro, hasPaid] = await Promise.all([
    proSessionId ? checkProSession(proSessionId) : Promise.resolve(false),
    paidToken ? checkDownloadAccess(paidToken) : Promise.resolve(false),
  ])

  return isPro || hasPaid
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

export async function hasFreeOrProAccess(
  request: NextRequest,
  toolId: string,
  dailyFreeLimit: number
): Promise<{ allowed: boolean; isPro: boolean; remaining: number }> {
  const proSessionId = request.cookies.get('queldrex_pro')?.value ?? ''
  const paidToken = request.cookies.get('queldrex_paid')?.value ?? ''
  const toolToken = request.cookies.get(`queldrex_tool_${toolId}`)?.value ?? ''

  const [isPro, hasPaid, hasTool] = await Promise.all([
    proSessionId ? checkProSession(proSessionId) : Promise.resolve(false),
    paidToken ? checkDownloadAccess(paidToken) : Promise.resolve(false),
    toolToken ? checkToolPurchase(toolToken, toolId) : Promise.resolve(false),
  ])

  if (isPro || hasPaid || hasTool) return { allowed: true, isPro: true, remaining: -1 }

  const ip = getClientIp(request)
  const today = new Date().toISOString().slice(0, 10)
  const key = `free_usage:${toolId}:${ip}:${today}`
  const redis = getRedis()
  const count = await redis.incr(key)
  if (count === 1) await redis.expire(key, 86400)

  const remaining = Math.max(0, dailyFreeLimit - count)
  return { allowed: count <= dailyFreeLimit, isPro: false, remaining }
}
