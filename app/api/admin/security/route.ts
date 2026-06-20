import { NextRequest } from 'next/server'
import { getSecurityLog } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'

function authCheck(req: NextRequest) {
  return req.headers.get('x-admin-secret') === process.env.ADMIN_SECRET
}

export async function GET(request: NextRequest) {
  if (!authCheck(request)) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const log = await getSecurityLog(200)
  const suspicious = log.reduce((acc, e) => {
    if (!e.success) acc[e.ip] = (acc[e.ip] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const flaggedIps = Object.entries(suspicious)
    .filter(([, count]) => count >= 3)
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count)
  return Response.json({ log, flaggedIps, total: log.length })
}
