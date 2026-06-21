import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { v4 as uuidv4 } from 'uuid'
import { randomUUID } from 'crypto'
import { getScan, saveScan, saveDownloadToken, updateScanLog, getDfySession, saveDfySession, updateDfyApplication, getRedis, getProCustomer, saveProSession, getToolCustomers, saveToolPurchase } from '@/lib/store/redis'
import { sendDeliveryEmail, sendDfyAuthorizationEmail, sendAdminPurchaseAlert } from '@/lib/email/resend'
import { sendSmsAlert } from '@/lib/sms/twilio'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const stripeKey = (process.env.STRIPE_SECRET_KEY || '').replace(/^﻿/, '').trim()
  const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || '').replace(/^﻿/, '').trim()
  if (!stripeKey || !webhookSecret) {
    return Response.json({ error: 'Webhook not configured' }, { status: 503 })
  }
  const stripe = new Stripe(stripeKey)
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return Response.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // ── invoice.payment_succeeded — refresh subscription access on renewal ───
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice
    const customerId = typeof invoice.customer === 'string' ? invoice.customer : (invoice.customer as Stripe.Customer | null)?.id
    if (customerId) {
      const [proSessionId, toolEntries] = await Promise.all([
        getProCustomer(customerId),
        getToolCustomers(customerId),
      ])
      await Promise.all([
        proSessionId ? saveProSession(proSessionId) : Promise.resolve(),
        ...toolEntries.map(({ toolId, token }) => saveToolPurchase(token, toolId)),
      ])
    }
    return Response.json({ received: true })
  }

  // ── invoice.payment_failed — tool subscriptions ──────────────────────────
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    const email = (invoice as unknown as { customer_email?: string }).customer_email
    if (email) {
      console.warn(`[stripe-webhook] payment_failed for ${email}, invoice ${invoice.id}`)
    }
    return Response.json({ received: true })
  }

  // ── checkout.session.expired — abandoned checkout ────────────────────────
  if (event.type === 'checkout.session.expired') {
    const expired = event.data.object as Stripe.Checkout.Session
    console.warn(`[stripe-webhook] checkout.session.expired: ${expired.id}`)
    return Response.json({ received: true })
  }

  if (event.type !== 'checkout.session.completed') {
    return Response.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session

  // ── Download product fallback ─────────────────────────────────────────────
  // If the verify redirect failed (browser closed), grant access via webhook.
  const meta = session.metadata || {}
  if (meta.type === 'download' && meta.productId) {
    const token = randomUUID()
    await Promise.all([
      getRedis().set(`download_product:${token}`, meta.productId, { ex: 60 * 60 * 24 * 365 }),
      getRedis().set(`download_session:${session.id}`, JSON.stringify({ token, productId: meta.productId }), { ex: 60 * 60 * 24 * 7 }),
    ])
    return Response.json({ received: true })
  }

  const scanId = session.metadata?.scanId
  if (!scanId) {
    return Response.json({ received: true })
  }

  const baseUrl = env('NEXT_PUBLIC_BASE_URL', 'https://queldrex.com')

  // ── DFY $499 ──────────────────────────────────────────────────────────────
  if (session.metadata?.tier === 'dfy') {
    const dfyToken = session.metadata.dfyToken
    if (!dfyToken) return Response.json({ received: true })

    const [scan, existingSession] = await Promise.all([
      getScan(scanId),
      getDfySession(dfyToken),
    ])

    if (!scan) return Response.json({ received: true })

    // Mark session as paid (was pending_payment)
    const updated = existingSession
      ? { ...existingSession, status: 'paid' as const }
      : {
          token: dfyToken, scanId, emailAddress: scan.emailAddress,
          domain: scan.businessInfo.domain, score: scan.score,
          status: 'paid' as const, createdAt: new Date().toISOString(),
        }
    await saveDfySession(updated)
    await updateScanLog(scanId, { paid: true, paidAt: new Date().toISOString(), status: 'DFY_PAID' }).catch(() => {})

    // Link dfyToken back to the application so admin can trigger implementation
    const applicationId = session.metadata?.applicationId
    if (applicationId) {
      await updateDfyApplication(applicationId, { status: 'paid', dfyToken }).catch(() => {})
    }

    sendAdminPurchaseAlert({
      domain: scan.businessInfo.domain,
      email: scan.emailAddress,
      score: scan.score,
      product: 'Done-For-You ($499)',
      amount: '$499',
    }).catch(() => {})
    sendSmsAlert(`[Queldrex] 💰 $499 DFY purchase: ${scan.businessInfo.domain} (score ${scan.score}/100)`).catch(() => {})

    // Auth email sent HERE — only after payment confirmed
    await sendDfyAuthorizationEmail({
      to: scan.emailAddress,
      domain: scan.businessInfo.domain,
      score: scan.score,
      credentialsUrl: `${baseUrl}/impl/${dfyToken}`,
      bookingUrl: `${baseUrl}/book?token=${dfyToken}`,
    }).catch(() => {})

    return Response.json({ received: true })
  }

  // ── Bundle $399 ───────────────────────────────────────────────────────────
  const scan = await getScan(scanId)
  if (!scan) {
    // Return 200 so Stripe doesn't retry — scan data expired (48hr TTL)
    return Response.json({ received: true, note: 'scan_expired' })
  }

  // Only skip if fully delivered — PAID alone means email may not have sent yet
  if (scan.status === 'DELIVERED') {
    return Response.json({ received: true })
  }

  // Re-use existing token if already generated (idempotent retry)
  const downloadToken = scan.downloadToken || uuidv4()
  if (!scan.downloadToken) {
    await saveDownloadToken(downloadToken, scanId)
  }

  const downloadUrl = `${baseUrl}/download/${downloadToken}`
  const paidAt = scan.paidAt || new Date().toISOString()

  // Send delivery email BEFORE marking DELIVERED — if it throws, Stripe will retry
  await sendDeliveryEmail({
    to: scan.emailAddress,
    businessName: scan.businessInfo.name || scan.businessInfo.domain,
    downloadUrl,
    score: scan.score,
  })

  await saveScan({ ...scan, status: 'DELIVERED', paid: true, downloadToken, paidAt })
  await updateScanLog(scanId, { paid: true, paidAt, status: 'DELIVERED', downloadToken }).catch(() => {})

  sendAdminPurchaseAlert({
    domain: scan.businessInfo.domain,
    email: scan.emailAddress,
    score: scan.score,
    product: 'AI Report Bundle ($399)',
    amount: '$399',
  }).catch(() => {})
  sendSmsAlert(`[Queldrex] 💰 $399 purchase: ${scan.businessInfo.domain} (score ${scan.score}/100)`).catch(() => {})

  return Response.json({ received: true })
}
