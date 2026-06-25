import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { saveAgency, getAgencyByStripe, updateAgency } from '@/lib/store/redis'
import type { AgencySubscription } from '@/lib/store/redis'
import { sendSmsAlert } from '@/lib/sms/twilio'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const stripeKey = (process.env.STRIPE_SECRET_KEY || '').replace(/^\uFEFF/, '').trim()
  const webhookSecret = (process.env.STRIPE_AGENCY_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || '').replace(/^\uFEFF/, '').trim()
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
    console.error('Agency webhook signature failed:', err instanceof Error ? err.message : err)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break
        if (session.metadata?.plan !== 'agency') break
        const email = (session.metadata?.email || '').toLowerCase()
        const agencyName = session.metadata?.agency_name || ''
        const subId = typeof session.subscription === 'string' ? session.subscription : (session.subscription as Stripe.Subscription)?.id || ''
        const customerId = typeof session.customer === 'string' ? session.customer : (session.customer as Stripe.Customer)?.id || ''
        if (!email || !subId) break
        // Idempotency: skip if agency already exists for this subscription
        const existing = await getAgencyByStripe(subId)
        if (existing) break
        const agency: AgencySubscription = {
          id: crypto.randomUUID(),
          email,
          agencyName,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subId,
          status: 'active',
          scansUsedThisMonth: 0,
          scansLimit: 25,
          clients: [],
          createdAt: new Date().toISOString(),
        }
        await saveAgency(agency)
        await sendAgencyWelcomeEmail(email, agencyName)
        sendSmsAlert(`[Queldrex] 💰 New Agency subscriber ($199/mo): ${agencyName} — ${email}`).catch(() => {})
        sendAdminAgencyAlert(email, agencyName).catch(() => {})
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const agency = await getAgencyByStripe(sub.id)
        if (agency) await updateAgency(agency.id, { status: 'canceled' })
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const parentSub = invoice.parent?.type === 'subscription_details' ? invoice.parent.subscription_details?.subscription : null
        const subId = typeof parentSub === 'string' ? parentSub : (parentSub as Stripe.Subscription)?.id || ''
        if (!subId) break
        const agency = await getAgencyByStripe(subId)
        if (agency) {
          await updateAgency(agency.id, { status: 'past_due' })
          await sendPaymentFailedEmail(agency.email, agency.agencyName)
        }
        break
      }
    }
  } catch (err) {
    console.error('Agency webhook handler error:', err instanceof Error ? err.message : err)
  }

  return Response.json({ received: true })
}

async function sendAgencyWelcomeEmail(email: string, agencyName: string) {
  try {
    const { Resend } = await import('resend')
    const resend = new Resend((process.env.RESEND_API_KEY || '').replace(/^\uFEFF/, '').trim())
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://queldrex.com').replace(/^\uFEFF/, '').trim()
    await resend.emails.send({
      from: 'Queldrex <hello@queldrex.com>',
      to: email,
      subject: `Welcome to the Queldrex Agency Plan — ${agencyName}`,
      html: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#f8fafc;padding:32px;">
<div style="max-width:520px;margin:0 auto;background:#0f172a;padding:28px;border-radius:12px;">
  <div style="font-size:11px;color:#22d3ee;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:12px;">Queldrex · Agency Plan Active</div>
  <div style="font-size:22px;font-weight:800;color:white;margin-bottom:12px;">Welcome, ${agencyName}.</div>
  <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin-bottom:20px;">
    Your Agency Plan is active. You can now scan up to <strong style="color:white;">25 clients per month</strong> and manage them all from your dashboard. Login with a magic link anytime.
  </p>
  <a href="${baseUrl}/agency" style="display:inline-block;background:linear-gradient(135deg,#06d6ff,#0891b2);color:#000;font-weight:700;font-size:13px;padding:11px 22px;border-radius:8px;text-decoration:none;">Go to Agency Dashboard →</a>
  <p style="color:#64748b;font-size:12px;margin-top:20px;">Questions? Reply to this email or contact hello@queldrex.com</p>
</div>
</body></html>`,
    })
  } catch { /* email non-fatal */ }
}

async function sendAdminAgencyAlert(email: string, agencyName: string) {
  try {
    const { Resend } = await import('resend')
    const resend = new Resend((process.env.RESEND_API_KEY || '').replace(/^\uFEFF/, '').trim())
    const adminEmail = process.env.ADMIN_EMAIL || 'hello@queldrex.com'
    const adminUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://queldrex.com').replace(/^\uFEFF/, '').trim() + '/admin'
    await resend.emails.send({
      from: 'Queldrex System <reports@queldrex.com>',
      to: adminEmail,
      subject: `💰 New Agency subscriber — ${agencyName}`,
      html: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#f8fafc;padding:32px;">
<div style="max-width:420px;margin:0 auto;background:#0f172a;padding:28px;border-radius:12px;">
  <div style="font-size:11px;color:#22d3ee;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:12px;">Queldrex · New Agency Subscriber</div>
  <div style="font-size:24px;font-weight:800;color:#4ade80;margin-bottom:4px;">$199/month</div>
  <div style="font-size:15px;font-weight:600;color:white;margin-bottom:4px;">Agency Plan</div>
  <div style="font-size:13px;color:#94a3b8;margin-bottom:4px;">${agencyName}</div>
  <div style="font-size:13px;color:#64748b;margin-bottom:24px;">${email}</div>
  <a href="${adminUrl}" style="display:block;background:#22d3ee;color:#0f172a;text-decoration:none;text-align:center;padding:12px;border-radius:8px;font-weight:700;font-size:14px;">Open Admin Panel →</a>
</div>
</body></html>`,
    })
  } catch { /* email non-fatal */ }
}

async function sendPaymentFailedEmail(email: string, agencyName: string) {
  try {
    const { Resend } = await import('resend')
    const resend = new Resend((process.env.RESEND_API_KEY || '').replace(/^\uFEFF/, '').trim())
    await resend.emails.send({
      from: 'Queldrex <hello@queldrex.com>',
      to: email,
      subject: `Action required — Agency Plan payment failed`,
      html: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#f8fafc;padding:32px;">
<div style="max-width:520px;margin:0 auto;background:#0f172a;padding:28px;border-radius:12px;">
  <div style="font-size:11px;color:#f87171;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:12px;">Queldrex · Payment Failed</div>
  <div style="font-size:20px;font-weight:800;color:white;margin-bottom:12px;">We couldn't charge your card.</div>
  <p style="color:#94a3b8;font-size:14px;line-height:1.7;">
    Your Queldrex Agency Plan for <strong style="color:white;">${agencyName}</strong> is now paused. Please update your payment method to continue managing your clients.
  </p>
</div>
</body></html>`,
    })
  } catch { /* email non-fatal */ }
}
