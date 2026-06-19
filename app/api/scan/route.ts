import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { scanWebsite } from '@/lib/tools/ai-visibility-scanner/scanner'
import { generateLlmsTxt, generateJsonLd, generateRecommendations } from '@/lib/tools/ai-visibility-scanner/generator'

export const dynamic = 'force-dynamic'

// Block SSRF — reject private/loopback/link-local IPs
function isPublicUrl(raw: string): boolean {
  try {
    const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
    const h = url.hostname
    if (h === 'localhost') return false
    // IPv4 private ranges
    if (/^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h) ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(h) || /^169\.254\./.test(h) ||
        /^0\./.test(h) || h === '::1') return false
    return true
  } catch {
    return false
  }
}

// Best-effort Redis save — scanner works even if Redis is down
async function trySaveToRedis(scan: unknown) {
  try {
    const { saveScan, appendScanLog } = await import('@/lib/store/redis')
    const s = scan as Parameters<typeof saveScan>[0]
    await saveScan(s)
    await appendScanLog({
      scanId: s.scanId,
      domain: s.businessInfo?.domain || s.url,
      email: s.emailAddress,
      score: s.score,
      paid: false,
      status: 'DONE',
      createdAt: s.createdAt || new Date().toISOString(),
    })
  } catch {
    // Redis failure doesn't block the scan
  }
}

export async function POST(request: NextRequest) {
  let body: { url?: string; email?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { url, email } = body

  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    return Response.json({ error: 'URL is required' }, { status: 400 })
  }
  if (!isPublicUrl(url.trim())) {
    return Response.json({ error: 'Please enter a valid public website URL' }, { status: 400 })
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    return Response.json({ error: 'Valid email address is required' }, { status: 400 })
  }

  // Honeypot
  const bodyRaw = body as Record<string, unknown>
  if (bodyRaw.website_url) {
    return Response.json({ scanId: uuidv4(), status: 'DONE' })
  }

  const scanId = uuidv4()
  const cleanUrl = url.trim()
  const cleanEmail = email.trim().toLowerCase()

  try {
    const { checks, extendedChecks, businessInfo, score, blockedAiBots, responseTimeMs } = await scanWebsite(cleanUrl)
    const generatedLlmsTxt = generateLlmsTxt(businessInfo)
    const generatedJsonLd = generateJsonLd(businessInfo)
    const recommendations = generateRecommendations(checks, businessInfo, blockedAiBots, extendedChecks)

    const completed = {
      scanId,
      toolId: 'ai-visibility-scanner',
      url: cleanUrl,
      emailAddress: cleanEmail,
      status: 'DONE' as const,
      score,
      checks,
      businessInfo,
      generatedLlmsTxt,
      generatedJsonLd,
      recommendations,
      paid: false,
      createdAt: new Date().toISOString(),
      blockedAiBots,
      responseTimeMs,
      extendedChecks,
    }

    // Fire-and-forget Redis save (needed for checkout later)
    trySaveToRedis(completed)

    // Fire-and-forget score email + admin alert
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://queldrex.com').replace(/^﻿/, '').trim()
    import('@/lib/email/resend').then(({ sendFreeScoreEmail, sendAdminScanAlert }) => {
      sendFreeScoreEmail({
        to: cleanEmail,
        domain: completed.businessInfo.domain,
        score: completed.score,
        passingSignals: Object.values(completed.checks).filter(Boolean).length,
        blockedAiBots: completed.blockedAiBots,
        topIssue: completed.recommendations[0]?.title || '',
        shareUrl: `${baseUrl}/share/${scanId}`,
        scanId,
      }).catch((err: unknown) => console.error('[scan] free score email failed:', err))
      sendAdminScanAlert({
        domain: completed.businessInfo.domain,
        email: cleanEmail,
        score: completed.score,
      }).catch(() => {})
    }).catch(() => {})

    return Response.json(completed)
  } catch (err) {
    console.error('Scan error:', err instanceof Error ? err.message : err)
    return Response.json({
      scanId,
      status: 'ERROR',
      error: 'Scan failed. Please check the URL and try again.',
    }, { status: 200 })
  }
}
