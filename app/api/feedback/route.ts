import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { saveFeedback } from '@/lib/store/redis'
import { sendSmsAlert } from '@/lib/sms/twilio'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { name, email, category, message } = await request.json()

  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    return Response.json({ error: 'Message is required (minimum 10 characters)' }, { status: 400 })
  }

  const safeName = typeof name === 'string' ? name.trim().slice(0, 100) : ''
  const safeEmail = typeof email === 'string' ? email.trim().slice(0, 200) : ''
  const safeCategory = typeof category === 'string' ? category.slice(0, 50) : 'General'
  const safeMessage = message.trim().slice(0, 5000)

  await saveFeedback({
    id: uuidv4(),
    category: safeCategory,
    name: safeName,
    email: safeEmail,
    message: safeMessage,
    createdAt: new Date().toISOString(),
  })

  // Notify admin — non-fatal
  const adminEmail = process.env.ADMIN_EMAIL || 'janitor.clean.base@gmail.com'
  const adminUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://queldrex.com').replace(/^﻿/, '').trim() + '/admin'
  Promise.all([
    (async () => {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend((process.env.RESEND_API_KEY || '').replace(/^﻿/, '').trim())
        await resend.emails.send({
          from: 'Queldrex System <reports@queldrex.com>',
          to: adminEmail,
          subject: `💬 New Feedback — ${safeCategory}${safeName ? ` from ${safeName}` : ''}`,
          html: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#f8fafc;padding:32px;">
<div style="max-width:500px;margin:0 auto;background:#0f172a;padding:28px;border-radius:12px;">
  <div style="font-size:11px;color:#22d3ee;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:12px;">Queldrex · Feedback — ${safeCategory}</div>
  ${safeName ? `<div style="font-size:16px;font-weight:700;color:white;margin-bottom:4px;">${safeName}</div>` : ''}
  ${safeEmail ? `<div style="font-size:13px;color:#22d3ee;margin-bottom:16px;">${safeEmail}</div>` : '<div style="margin-bottom:16px;"></div>'}
  <div style="background:#1e293b;border-radius:8px;padding:16px;margin-bottom:16px;">
    <div style="font-size:13px;color:#cbd5e1;line-height:1.7;white-space:pre-wrap;">${safeMessage.slice(0, 1000)}</div>
  </div>
  <a href="${adminUrl}" style="display:block;background:#22d3ee;color:#0f172a;text-decoration:none;text-align:center;padding:12px;border-radius:8px;font-weight:700;font-size:14px;">Open Admin Panel →</a>
</div>
</body></html>`,
        })
      } catch { /* email is non-fatal */ }
    })(),
    sendSmsAlert(`[Queldrex] New ${safeCategory} feedback${safeName ? ` from ${safeName}` : ''}. Check admin.`).catch(() => {}),
  ]).catch(() => {})

  return Response.json({ ok: true })
}
