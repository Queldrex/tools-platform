import { NextRequest } from 'next/server'
import { getScan, saveScan } from '@/lib/store/redis'
import { implementFixes } from '@/lib/tools/ai-visibility-scanner/implementer'
import { scanWebsite } from '@/lib/tools/ai-visibility-scanner/scanner'
import { sendImplementationEmail } from '@/lib/email/resend'
import type { ImplementationCredentials } from '@/lib/framework/types'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const headerSecret = request.headers.get('x-admin-secret')
  const { scanId, credentials, secret: bodySecret, sendEmail } = await request.json() as {
    scanId: string
    credentials: ImplementationCredentials
    secret?: string
    sendEmail?: boolean
  }

  const secret = headerSecret || bodySecret
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!scanId || !credentials) {
    return Response.json({ error: 'scanId and credentials are required' }, { status: 400 })
  }

  const scan = await getScan(scanId)
  if (!scan) {
    return Response.json({ error: 'Scan not found' }, { status: 404 })
  }

  // Run implementation
  const result = await implementFixes(scan, credentials)

  // Re-scan to verify (skip for manual platform — files not deployed yet)
  let afterScore: number | undefined
  if (credentials.platform !== 'manual' && result.status !== 'failed') {
    try {
      const reScan = await scanWebsite(scan.url)
      afterScore = reScan.score
      result.afterScore = afterScore
    } catch {
      // Re-scan failure doesn't fail the implementation
    }
  }

  // Save implementation record to the scan
  await saveScan({
    ...scan,
    status: scan.status,
    // @ts-expect-error — extending ScanResult with implementation data
    implementation: result,
  })

  // Email the before/after report if requested
  if (sendEmail !== false) {
    try {
      await sendImplementationEmail({
        to: scan.emailAddress,
        result,
        afterScore,
      })
    } catch {
      // Email failure doesn't fail the implementation response
    }
  }

  return Response.json(result)
}
