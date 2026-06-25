import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { randomUUID } from 'crypto'
import { getRedis } from '@/lib/store/redis'
import { getDownloadProduct } from '@/lib/download-products'
import { sendGenericEmail } from '@/lib/email/resend'

export const dynamic = 'force-dynamic'

const DOWNLOAD_PRODUCT_TTL = 60 * 60 * 24 * 365  // 1 year

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id') ?? ''
  const productId = searchParams.get('productId') ?? ''
  const returnTo = searchParams.get('returnTo') ?? '/downloads'
  const safeReturn = returnTo.startsWith('/') ? returnTo : '/downloads'

  if (!sessionId || !productId || !getDownloadProduct(productId)) {
    return NextResponse.redirect(new URL('/downloads', request.url))
  }

  const stripeKey = (process.env.STRIPE_SECRET_KEY || '').replace(/^\uFEFF/, '').trim()
  if (!stripeKey) return NextResponse.redirect(new URL(safeReturn, request.url))

  try {
    const stripe = new Stripe(stripeKey)
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.redirect(new URL(safeReturn, request.url))
    }

    // Check if webhook already pre-created a token for this session
    let token: string
    const existing = await getRedis().get<string>(`download_session:${sessionId}`)
    if (existing) {
      try {
        const parsed = JSON.parse(existing) as { token: string; productId: string }
        token = parsed.token
      } catch {
        token = randomUUID()
        await getRedis().set(`download_product:${token}`, productId, { ex: DOWNLOAD_PRODUCT_TTL })
      }
    } else {
      token = randomUUID()
      await getRedis().set(`download_product:${token}`, productId, { ex: DOWNLOAD_PRODUCT_TTL })
    }

    const product = getDownloadProduct(productId)!
    const customerEmail = session.customer_details?.email ?? (session.customer_email ?? '')
    if (customerEmail && product) {
      const itemsList = product.items.map(item => `<li style="font-size:13px;color:#374151;margin-bottom:4px;">${item}</li>`).join('')
      sendGenericEmail({
        to: customerEmail,
        subject: `Your download is ready — ${product.name}`,
        html: `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:520px;margin:40px auto;padding:0 20px;">
  <div style="background:#0f172a;padding:28px 32px;border-radius:16px 16px 0 0;text-align:center;">
    <div style="color:#4ade80;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:8px;">Queldrex &middot; Downloads</div>
    <div style="color:white;font-size:22px;font-weight:800;">${product.name}</div>
    <div style="color:#94a3b8;font-size:13px;margin-top:6px;">${product.tagline}</div>
  </div>
  <div style="background:white;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
    <p style="margin:0 0 16px;color:#374151;font-size:15px;">Thanks for your purchase. Your download is ready.</p>
    <a href="https://queldrex.com/api/download/product/${token}" style="display:block;background:linear-gradient(135deg,#16a34a,#15803d);color:white;text-decoration:none;text-align:center;padding:16px;border-radius:12px;font-weight:700;font-size:15px;margin-bottom:20px;">Download ${product.name} &rarr;</a>
    <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:16px;">
      <p style="margin:0 0 8px;font-size:13px;color:#374151;font-weight:600;">What's included</p>
      <p style="margin:0 0 10px;font-size:13px;color:#6b7280;line-height:1.6;">${product.description}</p>
      <ul style="margin:0;padding-left:16px;">${itemsList}</ul>
    </div>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:#14532d;line-height:1.6;">The download link above works from any browser for 1 year. Bookmark this email. To re-download on a new device, just click the button above — no account needed.</p>
    </div>
    <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">Queldrex LLC &middot; Castle Rock, CO &middot; <a href="https://queldrex.com" style="color:#9ca3af;">queldrex.com</a></p>
  </div>
</div>
</body></html>`,
      }).catch(() => {})
    }

    const response = NextResponse.redirect(new URL(`/downloads/${productId}?purchased=1`, request.url))
    response.cookies.set(`queldrex_download_${productId}`, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: DOWNLOAD_PRODUCT_TTL,
      path: '/',
    })
    return response
  } catch (err) {
    console.error('Download verify error:', err instanceof Error ? err.message : err)
    return NextResponse.redirect(new URL(safeReturn, request.url))
  }
}
