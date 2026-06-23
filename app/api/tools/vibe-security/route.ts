import { NextRequest } from 'next/server'
import { hasFreeOrProAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'

interface Check {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  name: string
  pattern: RegExp
  message: string
  owasp: string
  secureReplacement?: string
}

const CHECKS: Check[] = [
  { id: 'hardcoded-secret', severity: 'critical', name: 'Hardcoded Secret', owasp: 'A07', pattern: /(api[_-]?key|secret|password|passwd|pwd|token|auth)['":\s=]+['"][^'"]{8,}['"]/gi, message: 'Hardcoded credential detected. Use environment variables.', secureReplacement: '// Use environment variables:\nconst apiKey = process.env.API_KEY;' },
  { id: 'hardcoded-aws', severity: 'critical', name: 'AWS Key Pattern', owasp: 'A07', pattern: /AKIA[0-9A-Z]{16}/g, message: 'Possible AWS access key hardcoded in source.' },
  { id: 'placeholder-secret', severity: 'critical', name: 'Placeholder Secret', owasp: 'A07', pattern: /(YOUR_API_KEY|YOUR_SECRET|REPLACE_ME|INSERT_KEY|CHANGE_THIS|your[-_]?(api[-_]?key|secret|token|password))/gi, message: 'Placeholder credential in code — AI generators leave these as-is. Replace with real secrets from environment variables.', secureReplacement: '// Use environment variables:\nconst apiKey = process.env.API_KEY;' },
  { id: 'default-credential', severity: 'critical', name: 'Default Credentials', owasp: 'A07', pattern: /(admin|root|administrator)\s*[=:]\s*['"]?(password|admin|123456|root)['"]/gi, message: 'Default credentials detected — change immediately before deployment.' },
  { id: 'sql-injection', severity: 'high', name: 'SQL Injection Risk', owasp: 'A03', pattern: /(\$\{|'\s*\+\s*|"\s*\+\s*|f['"])[^)]*?(SELECT|INSERT|UPDATE|DELETE|DROP|UNION)/gi, message: 'String interpolation in SQL query — use parameterized queries.', secureReplacement: "// Use parameterized queries:\ndb.query('SELECT * FROM users WHERE id = ?', [id]);" },
  { id: 'command-injection', severity: 'high', name: 'Command Injection Risk', owasp: 'A03', pattern: /(exec|execSync|spawn|spawnSync|system|popen|subprocess\.call)\s*\([^)]*(\$\{|'\s*\+|"\s*\+)/gi, message: 'User input in shell command — sanitize all inputs.' },
  { id: 'eval-usage', severity: 'high', name: 'eval() Usage', owasp: 'A03', pattern: /\beval\s*\(/g, message: 'eval() executes arbitrary code — avoid completely.', secureReplacement: '// Avoid eval() — use JSON.parse() for data, or Function() only if absolutely necessary' },
  { id: 'xss-innerhtml', severity: 'high', name: 'XSS via innerHTML', owasp: 'A03', pattern: /\.innerHTML\s*=\s*[^'"][^;]*/g, message: 'Direct innerHTML assignment — use textContent or sanitize input.', secureReplacement: '// Use textContent instead:\nelement.textContent = userInput;' },
  { id: 'xss-document-write', severity: 'high', name: 'XSS via document.write', owasp: 'A03', pattern: /document\.write\s*\(/g, message: 'document.write() is XSS-prone — use DOM manipulation instead.' },
  { id: 'path-traversal', severity: 'high', name: 'Path Traversal Risk', owasp: 'A03', pattern: /(readFile|writeFile|readFileSync|writeFileSync|createReadStream)\s*\([^)]*(\$\{|'\s*\+|"\s*\+)/gi, message: 'User input in file path — validate and sanitize paths.' },
  { id: 'client-side-auth', severity: 'high', name: 'Client-Side Auth Logic', owasp: 'A01', pattern: /if\s*\([^)]*\b(isAdmin|isAuthenticated|role\s*===|user\.role)\b[^)]*\)\s*\{[^}]*return/gi, message: 'Authentication check in client-side code can be bypassed — move auth logic to server.' },
  { id: 'debug-flag', severity: 'high', name: 'Debug Mode Enabled', owasp: 'A02', pattern: /debug\s*[=:]\s*true/gi, message: 'Debug mode enabled — disable in production to prevent information disclosure.', secureReplacement: "// Use environment-based toggle:\nconst debug = process.env.NODE_ENV === 'development';" },
  { id: 'cors-wildcard', severity: 'high', name: 'Permissive CORS', owasp: 'A02', pattern: /Access-Control-Allow-Origin['":\s]+['"]\*/g, message: 'CORS wildcard allows any origin — restrict to specific domains in production.', secureReplacement: "// Restrict to specific origin:\nres.setHeader('Access-Control-Allow-Origin', 'https://yoursite.com');" },
  { id: 'insecure-random', severity: 'medium', name: 'Insecure Randomness', owasp: 'A02', pattern: /Math\.random\s*\(\)/g, message: 'Math.random() is not cryptographically secure — use crypto.getRandomValues().', secureReplacement: '// Use crypto API:\nconst array = new Uint32Array(1);\ncrypto.getRandomValues(array);\nconst random = array[0] / 2**32;' },
  { id: 'weak-hash', severity: 'medium', name: 'Weak Hash Algorithm', owasp: 'A02', pattern: /\b(md5|sha1|sha-1)\b/gi, message: 'MD5/SHA-1 are cryptographically broken — use SHA-256 or better.', secureReplacement: "// Use SHA-256:\nconst hash = await crypto.subtle.digest('SHA-256', data);" },
  { id: 'http-url', severity: 'medium', name: 'Insecure HTTP URL', owasp: 'A02', pattern: /['"]http:\/\/(?!localhost|127\.0\.0\.1)[^'"]+['"]/g, message: 'HTTP URL in code — use HTTPS in production.' },
  { id: 'proto-pollution', severity: 'medium', name: 'Prototype Pollution Risk', owasp: 'A03', pattern: /\[['"]__proto__['"]\]|\.__proto__\s*=/g, message: 'Prototype pollution vulnerability — never set __proto__ from user input.' },
  { id: 'empty-catch', severity: 'medium', name: 'Silent Error Swallowing', owasp: 'A10', pattern: /catch\s*\([^)]*\)\s*\{\s*\}/g, message: 'Empty catch block silently swallows errors — log or handle exceptions properly.', secureReplacement: "// Always handle or log errors:\ncatch (err) {\n  console.error('Operation failed:', err);\n  throw err; // or handle appropriately\n}" },
  { id: 'catch-null', severity: 'medium', name: 'Error Suppression', owasp: 'A10', pattern: /catch\s*\([^)]*\)\s*\{\s*return\s+null/g, message: 'Returning null on error hides failures — handle or propagate exceptions.' },
  { id: 'unpinned-dep', severity: 'medium', name: 'Unpinned Dependency', owasp: 'A06', pattern: /require\(['"][^'"]+['"]\)|from\s+['"][^'"]+['"]/g, message: 'Import from unverified source — pin dependency versions and audit with npm audit.' },
  { id: 'supply-chain-require', severity: 'low', name: 'Dynamic require()', owasp: 'A06', pattern: /require\s*\(\s*[^'"]/g, message: 'Dynamic require() with variable path — potential supply chain risk.' },
  { id: 'console-secret', severity: 'low', name: 'Sensitive Data Logging', owasp: 'A10', pattern: /console\.(log|error|warn)\s*\([^)]*\b(password|token|secret|key|auth)\b/gi, message: 'Possible sensitive data in console output — remove before production.' },
  { id: 'error-stack', severity: 'low', name: 'Stack Trace Exposure', owasp: 'A05', pattern: /res\.(send|json)\s*\([^)]*\.(stack|message)\b/gi, message: 'Error details sent to client — log server-side, send generic message to client.' },
  { id: 'todo-security', severity: 'low', name: 'TODO Security Comment', owasp: 'A07', pattern: /\/\/\s*(TODO|FIXME|HACK|XXX)[^:]*:(validate|sanitize|auth|security|encrypt|secure)/gi, message: 'Security TODO left unresolved — AI often flags items it should fix. Address before shipping.' },
]

export async function POST(request: NextRequest) {
  const access = await hasFreeOrProAccess(request, 'vibe-security', 1)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  let body: { code?: string; language?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const code = (body.code || '').slice(0, 50000)
  if (!code.trim()) return Response.json({ error: 'No code provided' }, { status: 400 })

  const lines = code.split('\n')
  const findings: Array<{ id: string; severity: string; name: string; message: string; line: number; snippet: string; owasp: string; secureReplacement?: string }> = []

  for (const check of CHECKS) {
    const re = new RegExp(check.pattern.source, check.pattern.flags)
    let match: RegExpExecArray | null
    while ((match = re.exec(code)) !== null) {
      const lineNum = code.slice(0, match.index).split('\n').length
      const snippet = match[0].slice(0, 120)
      const alreadyFound = findings.some(f => f.id === check.id && f.line === lineNum)
      if (!alreadyFound) {
        findings.push({ id: check.id, severity: check.severity, name: check.name, message: check.message, line: lineNum, snippet, owasp: check.owasp, secureReplacement: check.secureReplacement })
      }
    }
  }

  const summary = { critical: 0, high: 0, medium: 0, low: 0, total: findings.length }
  for (const f of findings) summary[f.severity as keyof typeof summary]++

  const score = Math.max(0, 100 - (summary.critical * 25 + summary.high * 15 + summary.medium * 8 + summary.low * 3))

  return Response.json({ findings, summary, linesScanned: lines.length, score })
}
