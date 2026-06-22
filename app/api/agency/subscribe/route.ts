import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const stripeKey = (process.env.STRIPE_SECRET_KEY || '').replace(/^﻿/, '').trim()
  if (!stripeKey) return Response.json({ error: 'Payment not configured' }, { status: 503 })

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
  const stripe = new Stripe(stripeKey)

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email.toLowerCase(),
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'Queldrex Agency Plan' },
          unit_amount: 9900,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      metadata: { email: email.toLowerCase(), agency_name: agency_name.trim(), plan: 'agency' },
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
      success_url: `${baseUrl}/agency/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/agency`,
    })
    return Response.json({ url: session.url })
  } catch (err) {
    console.error('Agency checkout error:', err instanceof Error ? err.message : err)
    return Response.json({ error: 'Could not create checkout session' }, { status: 502 })
  }
}
