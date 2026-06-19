import { NextRequest } from 'next/server'
import { getScan } from '@/lib/store/redis'
import { generateLlmsTxt } from '@/lib/tools/ai-visibility-scanner/generator'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const scanId = request.nextUrl.searchParams.get('scanId')
  if (!scanId || !/^[0-9a-f-]{36}$/.test(scanId)) {
    return Response.json({ error: 'Valid scanId required' }, { status: 400 })
  }

  const scan = await getScan(scanId)
  if (!scan) {
    return Response.json({ error: 'Scan not found or expired (48hr TTL). Please run a new scan.' }, { status: 404 })
  }

  const content = generateLlmsTxt(scan.businessInfo)
  const domain = (scan.businessInfo.domain || 'site').replace(/[^a-z0-9.-]/gi, '')

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="llms.txt"`,
      'Cache-Control': 'no-store',
      'X-Domain': domain,
    },
  })
}
