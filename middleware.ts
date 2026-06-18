import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let ratelimit: Ratelimit | null = null

function getRatelimit(): Ratelimit | null {
  if (ratelimit) return ratelimit
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    prefix: 'rl:scan',
  })
  return ratelimit
}

export async function middleware(request: NextRequest) {
  // Rate limit the scan endpoint only
  if (request.nextUrl.pathname === '/api/scan' && request.method === 'POST') {
    const rl = getRatelimit()
    if (rl) {
      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown'

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

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/scan'],
}
