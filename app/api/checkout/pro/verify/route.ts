import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { randomUUID } from 'crypto'
import { saveProSession, saveProCustomer } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id') ?? ''
  const returnTo = searchParams.get('returnTo') ?? '/tools'
  const safeReturn = returnTo.startsWith('/') ? returnTo : '/tools'

  if (!sessionId) {
    return NextResponse.redirect(new URL(safeReturn, request.url))
  }

  const stripeKey = (process.env.STRIPE_SECRET_KEY || '').replace(/^﻿/, '').trim()
  if (!stripeKey) return NextResponse.redirect(new URL(safeReturn, request.url))

  try {
    const stripe = new Stripe(stripeKey)
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.status !== 'complete') {
      return NextResponse.redirect(new URL(`${safeReturn}?error=1`, request.url))
    }

    const proSessionId = randomUUID()
    await saveProSession(proSessionId)

    const customerId = typeof session.customer === 'string' ? session.customer : null
    if (customerId) await saveProCustomer(customerId, proSessionId).catch(() => {})

    const response = NextResponse.redirect(new URL(`${safeReturn}?pro_activated=1`, request.url))
    response.cookies.set('queldrex_pro', proSessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
    return response
  } catch (err) {
    console.error('Pro verify error:', err instanceof Error ? err.message : err)
    return NextResponse.redirect(new URL(safeReturn, request.url))
  }
}
