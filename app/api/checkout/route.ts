import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { getScan, saveScan } from '@/lib/store/redis'
import { AI_VISIBILITY_SCANNER_CONFIG } from '@/lib/tools/ai-visibility-scanner/config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const { scanId } = await request.json()

  if (!scanId) {
    return Response.json({ error: 'scanId is required' }, { status: 400 })
  }

  const scan = await getScan(scanId)
  if (!scan) {
    return Response.json({ error: 'Scan not found' }, { status: 404 })
  }

  if (scan.status !== 'DONE') {
    return Response.json({ error: 'Scan is not complete yet' }, { status: 400 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: AI_VISIBILITY_SCANNER_CONFIG.currency,
          unit_amount: AI_VISIBILITY_SCANNER_CONFIG.price * 100,
          product_data: {
            name: `AI Visibility Report — ${scan.businessInfo.name || scan.businessInfo.domain}`,
            description: 'Full AI readiness report with generated llms.txt, JSON-LD schema, and prioritized recommendations',
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      scanId,
      toolId: AI_VISIBILITY_SCANNER_CONFIG.toolId,
    },
    customer_email: scan.emailAddress,
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/cancel`,
  })

  await saveScan({ ...scan, stripeSessionId: session.id })

  return Response.json({ checkoutUrl: session.url })
}
