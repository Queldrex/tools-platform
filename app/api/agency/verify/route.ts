import { NextRequest } from 'next/server'
import { getRedis, getAgency } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) return Response.json({ error: 'Token required' }, { status: 400 })

  const redis = getRedis()
  const agencyId = await redis.get<string>(`agencymagic:${token}`)
  if (!agencyId) {
    return Response.json({ error: 'Invalid or expired token' }, { status: 401 })
  }

  await redis.del(`agencymagic:${token}`)

  const agency = await getAgency(typeof agencyId === 'string' ? agencyId : String(agencyId))
  if (!agency) return Response.json({ error: 'Agency not found' }, { status: 404 })

  return Response.json({
    agencyId: agency.id,
    email: agency.email,
    agencyName: agency.agencyName,
    status: agency.status,
    scansUsedThisMonth: agency.scansUsedThisMonth,
    scansLimit: agency.scansLimit,
  })
}
