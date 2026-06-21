import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { v4 as uuidv4 } from 'uuid'
import { saveMonitor, getMonitorByStripe, updateMonitor } from '@/lib/store/redis'
import { sendSmsAlert } from '@/lib/sms/twilio'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const stripeKey = (process.env.STRIPE_SECRET_KEY || '').replace(/^﻿/, '').trim()
  const webhookSecret = (process.env.STRIPE_MONITOR_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || '').replace(/^﻿/, '').trim()
  if (!stripeKey || !webhookSecret) {
    return Response.json({ error: 'Not configured' }, { status: 503 })
  }
  const stripe = new Stripe(stripeKey)

  const sig = request.headers.get('stripe-signature')
  if (!sig) return Response.json({ error: 'No signature' }, { status: 400 })

  const rawBody = await request.text()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature failed:', err instanceof Error ? err.message : err)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break
        const email = (session.metadata?.email || '').toLowerCase()
        const domain = session.metadata?.domain || ''
        const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || ''
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id || ''
        if (!email || !domain || !subId) break
        // Idempotency: skip if monitor already exists for this subscription
        const existing = await getMonitorByStripe(subId)
        if (existing) break
        await saveMonitor({
          id: uuidv4(),
          email,
          domain,
          stripeSubscriptionId: subId,
          stripeCustomerId: customerId,
          status: 'active',
          scoreHistory: [],
          createdAt: new Date().toISOString(),
        })
        await sendMonitorWelcomeEmail(email, domain)
        sendSmsAlert(`[Queldrex] 💰 New Pro subscriber ($79/mo): ${domain} — ${email}`).catch(() => {})
        sendAdminMonitorAlert(email, domain).catch(() => {})
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const monitor = await getMonitorByStripe(sub.id)
        if (monitor) await updateMonitor(monitor.id, { status: 'cancelled' })
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const parentSub = invoice.parent?.type === 'subscription_details' ? invoice.parent.subscription_details?.subscription : null
        const subId = typeof parentSub === 'string' ? parentSub : (parentSub as Stripe.Subscription)?.id || ''
        if (!subId) break
        const monitor = await getMonitorByStripe(subId)
        if (monitor) {
          await updateMonitor(monitor.id, { status: 'past_due' })
          await sendPaymentFailedEmail(monitor.email, monitor.domain)
        }
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err instanceof Error ? err.message : err)
  }

  return Response.json({ received: true })
}

async function sendMonitorWelcomeEmail(email: string, domain: string) {
  try {
    const { Resend } = await import('resend')
    const resend = new Resend((process.env.RESEND_API_KEY || '').replace(/^﻿/, '').trim())
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://queldrex.com').replace(/^﻿/, '').trim()
    await resend.emails.send({
      from: 'Queldrex Monitor <reports@queldrex.com>',
      to: email,
      subject: `AI Visibility Monitor active for ${domain}`,
      html: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#f8fafc;padding:32px;">
<div style="max-width:520px;margin:0 auto;background:#0f172a;padding:28px;border-radius:12px;">
  <div style="font-size:11px;color:#22d3ee;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:12px;">Queldrex · Monitor Active</div>
  <div style="font-size:22px;font-weight:800;color:white;margin-bottom:12px;">You're now being monitored.</div>
  <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin-bottom:20px;">
    We'll scan <strong style="color:white;">${domain}</strong> monthly and alert you if your AI visibility score drops. Your first scan runs within 24 hours.
  </p>
  <a href="${baseUrl}/monitor" style="display:inline-block;background:linear-gradient(135deg,#06d6ff,#0891b2);color:#000;font-weight:700;font-size:13px;padding:11px 22px;border-radius:8px;text-decoration:none;">View Dashboard</a>
</div>
</body></html>`,
    })
  } catch { /* email non-fatal */ }
}

async function sendAdminMonitorAlert(email: string, domain: string) {
  try {
    const { Resend } = await import('resend')
    const resend = new Resend((process.env.RESEND_API_KEY || '').replace(/^﻿/, '').trim())
    const adminEmail = process.env.ADMIN_EMAIL || 'janitor.clean.base@gmail.com'
    const adminUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://queldrex.com').replace(/^﻿/, '').trim() + '/admin'
    await resend.emails.send({
      from: 'Queldrex System <reports@queldrex.com>',
      to: adminEmail,
      subject: `💰 New Pro subscriber — ${domain}`,
      html: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#f8fafc;padding:32px;">
<div style="max-width:420px;margin:0 auto;background:#0f172a;padding:28px;border-radius:12px;">
  <div style="font-size:11px;color:#22d3ee;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:12px;">Queldrex · New Pro Subscriber</div>
  <div style="font-size:24px;font-weight:800;color:#4ade80;margin-bottom:4px;">$79/month</div>
  <div style="font-size:15px;font-weight:600;color:white;margin-bottom:4px;">AI Visibility Monitor</div>
  <div style="font-size:13px;color:#94a3b8;margin-bottom:4px;">${domain}</div>
  <div style="font-size:13px;color:#64748b;margin-bottom:24px;">${email}</div>
  <a href="${adminUrl}" style="display:block;background:#22d3ee;color:#0f172a;text-decoration:none;text-align:center;padding:12px;border-radius:8px;font-weight:700;font-size:14px;">Open Admin Panel →</a>
</div>
</body></html>`,
    })
  } catch { /* email non-fatal */ }
}

async function sendPaymentFailedEmail(email: string, domain: string) {
  try {
    const { Resend } = await import('resend')
    const resend = new Resend((process.env.RESEND_API_KEY || '').replace(/^﻿/, '').trim())
    await resend.emails.send({
      from: 'Queldrex Monitor <reports@queldrex.com>',
      to: email,
      subject: `Action required — payment failed for ${domain} monitoring`,
      html: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#f8fafc;padding:32px;">
<div style="max-width:520px;margin:0 auto;background:#0f172a;padding:28px;border-radius:12px;">
  <div style="font-size:11px;color:#f87171;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:12px;">Queldrex · Payment Failed</div>
  <div style="font-size:20px;font-weight:800;color:white;margin-bottom:12px;">We couldn't charge your card.</div>
  <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin-bottom:20px;">
    Your AI Visibility Monitor for <strong style="color:white;">${domain}</strong> is now paused. Please update your payment method to continue monthly monitoring.
  </p>
</div>
</body></html>`,
    })
  } catch { /* email non-fatal */ }
}
