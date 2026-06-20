import { NextRequest } from 'next/server'
import { getDfySession } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get('token')
  if (!token) return Response.json({ error: 'token required' }, { status: 400 })

  const session = await getDfySession(token)
  if (!session) return Response.json({ exists: false }, { status: 404 })

  return Response.json({
    exists: true,
    status: session.status,
    credentialsDeletedAt: session.credentialsDeletedAt ?? null,
    credentialsPlatform: session.credentialsPlatform ?? null,
    domain: session.domain,
  })
}
