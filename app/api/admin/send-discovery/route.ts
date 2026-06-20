import { NextRequest } from 'next/server'
import { getDfyApplication, updateDfyApplication } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-admin-secret')
  if (!secret || secret !== process.env.ADMIN_SECRET)
    return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { applicationId } = await request.json()
  if (!applicationId) return Response.json({ error: 'applicationId required' }, { status: 400 })

  const app = await getDfyApplication(applicationId)
  if (!app) return Response.json({ error: 'Application not found' }, { status: 404 })

  const bookingUrl = process.env.NEXT_PUBLIC_CAL_URL || 'https://calendar.app.google/Lh45gFyesMmAbN7H7'
  const agreementUrl = `${(process.env.NEXT_PUBLIC_BASE_URL || 'https://queldrex.com').replace(/^﻿/, '').trim()}/dfy-agreement`

  const { sendDiscoveryEmail } = await import('@/lib/email/resend')
  await sendDiscoveryEmail({
    to: app.email,
    name: app.name,
    url: app.url,
    score: app.score,
    bookingUrl,
    agreementUrl,
  })

  await updateDfyApplication(applicationId, { status: 'contacted' })

  return Response.json({ ok: true })
}
