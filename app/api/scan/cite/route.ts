import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

// Live AI Citation Test — asks Claude Haiku what it knows about the scanned business.
// Requires ANTHROPIC_API_KEY. Returns gracefully if not configured.
export async function POST(request: NextRequest) {
  let body: { domain?: string; businessName?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { domain, businessName } = body
  if (!domain) return Response.json({ error: 'domain is required' }, { status: 400 })

  const apiKey = (process.env.ANTHROPIC_API_KEY || '').replace(/^﻿/, '').trim()
  if (!apiKey) {
    return Response.json({ citation: null, configured: false })
  }

  const name = businessName && businessName !== domain ? businessName : null
  const subject = name ? `"${name}" (website: ${domain})` : `the business at ${domain}`

  const prompt = `I'm going to ask you about a specific local business and I want a completely honest answer.

What do you know about ${subject}?

Please give a 2-3 sentence response covering: what the business does, where they are located (if known), and what they offer or are known for.

If you don't have specific information about this business in your training data, say exactly that — something like "I don't have specific information about this business in my training data." Do not make anything up or speculate.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      return Response.json({ citation: null, configured: true, error: 'API error' })
    }

    const data = await res.json() as { content: { type: string; text: string }[] }
    const citation = data.content?.[0]?.text?.trim() || null
    return Response.json({ citation, configured: true })
  } catch {
    return Response.json({ citation: null, configured: true, error: 'Request failed' })
  }
}
