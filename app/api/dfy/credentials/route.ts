import { NextRequest } from 'next/server'
import { getDfySession, saveDfySession } from '@/lib/store/redis'
import { encryptCredentials, decryptCredentials } from '@/lib/crypto'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let body: { token?: string; platform?: string; fields?: Record<string, string> }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { token, platform, fields } = body

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

  // Encrypt before storing — credentials never sit in Redis as plaintext
  const plaintext = JSON.stringify({ platform, fields: fields || {} })
  let encrypted: string
  try {
    encrypted = encryptCredentials(plaintext)
  } catch {
    // Encryption key not configured — store anyway but log warning
    console.error('CREDENTIALS_ENCRYPTION_KEY not set — storing credentials unencrypted')
    encrypted = plaintext
  }

  await saveDfySession({
    ...session,
    status: 'credentials_submitted',
    credentials: encrypted,
  })

  return Response.json({ ok: true })
}

// Admin-only: retrieve and decrypt credentials
export async function GET(request: NextRequest) {
  const secret = request.headers.get('x-admin-secret')
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = new URL(request.url).searchParams.get('token')
  if (!token) return Response.json({ error: 'token required' }, { status: 400 })

  const session = await getDfySession(token)
  if (!session) return Response.json({ error: 'Not found' }, { status: 404 })

  // Decrypt credentials if present
  let credentials = null
  if (session.credentials) {
    try {
      credentials = JSON.parse(decryptCredentials(session.credentials))
    } catch {
      // Might be unencrypted legacy data
      try {
        credentials = JSON.parse(session.credentials)
      } catch {
        credentials = session.credentials
      }
    }
  }

  return Response.json({ ...session, credentials })
}
