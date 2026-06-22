import { NextRequest } from 'next/server'
import { isIpLocked, incrementIpFailures, clearIpFailures, createAdminSession, logSecurityEvent } from '@/lib/store/redis'
import { verifyTotp } from '@/lib/totp'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  if (await isIpLocked(ip)) {
    return Response.json({ error: 'Too many failed attempts. Try again in 1 hour.', code: 'IP_LOCKED' }, { status: 429 })
  }

  let body: { secret?: string; totp?: string } = {}
  try { body = await request.json() } catch { /* ignore */ }

  const adminSecret = (process.env.ADMIN_SECRET || '').replace(/^\uFEFF/, '').trim()
  const secretOk = !!body.secret && !!adminSecret && body.secret === adminSecret
  const totpSecret = process.env.ADMIN_TOTP_SECRET
  const totpOk = totpSecret ? verifyTotp(totpSecret, body.totp || '') : true

  if (!secretOk || !totpOk) {
    const count = await incrementIpFailures(ip)
    logSecurityEvent({ ip, path: '/api/admin/login', method: 'POST', success: false }).catch(() => {})
    if (count === 3) sendAttackAlert(ip, count).catch(() => {})
    const remaining = Math.max(0, 5 - count)
    return Response.json({
      error: 'Invalid credentials',
      code: 'INVALID_CREDENTIALS',
      remaining,
    }, { status: 401 })
  }

  await clearIpFailures(ip)
  const sessionToken = await createAdminSession()
  logSecurityEvent({ ip, path: '/api/admin/login', method: 'POST', success: true, action: 'login' }).catch(() => {})
  return Response.json({ ok: true, sessionToken })
}

async function sendAttackAlert(ip: string, count: number) {
  const { Resend } = await import('resend')
  const { sendSmsAlert } = await import('@/lib/sms/twilio')
  const resend = new Resend((process.env.RESEND_API_KEY || '').replace(/^\uFEFF/, '').trim())
  await Promise.all([
    resend.emails.send({
      from: 'Queldrex Security <reports@queldrex.com>',
      to: process.env.ADMIN_EMAIL || 'hello@queldrex.com',
      subject: `🚨 Admin Attack Alert — ${count} failed attempts from ${ip}`,
      html: `<div style="font-family:system-ui;background:#0f172a;padding:24px;color:white;border-radius:12px;max-width:480px;">
        <div style="color:#f87171;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:12px;">⚠ Security Alert</div>
        <div style="font-size:18px;font-weight:800;margin-bottom:8px;">${count} Failed Admin Login Attempts</div>
        <div style="color:#94a3b8;font-size:13px;margin-bottom:16px;">IP: <span style="font-family:monospace;color:#f87171;">${ip}</span></div>
        <div style="color:#64748b;font-size:12px;">Time: ${new Date().toISOString()}</div>
        <div style="margin-top:16px;padding:12px;background:#1e293b;border-radius:8px;font-size:12px;color:#94a3b8;">
          If this wasn&apos;t you, your admin system is under attack. The IP will be automatically blocked after 5 attempts.
        </div>
      </div>`,
    }),
    sendSmsAlert(`[Queldrex] SECURITY: ${count} failed admin logins from ${ip}. Auto-blocked at 5 attempts.`),
  ])
}
