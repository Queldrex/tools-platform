import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  if (!code) return NextResponse.redirect('/', { status: 302 })

  try {
    const redis = getRedis()
    const data = await redis.hgetall(`url:${code}`)
    if (!data || !data.url) {
      return NextResponse.redirect('/tools/url-shortener?error=not_found', { status: 302 })
    }
    await redis.hincrby(`url:${code}`, 'clicks', 1)
    return NextResponse.redirect(data.url as string, { status: 302 })
  } catch {
    return NextResponse.redirect('/tools/url-shortener?error=lookup_failed', { status: 302 })
  }
}
