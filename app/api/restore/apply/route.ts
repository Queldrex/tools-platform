import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/store/redis'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const base = new URL(request.url).origin

  if (!token) {
    return NextResponse.redirect(new URL('/restore-access?error=invalid', base))
  }

  const raw = await getRedis().get<string>(`restore:${token}`)
  if (!raw) {
    return NextResponse.redirect(new URL('/restore-access?error=expired', base))
  }

  // One-time use — delete immediately
  await getRedis().del(`restore:${token}`)

  const { purchases } = JSON.parse(raw) as {
    email: string
    purchases: { type: string; id: string; label: string }[]
  }

  const response = NextResponse.redirect(new URL('/restore-access?success=1', base))

  for (const purchase of purchases) {
    if (purchase.type === 'pro' || purchase.type === 'tool') {
      // Grant full pro access for any active sub
      const sessionId = randomUUID()
      await getRedis().set(`pro_session:${sessionId}`, '1', { ex: 60 * 60 * 24 * 30 })
      response.cookies.set('queldrex_pro', sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      })
    } else if (purchase.type === 'download') {
      const dlToken = randomUUID()
      await getRedis().set(`download_product:${dlToken}`, purchase.id, { ex: 60 * 60 * 24 * 365 })
      response.cookies.set(`queldrex_download_${purchase.id}`, dlToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      })
    }
  }

  return response
}
