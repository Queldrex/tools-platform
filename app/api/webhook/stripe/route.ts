import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { v4 as uuidv4 } from 'uuid'
import { getScan, saveScan, saveDownloadToken } from '@/lib/store/redis'
import { sendDeliveryEmail } from '@/lib/email/resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return Response.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
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

  const scan = await getScan(scanId)
  if (!scan) {
    return Response.json({ error: 'Scan not found' }, { status: 404 })
  }

  if (scan.status === 'PAID' || scan.status === 'DELIVERED') {
    return Response.json({ received: true })
  }

  const downloadToken = uuidv4()
  await saveDownloadToken(downloadToken, scanId)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const downloadUrl = `${baseUrl}/api/download/${downloadToken}`

  const paidAt = new Date().toISOString()

  await saveScan({ ...scan, status: 'PAID', paid: true, downloadToken, paidAt })

  await sendDeliveryEmail({
    to: scan.emailAddress,
    businessName: scan.businessInfo.name || scan.businessInfo.domain,
    downloadUrl,
    score: scan.score,
  })

  await saveScan({ ...scan, status: 'DELIVERED', paid: true, downloadToken, paidAt })

  return Response.json({ received: true })
}
