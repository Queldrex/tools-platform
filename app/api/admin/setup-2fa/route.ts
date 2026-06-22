import { NextRequest } from 'next/server'
import { generateTotpSecret, totpQrUrl } from '@/lib/totp'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret') || request.headers.get('x-admin-secret')
  const adminSecret = (process.env.ADMIN_SECRET || '').replace(/^\uFEFF/, '').trim()
  if (!secret || !adminSecret || secret !== adminSecret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const alreadyConfigured = !!process.env.ADMIN_TOTP_SECRET
  const totpSecret = process.env.ADMIN_TOTP_SECRET || generateTotpSecret()
  const email = process.env.ADMIN_EMAIL || 'admin@queldrex.com'
  const qrUrl = totpQrUrl(totpSecret, email)

  return Response.json({ qrUrl, secret: totpSecret, alreadyConfigured })
}
