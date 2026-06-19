import { NextRequest } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

let _resend: Resend | null = null
function getResend() {
  if (!_resend) _resend = new Resend((process.env.RESEND_API_KEY || '').replace(/^﻿/, '').trim())
  return _resend
}

export async function POST(request: NextRequest) {
  const { name, email, category, message } = await request.json()

  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    return Response.json({ error: 'Message is required (minimum 10 characters)' }, { status: 400 })
  }

  const safeName = typeof name === 'string' ? name.trim().slice(0, 100) : 'Anonymous'
  const safeEmail = typeof email === 'string' ? email.trim().slice(0, 200) : ''
  const safeCategory = typeof category === 'string' ? category.slice(0, 50) : 'General'
  const safeMessage = message.trim().slice(0, 5000)

  try {
    await getResend().emails.send({
      from: 'Queldrex Feedback <noreply@queldrex.com>',
      to: 'hello@queldrex.com',
      replyTo: safeEmail || undefined,
      subject: `[${safeCategory}] Feedback from ${safeName || 'Anonymous'}`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px;">
    <div style="background:#0f172a;padding:24px 32px;border-radius:12px 12px 0 0;">
      <div style="color:#94a3b8;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px;">Queldrex</div>
      <div style="color:white;font-size:18px;font-weight:700;">New Feedback Submitted</div>
    </div>
    <div style="background:white;padding:32px;border-radius:0 0 12px 12px;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#6b7280;font-size:13px;width:100px;">Category</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600;font-size:13px;color:#1e293b;">${safeCategory}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#6b7280;font-size:13px;">Name</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#374151;">${safeName || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Email</td><td style="padding:8px 0;font-size:13px;color:#374151;">${safeEmail || '—'}</td></tr>
      </table>
      <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:20px;">
        <div style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:10px;">Message</div>
        <div style="font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap;">${safeMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
      </div>
    </div>
  </div>
</body>
</html>`,
    })
    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Failed to send feedback. Please try again.' }, { status: 500 })
  }
}
