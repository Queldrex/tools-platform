import { NextRequest } from 'next/server'
import { getScanByToken, updateScanLog } from '@/lib/store/redis'
import {
  generateReportZip,
  generateLlmsTxt,
  generateRobotsTxt,
  generateSitemapXml,
  generateSchemaHtml,
  generateOgHtml,
  generateFaqSchemaHtml,
  generateReviewSchemaHtml,
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
  'faq-schema.html':       { mime: 'text/html',             ext: 'faq-schema.html',       fn: generateFaqSchemaHtml },
  'review-schema.html':    { mime: 'text/html',             ext: 'review-schema.html',    fn: generateReviewSchemaHtml },
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

  // Grant Pro access cookie only to the FIRST browser that uses this token.
  // Subsequent visits (shared links, re-downloads) still get the file but no cookie.
  const redis = (await import('@/lib/store/redis')).getRedis()
  const cookieIssuedKey = `download_cookie_issued:${token}`
  const alreadyIssued = await redis.get(cookieIssuedKey)
  let cookieHeader: string | null = null
  if (!alreadyIssued) {
    await redis.set(cookieIssuedKey, '1', { ex: 60 * 60 * 24 * 365 })
    cookieHeader = `queldrex_paid=${token}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax; Secure; HttpOnly`
  }

  const fileParam = request.nextUrl.searchParams.get('file')

  if (fileParam) {
    const entry = FILE_MAP[fileParam]
    if (!entry) {
      return Response.json({ error: 'Unknown file' }, { status: 400 })
    }
    const content = entry.fn(scan)
    const headers: Record<string, string> = {
      'Content-Type': `${entry.mime}; charset=utf-8`,
      'Content-Disposition': `attachment; filename="${entry.ext}"`,
    }
    if (cookieHeader) headers['Set-Cookie'] = cookieHeader
    return new Response(content, { headers })
  }

  // Track ZIP download and notify admin (fire-and-forget, only on full ZIP)
  if (scan.scanId) {
    const ts = new Date().toISOString()
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://queldrex.com').replace(/^﻿/, '').trim()
    const downloadUrl = `${baseUrl}/download/${token}`
    updateScanLog(scan.scanId, { downloadedAt: ts }).catch(() => {})
    import('@/lib/email/resend').then(({ sendAdminDownloadAlert }) =>
      sendAdminDownloadAlert({
        domain: scan.businessInfo.domain,
        email: scan.emailAddress,
        scanId: scan.scanId,
        downloadUrl,
        score: scan.score,
        timestamp: ts,
      }).catch(() => {})
    ).catch(() => {})
  }

  // Default: serve the full ZIP
  const zipBuffer = await generateReportZip(scan)
  const domain = (scan.businessInfo.domain || 'report').replace(/[^a-z0-9.-]/gi, '_')

  const headers: Record<string, string> = {
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename="queldrex-ai-report-${domain}.zip"`,
    'Content-Length': zipBuffer.byteLength.toString(),
  }
  if (cookieHeader) headers['Set-Cookie'] = cookieHeader

  return new Response(zipBuffer, { headers })
}
