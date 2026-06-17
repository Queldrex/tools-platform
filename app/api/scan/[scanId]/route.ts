import { NextRequest } from 'next/server'
import { getScan } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  const { scanId } = await params
  const scan = await getScan(scanId)

  if (!scan) {
    return Response.json({ error: 'Scan not found' }, { status: 404 })
  }

  // Never expose full generated assets before payment
  const safe = {
    scanId: scan.scanId,
    status: scan.status,
    score: scan.score,
    checks: scan.checks,
    businessInfo: {
      name: scan.businessInfo.name,
      domain: scan.businessInfo.domain,
      url: scan.businessInfo.url,
    },
    recommendations: scan.paid
      ? scan.recommendations
      : scan.recommendations.map((r, i) =>
          i === 0
            ? r
            : { ...r, description: '••••••••••••', fix: '••••••••••••' }
        ),
    paid: scan.status === 'PAID' || scan.status === 'DELIVERED',
    downloadToken: scan.downloadToken,
    error: scan.error,
  }

  return Response.json(safe)
}
