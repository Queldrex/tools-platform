import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const stripeKey = (process.env.STRIPE_SECRET_KEY || '').replace(/^﻿/, '').trim()
  if (!stripeKey) return Response.json({ error: 'Payment not configured' }, { status: 503 })
  const stripe = new Stripe(stripeKey)

  let body: { email?: string; domain?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, domain } = body
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Valid email required' }, { status: 400 })
  }
  if (!domain || typeof domain !== 'string' || domain.trim().length === 0) {
    return Response.json({ error: 'Domain required' }, { status: 400 })
  }

  // Normalize domain — strip protocol, www., trailing slash
  const normalized = domain.trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/.*$/, '')
    .toLowerCase()

  const baseUrl = env('NEXT_PUBLIC_BASE_URL', 'https://queldrex.com')

  // Find or create Stripe customer
  let customerId: string
  try {
    const existing = await stripe.customers.list({ email: email.toLowerCase(), limit: 1 })
    if (existing.data.length > 0) {
      customerId = existing.data[0].id
    } else {
      const customer = await stripe.customers.create({ email: email.toLowerCase() })
      customerId = customer.id
    }
  } catch (err) {
    console.error('Stripe customer error:', err instanceof Error ? err.message : err)
    return Response.json({ error: 'Could not create customer' }, { status: 502 })
  }

  // Get or create the $79/month price — set STRIPE_MONITOR_PRICE_ID in Vercel env to pin a specific price
  let priceId = (process.env.STRIPE_MONITOR_PRICE_ID || '').replace(/^﻿/, '').trim()
  if (!priceId) {
    try {
      const price = await stripe.prices.create({
        currency: 'usd',
        unit_amount: 7900,
        recurring: { interval: 'month' },
        product_data: { name: 'Queldrex Pro' },
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
      metadata: { email: email.toLowerCase(), domain: normalized },
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
      success_url: `${baseUrl}/monitor/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/monitor`,
    })
    return Response.json({ url: session.url })
  } catch (err) {
    console.error('Stripe session error:', err instanceof Error ? err.message : err)
    return Response.json({ error: 'Could not create checkout session' }, { status: 502 })
  }
}
