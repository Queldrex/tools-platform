import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const stripeKey = (process.env.STRIPE_SECRET_KEY || '').replace(/^\uFEFF/, '').trim()
  if (!stripeKey) return Response.json({ error: 'Payment not configured' }, { status: 503 })

  let body: { returnTo?: string; billing?: string }
  try { body = await request.json() } catch { body = {} }

  const { returnTo = '/tools', billing = 'monthly' } = body
  const safeReturn = returnTo.startsWith('/') ? returnTo : '/tools'
  const baseUrl = env('NEXT_PUBLIC_BASE_URL', 'https://queldrex.com')
  const isAnnual = billing === 'annual'

  const stripe = new Stripe(stripeKey)

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: isAnnual ? 'Queldrex Pro (Annual)' : 'Queldrex Pro',
            description: isAnnual
              ? 'All tools, unlimited. Billed yearly. Cancel anytime.'
              : 'All tools, unlimited. Cancel anytime.',
          },
          unit_amount: isAnnual ? 79000 : 7900,
          recurring: { interval: isAnnual ? 'year' : 'month' },
        },
        quantity: 1,
      }],
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
      success_url: `${baseUrl}/api/checkout/pro/verify?session_id={CHECKOUT_SESSION_ID}&returnTo=${encodeURIComponent(safeReturn)}`,
      cancel_url: `${baseUrl}${safeReturn}`,
    })
    return Response.json({ url: session.url })
  } catch (err) {
    console.error('Pro checkout error:', err instanceof Error ? err.message : err)
    return Response.json({ error: 'Could not create checkout session' }, { status: 502 })
  }
}
