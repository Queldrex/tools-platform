import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { v4 as uuidv4 } from 'uuid'
import { getScan, saveScan, saveDfySession } from '@/lib/store/redis'
import { AI_VISIBILITY_SCANNER_CONFIG } from '@/lib/tools/ai-visibility-scanner/config'
import { env } from '@/lib/env'
import { sendDfyAuthorizationEmail } from '@/lib/email/resend'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const { scanId, tier } = await request.json() as { scanId: string; tier?: 'bundle' | 'dfy' }

  if (!scanId) {
    return Response.json({ error: 'scanId is required' }, { status: 400 })
  }

  const scan = await getScan(scanId)
  if (!scan) {
    return Response.json({ error: 'Scan not found' }, { status: 404 })
  }

  if (scan.status !== 'DONE' && scan.status !== 'PAID') {
    return Response.json({ error: 'Scan is not complete yet' }, { status: 400 })
  }

  const baseUrl = env('NEXT_PUBLIC_BASE_URL', 'https://queldrex.com')
  const isDfy = tier === 'dfy'

  if (isDfy) {
    // ── Done-For-You $499 ──────────────────────────────────────────────────
    const dfyToken = uuidv4()

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: 49900,
            product_data: {
              name: `Done-For-You AI Visibility — ${scan.businessInfo.name || scan.businessInfo.domain}`,
              description: 'Professional installation of llms.txt, JSON-LD schema, robots.txt, and sitemap on your website. Includes 30-day email support.',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        scanId,
        toolId: AI_VISIBILITY_SCANNER_CONFIG.toolId,
        tier: 'dfy',
        dfyToken,
      },
      customer_email: scan.emailAddress,
      success_url: `${baseUrl}/book?token=${dfyToken}`,
      cancel_url: `${baseUrl}/cancel`,
    })

    // Pre-create the DFY session in Redis so /book page can read it immediately
    await saveDfySession({
      token: dfyToken,
      scanId,
      emailAddress: scan.emailAddress,
      domain: scan.businessInfo.domain,
      score: scan.score,
      status: 'paid',
      createdAt: new Date().toISOString(),
    })

    await saveScan({ ...scan, stripeSessionId: session.id })

    // Send authorization + disclosure email immediately after payment
    const credentialsUrl = `${baseUrl}/impl/${dfyToken}`
    const bookingUrl = `${baseUrl}/book?token=${dfyToken}`
    await sendDfyAuthorizationEmail({
      to: scan.emailAddress,
      domain: scan.businessInfo.domain,
      score: scan.score,
      credentialsUrl,
      bookingUrl,
    }).catch(() => {/* non-fatal — user lands on /book page regardless */})

    return Response.json({ checkoutUrl: session.url })
  }

  // ── Standard Bundle $149 ─────────────────────────────────────────────────
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: AI_VISIBILITY_SCANNER_CONFIG.currency,
          unit_amount: AI_VISIBILITY_SCANNER_CONFIG.price * 100,
          product_data: {
            name: `AI Visibility Report — ${scan.businessInfo.name || scan.businessInfo.domain}`,
            description: 'Generated llms.txt, JSON-LD schema, full HTML report, and prioritized fix checklist — delivered to your inbox instantly.',
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      scanId,
      toolId: AI_VISIBILITY_SCANNER_CONFIG.toolId,
      tier: 'bundle',
    },
    customer_email: scan.emailAddress,
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/cancel`,
  })

  await saveScan({ ...scan, stripeSessionId: session.id })

  return Response.json({ checkoutUrl: session.url })
}
