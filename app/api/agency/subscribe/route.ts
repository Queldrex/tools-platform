import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const stripeKey = (process.env.STRIPE_SECRET_KEY || '').replace(/^﻿/, '').trim()
  if (!stripeKey) return Response.json({ error: 'Payment not configured' }, { status: 503 })
  const stripe = new Stripe(stripeKey)

  let body: { email?: string; agency_name?: string }
  try { body = await request.json() } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, agency_name } = body
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Valid email required' }, { status: 400 })
  }
  if (!agency_name || agency_name.trim().length === 0) {
    return Response.json({ error: 'Agency name required' }, { status: 400 })
  }

  const baseUrl = env('NEXT_PUBLIC_BASE_URL', 'https://queldrex.com')

  let customerId: string
  try {
    const existing = await stripe.customers.list({ email: email.toLowerCase(), limit: 1 })
    customerId = existing.data.length > 0
      ? existing.data[0].id
      : (await stripe.customers.create({ email: email.toLowerCase() })).id
  } catch (err) {
    console.error('Stripe customer error:', err instanceof Error ? err.message : err)
    return Response.json({ error: 'Could not create customer' }, { status: 502 })
  }

  // Set STRIPE_AGENCY_PRICE_ID in Vercel env to pin a specific price
  let priceId = (process.env.STRIPE_AGENCY_PRICE_ID || '').replace(/^﻿/, '').trim()
  if (!priceId) {
    try {
      const price = await stripe.prices.create({
        currency: 'usd',
        unit_amount: 29900,
        recurring: { interval: 'month' },
        product_data: { name: 'Queldrex Agency Plan' },
      })
      priceId = price.id
    } catch (err) {
      console.error('Stripe price error:', err instanceof Error ? err.message : err)
      return Response.json({ error: 'Could not create price' }, { status: 502 })
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { email: email.toLowerCase(), agency_name: agency_name.trim(), plan: 'agency' },
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
      success_url: `${baseUrl}/agency/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/agency`,
    })
    return Response.json({ url: session.url })
  } catch (err) {
    console.error('Stripe session error:', err instanceof Error ? err.message : err)
    return Response.json({ error: 'Could not create checkout session' }, { status: 502 })
  }
}
