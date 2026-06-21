import { NextRequest } from 'next/server'
import { hasFreeOrProAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const GROQ_API_KEY = process.env.GROQ_API_KEY

type Platform = 'google' | 'meta' | 'linkedin' | 'twitter' | 'email'

const IDEAL_LENGTH: Record<Platform, [number, number]> = {
  google: [25, 90],
  meta: [25, 150],
  linkedin: [150, 200],
  twitter: [200, 280],
  email: [35, 50],
}

const CTA_WORDS = ['get', 'start', 'try', 'discover', 'learn', 'join', 'sign up', 'download', 'claim', 'book', 'schedule', 'save', 'unlock', 'access', 'grab', 'buy', 'shop', 'order', 'register', 'subscribe']
const URGENCY_WORDS = ['limited', 'today', 'now', 'hurry', 'expires', 'last chance', 'only', 'exclusive', 'deadline', 'offer ends', 'while supplies', 'ends soon', 'act fast']
const SOCIAL_PROOF_WORDS = ['trusted by', 'customers', 'reviews', 'rated', 'stars', '#1', 'award', 'certified', 'guaranteed', 'proven', 'million', 'thousand', 'clients', 'users']
const SPAM_PATTERNS = ['free!!!', '!!!', 'click here', 'act now', 'buy now!!!', 'order now!!!']

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '')
  if (!word) return 0
  const vowelGroups = word.match(/[aeiouy]+/g)
  let count = vowelGroups ? vowelGroups.length : 1
  if (word.endsWith('e') && count > 1) count--
  return Math.max(1, count)
}

function fleschScore(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 2).length || 1
  const words = text.split(/\s+/).filter(Boolean)
  if (!words.length) return 50
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0)
  return 206.835 - 1.015 * (words.length / sentences) - 84.6 * (syllables / words.length)
}

function scoreLength(copy: string, platform: Platform): number {
  const len = copy.length
  const [min, max] = IDEAL_LENGTH[platform]
  if (len >= min && len <= max) return 20
  const diff = len < min ? min - len : len - max
  const range = max - min
  if (diff <= range * 0.3) return 12
  if (diff <= range * 0.7) return 6
  return 2
}

function scoreCTA(copy: string): number {
  const lower = copy.toLowerCase()
  if (CTA_WORDS.some(w => lower.includes(w))) return 20
  if (/\b(see|find|check|view|read|watch|explore)\b/i.test(lower)) return 10
  return 0
}

function scoreClarity(copy: string): number {
  const score = fleschScore(copy)
  if (score > 70) return 20
  if (score > 60) return 15
  if (score > 50) return 10
  if (score > 40) return 5
  return 2
}

function scoreUrgency(copy: string): number {
  const lower = copy.toLowerCase()
  const matches = URGENCY_WORDS.filter(w => lower.includes(w)).length
  if (matches >= 2) return 15
  if (matches === 1) return 8
  return 0
}

function scoreSocialProof(copy: string): number {
  const lower = copy.toLowerCase()
  const hasPercent = /\d+%/.test(copy)
  const matches = SOCIAL_PROOF_WORDS.filter(w => lower.includes(w)).length + (hasPercent ? 1 : 0)
  if (matches >= 2) return 15
  if (matches === 1) return 8
  return 0
}

function scoreSpam(copy: string): { score: number; flags: string[] } {
  const flags: string[] = []
  const lower = copy.toLowerCase()
  SPAM_PATTERNS.forEach(p => { if (lower.includes(p)) flags.push(p) })
  const allCapsWords = copy.split(/\s+/).filter(w => w.length > 2 && w === w.toUpperCase() && /[A-Z]/.test(w))
  if (allCapsWords.length > 2) flags.push(`ALL CAPS: ${allCapsWords.slice(0, 3).join(', ')}`)
  return { score: -Math.min(25, flags.length * 8), flags }
}

async function getGroqFeedback(copy: string, platform: string): Promise<Record<string, unknown>> {
  if (!GROQ_API_KEY) return { emotional_appeal: 5, value_proposition: 5, brand_voice: 5, one_line_summary: '', top_improvement: 'Add an API key to enable AI feedback.', rewritten_version: copy }
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: `Grade this ${platform} ad copy. Return ONLY valid JSON with these exact keys: { "emotional_appeal": <0-10>, "value_proposition": <0-10>, "brand_voice": <0-10>, "one_line_summary": "<what it does well>", "top_improvement": "<single most impactful change>", "rewritten_version": "<improved version, same platform constraints>" }\n\nAd copy:\n${copy}` }],
        max_tokens: 600,
        temperature: 0.3,
      }),
    })
    const data = await res.json()
    const raw = data.choices?.[0]?.message?.content ?? ''
    const match = raw.match(/\{[\s\S]*\}/)
    return JSON.parse(match ? match[0] : raw)
  } catch {
    return { emotional_appeal: 5, value_proposition: 5, brand_voice: 5, one_line_summary: '', top_improvement: 'Unable to get AI feedback. Try again.', rewritten_version: copy }
  }
}

export async function POST(request: NextRequest) {
  let body: { copy?: string; platform?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const copy = (body.copy || '').trim()
  if (!copy) return Response.json({ error: 'Ad copy is required' }, { status: 400 })
  if (copy.length < 5) return Response.json({ error: 'Ad copy is too short' }, { status: 400 })

  const platform = (['google', 'meta', 'linkedin', 'twitter', 'email'].includes(body.platform ?? '') ? body.platform : 'meta') as Platform

  const access = await hasFreeOrProAccess(request, 'ad-grader', 3)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  const lengthScore = scoreLength(copy, platform)
  const ctaScore = scoreCTA(copy)
  const clarityScore = scoreClarity(copy)
  const urgencyScore = scoreUrgency(copy)
  const socialScore = scoreSocialProof(copy)
  const { score: spamScore, flags: spamFlags } = scoreSpam(copy)

  const deterministicScore = Math.max(0, lengthScore + ctaScore + clarityScore + urgencyScore + socialScore + spamScore)

  const qualitative = await getGroqFeedback(copy, platform)
  const aiBonus = ((Number(qualitative.emotional_appeal) + Number(qualitative.value_proposition) + Number(qualitative.brand_voice)) / 3) * 10 / 10

  const finalScore = Math.min(100, Math.round(deterministicScore + aiBonus))
  const grade = finalScore >= 90 ? 'A+' : finalScore >= 80 ? 'A' : finalScore >= 70 ? 'B' : finalScore >= 60 ? 'C' : 'F'

  return Response.json({
    score: finalScore,
    grade,
    platform,
    characterCount: copy.length,
    wordCount: copy.split(/\s+/).filter(Boolean).length,
    breakdown: {
      length: lengthScore,
      cta: ctaScore,
      clarity: clarityScore,
      urgency: urgencyScore,
      socialProof: socialScore,
      spamFlags: spamScore,
      spamFlagList: spamFlags,
    },
    qualitative: {
      emotionalAppeal: qualitative.emotional_appeal,
      valueProposition: qualitative.value_proposition,
      brandVoice: qualitative.brand_voice,
      summary: qualitative.one_line_summary,
      topImprovement: qualitative.top_improvement,
      rewrittenVersion: qualitative.rewritten_version,
    },
  })
}
