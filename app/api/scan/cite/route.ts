import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

// Live AI Citation Test — checks what AI knows about the scanned business.
// Priority order (all free or near-free):
//   1. GROQ_API_KEY  — Groq free tier: 14,400 req/day, no billing, get at console.groq.com
//   2. ANTHROPIC_API_KEY — Claude Haiku ~$0.0001/call
//   3. GEMINI_API_KEY — Gemini Flash (requires billing on Google project)
// Returns gracefully if none configured.

async function runWithGroq(prompt: string, apiKey: string): Promise<string | null> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.1,
    }),
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) return null
  const data = await res.json() as { choices?: { message?: { content?: string } }[] }
  return data.choices?.[0]?.message?.content?.trim() ?? null
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

export async function POST(request: NextRequest) {
  let body: { domain?: string; businessName?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { domain, businessName } = body
  if (!domain) return Response.json({ error: 'domain is required' }, { status: 400 })

  const groqKey      = (process.env.GROQ_API_KEY      || '').replace(/^﻿/, '').trim()
  const anthropicKey = (process.env.ANTHROPIC_API_KEY || '').replace(/^﻿/, '').trim()
  const geminiKey    = (process.env.GEMINI_API_KEY    || '').replace(/^﻿/, '').trim()

  if (!groqKey && !anthropicKey && !geminiKey) {
    return Response.json({ citation: null, configured: false, model: null })
  }

  const name = businessName && businessName !== domain ? businessName : null
  const subject = name ? `"${name}" (website: ${domain})` : `the business at ${domain}`

  const prompt = `I'm going to ask you about a specific business and I want a completely honest answer.

What do you know about ${subject}?

Give a 2-3 sentence response: what the business does, where they are located (if known), what they offer or are known for.

If you don't have specific information about this business in your training data, say so clearly — e.g. "I don't have specific information about this business in my training data." Do not speculate or make anything up.`

  try {
    let citation: string | null = null
    let model: string

    if (groqKey) {
      citation = await runWithGroq(prompt, groqKey)
      model = 'Llama 3 (Groq)'
    } else if (anthropicKey) {
      citation = await runWithAnthropic(prompt, anthropicKey)
      model = 'Claude Haiku'
    } else {
      citation = await runWithGemini(prompt, geminiKey)
      model = 'Gemini Flash'
    }

    return Response.json({ citation, configured: true, model })
  } catch {
    return Response.json({ citation: null, configured: true, error: 'Request failed', model: null })
  }
}
