import { NextRequest } from 'next/server'
import { getReferralCode } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code') || ''
  if (!code) return Response.json({ error: 'code required' }, { status: 400 })

  const ref = await getReferralCode(code.toUpperCase())
  if (!ref) return Response.json({ valid: false }, { status: 404 })

  return Response.json({ valid: true, ownerEmail: ref.ownerEmail, uses: ref.uses, creditsEarned: ref.creditsEarned })
}
