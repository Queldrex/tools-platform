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
      max_tokens: 2200,
      temperature: 0.2,
    }),
  })
  if (!res.ok) throw new Error(`Service error ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

export async function POST(request: NextRequest) {
  if (!GROQ_API_KEY) return Response.json({ error: 'Service not configured' }, { status: 503 })

  const access = await hasFreeOrProAccess(request, 'proposal-generator', 1)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  let body: {
    yourCompany?: string; clientCompany?: string; projectTitle?: string
    serviceType?: string; projectScope?: string; timeline?: string
    budget?: string; yourStrengths?: string; deliverables?: string
    tone?: string
  }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid request' }, { status: 400 }) }

  if (!body.yourCompany?.trim()) return Response.json({ error: 'Your company name is required' }, { status: 400 })
  if (!body.clientCompany?.trim()) return Response.json({ error: 'Client company name is required' }, { status: 400 })
  if (!body.projectScope?.trim()) return Response.json({ error: 'Project scope is required' }, { status: 400 })

  const toneInstructions: Record<string, string> = {
    formal: 'formal and authoritative, sophisticated business language',
    confident: 'confident and direct, results-focused, commanding',
    collaborative: 'collaborative and partnership-focused, warm yet professional',
  }

  const raw = await askGroq(`You are a senior business development consultant writing a winning client proposal. Create a complete, professional business proposal.

Details:
- Your Company: ${body.yourCompany}
- Client: ${body.clientCompany}
- Project Title: ${body.projectTitle || `${body.serviceType} Project`}
- Service Type: ${body.serviceType || 'Professional Services'}
- Project Scope: ${body.projectScope}
- Timeline: ${body.timeline || 'To be determined'}
- Budget/Investment: ${body.budget || 'Competitive pricing based on scope'}
- Your Strengths: ${body.yourStrengths || 'Experienced team with proven results'}
- Deliverables: ${body.deliverables || 'As defined in project scope'}
- Tone: ${toneInstructions[body.tone || 'confident'] || toneInstructions.confident}

Write a compelling proposal that wins the client. Return ONLY valid JSON (no markdown fences):
{
  "title": "Business Proposal: ${body.projectTitle || body.serviceType} for ${body.clientCompany}",
  "executiveSummary": "<2-3 powerful paragraphs that immediately establish value and why ${body.yourCompany} is the right choice>",
  "sections": [
    {
      "heading": "Executive Summary",
      "content": "<same as executiveSummary above>"
    },
    {
      "heading": "Understanding Your Challenge",
      "content": "<2-3 paragraphs showing deep understanding of client's likely pain points and what's at stake if not addressed>"
    },
    {
      "heading": "Our Proposed Solution",
      "content": "<detailed description of the approach, methodology, and how it specifically addresses their needs>"
    },
    {
      "heading": "Scope of Work",
      "content": "<numbered phases — Phase 1: Discovery & Strategy, Phase 2: etc. Each with brief description of what happens in that phase>"
    },
    {
      "heading": "Project Timeline",
      "content": "<phase-by-phase timeline using the ${body.timeline || '8-week'} total timeline>"
    },
    {
      "heading": "Your Investment",
      "content": "<frame ${body.budget || 'competitive pricing'} as an investment with ROI context. List what is included. Add payment terms: 50% upfront, 50% upon completion.>"
    },
    {
      "heading": "Why ${body.yourCompany}",
      "content": "<3-4 compelling differentiators based on: ${body.yourStrengths}>"
    },
    {
      "heading": "Next Steps",
      "content": "<clear 3-step CTA: 1. Review and approve this proposal, 2. Sign agreement and submit retainer, 3. Kickoff call scheduled within 48 hours>"
    },
    {
      "heading": "Terms & Conditions",
      "content": "<brief: payment terms, revision policy (2 rounds included), IP ownership transfers upon final payment, 30-day notice for cancellation, confidentiality clause>"
    }
  ],
  "fullText": "<complete proposal as clean plain text with all sections, headings uppercase, separated by double newlines>"
}`)

  let result: { title: string; executiveSummary: string; sections: Array<{ heading: string; content: string }>; fullText: string }
  try {
    const match = raw.match(/\{[\s\S]*\}/)
    result = JSON.parse(match ? match[0] : raw)
  } catch {
    return Response.json({ error: 'Generation failed. Please try again.' }, { status: 500 })
  }

  return Response.json({ ...result, yourCompany: body.yourCompany, clientCompany: body.clientCompany, projectTitle: body.projectTitle, hasAccess: access.isPro, generatedAt: new Date().toISOString() })
}
