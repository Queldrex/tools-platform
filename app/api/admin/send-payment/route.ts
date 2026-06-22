import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { v4 as uuidv4 } from 'uuid'
import { getDfyApplication, updateDfyApplication, saveDfySession, logSecurityEvent } from '@/lib/store/redis'
import { adminAuthCheck } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!await adminAuthCheck(request)) {
    logSecurityEvent({ ip, path: '/api/admin/send-payment', method: 'POST', success: false }).catch(() => {})
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { applicationId } = await request.json()
  if (!applicationId) return Response.json({ error: 'applicationId required' }, { status: 400 })

  const app = await getDfyApplication(applicationId)
  if (!app) return Response.json({ error: 'Application not found' }, { status: 404 })

  const stripeKey = (process.env.STRIPE_SECRET_KEY || '').replace(/^\uFEFF/, '').trim()
  if (!stripeKey) return Response.json({ error: 'Stripe not configured' }, { status: 503 })

  const stripe = new Stripe(stripeKey)
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://queldrex.com').replace(/^\uFEFF/, '').trim()
  const dfyToken = uuidv4()

  // Pre-create the DFY session so it exists when they pay
  await saveDfySession({
    token: dfyToken,
    scanId: app.scanId || '',
    emailAddress: app.email,
    domain: app.url,
    score: app.score || 0,
    status: 'pending_payment',
    createdAt: new Date().toISOString(),
  })

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: app.email,
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: 49900,
        product_data: {
          name: 'Done-For-You AI Visibility Implementation',
          description: `Full AI visibility fix for ${app.url} — we implement everything for you`,
        },
      },
      quantity: 1,
    }],
    mode: 'payment',
    allow_promotion_codes: true,
    automatic_tax: { enabled: true },
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/cancel`,
    metadata: { scanId: app.scanId || '', dfyToken, tier: 'dfy', applicationId },
  })

  // Send payment link email
  const { sendPaymentLinkEmail } = await import('@/lib/email/resend')
  await sendPaymentLinkEmail({
    to: app.email,
    name: app.name,
    url: app.url,
    paymentUrl: session.url!,
    score: app.score,
  })

  await updateDfyApplication(applicationId, { status: 'payment_sent' })

  return Response.json({ ok: true, paymentUrl: session.url })
}
