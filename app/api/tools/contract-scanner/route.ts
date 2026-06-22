import { NextRequest } from 'next/server'
import { hasFreeOrProAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const GROQ_API_KEY = process.env.GROQ_API_KEY

async function analyzeContract(contractText: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `You are a contract risk analyst. Analyze this contract text for legal and business risk.

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "riskScore": <integer 0-100, where 100 is highest risk>,
  "riskLevel": <"low"|"medium"|"high"|"critical">,
  "summary": "<2-3 sentence plain-English overview of the overall risk>",
  "clauses": [
    {
      "name": "<clause category name>",
      "severity": <"critical"|"high"|"medium"|"low">,
      "quote": "<verbatim excerpt from contract, max 150 chars>",
      "risk": "<what makes this clause risky>",
      "recommendation": "<what to negotiate or add>"
    }
  ],
  "positives": ["<favorable clause or protective language found>"],
  "redFlags": ["<specific red flag phrase or pattern>"],
  "recommendations": ["<top actionable recommendation 1>", "<top actionable recommendation 2>", "<top actionable recommendation 3>"]
}

Focus on: intellectual property assignment, non-compete and non-solicitation, liability limitations, indemnification, unilateral amendment rights, auto-renewal, payment terms and late fees, termination for convenience, arbitration and class action waivers, governing jurisdiction, confidentiality scope and duration, data ownership.

Contract text:
${contractText.slice(0, 8000)}`,
      }],
      max_tokens: 1200,
      temperature: 0.2,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } })?.error?.message ?? `Groq ${res.status}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

export async function POST(request: NextRequest) {
  if (!GROQ_API_KEY) {
    return Response.json({ error: 'Contract scanner requires a Groq API key.', setup_required: true }, { status: 503 })
  }

  const access = await hasFreeOrProAccess(request, 'contract-scanner', 1)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  let body: { contractText?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const contractText = (body.contractText || '').trim()
  if (!contractText) return Response.json({ error: 'Contract text is required' }, { status: 400 })
  if (contractText.length < 100) return Response.json({ error: 'Contract text is too short — paste the full contract' }, { status: 400 })

  let raw: string
  try {
    raw = await analyzeContract(contractText)
  } catch (err) {
    return Response.json({ error: 'AI service temporarily unavailable. Please try again.' }, { status: 503 })
  }

  // Parse JSON from Groq response
  let analysis: Record<string, unknown>
  try {
    const match = raw.match(/\{[\s\S]*\}/)
    analysis = JSON.parse(match ? match[0] : raw)
  } catch {
    return Response.json({ error: 'Analysis parsing failed. Please try again.' }, { status: 500 })
  }

  return Response.json({
    ...analysis,
    wordCount: contractText.split(/\s+/).length,
    analyzedAt: new Date().toISOString(),
  })
}
