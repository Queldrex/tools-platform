import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/store/redis'
import { hasToolAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://queldrex.com'

function generateCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from(crypto.getRandomValues(new Uint8Array(6)), b => chars[b % chars.length]).join('')
}

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  if (!await hasToolAccess(req)) return NextResponse.json({ paywall: true }, { status: 402 })
  try {
    const { url, customCode } = await req.json()
    if (!url || !isValidUrl(url)) {
      return NextResponse.json({ error: 'A valid http or https URL is required.' }, { status: 400 })
    }

    // Rate limit: 10 per IP per day
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
    const redis = await getRedis()
    const rateLimitKey = `url-shortener:rate:${ip}`
    const count = await redis.incr(rateLimitKey)
    if (count === 1) await redis.expire(rateLimitKey, 86400)
    if (count > 10) {
      return NextResponse.json({ error: 'Rate limit reached. 10 URLs per day on the free tier.' }, { status: 429 })
    }

    let code = customCode?.trim().replace(/[^a-zA-Z0-9-_]/g, '') || generateCode()
    if (code.length < 3 || code.length > 20) code = generateCode()

    const existing = await redis.get(`url:${code}`)
    if (existing) {
      if (customCode) return NextResponse.json({ error: 'That custom code is already taken.' }, { status: 409 })
      code = generateCode()
    }

    await redis.hset(`url:${code}`, { url, created: Date.now(), clicks: 0 })
    await redis.expire(`url:${code}`, 60 * 60 * 24 * 90) // 90 days TTL

    return NextResponse.json({ code, shortUrl: `${BASE_URL}/s/${code}` })
  } catch {
    return NextResponse.json({ error: 'Failed to create short URL.' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 })

  try {
    const redis = await getRedis()
    const data = await redis.hgetall(`url:${code}`)
    if (!data || !data.url) return NextResponse.json({ error: 'Short URL not found.' }, { status: 404 })

    return NextResponse.json({ url: data.url, clicks: Number(data.clicks ?? 0), created: Number(data.created ?? 0) })
  } catch {
    return NextResponse.json({ error: 'Lookup failed.' }, { status: 500 })
  }
}
