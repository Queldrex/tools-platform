import { NextRequest } from 'next/server'
import { getScanLog, getScanLogCount, logSecurityEvent } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const secret = request.headers.get('x-admin-secret')
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    logSecurityEvent({ ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown', path: new URL(request.url).pathname, method: request.method, success: false }).catch(() => {})
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  logSecurityEvent({ ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown', path: '/api/admin/log', method: 'GET', success: true, action: 'login' }).catch(() => {})

  const url = new URL(request.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '200'), 500)
  const offset = parseInt(url.searchParams.get('offset') || '0')

  const [entries, total] = await Promise.all([
    getScanLog(limit, offset),
    getScanLogCount(),
  ])

  return Response.json({ total, entries })
}
