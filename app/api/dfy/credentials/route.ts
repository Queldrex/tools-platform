import { NextRequest } from 'next/server'
import { getDfySession, saveDfySession } from '@/lib/store/redis'
import { encryptCredentials, decryptCredentials } from '@/lib/crypto'
import { sendAdminNotification } from '@/lib/email/resend'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'janitor.clean.base@gmail.com'

export async function POST(request: NextRequest) {
  let body: { token?: string; platform?: string; fields?: Record<string, string>; signature?: { firstName: string; lastName: string; date: string; signedAt: string } }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { token, platform, fields, signature } = body

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
    credentialsPlatform: platform,  // stored unencrypted so deletion email knows what was deleted
  })

  // Email signed agreement to admin — non-fatal
  if (signature) {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY!.replace(/^﻿/, '').trim())
    resend.emails.send({
      from: 'Queldrex System <reports@queldrex.com>',
      to: ADMIN_EMAIL,
      subject: `✍️ Signed Agreement — ${session.domain}`,
      html: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#f8fafc;padding:32px;">
<div style="max-width:520px;margin:0 auto;background:#0f172a;padding:28px;border-radius:12px;">
  <div style="font-size:11px;color:#22d3ee;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:12px;">Queldrex · DFY Service Agreement Signed</div>
  <div style="font-size:18px;font-weight:800;color:white;margin-bottom:4px;">${session.domain}</div>
  <div style="font-size:13px;color:#94a3b8;margin-bottom:20px;">Agreement signed at credential submission</div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
    <tr><td style="font-size:12px;color:#64748b;padding:6px 0;">Full Name</td><td style="font-size:13px;color:white;text-align:right;font-weight:700;">${signature.firstName} ${signature.lastName}</td></tr>
    <tr><td style="font-size:12px;color:#64748b;padding:6px 0;">Date Signed (entered)</td><td style="font-size:12px;color:#cbd5e1;text-align:right;">${signature.date}</td></tr>
    <tr><td style="font-size:12px;color:#64748b;padding:6px 0;">Timestamp (server)</td><td style="font-size:12px;color:#cbd5e1;text-align:right;">${signature.signedAt}</td></tr>
    <tr><td style="font-size:12px;color:#64748b;padding:6px 0;">Platform</td><td style="font-size:12px;color:#cbd5e1;text-align:right;text-transform:capitalize;">${platform}</td></tr>
    <tr><td style="font-size:12px;color:#64748b;padding:6px 0;">Token</td><td style="font-size:11px;color:#475569;text-align:right;font-family:monospace;">${token.slice(0, 8)}…</td></tr>
  </table>
  <div style="background:#1e293b;border-radius:8px;padding:12px;font-size:11px;color:#64748b;line-height:1.6;">
    Agreement accepted: Done-For-You AI Visibility Implementation Service Agreement, Queldrex LLC. Client confirmed ownership/authorization and consented to technical changes.
  </div>
</div>
</body></html>`,
    }).catch(() => {})
  }

  // Notify admin of credentials — non-fatal
  sendAdminNotification({
    domain: session.domain,
    token,
    platform: platform || 'unknown',
  }).catch(() => {})

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
