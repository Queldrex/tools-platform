import { NextRequest } from 'next/server'
import { hasFreeOrProAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const GROQ_API_KEY = process.env.GROQ_API_KEY

async function askGroq(prompt: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1800,
      temperature: 0.4,
    }),
  })
  if (!res.ok) throw new Error(`Groq ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

export async function POST(request: NextRequest) {
  if (!GROQ_API_KEY) return Response.json({ error: 'AI service not configured', setup_required: true }, { status: 503 })

  let body: {
    clientName?: string
    agencyName?: string
    period?: string
    serviceType?: string
    metrics?: Array<{ name: string; value: string; change?: string }>
    wins?: string
    challenges?: string
    nextSteps?: string
    tone?: string
  }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { clientName, agencyName, period, serviceType, metrics, wins, challenges, nextSteps, tone } = body

  if (!clientName?.trim()) return Response.json({ error: 'Client name is required' }, { status: 400 })
  if (!wins?.trim() && !metrics?.length) return Response.json({ error: 'Provide at least wins or metrics' }, { status: 400 })

  const access = await hasFreeOrProAccess(request, 'agency-report', 1)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  const metricsText = metrics?.length
    ? metrics.map(m => `- ${m.name}: ${m.value}${m.change ? ` (${m.change})` : ''}`).join('\n')
    : 'No specific metrics provided'

  let raw: string
  try {
    raw = await askGroq(`You are a senior account manager at a digital agency. Write a professional monthly client report.

Client: ${clientName}
Agency: ${agencyName || 'our agency'}
Period: ${period || 'this month'}
Service Type: ${serviceType || 'digital services'}
Report Tone: ${tone || 'professional and confident'}

Key Metrics:
${metricsText}

Wins / Highlights:
${wins || 'None provided'}

Challenges:
${challenges || 'None this month'}

Planned Next Steps:
${nextSteps || 'To be discussed'}

Write a complete professional monthly report. Return ONLY valid JSON, no markdown:
{
  "reportTitle": "<Professional report title>",
  "executiveSummary": "<3-4 sentence executive summary — confident, results-focused, written for a business owner>",
  "sections": [
    {
      "title": "<section heading>",
      "content": "<section body — 2-5 paragraphs of professional prose>"
    }
  ],
  "keyAchievements": ["<achievement 1>", "<achievement 2>", "<achievement 3>"],
  "metricsNarrative": "<2-3 sentences interpreting the metrics in business terms>",
  "challengesAndSolutions": "<professional framing of challenges and how they are being addressed>",
  "nextMonthPlan": "<concrete, numbered action items for next month>",
  "closingNote": "<warm, professional closing paragraph that reinforces the agency-client relationship>"
}`)
  } catch {
    return Response.json({ error: 'AI service temporarily unavailable. Please try again.' }, { status: 503 })
  }

  let result: Record<string, unknown>
  try {
    const match = raw.match(/\{[\s\S]*\}/)
    result = JSON.parse(match ? match[0] : raw)
  } catch {
    return Response.json({ error: 'Report generation failed. Please try again.' }, { status: 500 })
  }

  return Response.json({
    ...result,
    clientName,
    agencyName: agencyName || '',
    period: period || '',
    generatedAt: new Date().toISOString(),
  })
}
