import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let scanRatelimit: Ratelimit | null = null
let adminRatelimit: Ratelimit | null = null
let publicRatelimit: Ratelimit | null = null

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

function getScanRatelimit(): Ratelimit | null {
  if (scanRatelimit) return scanRatelimit
  const redis = getRedis()
  if (!redis) return null
  scanRatelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '1 h'), prefix: 'rl:scan' })
  return scanRatelimit
}

function getAdminRatelimit(): Ratelimit | null {
  if (adminRatelimit) return adminRatelimit
  const redis = getRedis()
  if (!redis) return null
  adminRatelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(100, '1 h'), prefix: 'rl:admin' })
  return adminRatelimit
}

function getPublicRatelimit(): Ratelimit | null {
  if (publicRatelimit) return publicRatelimit
  const redis = getRedis()
  if (!redis) return null
  // 20 req/hour for cite, feedback, apply — prevents AI API abuse and spam
  publicRatelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, '1 h'), prefix: 'rl:public' })
  return publicRatelimit
}

function getIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = getIp(request)

  // Rate limit scan endpoint
  if (pathname === '/api/scan' && request.method === 'POST') {
    const rl = getScanRatelimit()
    if (rl) {
      const { success, remaining, reset } = await rl.limit(ip)
      if (!success) {
        return NextResponse.json(
          { error: 'Too many scans. Please wait before scanning again.' },
          {
            status: 429,
            headers: {
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': reset.toString(),
              'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
            },
          }
        )
      }
      const response = NextResponse.next()
      response.headers.set('X-RateLimit-Remaining', remaining.toString())
      return response
    }
  }

  // Rate limit public submission endpoints — prevents spam and AI API abuse
  const PUBLIC_RATE_LIMITED = ['/api/scan/cite', '/api/feedback', '/api/dfy/apply']
  if (PUBLIC_RATE_LIMITED.includes(pathname) && request.method === 'POST') {
    const rl = getPublicRatelimit()
    if (rl) {
      const { success } = await rl.limit(ip)
      if (!success) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429, headers: { 'Retry-After': '3600' } }
        )
      }
    }
  }

  // Rate limit all admin API endpoints — prevents brute-force on ADMIN_SECRET
  if (pathname.startsWith('/api/admin/')) {
    const rl = getAdminRatelimit()
    if (rl) {
      const { success } = await rl.limit(ip)
      if (!success) {
        return NextResponse.json(
          { error: 'Too many requests.' },
          { status: 429, headers: { 'Retry-After': '3600' } }
        )
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/scan',
    '/api/scan/cite',
    '/api/feedback',
    '/api/dfy/apply',
    '/api/admin/:path*',
    '/admin',
    '/admin/:path*',
  ],
}
