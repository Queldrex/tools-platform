import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const stripeKey = (process.env.STRIPE_SECRET_KEY || '').replace(/^﻿/, '').trim()
  if (!stripeKey) return Response.json({ error: 'Payment not configured' }, { status: 503 })

  let body: { returnTo?: string }
  try { body = await request.json() } catch { body = {} }

  const returnTo = (body.returnTo || '/tools').startsWith('/') ? (body.returnTo || '/tools') : '/tools'
  const stripe = new Stripe(stripeKey)
  const baseUrl = env('NEXT_PUBLIC_BASE_URL', 'https://queldrex.com')

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: 14900,
          product_data: {
            name: 'Queldrex — All Tools Bundle',
            description: 'Lifetime access to all 17 current paid tools on queldrex.com. Pay once, use forever. Does not include future tools added after purchase.',
          },
        },
        quantity: 1,
      }],
      metadata: { type: 'bundle', returnTo },
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
      success_url: `${baseUrl}/api/checkout/bundle/verify?session_id={CHECKOUT_SESSION_ID}&returnTo=${encodeURIComponent(returnTo)}`,
      cancel_url: `${baseUrl}/pricing`,
    })
    return Response.json({ url: session.url })
  } catch (err) {
    console.error('Bundle checkout error:', err instanceof Error ? err.message : err)
    return Response.json({ error: 'Could not create checkout session' }, { status: 502 })
  }
}
