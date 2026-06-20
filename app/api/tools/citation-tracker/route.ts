import { NextRequest } from 'next/server'
import { getRedis } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

async function askGPT(prompt: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.3,
    }),
  })
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

export async function POST(request: NextRequest) {
  if (!OPENAI_API_KEY) {
    return Response.json({
      error: 'AI Citation Tracker requires an OpenAI API key. Add OPENAI_API_KEY to your environment variables.',
      setup_required: true,
    }, { status: 503 })
  }

  let body: { businessName?: string; city?: string; industry?: string; domain?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { businessName, city, industry } = body
  if (!businessName?.trim() || !city?.trim() || !industry?.trim()) {
    return Response.json({ error: 'businessName, city, and industry are required' }, { status: 400 })
  }

  // Rate limit: 1 free use per IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rateKey = `cit_tracker_uses:${ip}`
  const redis = getRedis()
  const uses = await redis.incr(rateKey)
  if (uses === 1) await redis.expire(rateKey, 60 * 60 * 24) // 24hr window
  if (uses > 1) {
    return Response.json({ paywall: true }, { status: 402 })
  }

  const [response1, response2, response3] = await Promise.all([
    askGPT(
      `Does "${businessName}" in ${city} come up when people ask you about ${industry} businesses in that area? ` +
      `Answer honestly. If you know about this specific business, describe what you know. ` +
      `If you don't have information about this specific business, say so clearly. ` +
      `Keep your answer to 3-4 sentences.`
    ),
    askGPT(
      `I'm looking for a good ${industry} business in ${city}. Can you give me some recommendations? ` +
      `List 3-5 specific businesses you would recommend, with a brief reason for each.`
    ),
    askGPT(
      `For a ${industry} business called "${businessName}" in ${city} that wants to appear in your recommendations ` +
      `when people ask for ${industry} businesses in that area, what are the 3 most important things they should do? ` +
      `Be specific and actionable.`
    ),
  ])

  const lc = response1.toLowerCase()
  const mentioned =
    lc.includes(businessName.toLowerCase()) &&
    !lc.includes("don't have") &&
    !lc.includes("do not have") &&
    !lc.includes("no information") &&
    !lc.includes("not aware") &&
    !lc.includes("no specific") &&
    !lc.includes("cannot confirm")

  return Response.json({
    businessName,
    city,
    industry,
    mentioned,
    mentionContext: response1,
    competitors: response2,
    improvements: response3,
    scanId: crypto.randomUUID(),
    scannedAt: new Date().toISOString(),
  })
}
