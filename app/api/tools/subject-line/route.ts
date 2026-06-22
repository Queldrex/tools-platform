import { NextRequest } from 'next/server'
import { hasFreeOrProAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'

const SPAM_WORDS = ['winner', 'urgent', 'act now', 'click here', 'limited time', 'congratulations', "you've been selected", 'dear friend', 'make money', 'risk free', 'no cost', '100% free', 'promise', 'prize', 'earn $', 'income from home', 'work from home', 'be your own boss']
const POWER_WORDS = ['new', 'secret', 'exclusive', 'discover', 'proven', 'results', 'ultimate', 'instant', 'easy', 'fast', 'simple', 'bonus', 'save', 'important', 'warning', 'deadline', 'expires', 'announcing', 'introducing', 'finally', 'breakthrough', 'revealed', 'free']

function scoreLength(subject: string): { score: number; label: string } {
  const len = subject.length
  if (len >= 35 && len <= 50) return { score: 20, label: 'Perfect length' }
  if ((len >= 30 && len < 35) || (len > 50 && len <= 60)) return { score: 15, label: 'Good length' }
  if ((len >= 20 && len < 30) || (len > 60 && len <= 70)) return { score: 8, label: 'Could be better' }
  return { score: 3, label: len < 20 ? 'Too short' : 'Too long for mobile' }
}

function scoreSpam(subject: string): { score: number; matched: string[] } {
  const lower = subject.toLowerCase()
  const matched = SPAM_WORDS.filter(w => lower.includes(w))
  return { score: Math.max(0, 25 - matched.length * 5), matched }
}

function scorePersonalization(subject: string): { score: number; label: string } {
  if (/\{first_name\}|\{\{name\}\}|\[name\]|\{name\}/i.test(subject)) return { score: 15, label: 'Personalized token found' }
  if (/\byou\b|\byour\b/i.test(subject)) return { score: 8, label: 'Uses "you/your"' }
  return { score: 3, label: 'No personalization' }
}

function scorePowerWords(subject: string): { score: number; matched: string[] } {
  const lower = subject.toLowerCase()
  const matched = POWER_WORDS.filter(w => lower.includes(w))
  return { score: matched.length > 0 ? 15 : 5, matched }
}

function scoreQuestion(subject: string): { score: number; label: string } {
  if (subject.trim().endsWith('?')) return { score: 10, label: 'Question format' }
  if (/\b(how|what|why|when|who|which|where|can|could|would|will|are|is)\b/i.test(subject)) return { score: 5, label: 'Contains question word' }
  return { score: 2, label: 'No question' }
}

function scoreEmoji(subject: string): { score: number; label: string; count: number } {
  const emojiCount = [...subject].filter(c => /\p{Emoji}/u.test(c) && c !== ' ').length
  if (emojiCount === 1) return { score: 10, label: 'Perfect — one emoji', count: 1 }
  if (emojiCount === 2) return { score: 6, label: 'Two emojis', count: 2 }
  if (emojiCount === 0) return { score: 5, label: 'No emoji (fine)', count: 0 }
  return { score: 2, label: 'Too many emojis', count: emojiCount }
}

function scoreNumber(subject: string): { score: number; hasNumber: boolean } {
  const hasNumber = /\d/.test(subject)
  return { score: hasNumber ? 5 : 0, hasNumber }
}

function getIssues(subject: string, spamMatched: string[]): string[] {
  const issues: string[] = []
  const allCapsWords = subject.split(/\s+/).filter(w => w.length > 2 && w === w.toUpperCase() && /[A-Z]/.test(w))
  if (allCapsWords.length > 0) issues.push(`ALL CAPS detected: "${allCapsWords.join(', ')}" — major spam trigger`)
  if (subject.length > 60) issues.push('May be cut off on mobile (over 60 characters)')
  if (subject.toLowerCase().startsWith('re:') || subject.toLowerCase().startsWith('fwd:')) issues.push('Fake reply/forward prefix is a deliverability risk and may violate email laws')
  if (spamMatched.length > 0) issues.push(`Spam trigger words: "${spamMatched.join('", "')}"`)
  if (subject.includes('!!!') || subject.split('!').length - 1 > 1) issues.push('Multiple exclamation marks — spam filter trigger')
  if (!/[a-zA-Z]/.test(subject)) issues.push('No readable text detected')
  return issues
}

function getAlternatives(subject: string): string[] {
  const clean = subject.replace(/[?!.]+$/, '').trim()
  const alts = [
    `${clean} — Today Only`,
    subject.match(/^\d/) ? subject : `3 ways: ${clean.toLowerCase()}`,
    subject.trim().endsWith('?') ? subject : `${clean}?`,
  ]
  return alts
}

function getOpenRateLabel(score: number): string {
  if (score >= 85) return 'Likely 35–45% open rate (excellent)'
  if (score >= 70) return 'Likely 25–35% open rate (above average)'
  if (score >= 55) return 'Likely 18–25% open rate (average)'
  if (score >= 40) return 'Likely 12–18% open rate (below average)'
  return 'Likely <12% open rate (poor)'
}

export async function POST(request: NextRequest) {
  const access = await hasFreeOrProAccess(request, 'subject-line', 5)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  let body: { subject?: string; preheader?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const subject = (body.subject || '').trim()
  if (!subject) return Response.json({ error: 'Subject line is required' }, { status: 400 })

  const length = scoreLength(subject)
  const spam = scoreSpam(subject)
  const personalization = scorePersonalization(subject)
  const powerWords = scorePowerWords(subject)
  const question = scoreQuestion(subject)
  const emoji = scoreEmoji(subject)
  const number = scoreNumber(subject)

  const total = length.score + spam.score + personalization.score + powerWords.score + question.score + emoji.score + number.score
  const score = Math.min(100, Math.max(0, total))
  const grade = score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : score >= 40 ? 'D' : 'F'

  return Response.json({
    score,
    grade,
    estimatedOpenRate: getOpenRateLabel(score),
    characterCount: subject.length,
    wordCount: subject.split(/\s+/).filter(Boolean).length,
    breakdown: {
      length: { score: length.score, max: 20, label: length.label },
      spamScore: { score: spam.score, max: 25, matched: spam.matched },
      personalization: { score: personalization.score, max: 15, label: personalization.label },
      powerWords: { score: powerWords.score, max: 15, matched: powerWords.matched },
      question: { score: question.score, max: 10, label: question.label },
      emoji: { score: emoji.score, max: 10, label: emoji.label, count: emoji.count },
      number: { score: number.score, max: 5, hasNumber: number.hasNumber },
    },
    issues: getIssues(subject, spam.matched),
    alternatives: getAlternatives(subject),
  })
}
