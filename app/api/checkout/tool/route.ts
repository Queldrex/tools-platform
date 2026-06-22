import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { env } from '@/lib/env'
import { TOOL_PRICING } from '@/lib/tool-pricing'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const stripeKey = (process.env.STRIPE_SECRET_KEY || '').replace(/^\uFEFF/, '').trim()
  if (!stripeKey) return Response.json({ error: 'Payment not configured' }, { status: 503 })

  let body: { toolId?: string; returnTo?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { toolId = '', returnTo = '/tools' } = body
  const toolConfig = TOOL_PRICING[toolId]
  if (!toolConfig) return Response.json({ error: 'Unknown tool' }, { status: 400 })

  const stripe = new Stripe(stripeKey)
  const baseUrl = env('NEXT_PUBLIC_BASE_URL', 'https://queldrex.com')
  const safeReturn = returnTo.startsWith('/') ? returnTo : '/tools'

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: toolConfig.monthlyPrice * 100,
          recurring: { interval: 'month' },
          product_data: {
            name: `Queldrex — ${toolConfig.name}`,
            description: `Unlimited monthly access. Cancel anytime from your billing portal.`,
          },
        },
        quantity: 1,
      }],
      metadata: { toolId, returnTo: safeReturn },
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
      success_url: `${baseUrl}/api/checkout/tool/verify?session_id={CHECKOUT_SESSION_ID}&toolId=${encodeURIComponent(toolId)}&returnTo=${encodeURIComponent(safeReturn)}`,
      cancel_url: `${baseUrl}${safeReturn}`,
    })
    return Response.json({ url: session.url })
  } catch (err) {
    console.error('Tool checkout error:', err instanceof Error ? err.message : err)
    return Response.json({ error: 'Could not create checkout session' }, { status: 502 })
  }
}
