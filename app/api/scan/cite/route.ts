import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

// Live AI Citation Test.
// Uses Gemini Flash (free, GEMINI_API_KEY) or Anthropic Haiku (ANTHROPIC_API_KEY).
// Gemini Flash free tier: 1,500 req/day, no billing needed. Get key at aistudio.google.com
// Returns gracefully if neither key is configured.

async function runWithGemini(prompt: string, apiKey: string): Promise<string | null> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.1 },
      }),
      signal: AbortSignal.timeout(15000),
    }
  )
  if (!res.ok) return null
  const data = await res.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null
}

async function runWithAnthropic(prompt: string, apiKey: string): Promise<string | null> {
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
  if (!res.ok) return null
  const data = await res.json() as { content: { type: string; text: string }[] }
  return data.content?.[0]?.text?.trim() ?? null
}

export async function POST(request: NextRequest) {
  let body: { domain?: string; businessName?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { domain, businessName } = body
  if (!domain) return Response.json({ error: 'domain is required' }, { status: 400 })

  const geminiKey = (process.env.GEMINI_API_KEY || '').replace(/^﻿/, '').trim()
  const anthropicKey = (process.env.ANTHROPIC_API_KEY || '').replace(/^﻿/, '').trim()

  if (!geminiKey && !anthropicKey) {
    return Response.json({ citation: null, configured: false, model: null })
  }

  const name = businessName && businessName !== domain ? businessName : null
  const subject = name ? `"${name}" (website: ${domain})` : `the business at ${domain}`

  const prompt = `I'm going to ask you about a specific local business and I want a completely honest answer.

What do you know about ${subject}?

Give a 2-3 sentence response covering: what the business does, where they are located (if known), and what they offer or are known for.

If you don't have specific information about this business in your training data, say so clearly — for example: "I don't have specific information about this business in my training data." Do not speculate or make anything up.`

  try {
    let citation: string | null = null
    let model: string

    // Prefer Gemini (free tier, 1500 req/day) — fall back to Anthropic
    if (geminiKey) {
      citation = await runWithGemini(prompt, geminiKey)
      model = 'Gemini Flash'
    } else {
      citation = await runWithAnthropic(prompt, anthropicKey)
      model = 'Claude Haiku'
    }

    return Response.json({ citation, configured: true, model })
  } catch {
    return Response.json({ citation: null, configured: true, error: 'Request failed', model: null })
  }
}
