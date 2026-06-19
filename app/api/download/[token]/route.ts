import { NextRequest } from 'next/server'
import { getScanByToken } from '@/lib/store/redis'
import {
  generateReportZip,
  generateLlmsTxt,
  generateRobotsTxt,
  generateSitemapXml,
  generateSchemaHtml,
  generateOgHtml,
  generateRecommendationsMd,
  generateReportHtml,
} from '@/lib/zip/generator'

export const dynamic = 'force-dynamic'

const FILE_MAP: Record<string, { mime: string; ext: string; fn: (s: Parameters<typeof generateLlmsTxt>[0]) => string }> = {
  'llms.txt':              { mime: 'text/plain',            ext: 'llms.txt',              fn: generateLlmsTxt },
  'robots.txt':            { mime: 'text/plain',            ext: 'robots.txt',            fn: generateRobotsTxt },
  'sitemap.xml':           { mime: 'application/xml',       ext: 'sitemap.xml',           fn: generateSitemapXml },
  'schema-install.html':   { mime: 'text/html',             ext: 'schema-install.html',   fn: generateSchemaHtml },
  'og-and-canonical.html': { mime: 'text/html',             ext: 'og-and-canonical.html', fn: generateOgHtml },
  'recommendations.md':    { mime: 'text/markdown',         ext: 'recommendations.md',    fn: generateRecommendationsMd },
  'report.html':           { mime: 'text/html',             ext: 'report.html',           fn: generateReportHtml },
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const scan = await getScanByToken(token)

  if (!scan) {
    return Response.json({ error: 'Download link not found or expired' }, { status: 404 })
  }

  const fileParam = request.nextUrl.searchParams.get('file')

  if (fileParam) {
    const entry = FILE_MAP[fileParam]
    if (!entry) {
      return Response.json({ error: 'Unknown file' }, { status: 400 })
    }
    const content = entry.fn(scan)
    return new Response(content, {
      headers: {
        'Content-Type': `${entry.mime}; charset=utf-8`,
        'Content-Disposition': `attachment; filename="${entry.ext}"`,
      },
    })
  }

  // Default: serve the full ZIP
  const zipBuffer = await generateReportZip(scan)
  const domain = (scan.businessInfo.domain || 'report').replace(/[^a-z0-9.-]/gi, '_')

  return new Response(zipBuffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="queldrex-ai-report-${domain}.zip"`,
      'Content-Length': zipBuffer.byteLength.toString(),
    },
  })
}
