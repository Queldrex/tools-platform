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
      max_tokens: 2000,
      temperature: 0.1,
    }),
  })
  if (!res.ok) throw new Error(`AI service error ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

export async function POST(request: NextRequest) {
  if (!GROQ_API_KEY) return Response.json({ error: 'Service not configured' }, { status: 503 })

  let body: {
    type?: string
    disclosingParty?: string
    receivingParty?: string
    purpose?: string
    duration?: string
    jurisdiction?: string
    includeNonSolicit?: boolean
    includeNonCompete?: boolean
  }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid request' }, { status: 400 }) }

  const { type = 'mutual', disclosingParty, receivingParty, purpose, duration = '2 years', jurisdiction = 'Colorado, USA', includeNonSolicit = false, includeNonCompete = false } = body

  if (!disclosingParty?.trim()) return Response.json({ error: 'Disclosing party name is required' }, { status: 400 })
  if (!receivingParty?.trim()) return Response.json({ error: 'Receiving party name is required' }, { status: 400 })
  if (!purpose?.trim()) return Response.json({ error: 'Purpose is required' }, { status: 400 })

  const access = await hasFreeOrProAccess(request, 'nda-generator', 1)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  const ndaType = type === 'mutual' ? 'Mutual Non-Disclosure Agreement' : 'One-Way Non-Disclosure Agreement'
  const obligationType = type === 'mutual' ? 'both parties' : `${receivingParty} (the Receiving Party)`

  const raw = await askGroq(`You are a business attorney drafting a professional Non-Disclosure Agreement. Generate a complete, legally sound ${ndaType}.

Details:
- Type: ${ndaType}
- Party A (${type === 'mutual' ? 'First Party' : 'Disclosing Party'}): ${disclosingParty}
- Party B (${type === 'mutual' ? 'Second Party' : 'Receiving Party'}): ${receivingParty}
- Business Purpose: ${purpose}
- Term: ${duration}
- Governing Law: ${jurisdiction}
- Include Non-Solicitation: ${includeNonSolicit ? 'Yes' : 'No'}
- Include Non-Compete: ${includeNonCompete ? 'Yes' : 'No'}

Write a complete, professional NDA. Use standard legal formatting. Return ONLY valid JSON (no markdown fences):
{
  "title": "${ndaType} between ${disclosingParty} and ${receivingParty}",
  "document": "<full NDA text — use \\n\\n between sections, **SECTION HEADER** format for headings, proper legal language throughout. Include: recitals, definition of confidential information (broad), obligations of ${obligationType}, exclusions from confidentiality, term and termination, return/destruction of materials, injunctive relief remedies clause, governing law, entire agreement clause, signature block with lines for both parties, dates, and titles>",
  "disclaimer": "This document is AI-generated for informational purposes only and does not constitute legal advice. Have a licensed attorney review before signing."
}`)

  let result: { title: string; document: string; disclaimer: string }
  try {
    const match = raw.match(/\{[\s\S]*\}/)
    result = JSON.parse(match ? match[0] : raw)
  } catch {
    return Response.json({ error: 'Generation failed. Please try again.' }, { status: 500 })
  }

  return Response.json({ ...result, type, parties: { disclosing: disclosingParty, receiving: receivingParty }, duration, jurisdiction, generatedAt: new Date().toISOString() })
}
