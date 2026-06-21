import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/store/redis'
import { sendGenericEmail } from '@/lib/email/resend'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  // Always return 200 to prevent email enumeration
  doRestore(email).catch(err => console.error('Restore background error:', err))
  return NextResponse.json({ ok: true })
}

async function doRestore(email: string) {
  const stripeKey = (process.env.STRIPE_SECRET_KEY || '').replace(/^﻿/, '').trim()
  if (!stripeKey) return

  const stripe = new Stripe(stripeKey)
  const customers = await stripe.customers.list({ email, limit: 5 })
  if (customers.data.length === 0) return

  const customer = customers.data[0]
  const purchases: { type: string; id: string; label: string }[] = []

  // Check active subscriptions
  const subs = await stripe.subscriptions.list({ customer: customer.id, status: 'active', limit: 10 })
  for (const sub of subs.data) {
    const amount = sub.items.data[0]?.price?.unit_amount ?? 0
    if (amount === 7900) {
      purchases.push({ type: 'pro', id: sub.id, label: 'Queldrex Pro — all 48 tools' })
    } else {
      purchases.push({ type: 'tool', id: sub.id, label: `Tool subscription ($${(amount / 100).toFixed(2)}/mo)` })
    }
  }

  // Check recent one-time download payments
  const payments = await stripe.paymentIntents.list({ customer: customer.id, limit: 20 })
  for (const pi of payments.data) {
    if (pi.status === 'succeeded' && pi.metadata?.type === 'download' && pi.metadata?.productId) {
      purchases.push({ type: 'download', id: pi.metadata.productId, label: `Download: ${pi.metadata.productId.replace(/-/g, ' ')}` })
    }
  }

  if (purchases.length === 0) return

  const restoreToken = randomUUID()
  await getRedis().set(
    `restore:${restoreToken}`,
    JSON.stringify({ email, purchases }),
    { ex: 60 * 60 }  // 1 hour
  )

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://queldrex.com').replace(/^﻿/, '').trim()
  const restoreUrl = `${baseUrl}/api/restore/apply?token=${restoreToken}`

  await sendGenericEmail({
    to: email,
    subject: 'Restore your Queldrex access',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:540px;margin:40px auto;padding:0 20px;">
    <div style="background:#09090B;padding:32px;border-radius:16px 16px 0 0;text-align:center;">
      <div style="color:#A1A1AA;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:10px;">Queldrex · Access Restore</div>
      <div style="color:#FAFAFA;font-size:22px;font-weight:800;">Restore your access</div>
    </div>
    <div style="background:white;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
      <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">Click the button below to restore access on this device. The link expires in 1 hour.</p>
      <p style="color:#6b7280;font-size:13px;margin:0 0 8px;font-weight:600;">Access found for:</p>
      <ul style="color:#1e293b;margin:0 0 24px;padding-left:20px;line-height:2;">
        ${purchases.map(p => `<li>${p.label}</li>`).join('')}
      </ul>
      <a href="${restoreUrl}" style="display:block;background:linear-gradient(135deg,#7C3AED,#6D28D9);color:white;text-decoration:none;text-align:center;padding:16px;border-radius:10px;font-weight:800;font-size:15px;margin-bottom:16px;">Restore Access on This Device</a>
      <p style="color:#9ca3af;font-size:12px;margin:0 0 8px;text-align:center;">Or copy this link into the browser where you want access:</p>
      <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:10px 14px;margin-bottom:20px;word-break:break-all;font-size:11px;color:#6b7280;font-family:monospace;">${restoreUrl}</div>
      <p style="color:#9ca3af;font-size:11px;margin:0;text-align:center;">If you didn't request this, ignore this email. Your account is safe.</p>
    </div>
    <p style="text-align:center;font-size:11px;color:#94a3b8;margin-top:16px;">Queldrex LLC · Castle Rock, CO · queldrex.com</p>
  </div>
</body>
</html>`,
  })
}
