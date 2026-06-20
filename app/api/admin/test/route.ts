import { NextRequest } from 'next/server'
import { saveDfyApplication, getDfyApplications, getRedis, saveDfySession } from '@/lib/store/redis'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

const TEST_PREFIX = 'TEST_'

function authCheck(request: NextRequest) {
  const secret = request.headers.get('x-admin-secret')
  return secret && secret === process.env.ADMIN_SECRET
}

// GET /api/admin/test — health check all systems
export async function GET(request: NextRequest) {
  if (!authCheck(request)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const results: Record<string, { ok: boolean; detail: string }> = {}

  // Redis
  try {
    const redis = getRedis()
    await redis.ping()
    results.redis = { ok: true, detail: 'Connected' }
  } catch (e) {
    results.redis = { ok: false, detail: String(e) }
  }

  // Resend API key
  results.resend = process.env.RESEND_API_KEY
    ? { ok: true, detail: 'API key set' }
    : { ok: false, detail: 'RESEND_API_KEY not set' }

  // Stripe
  results.stripe = process.env.STRIPE_SECRET_KEY
    ? { ok: true, detail: process.env.STRIPE_SECRET_KEY.startsWith('sk_live') ? 'Live mode' : 'Test mode' }
    : { ok: false, detail: 'STRIPE_SECRET_KEY not set' }

  // Encryption key
  results.encryption = process.env.CREDENTIALS_ENCRYPTION_KEY
    ? { ok: true, detail: 'Key set' }
    : { ok: false, detail: 'CREDENTIALS_ENCRYPTION_KEY not set — credentials stored unencrypted' }

  // Admin email
  results.adminEmail = { ok: true, detail: process.env.ADMIN_EMAIL || 'janitor.clean.base@gmail.com (default)' }

  // Base URL
  results.baseUrl = { ok: true, detail: (process.env.NEXT_PUBLIC_BASE_URL || 'https://queldrex.com').replace(/^﻿/, '').trim() }

  // Calendar URL
  results.calUrl = process.env.NEXT_PUBLIC_CAL_URL
    ? { ok: true, detail: 'Set' }
    : { ok: false, detail: 'NEXT_PUBLIC_CAL_URL not set — using hardcoded fallback' }

  const allOk = Object.values(results).every(r => r.ok)
  return Response.json({ ok: allOk, checks: results })
}

// POST /api/admin/test — seed a test DFY application at various stages
export async function POST(request: NextRequest) {
  if (!authCheck(request)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { stage } = await request.json().catch(() => ({ stage: 'paid' }))
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://queldrex.com').replace(/^﻿/, '').trim()

  const id = `${TEST_PREFIX}${randomUUID()}`
  const dfyToken = randomUUID()
  const now = new Date().toISOString()

  const statusMap: Record<string, 'new' | 'contacted' | 'payment_sent' | 'paid'> = {
    new: 'new',
    contacted: 'contacted',
    payment_sent: 'payment_sent',
    paid: 'paid',
  }
  const appStatus = statusMap[stage] ?? 'paid'

  // Save DFY application
  await saveDfyApplication({
    id,
    name: 'Test Client',
    email: process.env.ADMIN_EMAIL || 'janitor.clean.base@gmail.com',
    url: 'test-business.com',
    platform: 'ftp',
    score: 12,
    message: '[TEST] This is a seeded test application — safe to delete.',
    status: appStatus,
    createdAt: now,
    dfyToken: appStatus === 'paid' ? dfyToken : undefined,
    implemented: false,
  })

  // If paid, also create a DFY session (what the impl page uses)
  if (appStatus === 'paid') {
    await saveDfySession({
      token: dfyToken,
      scanId: 'test-scan-id',
      emailAddress: process.env.ADMIN_EMAIL || 'janitor.clean.base@gmail.com',
      domain: 'test-business.com',
      score: 12,
      status: 'paid',
      createdAt: now,
    })
  }

  return Response.json({
    ok: true,
    applicationId: id,
    dfyToken: appStatus === 'paid' ? dfyToken : null,
    status: appStatus,
    links: {
      admin: `${baseUrl}/admin`,
      implPage: appStatus === 'paid' ? `${baseUrl}/impl/${dfyToken}` : null,
    },
  })
}

// DELETE /api/admin/test — clean up all test applications
export async function DELETE(request: NextRequest) {
  if (!authCheck(request)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const apps = await getDfyApplications(200)
  const testApps = apps.filter(a => a.id.startsWith(TEST_PREFIX))

  const redis = getRedis()
  await Promise.all(testApps.map(a => redis.del(`dfyapp:${a.id}`)))

  // Remove from sorted set
  if (testApps.length > 0) {
    await Promise.all(testApps.map(a => redis.zrem('dfyapps', a.id)))
  }

  return Response.json({ ok: true, deleted: testApps.length })
}
