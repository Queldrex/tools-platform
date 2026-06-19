import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { v4 as uuidv4 } from 'uuid'
import { getScan, saveScan, saveDfySession } from '@/lib/store/redis'
import { AI_VISIBILITY_SCANNER_CONFIG } from '@/lib/tools/ai-visibility-scanner/config'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const stripeKey = (process.env.STRIPE_SECRET_KEY || '').replace(/^﻿/, '').trim()
  if (!stripeKey) return Response.json({ error: 'Payment not configured' }, { status: 503 })
  const stripe = new Stripe(stripeKey)

  let body: { scanId?: string; tier?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { scanId, tier } = body

  if (!scanId) {
    return Response.json({ error: 'scanId is required' }, { status: 400 })
  }
  if (tier && tier !== 'bundle' && tier !== 'dfy') {
    return Response.json({ error: 'Invalid tier' }, { status: 400 })
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

    let session: Awaited<ReturnType<typeof stripe.checkout.sessions.create>>
    try {
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'usd',
            unit_amount: 49900,
            product_data: {
              name: `Done-For-You AI Visibility — ${scan.businessInfo.domain}`,
              description: 'Professional installation of llms.txt, JSON-LD schema, robots.txt, and sitemap on your website. Includes 30-day email support.',
            },
          },
          quantity: 1,
        }],
        metadata: { scanId, toolId: AI_VISIBILITY_SCANNER_CONFIG.toolId, tier: 'dfy', dfyToken },
        customer_email: scan.emailAddress,
        success_url: `${baseUrl}/book?token=${dfyToken}`,
        cancel_url: `${baseUrl}/cancel`,
      })
    } catch (err) {
      console.error('Stripe DFY session error:', err instanceof Error ? err.message : err)
      return Response.json({ error: 'Payment session could not be created. Please try again.' }, { status: 502 })
    }

    // Pre-create session as pending_payment so /book page loads on redirect.
    // Auth email is sent ONLY after Stripe webhook confirms payment.
    await saveDfySession({
      token: dfyToken,
      scanId,
      emailAddress: scan.emailAddress,
      domain: scan.businessInfo.domain,
      score: scan.score,
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
    })

    await saveScan({ ...scan, stripeSessionId: session.id })

    return Response.json({ checkoutUrl: session.url })
  }

  // ── Standard Bundle $149 ─────────────────────────────────────────────────
  let bundleSession: Awaited<ReturnType<typeof stripe.checkout.sessions.create>>
  try {
    bundleSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: AI_VISIBILITY_SCANNER_CONFIG.currency,
          unit_amount: AI_VISIBILITY_SCANNER_CONFIG.price * 100,
          product_data: {
            name: `AI Visibility Report — ${scan.businessInfo.domain}`,
            description: 'Generated llms.txt, JSON-LD schema, full HTML report, and prioritized fix checklist — delivered to your inbox instantly.',
          },
        },
        quantity: 1,
      }],
      metadata: { scanId, toolId: AI_VISIBILITY_SCANNER_CONFIG.toolId, tier: 'bundle' },
      customer_email: scan.emailAddress,
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
    })
  } catch (err) {
    console.error('Stripe bundle session error:', err instanceof Error ? err.message : err)
    return Response.json({ error: 'Payment session could not be created. Please try again.' }, { status: 502 })
  }

  await saveScan({ ...scan, stripeSessionId: bundleSession.id })

  return Response.json({ checkoutUrl: bundleSession.url })
}
