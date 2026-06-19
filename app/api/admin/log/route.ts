import { NextRequest } from 'next/server'
import { getScanLog, getScanLogCount } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const secret = request.headers.get('x-admin-secret')
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '200'), 500)
  const offset = parseInt(url.searchParams.get('offset') || '0')

  const [entries, total] = await Promise.all([
    getScanLog(limit, offset),
    getScanLogCount(),
  ])

  return Response.json({ total, entries })
}
