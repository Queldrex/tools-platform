import { NextRequest } from 'next/server'
import { getAgencyByEmail, getRedis } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'

const MAGIC_TTL = 60 * 15 // 15 minutes

export async function POST(request: NextRequest) {
  let body: { email?: string }
  try { body = await request.json() } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email } = body
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Valid email required' }, { status: 400 })
  }

  const agency = await getAgencyByEmail(email)
  if (!agency) {
    // Don't reveal whether email exists — always return sent
    return Response.json({ sent: true })
  }

  const token = crypto.randomUUID()
  await getRedis().set(`agencymagic:${token}`, agency.id, { ex: MAGIC_TTL })

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://queldrex.com').replace(/^\uFEFF/, '').trim()
  const loginLink = `${baseUrl}/agency/dashboard?token=${token}`

  try {
    const { Resend } = await import('resend')
    const resend = new Resend((process.env.RESEND_API_KEY || '').replace(/^\uFEFF/, '').trim())
    await resend.emails.send({
      from: 'Queldrex <hello@queldrex.com>',
      to: email,
      subject: 'Your Queldrex Agency Dashboard login link',
      html: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#f8fafc;padding:32px;">
<div style="max-width:520px;margin:0 auto;background:#0f172a;padding:28px;border-radius:12px;">
  <div style="font-size:11px;color:#22d3ee;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:12px;">Queldrex · Agency Login</div>
  <div style="font-size:20px;font-weight:800;color:white;margin-bottom:12px;">Here's your login link.</div>
  <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin-bottom:20px;">
    Click the button below to access your Agency Dashboard. This link expires in <strong style="color:white;">15 minutes</strong> and can only be used once.
  </p>
  <a href="${loginLink}" style="display:inline-block;background:linear-gradient(135deg,#06d6ff,#0891b2);color:#000;font-weight:700;font-size:13px;padding:11px 22px;border-radius:8px;text-decoration:none;">Open Agency Dashboard →</a>
  <p style="color:#64748b;font-size:12px;margin-top:20px;">If you didn't request this, you can safely ignore it.</p>
</div>
</body></html>`,
    })
  } catch (err) {
    console.error('Agency magic link email error:', err instanceof Error ? err.message : err)
    return Response.json({ error: 'Could not send email' }, { status: 502 })
  }

  return Response.json({ sent: true })
}
