import { NextRequest } from 'next/server'
import { createReferralCode, getReferralCode } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let body: { email?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const email = (body.email || '').trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return Response.json({ error: 'Valid email required' }, { status: 400 })

  const code = await createReferralCode(email)
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://queldrex.com').replace(/^﻿/, '').trim()
  const record = await getReferralCode(code)

  return Response.json({ code, shareUrl: `${baseUrl}/r/${code}`, uses: record?.uses ?? 0, creditsEarned: record?.creditsEarned ?? 0 })
}
