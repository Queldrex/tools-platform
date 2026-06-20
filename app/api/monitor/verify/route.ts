import { NextRequest } from 'next/server'
import { getRedis } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token || token.length < 10) {
    return Response.json({ error: 'Invalid token' }, { status: 400 })
  }

  const redis = getRedis()
  const email = await redis.get<string>(`magic:${token}`)
  if (!email) {
    return Response.json({ error: 'Token expired or invalid' }, { status: 404 })
  }

  await redis.del(`magic:${token}`)
  return Response.json({ email: typeof email === 'string' ? email : String(email) })
}
