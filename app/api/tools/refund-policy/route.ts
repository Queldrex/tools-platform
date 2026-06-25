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
      max_tokens: 1600,
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
    companyName?: string; productType?: string; refundWindowDays?: number
    refundMethod?: string; requiresReturn?: boolean; restockingFee?: number
    nonRefundableItems?: string; jurisdiction?: string; contactEmail?: string; processingDays?: number
  }
  const access = await hasFreeOrProAccess(request, 'refund-policy', 2)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (!body.companyName?.trim()) return Response.json({ error: 'Company name is required' }, { status: 400 })

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const productType = body.productType || 'digital'
  const window = body.refundWindowDays ?? 30
  const method = body.refundMethod || 'original'
  const fee = body.restockingFee ?? 0
  const processingDays = body.processingDays ?? 5

  let raw: string
  try {
    raw = await askGroq(`You are a legal document assistant. Generate a complete, professional Refund Policy.

Company: ${body.companyName}
Product Type: ${productType}
Refund Window: ${window} days
Refund Method: ${method === 'original' ? 'original payment method' : method === 'store-credit' ? 'store credit' : 'original payment method or store credit'}
Requires Return of Item: ${body.requiresReturn ?? false}
Restocking Fee: ${fee > 0 ? fee + '%' : 'none'}
Non-Refundable Items: ${body.nonRefundableItems || 'none specified'}
Jurisdiction: ${body.jurisdiction || 'Colorado, USA'}
Contact Email: ${body.contactEmail || 'support@' + body.companyName!.toLowerCase().replace(/\s+/g, '') + '.com'}
Processing Time: ${processingDays} business days
Effective Date: ${today}

Write a complete refund policy with these sections:
1. Overview / Our Commitment
2. Eligibility for Refunds (${window}-day window, conditions)
3. How to Request a Refund (clear step-by-step)
4. Refund Method and Timeline (${processingDays} business days)
5. Non-Refundable Items${body.nonRefundableItems ? ': ' + body.nonRefundableItems : ''}
${productType === 'physical' || productType === 'mixed' ? '6. Return Shipping Process' : ''}
${productType === 'physical' || productType === 'mixed' ? '7. Damaged or Defective Items' : ''}
${productType === 'subscription' || productType === 'mixed' ? '8. Subscription Cancellations' : ''}
9. Contact Information
10. Policy Updates

Use **SECTION TITLE** for headers. Separate sections with \\n\\n. Write professional, friendly, customer-facing prose.

Return ONLY valid JSON:
{
  "document": "<complete refund policy with **BOLD** section headers and \\n\\n between sections>",
  "wordCount": <integer>,
  "disclaimer": "This document is for informational purposes only and does not constitute legal advice. Consult a qualified attorney before publishing."
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

  return Response.json({ ...result, companyName: body.companyName, effectiveDate: today, hasAccess: access.isPro, generatedAt: new Date().toISOString() })
}
