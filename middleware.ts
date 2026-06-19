import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let scanRatelimit: Ratelimit | null = null
let adminRatelimit: Ratelimit | null = null

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
  // Tight limit on admin — 30 req/hour/IP to block brute force
  adminRatelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, '1 h'), prefix: 'rl:admin' })
  return adminRatelimit
}

function getIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

export async function middleware(request: NextRequest) {
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

  // Admin page — require valid session cookie (set by /api/admin/auth)
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const adminSecret = (process.env.ADMIN_SECRET || '').replace(/^﻿/, '').trim()
    const cookieHeader = request.headers.get('cookie') || ''
    const sessionCookie = cookieHeader.split(';').find(c => c.trim().startsWith('admin_session='))
    const sessionValue = sessionCookie?.split('=')[1]?.trim()
    const expectedValue = adminSecret.slice(-16)

    if (!adminSecret || sessionValue !== expectedValue) {
      return NextResponse.redirect(new URL('/admin-login', request.url))
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
  matcher: ['/api/scan', '/api/admin/:path*', '/admin', '/admin/:path*'],
}
