import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getScan, saveScan, saveDownloadToken, updateScanLog, logSecurityEvent } from '@/lib/store/redis'
import { sendDeliveryEmail } from '@/lib/email/resend'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Accept secret in header (preferred) or body (backwards compat)
  const headerSecret = request.headers.get('x-admin-secret')
  let scanId: string | undefined
  let bodySecret: string | undefined

  try {
    const body = await request.json()
    scanId = body.scanId
    bodySecret = body.secret
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const secret = headerSecret || bodySecret
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    logSecurityEvent({ ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown', path: '/api/admin/deliver', method: 'POST', success: false }).catch(() => {})
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!scanId) {
    return Response.json({ error: 'scanId is required' }, { status: 400 })
  }

  const scan = await getScan(scanId)
  if (!scan) {
    return Response.json({ error: 'Scan not found' }, { status: 404 })
  }

  if (scan.status === 'DELIVERED') {
    return Response.json({ error: 'Already delivered — use Resend instead', status: scan.status }, { status: 409 })
  }

  // Reuse existing token if present (idempotent), otherwise generate new
  const downloadToken = scan.downloadToken || uuidv4()
  if (!scan.downloadToken) {
    await saveDownloadToken(downloadToken, scanId)
  }

  const baseUrl = env('NEXT_PUBLIC_BASE_URL', 'https://queldrex.com')
  const downloadUrl = `${baseUrl}/download/${downloadToken}`
  const paidAt = new Date().toISOString()

  // Send email BEFORE marking DELIVERED so errors surface cleanly
  await sendDeliveryEmail({
    to: scan.emailAddress,
    businessName: scan.businessInfo.name || scan.businessInfo.domain,
    downloadUrl,
    score: scan.score,
  })

  await saveScan({ ...scan, status: 'DELIVERED', paid: true, downloadToken, paidAt })
  await updateScanLog(scanId, { paid: true, paidAt, status: 'DELIVERED', downloadToken }).catch(() => {})

  // Never return the downloadUrl — it's a one-time token sent only to the client's email
  return Response.json({
    delivered: true,
    to: scan.emailAddress,
    score: scan.score,
    domain: scan.businessInfo.domain,
  })
}
