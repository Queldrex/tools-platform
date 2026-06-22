import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { env } from '@/lib/env'
import { getDownloadProduct } from '@/lib/download-products'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const stripeKey = (process.env.STRIPE_SECRET_KEY || '').replace(/^\uFEFF/, '').trim()
  if (!stripeKey) return Response.json({ error: 'Payment not configured' }, { status: 503 })

  let body: { productId?: string; returnTo?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { productId = '', returnTo = '/downloads' } = body
  const product = getDownloadProduct(productId)
  if (!product) return Response.json({ error: 'Unknown product' }, { status: 400 })

  const stripe = new Stripe(stripeKey)
  const baseUrl = env('NEXT_PUBLIC_BASE_URL', 'https://queldrex.com')
  const safeReturn = returnTo.startsWith('/') ? returnTo : '/downloads'

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: product.price * 100,
          product_data: {
            name: `Queldrex — ${product.name}`,
            description: product.tagline,
          },
        },
        quantity: 1,
      }],
      metadata: { type: 'download', productId, returnTo: safeReturn },
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
      success_url: `${baseUrl}/api/checkout/download/verify?session_id={CHECKOUT_SESSION_ID}&productId=${encodeURIComponent(productId)}&returnTo=${encodeURIComponent(safeReturn)}`,
      cancel_url: `${baseUrl}/downloads`,
    })
    return Response.json({ url: session.url })
  } catch (err) {
    console.error('Download checkout error:', err instanceof Error ? err.message : err)
    return Response.json({ error: 'Could not create checkout session' }, { status: 502 })
  }
}
