import { NextRequest } from 'next/server'
import { getDfySession, saveDfySession } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { token, platform, fields } = await request.json() as {
    token: string
    platform: string
    fields: Record<string, string>
  }

  if (!token || !platform) {
    return Response.json({ error: 'token and platform are required' }, { status: 400 })
  }

  const session = await getDfySession(token)
  if (!session) {
    return Response.json({ error: 'Invalid or expired link' }, { status: 404 })
  }

  if (session.status === 'complete') {
    return Response.json({ error: 'Implementation already completed' }, { status: 409 })
  }

  // Store credentials JSON — never log, never expose in responses
  await saveDfySession({
    ...session,
    status: 'credentials_submitted',
    credentials: JSON.stringify({ platform, fields }),
  })

  return Response.json({ ok: true })
}

// Admin-only: retrieve credentials to run implementation
export async function GET(request: NextRequest) {
  const secret = request.headers.get('x-admin-secret')
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = new URL(request.url).searchParams.get('token')
  if (!token) return Response.json({ error: 'token required' }, { status: 400 })

  const session = await getDfySession(token)
  if (!session) return Response.json({ error: 'Not found' }, { status: 404 })

  return Response.json(session)
}
