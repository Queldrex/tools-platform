import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getRedis } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let body: { email?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const email = (body.email || '').trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Valid email required' }, { status: 400 })
  }

  const token = uuidv4()
  await getRedis().set(`magic:${token}`, email, { ex: 900 })

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://queldrex.com').replace(/^﻿/, '').trim()
  const loginUrl = `${baseUrl}/monitor/dashboard?token=${token}`

  try {
    const { Resend } = await import('resend')
    const resend = new Resend((process.env.RESEND_API_KEY || '').replace(/^﻿/, '').trim())
    await resend.emails.send({
      from: 'Queldrex Monitor <reports@queldrex.com>',
      to: email,
      subject: 'Your Queldrex Monitor login link',
      html: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#f8fafc;padding:32px;">
<div style="max-width:520px;margin:0 auto;background:#0f172a;padding:28px;border-radius:12px;">
  <div style="font-size:11px;color:#22d3ee;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:12px;">Queldrex · Secure Login</div>
  <div style="font-size:20px;font-weight:800;color:white;margin-bottom:12px;">Your dashboard login link</div>
  <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin-bottom:20px;">Click the button below to access your monitoring dashboard. This link expires in 15 minutes and can only be used once.</p>
  <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#06d6ff,#0891b2);color:#000;font-weight:700;font-size:13px;padding:11px 22px;border-radius:8px;text-decoration:none;">Open Dashboard →</a>
  <p style="color:#475569;font-size:11px;margin-top:20px;">If you didn't request this, ignore this email.</p>
</div>
</body></html>`,
    })
  } catch (err) {
    console.error('Magic link email error:', err instanceof Error ? err.message : err)
    return Response.json({ error: 'Failed to send email' }, { status: 500 })
  }

  return Response.json({ sent: true })
}
