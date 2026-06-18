import { NextRequest } from 'next/server'
import { createHmac } from 'crypto'
import { getDfySession, saveDfySession } from '@/lib/store/redis'
import { sendCredentialsRequestEmail } from '@/lib/email/resend'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'

// Cal.com sends HMAC-SHA256 of raw body in X-Cal-Signature-256 header
function verifyCalSignature(rawBody: string, signature: string, secret: string): boolean {
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  return signature === expected
}

// Extract token from booking notes — we pre-fill "Implementation token: <uuid>"
function extractToken(notes: string | undefined): string | null {
  if (!notes) return null
  const match = notes.match(/Implementation token:\s*([a-f0-9-]{36})/i)
  return match?.[1] ?? null
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  // Verify signature if secret is configured
  const webhookSecret = process.env.CAL_WEBHOOK_SECRET
  if (webhookSecret) {
    const signature = request.headers.get('x-cal-signature-256') || ''
    if (!verifyCalSignature(rawBody, signature, webhookSecret)) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  let payload: CalWebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Only handle new bookings
  if (payload.triggerEvent !== 'BOOKING_CREATED') {
    return Response.json({ ok: true, skipped: true })
  }

  const notes =
    payload.payload?.responses?.notes?.value ||
    payload.payload?.additionalNotes ||
    payload.payload?.description ||
    ''

  const token = extractToken(notes)
  if (!token) {
    // Booking not from our DFY flow — ignore silently
    return Response.json({ ok: true, skipped: true })
  }

  const session = await getDfySession(token)
  if (!session) {
    return Response.json({ error: 'DFY session not found for token' }, { status: 404 })
  }

  // Mark as booked
  await saveDfySession({
    ...session,
    status: 'booked',
    bookedAt: new Date().toISOString(),
  })

  // Send credentials request email to client
  const baseUrl = env('NEXT_PUBLIC_BASE_URL', 'https://queldrex.com')
  const credentialsUrl = `${baseUrl}/impl/${token}`
  const startTime = payload.payload?.startTime
  const formattedTime = startTime
    ? new Date(startTime).toLocaleString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
      })
    : 'your booked slot'

  await sendCredentialsRequestEmail({
    to: session.emailAddress,
    domain: session.domain,
    credentialsUrl,
    formattedTime,
  })

  return Response.json({ ok: true, token, domain: session.domain })
}

// Cal.com webhook payload shape (simplified)
interface CalWebhookPayload {
  triggerEvent: string
  payload?: {
    startTime?: string
    endTime?: string
    description?: string
    additionalNotes?: string
    responses?: {
      notes?: { value?: string }
      name?: { value?: string }
      email?: { value?: string }
    }
    attendees?: { email: string; name: string }[]
  }
}
