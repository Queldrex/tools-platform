import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getScan, saveScan, saveDownloadToken } from '@/lib/store/redis'
import { sendDeliveryEmail } from '@/lib/email/resend'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { scanId, secret } = await request.json()

  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!scanId) {
    return Response.json({ error: 'scanId is required' }, { status: 400 })
  }

  const scan = await getScan(scanId)
  if (!scan) {
    return Response.json({ error: 'Scan not found' }, { status: 404 })
  }

  if (scan.status === 'PAID' || scan.status === 'DELIVERED') {
    return Response.json({ error: 'Already delivered', status: scan.status }, { status: 409 })
  }

  const downloadToken = uuidv4()
  await saveDownloadToken(downloadToken, scanId)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://queldrex.com'
  const downloadUrl = `${baseUrl}/api/download/${downloadToken}`
  const paidAt = new Date().toISOString()

  await saveScan({ ...scan, status: 'PAID', paid: true, downloadToken, paidAt })

  await sendDeliveryEmail({
    to: scan.emailAddress,
    businessName: scan.businessInfo.name || scan.businessInfo.domain,
    downloadUrl,
    score: scan.score,
  })

  await saveScan({ ...scan, status: 'DELIVERED', paid: true, downloadToken, paidAt })

  return Response.json({
    delivered: true,
    to: scan.emailAddress,
    downloadUrl,
    score: scan.score,
    domain: scan.businessInfo.domain,
  })
}
