import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { v4 as uuidv4 } from 'uuid'
import { getScan, saveScan, saveDownloadToken, updateScanLog, getDfySession, saveDfySession } from '@/lib/store/redis'
import { sendDeliveryEmail, sendDfyAuthorizationEmail } from '@/lib/email/resend'
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

  if (event.type !== 'checkout.session.completed') {
    return Response.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const scanId = session.metadata?.scanId
  if (!scanId) {
    return Response.json({ error: 'No scanId in metadata' }, { status: 400 })
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

  // ── Bundle $149 ───────────────────────────────────────────────────────────
  const scan = await getScan(scanId)
  if (!scan) {
    return Response.json({ error: 'Scan not found' }, { status: 404 })
  }

  if (scan.status === 'PAID' || scan.status === 'DELIVERED') {
    return Response.json({ received: true })
  }

  const downloadToken = uuidv4()
  await saveDownloadToken(downloadToken, scanId)

  const downloadUrl = `${baseUrl}/download/${downloadToken}`
  const paidAt = new Date().toISOString()

  await saveScan({ ...scan, status: 'PAID', paid: true, downloadToken, paidAt })

  await sendDeliveryEmail({
    to: scan.emailAddress,
    businessName: scan.businessInfo.domain,
    downloadUrl,
    score: scan.score,
  })

  await saveScan({ ...scan, status: 'DELIVERED', paid: true, downloadToken, paidAt })
  await updateScanLog(scanId, { paid: true, paidAt, status: 'DELIVERED' }).catch(() => {})

  return Response.json({ received: true })
}
