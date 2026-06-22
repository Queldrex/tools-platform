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
      temperature: 0.3,
    }),
  })
  if (!res.ok) throw new Error(`Service error ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

export async function POST(request: NextRequest) {
  if (!GROQ_API_KEY) return Response.json({ error: 'Service not configured' }, { status: 503 })

  const access = await hasFreeOrProAccess(request, 'job-description', 2)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  let body: {
    jobTitle?: string; company?: string; industry?: string
    employmentType?: string; location?: string; remote?: string
    salaryMin?: number; salaryMax?: number; experienceLevel?: string
    keyResponsibilities?: string; requiredSkills?: string
    niceToHave?: string; companyBlurb?: string; tone?: string
  }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid request' }, { status: 400 }) }

  if (!body.jobTitle?.trim()) return Response.json({ error: 'Job title is required' }, { status: 400 })
  if (!body.company?.trim()) return Response.json({ error: 'Company name is required' }, { status: 400 })
  if (!body.keyResponsibilities?.trim()) return Response.json({ error: 'Key responsibilities are required' }, { status: 400 })

  const salaryText = body.salaryMin && body.salaryMax
    ? `$${body.salaryMin.toLocaleString()} – $${body.salaryMax.toLocaleString()}/year`
    : body.salaryMin ? `From $${body.salaryMin.toLocaleString()}/year` : 'Competitive, based on experience'

  const toneInstructions: Record<string, string> = {
    professional: 'formal and corporate, clear and direct',
    casual: 'warm and approachable, conversational but still professional',
    'startup-energy': 'energetic and bold, show company culture, use active exciting language',
  }

  const companyBlurb = body.companyBlurb || `${body.company} is a growing company looking for talented individuals to join our team.`
  const toneLabel = toneInstructions[body.tone || 'professional'] || toneInstructions.professional

  let raw: string
  try {
    raw = await askGroq(`You are a senior HR professional. Write a complete, ready-to-post job description.

Role: ${body.jobTitle}
Company: ${body.company}
Industry: ${body.industry || 'Technology'}
Employment: ${body.employmentType || 'Full-time'}, ${body.remote || 'hybrid'}, ${body.location || 'Location flexible'}
Experience Level: ${body.experienceLevel || 'mid'}-level
Salary: ${salaryText}
Tone: ${toneLabel}
Key Responsibilities: ${body.keyResponsibilities}
Required Skills: ${body.requiredSkills || 'Not specified'}
Nice to Have: ${body.niceToHave || 'Not specified'}
About the Company: ${companyBlurb}

Return ONLY a raw JSON object (no markdown, no code fences). Use this exact structure:
{"jobTitle":"...","sections":[{"heading":"About the Role","content":"..."},{"heading":"What You'll Do","content":"..."},{"heading":"What We're Looking For","content":"..."},{"heading":"Compensation and Benefits","content":"${salaryText}, plus standard benefits"},{"heading":"Equal Opportunity","content":"..."}],"fullText":"...","characterCount":0,"estimatedReadTime":"2 min read"}

Fill every field with real content. No placeholder angle brackets. Escape any quotes inside strings with backslash.`)
  } catch {
    return Response.json({ error: 'Generation temporarily unavailable. Please try again.' }, { status: 503 })
  }

  let result: { jobTitle: string; sections: Array<{ heading: string; content: string }>; fullText: string; characterCount: number; estimatedReadTime: string }
  try {
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
    const match = cleaned.match(/\{[\s\S]*\}/)
    result = JSON.parse(match ? match[0] : cleaned)
    if (!result.fullText && result.sections) {
      result.fullText = result.sections.map((s: { heading: string; content: string }) => `${s.heading}\n${s.content}`).join('\n\n')
    }
    if (!result.characterCount && result.fullText) result.characterCount = result.fullText.length
    if (!result.estimatedReadTime) result.estimatedReadTime = `${Math.ceil((result.fullText || '').length / 1000)} min read`
  } catch {
    return Response.json({ error: 'Generation failed. Please try again.' }, { status: 500 })
  }

  return Response.json({ ...result, company: body.company, location: body.location, employmentType: body.employmentType, remote: body.remote, generatedAt: new Date().toISOString() })
}
