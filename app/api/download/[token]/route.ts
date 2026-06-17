import { NextRequest } from 'next/server'
import { getScanByToken } from '@/lib/store/redis'
import { generateReportZip } from '@/lib/zip/generator'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const scan = await getScanByToken(token)

  if (!scan) {
    return Response.json({ error: 'Download link not found or expired' }, { status: 404 })
  }

  const zipBuffer = await generateReportZip(scan)
  const domain = scan.businessInfo.domain || 'report'
  const filename = `queldrex-ai-report-${domain}.zip`

  return new Response(zipBuffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': zipBuffer.byteLength.toString(),
    },
  })
}
