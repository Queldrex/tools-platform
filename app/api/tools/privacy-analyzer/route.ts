import { NextRequest } from 'next/server'
import { hasFreeOrProAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const GROQ_API_KEY = process.env.GROQ_API_KEY

async function fetchPageText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Queldrex Privacy Analyzer/1.0', Accept: 'text/html' },
    signal: AbortSignal.timeout(12000),
    redirect: 'follow',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const html = await res.text()
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 12000)
}

export async function POST(request: NextRequest) {
  if (!GROQ_API_KEY) return Response.json({ error: 'AI analysis service not configured' }, { status: 503 })

  const access = await hasFreeOrProAccess(request, 'privacy-analyzer', 1)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  let body: { url?: string; text?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  let policyText = (body.text || '').trim()

  if (body.url && !policyText) {
    const url = body.url.trim()
    if (!/^https?:\/\/.+/.test(url)) return Response.json({ error: 'URL must start with http:// or https://' }, { status: 400 })
    try { policyText = await fetchPageText(url) } catch (e) {
      return Response.json({ error: `Could not fetch URL: ${e instanceof Error ? e.message : 'Fetch failed'}` }, { status: 400 })
    }
  }

  if (!policyText) return Response.json({ error: 'Provide a URL or paste the privacy policy text' }, { status: 400 })
  if (policyText.length < 200) return Response.json({ error: 'Text too short — paste the full privacy policy' }, { status: 400 })

  const prompt = `You are a privacy law compliance analyst. Analyze this privacy policy for GDPR and CCPA compliance.

PRIVACY POLICY TEXT:
${policyText.slice(0, 11000)}

Return ONLY valid JSON with no markdown or extra text:
{
  "complianceScore": <integer 0-100, 100=fully compliant>,
  "gdpr": {
    "score": <integer 0-100>,
    "lawfulBasis": <boolean>,
    "dataMinimization": <boolean>,
    "userRights": <boolean - mentions right to access, delete, or portability>,
    "dataRetention": <boolean - states retention periods>,
    "thirdPartySharing": <boolean - discloses third-party data sharing>,
    "dpo": <boolean - mentions Data Protection Officer or privacy contact>
  },
  "ccpa": {
    "score": <integer 0-100>,
    "optOut": <boolean - right to opt out of data sale>,
    "disclosure": <boolean - discloses categories of personal info collected>,
    "financialIncentives": <boolean - addresses financial incentives for data>
  },
  "dataCollected": [<string category of data collected, max 10>],
  "thirdParties": [<string named third party, max 8>],
  "retentionPeriod": "<stated retention period or 'Not specified'>",
  "redFlags": [<string serious concern, max 5>],
  "missingClauses": [<string required clause that is absent, max 5>],
  "summary": "<2-3 sentence plain-English summary>",
  "verdict": "<one sentence verdict>"
}`

  let raw: string
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], max_tokens: 1200, temperature: 0.1 }),
      signal: AbortSignal.timeout(25000),
    })
    if (!res.ok) throw new Error(`AI ${res.status}`)
    const data = await res.json()
    raw = data.choices?.[0]?.message?.content ?? ''
  } catch { return Response.json({ error: 'Analysis service temporarily unavailable. Please try again.' }, { status: 503 }) }

  let result: Record<string, unknown>
  try {
    const match = raw.match(/\{[\s\S]*\}/)
    result = JSON.parse(match ? match[0] : raw)
  } catch { return Response.json({ error: 'Analysis parsing failed. Please try again.' }, { status: 500 }) }

  return Response.json({ ...result, analyzedAt: new Date().toISOString() })
}
