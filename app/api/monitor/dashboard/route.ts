import { NextRequest } from 'next/server'
import { getMonitorsByEmail } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Valid email required' }, { status: 400 })
  }

  const monitors = await getMonitorsByEmail(email.toLowerCase())
  return Response.json({ monitors })
}
