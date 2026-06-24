import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { randomUUID } from 'crypto'
import { saveToolPurchase, saveToolCustomer } from '@/lib/store/redis'
import { TOOL_PRICING } from '@/lib/tool-pricing'
import { sendGenericEmail } from '@/lib/email/resend'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id') ?? ''
  const toolId = searchParams.get('toolId') ?? ''
  const returnTo = searchParams.get('returnTo') ?? '/tools'
  const safeReturn = returnTo.startsWith('/') ? returnTo : '/tools'

  if (!sessionId || !toolId || !TOOL_PRICING[toolId]) {
    return NextResponse.redirect(new URL('/tools', request.url))
  }

  const stripeKey = (process.env.STRIPE_SECRET_KEY || '').replace(/^\uFEFF/, '').trim()
  if (!stripeKey) return NextResponse.redirect(new URL(safeReturn, request.url))

  try {
    const stripe = new Stripe(stripeKey)
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required' && session.status !== 'complete') {
      return NextResponse.redirect(new URL(safeReturn, request.url))
    }

    const token = randomUUID()
    await saveToolPurchase(token, toolId)

    const customerId = typeof session.customer === 'string' ? session.customer : null
    if (customerId) await saveToolCustomer(customerId, toolId, token).catch(() => {})

    const toolInfo = TOOL_PRICING[toolId]
    const toolName = toolInfo?.name ?? toolId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    const customerEmail = session.customer_details?.email ?? (session.customer_email ?? '')
    if (customerEmail) {
      sendGenericEmail({
        to: customerEmail,
        subject: `Your Queldrex access is ready — ${toolName}`,
        html: `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:520px;margin:40px auto;padding:0 20px;">
  <div style="background:#0f172a;padding:28px 32px;border-radius:16px 16px 0 0;text-align:center;">
    <div style="color:#a78bfa;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:8px;">Queldrex · Tool Access</div>
    <div style="color:white;font-size:22px;font-weight:800;">You're in.</div>
  </div>
  <div style="background:white;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
    <p style="margin:0 0 16px;color:#374151;font-size:15px;">Your lifetime access to <strong>${toolName}</strong> is ready. Pay once, use forever.</p>
    <a href="https://queldrex.com/tools/${toolId}" style="display:block;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:white;text-decoration:none;text-align:center;padding:16px;border-radius:12px;font-weight:700;font-size:15px;margin-bottom:20px;">Open ${toolName} →</a>
    <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:20px;">
      <p style="margin:0 0 8px;font-size:13px;color:#374151;font-weight:600;">Important — save this email</p>
      <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">Access is tied to the browser you used at checkout. If you clear your cookies or switch devices, email <a href="mailto:hello@queldrex.com" style="color:#7c3aed;">hello@queldrex.com</a> with your order confirmation and we'll restore your access.</p>
    </div>
    <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">Queldrex LLC · Castle Rock, CO · <a href="https://queldrex.com" style="color:#9ca3af;">queldrex.com</a></p>
  </div>
</div>
</body></html>`,
      }).catch(() => {})
    }

    const response = NextResponse.redirect(new URL(`${safeReturn}?purchased=1`, request.url))
    response.cookies.set(`queldrex_tool_${toolId}`, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 3650,
      path: '/',
    })
    return response
  } catch (err) {
    console.error('Tool verify error:', err instanceof Error ? err.message : err)
    return NextResponse.redirect(new URL(safeReturn, request.url))
  }
}
