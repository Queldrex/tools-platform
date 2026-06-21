import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { adminAuthCheck } from '@/lib/admin-auth'
import { logSecurityEvent } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

export async function GET(request: NextRequest) {
  const stripe = getStripe()
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!await adminAuthCheck(request)) {
    logSecurityEvent({ ip, path: '/api/admin/revenue', method: 'GET', success: false }).catch(() => {})
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [subs, sessions] = await Promise.all([
      stripe.subscriptions.list({ status: 'active', limit: 100, expand: ['data.customer'] }),
      stripe.checkout.sessions.list({ limit: 20, expand: ['data.customer'] }),
    ])

    const mrr = subs.data.reduce((sum, sub) => {
      const amount = sub.items.data[0]?.price?.unit_amount ?? 0
      const interval = sub.items.data[0]?.price?.recurring?.interval
      const monthly = interval === 'year' ? amount / 12 : amount
      return sum + monthly
    }, 0) / 100

    const recentSales = sessions.data
      .filter(s => s.status === 'complete' || s.payment_status === 'paid')
      .map(s => ({
        id: s.id,
        amount: (s.amount_total ?? 0) / 100,
        currency: s.currency ?? 'usd',
        customerEmail: s.customer_details?.email ?? (s.customer as Stripe.Customer | null)?.email ?? 'unknown',
        created: s.created,
        mode: s.mode,
        productName:
          s.metadata?.type === 'download' ? `Download: ${s.metadata.productId}`
          : s.mode === 'subscription' ? 'Pro / Tool Sub'
          : 'Scanner / One-time',
      }))

    return NextResponse.json({
      mrr: Math.round(mrr * 100) / 100,
      activeSubscriptions: subs.data.length,
      recentSales,
      totalRevenueLast20: Math.round(recentSales.reduce((s, p) => s + p.amount, 0) * 100) / 100,
    })
  } catch (err) {
    console.error('Revenue API error:', err)
    return NextResponse.json({ error: 'Failed to fetch revenue data' }, { status: 500 })
  }
}
