import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { saveDfyApplication, getScan, getNextTicketNumber } from '@/lib/store/redis'
import { sendSmsAlert } from '@/lib/sms/twilio'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, email, url, platform, message, scanId } = body

  if (!name || typeof name !== 'string' || name.trim().length < 1)
    return Response.json({ error: 'Name is required' }, { status: 400 })
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
    return Response.json({ error: 'Valid email is required' }, { status: 400 })
  if (!url || typeof url !== 'string' || url.trim().length < 3)
    return Response.json({ error: 'Website URL is required' }, { status: 400 })
  if (!message || typeof message !== 'string' || message.trim().length < 10)
    return Response.json({ error: 'Please tell us a bit about your business (min 10 chars)' }, { status: 400 })

  // Optionally pull score from existing scan
  let score: number | undefined
  if (scanId && typeof scanId === 'string') {
    const scan = await getScan(scanId).catch(() => null)
    if (scan) score = scan.score
  }

  const ticketNumber = await getNextTicketNumber()

  await saveDfyApplication({
    id: uuidv4(),
    scanId: scanId || undefined,
    name: name.trim().slice(0, 100),
    email: email.trim().toLowerCase().slice(0, 200),
    url: url.trim().slice(0, 300),
    platform: typeof platform === 'string' ? platform.slice(0, 50) : 'Unknown',
    score,
    message: message.trim().slice(0, 2000),
    status: 'new',
    createdAt: new Date().toISOString(),
    ticketNumber,
    priority: 'medium',
    statusHistory: [{ status: 'new', at: new Date().toISOString() }],
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
          subject: `📋 New DFY Application — ${url.trim()} (#${ticketNumber})`,
          html: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#f8fafc;padding:32px;">
<div style="max-width:520px;margin:0 auto;background:#0f172a;padding:28px;border-radius:12px;">
  <div style="font-size:11px;color:#22d3ee;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:12px;">Queldrex · DFY Application #${ticketNumber}</div>
  <div style="font-size:20px;font-weight:800;color:white;margin-bottom:4px;">${url.trim()}</div>
  ${score !== undefined ? `<div style="font-size:13px;color:#94a3b8;margin-bottom:16px;">AI Score: ${score}/100</div>` : '<div style="margin-bottom:16px;"></div>'}
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
    <tr><td style="font-size:12px;color:#64748b;padding:5px 0;width:80px;">Name</td><td style="font-size:13px;color:white;">${name.trim()}</td></tr>
    <tr><td style="font-size:12px;color:#64748b;padding:5px 0;">Email</td><td style="font-size:13px;color:#22d3ee;">${email.trim()}</td></tr>
    <tr><td style="font-size:12px;color:#64748b;padding:5px 0;">Platform</td><td style="font-size:13px;color:white;">${typeof platform === 'string' ? platform : 'Unknown'}</td></tr>
  </table>
  <div style="background:#1e293b;border-radius:8px;padding:14px;margin-bottom:16px;">
    <div style="font-size:10px;color:#475569;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">Message</div>
    <div style="font-size:13px;color:#cbd5e1;line-height:1.7;white-space:pre-wrap;">${message.trim().slice(0, 500)}</div>
  </div>
  <a href="${adminUrl}" style="display:block;background:#22d3ee;color:#0f172a;text-decoration:none;text-align:center;padding:12px;border-radius:8px;font-weight:700;font-size:14px;">Open Admin Panel →</a>
</div>
</body></html>`,
        })
      } catch { /* email is non-fatal */ }
    })(),
    sendSmsAlert(`[Queldrex] New DFY application #${ticketNumber}: ${url.trim()} from ${name.trim()}. Check admin.`).catch(() => {}),
  ]).catch(() => {})

  return Response.json({ ok: true })
}
