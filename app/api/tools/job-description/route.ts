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

  const access = await hasFreeOrProAccess(request, 'job-description', 2)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  const salaryText = body.salaryMin && body.salaryMax
    ? `$${body.salaryMin.toLocaleString()} – $${body.salaryMax.toLocaleString()}/year`
    : body.salaryMin ? `From $${body.salaryMin.toLocaleString()}/year` : 'Competitive, based on experience'

  const toneInstructions: Record<string, string> = {
    professional: 'formal and corporate, clear and direct',
    casual: 'warm and approachable, conversational but still professional',
    'startup-energy': 'energetic and bold, show company culture, use active exciting language',
  }

  const raw = await askGroq(`You are a senior HR professional writing a job posting. Create a complete, ready-to-post job description.

Role: ${body.jobTitle}
Company: ${body.company}
Industry: ${body.industry || 'Technology'}
Employment: ${body.employmentType || 'Full-time'}, ${body.remote || 'hybrid'}, ${body.location || 'Location flexible'}
Experience Level: ${body.experienceLevel || 'mid'}-level
Salary: ${salaryText}
Tone: ${toneInstructions[body.tone || 'professional'] || toneInstructions.professional}

Key Responsibilities (user notes): ${body.keyResponsibilities}
Required Skills (user notes): ${body.requiredSkills || 'Not specified'}
Nice to Have: ${body.niceToHave || 'Not specified'}
About the Company: ${body.companyBlurb || `${body.company} is a growing company looking for talented individuals to join our team.`}

Write a compelling job description. Return ONLY valid JSON:
{
  "jobTitle": "${body.jobTitle}",
  "sections": [
    { "heading": "About the Role", "content": "<2-3 sentence overview of why this role matters and what makes it exciting>" },
    { "heading": "What You'll Do", "content": "<5-8 bullet points starting with action verbs, one per line with • prefix>" },
    { "heading": "What We're Looking For", "content": "<Required: 5-7 bullets with • prefix\\n\\nNice to Have:\\n<3-4 bullets with • prefix>" },
    { "heading": "About ${body.company}", "content": "<2-3 sentences about the company>" },
    { "heading": "Compensation & Benefits", "content": "${salaryText}<plus mention 3-4 typical benefits like health insurance, PTO, flexible hours, remote work if applicable>" },
    { "heading": "Equal Opportunity", "content": "<standard EEO statement>" }
  ],
  "fullText": "<complete job posting as clean plain text, sections separated by newlines>",
  "characterCount": <integer>,
  "estimatedReadTime": "<e.g. '2 min read'>"
}`)

  let result: { jobTitle: string; sections: Array<{ heading: string; content: string }>; fullText: string; characterCount: number; estimatedReadTime: string }
  try {
    const match = raw.match(/\{[\s\S]*\}/)
    result = JSON.parse(match ? match[0] : raw)
    if (!result.characterCount && result.fullText) result.characterCount = result.fullText.length
    if (!result.estimatedReadTime) result.estimatedReadTime = `${Math.ceil(result.fullText.length / 1000)} min read`
  } catch {
    return Response.json({ error: 'Generation failed. Please try again.' }, { status: 500 })
  }

  return Response.json({ ...result, company: body.company, location: body.location, employmentType: body.employmentType, remote: body.remote, generatedAt: new Date().toISOString() })
}
