import { NextRequest } from 'next/server'
import { getRedis } from '@/lib/store/redis'
import { sendSmsAlert } from '@/lib/sms/twilio'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Rate limit: 3 submissions per IP per hour
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rateKey = `contact:rate:${ip}`
  try {
    const redis = getRedis()
    const uses = await redis.incr(rateKey)
    if (uses === 1) await redis.expire(rateKey, 3600)
    if (uses > 3) return Response.json({ error: 'Too many requests. Please try again in an hour.' }, { status: 429 })
  } catch { /* Redis failure doesn't block contact */ }

  let body: { name?: string; email?: string; subject?: string; message?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const name = (body.name || '').trim()
  const email = (body.email || '').trim().toLowerCase()
  const subject = (body.subject || '').trim()
  const message = (body.message || '').trim()

  if (!name) return Response.json({ error: 'Name is required' }, { status: 400 })
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return Response.json({ error: 'Valid email required' }, { status: 400 })
  if (!message || message.length < 20)
    return Response.json({ error: 'Message must be at least 20 characters' }, { status: 400 })

  try {
    const { Resend } = await import('resend')
    const resend = new Resend((process.env.RESEND_API_KEY || '').replace(/^﻿/, '').trim())

    await Promise.all([
      // Notify admin
      resend.emails.send({
        from: 'Queldrex Contact <reports@queldrex.com>',
        to: process.env.ADMIN_EMAIL || 'janitor.clean.base@gmail.com',
        subject: `[Queldrex Contact] ${subject || 'General Question'} — from ${name}`,
        html: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#f8fafc;padding:32px;">
<div style="max-width:560px;margin:0 auto;background:#0f172a;padding:28px;border-radius:12px;">
  <div style="font-size:11px;color:#22d3ee;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:16px;">Queldrex · New Contact Message</div>
  <table style="width:100%;font-size:13px;color:#94a3b8;margin-bottom:20px;border-collapse:collapse;">
    <tr><td style="padding:6px 0;font-weight:600;color:#cbd5e1;width:80px;">Name</td><td style="padding:6px 0;">${name}</td></tr>
    <tr><td style="padding:6px 0;font-weight:600;color:#cbd5e1;">Email</td><td style="padding:6px 0;"><a href="mailto:${email}" style="color:#22d3ee;">${email}</a></td></tr>
    <tr><td style="padding:6px 0;font-weight:600;color:#cbd5e1;">Subject</td><td style="padding:6px 0;">${subject || 'General Question'}</td></tr>
  </table>
  <div style="background:#1e293b;border-radius:8px;padding:16px;font-size:14px;color:#e2e8f0;line-height:1.7;white-space:pre-wrap;">${message}</div>
  <p style="color:#475569;font-size:11px;margin-top:16px;">Sent from queldrex.com/contact</p>
</div>
</body></html>`,
      }),
      // Confirm to sender
      resend.emails.send({
        from: 'Queldrex <reports@queldrex.com>',
        to: email,
        subject: 'We got your message — Queldrex',
        html: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#f8fafc;padding:32px;">
<div style="max-width:520px;margin:0 auto;background:#0f172a;padding:28px;border-radius:12px;">
  <div style="font-size:11px;color:#22d3ee;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:12px;">Queldrex</div>
  <div style="font-size:20px;font-weight:800;color:white;margin-bottom:12px;">Got your message, ${name}.</div>
  <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin-bottom:20px;">Thanks for reaching out. We&apos;ll reply to <strong style="color:#e2e8f0;">${email}</strong> within 24 hours.</p>
  <p style="color:#94a3b8;font-size:14px;line-height:1.7;">In the meantime, feel free to explore our tools at <a href="https://queldrex.com/tools" style="color:#22d3ee;">queldrex.com/tools</a> or check out the <a href="https://queldrex.com/scanner" style="color:#22d3ee;">free AI Visibility Scanner</a>.</p>
  <p style="color:#475569;font-size:11px;margin-top:24px;">— Queldrex Team · Castle Rock, Colorado · queldrex.com</p>
</div>
</body></html>`,
      }),
    ])
  } catch (err) {
    console.error('Contact email error:', err instanceof Error ? err.message : err)
    return Response.json({ error: 'Failed to send message' }, { status: 500 })
  }

  sendSmsAlert(`[Queldrex] Contact form: "${subject || 'General'}" from ${name} (${email})`).catch(() => {})

  return Response.json({ sent: true })
}
