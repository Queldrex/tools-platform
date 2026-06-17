import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { saveScan } from '@/lib/store/redis'
import { scanWebsite } from '@/lib/tools/ai-visibility-scanner/scanner'
import { generateLlmsTxt, generateJsonLd, generateRecommendations } from '@/lib/tools/ai-visibility-scanner/generator'
import type { ScanResult } from '@/lib/framework/types'

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

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return Response.json({ error: 'Valid email address is required' }, { status: 400 })
  }

  const scanId = uuidv4()
  const cleanUrl = url.trim()
  const cleanEmail = email.trim().toLowerCase()

  // Save PROCESSING state immediately so status polls return something meaningful
  const initial: ScanResult = {
    scanId,
    toolId: 'ai-visibility-scanner',
    url: cleanUrl,
    emailAddress: cleanEmail,
    status: 'PROCESSING',
    score: 0,
    checks: { robotsTxt: false, sitemapXml: false, llmsTxt: false, openGraph: false, jsonLd: false, localBusinessSchema: false },
    businessInfo: { name: '', description: '', url: cleanUrl, domain: '', title: '', phone: '', email: '', address: '', image: '', social: [], pages: [] },
    generatedLlmsTxt: '',
    generatedJsonLd: '',
    recommendations: [],
    paid: false,
    createdAt: new Date().toISOString(),
  }
  await saveScan(initial)

  // Run the scan synchronously — Lambda stays alive until we return a response.
  // This avoids fire-and-forget execution model issues in serverless environments.
  try {
    const { checks, businessInfo, score } = await scanWebsite(cleanUrl)
    const generatedLlmsTxt = generateLlmsTxt(businessInfo)
    const generatedJsonLd = generateJsonLd(businessInfo)
    const recommendations = generateRecommendations(checks, businessInfo)

    const completed: ScanResult = {
      ...initial,
      status: 'DONE',
      score,
      checks,
      businessInfo,
      generatedLlmsTxt,
      generatedJsonLd,
      recommendations,
    }
    await saveScan(completed)

    return Response.json({ scanId, status: 'DONE' })
  } catch (err) {
    const failed: ScanResult = {
      ...initial,
      status: 'ERROR',
      error: err instanceof Error ? err.message : 'Scan failed. Please check the URL and try again.',
    }
    await saveScan(failed)
    return Response.json({ scanId, status: 'ERROR', error: failed.error }, { status: 200 })
  }
}
