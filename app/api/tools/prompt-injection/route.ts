import { NextRequest } from 'next/server'
import { hasFreeOrProAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'

interface Pattern {
  regex: RegExp
  type: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  desc: string
}

const PATTERNS: Pattern[] = [
  { regex: /ignore\s+(all\s+)?(previous|prior|above|your)\s+(instructions?|prompt|context|directives?)/gi, type: 'Instruction Override', severity: 'critical', desc: 'Attempts to nullify system instructions — the most common and dangerous injection type.' },
  { regex: /\bD\.?A\.?N\.?\b|\bdo\s+anything\s+now\b/gi, type: 'DAN Jailbreak', severity: 'critical', desc: 'Classic "Do Anything Now" jailbreak — attempts to create an unrestricted AI persona.' },
  { regex: /(repeat|print|output|echo|show|reveal|display|tell\s+me|what\s+is)\s+(your|the)\s+(system\s+)?(prompt|instructions?|context|configuration|rules?|guidelines?)/gi, type: 'Prompt Extraction', severity: 'critical', desc: 'Attempts to extract the system prompt or confidential instructions.' },
  { regex: /act\s+as\s+(if\s+)?(you\s+(are|were)\s+)?(an?\s+)?(evil|malicious|unrestricted|jailbroken|uncensored|unfiltered|unaligned|unchained)/gi, type: 'Malicious Persona', severity: 'critical', desc: 'Attempts to make the AI adopt a harmful, unrestricted persona.' },
  { regex: /<\|system\|>|<\|user\|>|<\|assistant\|>|<\|im_start\|>|<\|im_end\|>|\[SYSTEM\]|\[INST\]|\[\/INST\]|\{\{system\}\}|\{\{prompt\}\}/gi, type: 'Token Smuggling', severity: 'critical', desc: 'Injects model-specific control tokens to hijack conversation structure.' },
  { regex: /you\s+are\s+now\s+(a|an|the)\s+(?!(helpful|friendly|professional|expert|knowledgeable|skilled)\s)/gi, type: 'Role Injection', severity: 'high', desc: 'Attempts to reassign the AI to a new, potentially malicious role.' },
  { regex: /forget\s+(everything|all|what)\s+(you|i|was|were|have)|(clear|reset|wipe)\s+(your\s+)?(memory|context|history|instructions?)/gi, type: 'Memory Wipe', severity: 'high', desc: 'Attempts to reset or clear the AI\'s context and instructions.' },
  { regex: /developer\s+mode\s+(enabled|on|activated?)|god\s+mode|unrestricted\s+mode|admin\s+(mode|override|access)|override\s+mode/gi, type: 'Mode Switch', severity: 'high', desc: 'Attempts to switch to a fictional "special mode" with fewer restrictions.' },
  { regex: /---+\s*(system|user|assistant|human|ai)\s*---+|#{1,6}\s*(system|user|assistant)\s*prompt/gi, type: 'Separator Injection', severity: 'high', desc: 'Uses separator patterns to inject fake message boundaries into the conversation.' },
  { regex: /translate\s+(the\s+)?(above|following|this|previous|your\s+response)\s+(to|into)\s+(base64|hex|rot[\-\s]?13|morse\s+code|binary|leetspeak)/gi, type: 'Encoding Attack', severity: 'high', desc: 'Encodes output to bypass content filters and monitoring.' },
  { regex: /what\s+would\s+you\s+(say|do|tell\s+me)\s+if\s+(you\s+)?(had\s+no|without|ignoring|without\s+any)\s+(restrictions?|limitations?|rules?|guidelines?|filters?)/gi, type: 'Restriction Bypass', severity: 'high', desc: 'Asks the model to respond hypothetically without its safety guidelines.' },
  { regex: /in\s+a\s+(fictional|hypothetical|alternate|made[\-\s]up)\s+(world|universe|scenario|context|setting|story)|for\s+(a\s+)?(story|novel|script|fiction|roleplay)|pretend\s+(that\s+)?(you|there)\s+(are|is|have)\s+no\s+(rules?|restrictions?)/gi, type: 'Hypothetical Framing', severity: 'medium', desc: 'Uses fictional or hypothetical framing to lower safety guardrails.' },
  { regex: /\bprompt\s+injection\b|\bjailbreak\b|\byou\s+have\s+been\s+jailbroken\b/gi, type: 'Explicit Attack Term', severity: 'medium', desc: 'Contains explicit jailbreak or injection terminology.' },
  { regex: /simulate\s+(an?\s+)?(AI|chatbot|assistant|model)\s+(with(out)?\s+(restrictions?|limitations?|rules?|filters?)|that\s+can\s+(say|do)\s+anything)/gi, type: 'Simulation Attack', severity: 'high', desc: 'Asks the model to simulate an unrestricted AI system.' },
  { regex: /from\s+now\s+on\s+(you\s+)?(are|will|must|should|shall)\s+(ignore|disregard|forget|bypass|override)/gi, type: 'Persistent Override', severity: 'critical', desc: 'Attempts to establish persistent instruction override for all future responses.' },
]

const SEVERITY_SCORE: Record<string, number> = { critical: 35, high: 20, medium: 10, low: 5 }

const VERDICTS: Record<string, string> = {
  critical: 'Multiple critical injection patterns detected. This prompt is actively hostile — do not process in production.',
  high: 'High-risk patterns detected. This prompt attempts to manipulate AI behavior and should be blocked.',
  medium: 'Suspicious patterns detected. Review this prompt before allowing it to reach your AI system.',
  low: 'Minor indicators detected. Low risk, but monitor for patterns in user behavior.',
  clean: 'No injection patterns detected. Prompt appears safe.',
}

const RECOMMENDATIONS: Record<string, string> = {
  critical: 'Block immediately. Log the attempt, flag the user account, and review your system prompt for information leakage.',
  high: 'Block and log. Consider adding a system-level detection layer before prompts reach your AI.',
  medium: 'Flag for review. Implement semantic similarity checks against known jailbreak patterns.',
  low: 'Monitor. Track frequency per user — repeated low-severity patterns may indicate probing.',
  clean: 'No action needed. Continue monitoring at the system level.',
}

export async function POST(request: NextRequest) {
  let body: { prompt?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const prompt = (body.prompt || '').trim()
  if (!prompt) return Response.json({ error: 'Prompt text is required' }, { status: 400 })
  if (prompt.length > 50000) return Response.json({ error: 'Prompt too long (max 50,000 characters)' }, { status: 400 })

  const access = await hasFreeOrProAccess(request, 'prompt-injection', 3)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  const detections: Array<{ type: string; severity: string; match: string; description: string }> = []
  const seenTypes = new Set<string>()

  for (const p of PATTERNS) {
    const matches = [...prompt.matchAll(new RegExp(p.regex.source, p.regex.flags))]
    for (const match of matches) {
      if (!seenTypes.has(p.type)) {
        seenTypes.add(p.type)
        detections.push({ type: p.type, severity: p.severity, match: match[0].slice(0, 120), description: p.desc })
      }
    }
  }

  let riskScore = 0
  for (const d of detections) riskScore += SEVERITY_SCORE[d.severity] ?? 0
  riskScore = Math.min(100, riskScore)

  const riskLevel = riskScore >= 70 ? 'critical' : riskScore >= 40 ? 'high' : riskScore >= 20 ? 'medium' : riskScore > 0 ? 'low' : 'clean'

  const summary = {
    critical: detections.filter(d => d.severity === 'critical').length,
    high: detections.filter(d => d.severity === 'high').length,
    medium: detections.filter(d => d.severity === 'medium').length,
    low: detections.filter(d => d.severity === 'low').length,
    total: detections.length,
  }

  return Response.json({
    riskScore,
    riskLevel,
    verdict: VERDICTS[riskLevel],
    recommendation: RECOMMENDATIONS[riskLevel],
    detections: detections.sort((a, b) => (SEVERITY_SCORE[b.severity] ?? 0) - (SEVERITY_SCORE[a.severity] ?? 0)),
    summary,
    promptLength: prompt.length,
    analyzedAt: new Date().toISOString(),
  })
}
