import { NextRequest } from 'next/server'
import { getRedis } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rateKey = `newsletter:rate:${ip}`
  try {
    const redis = getRedis()
    const uses = await redis.incr(rateKey)
    if (uses === 1) await redis.expire(rateKey, 3600)
    if (uses > 5) return Response.json({ error: 'Too many requests.' }, { status: 429 })
  } catch { /* Redis failure doesn't block signup */ }

  let body: { email?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const email = (body.email || '').trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return Response.json({ error: 'Valid email required' }, { status: 400 })

  try {
    const { Resend } = await import('resend')
    const resend = new Resend((process.env.RESEND_API_KEY || '').replace(/^﻿/, '').trim())

    await Promise.all([
      resend.emails.send({
        from: 'Queldrex <reports@queldrex.com>',
        to: process.env.ADMIN_EMAIL || 'hello@queldrex.com',
        subject: `[Queldrex] New tool notification signup — ${email}`,
        html: `<p>New newsletter signup: <strong>${email}</strong></p>`,
      }),
      resend.emails.send({
        from: 'Queldrex <reports@queldrex.com>',
        to: email,
        subject: "You're in — Queldrex tool updates",
        html: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#f8fafc;padding:32px;">
<div style="max-width:520px;margin:0 auto;background:#0f172a;padding:28px;border-radius:12px;">
  <div style="font-size:11px;color:#a78bfa;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:12px;">Queldrex</div>
  <div style="font-size:20px;font-weight:800;color:white;margin-bottom:12px;">You're on the list.</div>
  <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin-bottom:20px;">We'll email you when new tools launch. One email per drop — no spam, no newsletters, no fluff.</p>
  <p style="color:#94a3b8;font-size:14px;line-height:1.7;">While you're here, try any of our <a href="https://queldrex.com/tools" style="color:#a78bfa;">51 free tools</a> — no account needed.</p>
  <p style="color:#475569;font-size:11px;margin-top:24px;">— Queldrex · Castle Rock, Colorado · <a href="https://queldrex.com" style="color:#475569;">queldrex.com</a></p>
</div>
</body></html>`,
      }),
    ])
  } catch (err) {
    console.error('Newsletter email error:', err instanceof Error ? err.message : err)
    return Response.json({ error: 'Failed to subscribe' }, { status: 500 })
  }

  return Response.json({ subscribed: true })
}
