import { NextRequest } from 'next/server'
import { getFeedbackLog } from '@/lib/store/redis'
import { adminAuthCheck } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!await adminAuthCheck(request)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const entries = await getFeedbackLog(100)
  return Response.json({ entries })
}
