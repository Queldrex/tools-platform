import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getScan, saveDownloadToken, logSecurityEvent } from '@/lib/store/redis'
import { sendDeliveryEmail } from '@/lib/email/resend'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-admin-secret')
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    logSecurityEvent({ ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown', path: '/api/admin/resend', method: 'POST', success: false }).catch(() => {})
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let scanId: string | undefined
  try {
    const body = await request.json()
    scanId = body.scanId
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!scanId) {
    return Response.json({ error: 'scanId is required' }, { status: 400 })
  }

  const scan = await getScan(scanId)
  if (!scan) {
    return Response.json({ error: 'Scan not found — it may have expired (48hr TTL). Run a new scan for this customer.' }, { status: 404 })
  }

  // Reuse existing token or issue a new one
  const downloadToken = scan.downloadToken || uuidv4()
  if (!scan.downloadToken) {
    await saveDownloadToken(downloadToken, scanId)
  }

  const baseUrl = env('NEXT_PUBLIC_BASE_URL', 'https://queldrex.com')
  const downloadUrl = `${baseUrl}/download/${downloadToken}`

  await sendDeliveryEmail({
    to: scan.emailAddress,
    businessName: scan.businessInfo.name || scan.businessInfo.domain,
    downloadUrl,
    score: scan.score,
  })

  return Response.json({
    sent: true,
    to: scan.emailAddress,
    downloadUrl,
  })
}
