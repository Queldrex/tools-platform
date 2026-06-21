import { NextRequest } from 'next/server'
import { hasFreeOrProAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'

interface Check {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  name: string
  pattern: RegExp
  message: string
}

const CHECKS: Check[] = [
  { id: 'hardcoded-secret', severity: 'critical', name: 'Hardcoded Secret', pattern: /(api[_-]?key|secret|password|passwd|pwd|token|auth)['":\s=]+['"][^'"]{8,}['"]/gi, message: 'Hardcoded credential detected. Use environment variables.' },
  { id: 'hardcoded-aws', severity: 'critical', name: 'AWS Key Pattern', pattern: /AKIA[0-9A-Z]{16}/g, message: 'Possible AWS access key hardcoded in source.' },
  { id: 'sql-injection', severity: 'high', name: 'SQL Injection Risk', pattern: /(\$\{|'\s*\+\s*|"\s*\+\s*|f['"])[^)]*?(SELECT|INSERT|UPDATE|DELETE|DROP|UNION)/gi, message: 'String interpolation in SQL query — use parameterized queries.' },
  { id: 'command-injection', severity: 'high', name: 'Command Injection Risk', pattern: /(exec|execSync|spawn|spawnSync|system|popen|subprocess\.call)\s*\([^)]*(\$\{|'\s*\+|"\s*\+)/gi, message: 'User input in shell command — sanitize all inputs.' },
  { id: 'eval-usage', severity: 'high', name: 'eval() Usage', pattern: /\beval\s*\(/g, message: 'eval() executes arbitrary code — avoid completely.' },
  { id: 'xss-innerhtml', severity: 'high', name: 'XSS via innerHTML', pattern: /\.innerHTML\s*=\s*[^'"][^;]*/g, message: 'Direct innerHTML assignment — use textContent or sanitize input.' },
  { id: 'xss-document-write', severity: 'high', name: 'XSS via document.write', pattern: /document\.write\s*\(/g, message: 'document.write() is XSS-prone — use DOM manipulation instead.' },
  { id: 'path-traversal', severity: 'high', name: 'Path Traversal Risk', pattern: /(readFile|writeFile|readFileSync|writeFileSync|createReadStream)\s*\([^)]*(\$\{|'\s*\+|"\s*\+)/gi, message: 'User input in file path — validate and sanitize paths.' },
  { id: 'insecure-random', severity: 'medium', name: 'Insecure Randomness', pattern: /Math\.random\s*\(\)/g, message: 'Math.random() is not cryptographically secure — use crypto.getRandomValues().' },
  { id: 'weak-hash', severity: 'medium', name: 'Weak Hash Algorithm', pattern: /\b(md5|sha1|sha-1)\b/gi, message: 'MD5/SHA-1 are cryptographically broken — use SHA-256 or better.' },
  { id: 'http-url', severity: 'medium', name: 'Insecure HTTP URL', pattern: /['"]http:\/\/(?!localhost|127\.0\.0\.1)[^'"]+['"]/g, message: 'HTTP URL in code — use HTTPS in production.' },
  { id: 'proto-pollution', severity: 'medium', name: 'Prototype Pollution Risk', pattern: /\[['"]__proto__['"]\]|\.__proto__\s*=/g, message: 'Prototype pollution vulnerability — never set __proto__ from user input.' },
  { id: 'console-secret', severity: 'low', name: 'Sensitive Data Logging', pattern: /console\.(log|error|warn)\s*\([^)]*\b(password|token|secret|key|auth)\b/gi, message: 'Possible sensitive data in console output — remove before production.' },
  { id: 'error-stack', severity: 'low', name: 'Stack Trace Exposure', pattern: /res\.(send|json)\s*\([^)]*\.(stack|message)\b/gi, message: 'Error details sent to client — log server-side, send generic message to client.' },
]

export async function POST(request: NextRequest) {
  const access = await hasFreeOrProAccess(request, 'vibe-security', 1)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  let body: { code?: string; language?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const code = (body.code || '').slice(0, 50000)
  if (!code.trim()) return Response.json({ error: 'No code provided' }, { status: 400 })

  const lines = code.split('\n')
  const findings: Array<{ id: string; severity: string; name: string; message: string; line: number; snippet: string }> = []

  for (const check of CHECKS) {
    const re = new RegExp(check.pattern.source, check.pattern.flags)
    let match: RegExpExecArray | null
    while ((match = re.exec(code)) !== null) {
      const lineNum = code.slice(0, match.index).split('\n').length
      const snippet = match[0].slice(0, 120)
      const alreadyFound = findings.some(f => f.id === check.id && f.line === lineNum)
      if (!alreadyFound) {
        findings.push({ id: check.id, severity: check.severity, name: check.name, message: check.message, line: lineNum, snippet })
      }
    }
  }

  const summary = { critical: 0, high: 0, medium: 0, low: 0, total: findings.length }
  for (const f of findings) summary[f.severity as keyof typeof summary]++

  const score = Math.max(0, 100 - (summary.critical * 25 + summary.high * 15 + summary.medium * 8 + summary.low * 3))

  return Response.json({ findings, summary, linesScanned: lines.length, score })
}
