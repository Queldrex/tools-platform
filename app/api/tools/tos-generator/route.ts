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
      temperature: 0.2,
    }),
  })
  if (!res.ok) throw new Error(`AI service ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

export async function POST(request: NextRequest) {
  if (!GROQ_API_KEY) return Response.json({ error: 'Service not configured' }, { status: 503 })

  let body: {
    companyName?: string; websiteUrl?: string; serviceDescription?: string
    businessType?: string; jurisdiction?: string; contactEmail?: string
    hasSubscription?: boolean; sellsPhysicalGoods?: boolean; hasUserContent?: boolean; minimumAge?: number
  }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (!body.companyName?.trim()) return Response.json({ error: 'Company name is required' }, { status: 400 })
  if (!body.serviceDescription?.trim()) return Response.json({ error: 'Service description is required' }, { status: 400 })

  const access = await hasFreeOrProAccess(request, 'tos-generator', 1)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const minAge = body.minimumAge ?? 13

  const sections = [
    '1. Introduction and Acceptance of Terms',
    '2. Description of Service',
    body.hasSubscription ? '3. Subscription and Billing (include: payment terms, auto-renewal disclosure, cancellation process, refund policy)' : '3. Payment Terms',
    body.sellsPhysicalGoods ? '4. Physical Goods, Shipping, and Returns' : null,
    '5. User Accounts and Registration',
    '6. Acceptable Use Policy (list prohibited actions clearly)',
    `7. Intellectual Property (company owns platform; ${body.hasUserContent ? 'users retain ownership of their content but grant company a license' : 'all content belongs to company'})`,
    '8. Privacy and Data',
    '9. Disclaimer of Warranties',
    '10. Limitation of Liability',
    '11. Indemnification',
    `12. Governing Law and Jurisdiction (${body.jurisdiction || 'Colorado, USA'})`,
    '13. Dispute Resolution',
    '14. Age Requirements (minimum age: ' + minAge + ')',
    '15. Changes to Terms',
    '16. Contact Information',
  ].filter(Boolean).join('\n')

  let raw: string
  try {
    raw = await askGroq(`You are a legal document drafting assistant. Generate a complete, professional Terms of Service document.

Company: ${body.companyName}
Website: ${body.websiteUrl || 'the company website'}
Service: ${body.serviceDescription}
Business Type: ${body.businessType || 'saas'}
Jurisdiction: ${body.jurisdiction || 'Colorado, USA'}
Contact Email: ${body.contactEmail || 'legal@' + (body.companyName || 'company').toLowerCase().replace(/\s+/g, '') + '.com'}
Effective Date: ${today}
Has Subscription: ${body.hasSubscription}
Sells Physical Goods: ${body.sellsPhysicalGoods}
Has User-Generated Content: ${body.hasUserContent}
Minimum Age: ${minAge}

Include ALL of these sections:
${sections}

Write complete, professional legal prose for each section. Use **SECTION TITLE** format for headers. Separate sections with double newlines. Make it comprehensive but readable. Include the effective date.

Return ONLY valid JSON:
{
  "title": "Terms of Service for ${body.companyName}",
  "effectiveDate": "${today}",
  "document": "<complete ToS document with **BOLD** headers and \\n\\n between sections>",
  "wordCount": <approximate word count as integer>,
  "disclaimer": "This document is generated for informational purposes only and does not constitute legal advice. Consult a qualified attorney before publishing."
}`)
  } catch {
    return Response.json({ error: 'Document generation temporarily unavailable. Please try again.' }, { status: 503 })
  }

  let result: Record<string, unknown>
  try {
    const match = raw.match(/\{[\s\S]*\}/)
    result = JSON.parse(match ? match[0] : raw)
  } catch {
    return Response.json({ error: 'Generation failed. Please try again.' }, { status: 500 })
  }

  return Response.json({ ...result, generatedAt: new Date().toISOString() })
}
