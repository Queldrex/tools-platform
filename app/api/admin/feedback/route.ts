import { NextRequest } from 'next/server'
import { getFeedbackLog } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const secret = request.headers.get('x-admin-secret')
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const entries = await getFeedbackLog(100)
  return Response.json({ entries })
}
