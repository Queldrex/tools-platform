'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'PHP', 'Go', 'Java', 'Ruby', 'C#', 'Other']

const SEV_COLOR: Record<string, string> = {
  critical: '#f87171',
  high: '#fb923c',
  medium: '#facc15',
  low: '#94a3b8',
}

const EXAMPLE_CODE = `// Example vulnerable code
const password = "supersecret123";
const apiKey = "sk-abc123xyz456def789";

function getUser(id) {
  const query = "SELECT * FROM users WHERE id = " + id;
  db.query(query);
}

app.get('/debug', (req, res) => {
  try {
    riskyOperation();
  } catch (err) {
    res.json({ error: err.message, stack: err.stack });
  }
});

const token = Math.random().toString(36);
document.getElementById('output').innerHTML = userInput;`

interface Finding {
  id: string
  severity: string
  name: string
  message: string
  line: number
  snippet: string
  owasp?: string
  secureReplacement?: string
}

interface ScanResult {
  findings: Finding[]
  summary: { critical: number; high: number; medium: number; low: number; total: number }
  linesScanned: number
  score: number
}

interface ComplianceIssue {
  type: 'GDPR' | 'SOC2' | 'HIPAA'
  message: string
  line: number
  snippet: string
}

function detectLanguage(code: string): string {
  const scores: Record<string, number> = {
    TypeScript: 0,
    Python: 0,
    PHP: 0,
    SQL: 0,
    Go: 0,
    Java: 0,
    Ruby: 0,
    JavaScript: 0,
  }
  if (/: string|: number|: boolean|interface |<T>| as [A-Z]/.test(code)) scores.TypeScript += 3
  if (/def |import |print\(|self\.|elif /.test(code)) scores.Python += 3
  if (/<\?php|\$_GET|\$_POST|echo |->/.test(code)) scores.PHP += 3
  if (/SELECT |FROM |WHERE |INSERT INTO|JOIN /i.test(code)) scores.SQL += 3
  if (/func |package |:=|fmt\./.test(code)) scores.Go += 3
  if (/public class|System\.out|void main|@Override/.test(code)) scores.Java += 3
  if (/\bend\b|puts |require '/.test(code)) scores.Ruby += 3
  if (/const |let |var |=>|function /.test(code)) scores.JavaScript += 1

  let best = 'JavaScript'
  let bestScore = 0
  for (const [lang, score] of Object.entries(scores)) {
    if (score > bestScore) { bestScore = score; best = lang }
  }
  return bestScore >= 3 ? best : ''
}

function getVibeRiskScore(code: string): { level: 'High' | 'Medium' | 'Low'; score: number; signals: string[] } {
  let score = 0
  const signals: string[] = []

  const todoMatches = (code.match(/\/\/\s*(TODO|FIXME|HACK|XXX)/gi) || []).length
  if (todoMatches > 0) { score += todoMatches * 2; signals.push(`${todoMatches} TODO/FIXME comment${todoMatches > 1 ? 's' : ''}`) }

  const placeholderMatches = (code.match(/(YOUR_API_KEY|YOUR_SECRET|REPLACE_ME|INSERT_KEY|CHANGE_THIS)/gi) || []).length
  if (placeholderMatches > 0) { score += placeholderMatches * 5; signals.push(`${placeholderMatches} placeholder value${placeholderMatches > 1 ? 's' : ''}`) }

  const lines = code.split('\n')
  const noLineBreaks = lines.length < code.length / 80
  if (lines.length > 50 && noLineBreaks) { score += 3; signals.push('Large single block (no spacing)') }

  const hasTryCatch = /try\s*\{[\s\S]*?catch/.test(code)
  if (!hasTryCatch && code.length > 200) { score += 2; signals.push('No error handling found') }

  const capsVars = (code.match(/\b[A-Z_]{3,}\b/g) || []).filter(v => !['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'NULL', 'TRUE', 'FALSE', 'UNION', 'JOIN'].includes(v))
  if (capsVars.length > 3) { score += Math.min(capsVars.length, 5); signals.push(`${capsVars.length} all-caps constants`) }

  const emptyFns = (code.match(/\(\)\s*\{\s*\}/g) || []).length
  if (emptyFns > 0) { score += emptyFns * 2; signals.push(`${emptyFns} empty function${emptyFns > 1 ? 's' : ''}`) }

  const level = score >= 8 ? 'High' : score >= 4 ? 'Medium' : 'Low'
  return { level, score, signals }
}

function runComplianceChecks(code: string, flags: { gdpr: boolean; soc2: boolean; hipaa: boolean }): ComplianceIssue[] {
  const issues: ComplianceIssue[] = []
  const lines = code.split('\n')

  if (flags.gdpr) {
    lines.forEach((line, i) => {
      if (/console\.(log|warn|error)\s*\([^)]*\b(email|name|address|phone|postal)\b/i.test(line)) {
        issues.push({ type: 'GDPR', message: 'Possible PII logged to console — GDPR requires data minimization', line: i + 1, snippet: line.trim().slice(0, 100) })
      }
      if (/\b(userData|userEmail|personalData|userInfo)\b/.test(line)) {
        issues.push({ type: 'GDPR', message: 'Personal data variable — ensure it is encrypted at rest and not retained beyond purpose', line: i + 1, snippet: line.trim().slice(0, 100) })
      }
    })
    if (!/delete|remove|purge|erasure/i.test(code)) {
      issues.push({ type: 'GDPR', message: 'No data deletion logic found — GDPR Article 17 requires right to erasure support', line: 0, snippet: '' })
    }
  }

  if (flags.soc2) {
    if (!/rateLimit|rate_limit|throttle/.test(code) && /express|app\.(get|post|put|delete)/.test(code)) {
      issues.push({ type: 'SOC2', message: 'No rate limiting detected in Express routes — SOC2 requires availability controls', line: 0, snippet: '' })
    }
    lines.forEach((line, i) => {
      if (/console\.(log|warn|error)\s*\([^)]*\b(login|auth|token|session)\b/i.test(line)) {
        issues.push({ type: 'SOC2', message: 'Auth flow logged to console — use structured audit logging instead', line: i + 1, snippet: line.trim().slice(0, 100) })
      }
    })
    if (!/audit|log\.(info|warn|error)|winston|pino|bunyan/.test(code) && code.length > 300) {
      issues.push({ type: 'SOC2', message: 'No structured audit logging found — SOC2 CC7.2 requires event logging', line: 0, snippet: '' })
    }
  }

  if (flags.hipaa) {
    lines.forEach((line, i) => {
      if (/\b(ssn|diagnosis|patient|health_data|medical|phi)\b/i.test(line)) {
        issues.push({ type: 'HIPAA', message: 'PHI variable name detected — must be encrypted at rest and in transit (HIPAA §164.312)', line: i + 1, snippet: line.trim().slice(0, 100) })
      }
      if (/localStorage\.|sessionStorage\./i.test(line) && /\b(ssn|diagnosis|patient|health|medical)\b/i.test(line)) {
        issues.push({ type: 'HIPAA', message: 'PHI written to browser storage — HIPAA prohibits unencrypted PHI on client', line: i + 1, snippet: line.trim().slice(0, 100) })
      }
    })
  }

  return issues
}

const VIBE_RISK_COLOR = { High: '#f87171', Medium: '#facc15', Low: '#4ade80' }
const COMPLIANCE_COLOR = { GDPR: '#60a5fa', SOC2: '#a78bfa', HIPAA: '#f472b6' }

export default function VibeSecurityPage() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('JavaScript')
  const [autoDetected, setAutoDetected] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)
  const [expandedReplacements, setExpandedReplacements] = useState<Set<string>>(new Set())
  const [compliance, setCompliance] = useState({ gdpr: false, soc2: false, hipaa: false })
  const [complianceIssues, setComplianceIssues] = useState<ComplianceIssue[]>([])

  const vibeRisk = code.trim().length > 50 ? getVibeRiskScore(code) : null

  const handleCodeChange = (value: string) => {
    setCode(value)
    const detected = detectLanguage(value)
    if (detected) {
      setAutoDetected(detected)
      setLanguage(detected)
    } else {
      setAutoDetected('')
    }
  }

  const scan = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    setPaywall(false)
    setComplianceIssues([])
    try {
      const res = await fetch('/api/tools/vibe-security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      })
      const data = await res.json()
      if (data.paywall || res.status === 402) { setPaywall(true); return }
      if (!res.ok) throw new Error(data.error || 'Scan failed')
      setResult(data)
      if (compliance.gdpr || compliance.soc2 || compliance.hipaa) {
        setComplianceIssues(runComplianceChecks(code, compliance))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scan failed')
    } finally {
      setLoading(false)
    }
  }

  const toggleReplacement = (key: string) => {
    setExpandedReplacements(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const scoreColor = result ? (result.score >= 80 ? '#4ade80' : result.score >= 50 ? '#facc15' : '#f87171') : '#06d6ff'

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/tools" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: 'rgb(245,158,11)', borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)' }}>Live</span>
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#4ade80', borderColor: 'rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.08)' }}>Free scan available</span>
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: 'rgb(245,158,11)', borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)' }}>Full access from $49</span>
        </div>

        <h1 className="text-4xl font-black text-white mb-3">Vibe Coding <span style={{ color: 'rgb(245,158,11)' }}>Security Shield</span></h1>
        <p className="text-white/55 text-base mb-3 max-w-2xl">Paste AI-generated code for an instant OWASP security scan. Free scan here — license this tool for your platform from $49, or get all 51 tools from $99.</p>
        <div className="flex items-center gap-4 mb-8">
          <Link href="/pricing" className="text-sm font-bold hover:opacity-80 transition-opacity" style={{ color: 'rgb(245,158,11)' }}>Get this tool — $49 →</Link>
          <Link href="/pricing" className="text-sm text-white/40 hover:text-white/70 transition-colors">All 51 tools — from $99 →</Link>
        </div>

        <div className="rounded-xl border px-4 py-3 mb-6 text-xs text-amber-200/70" style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.15)' }}>
          <strong className="text-amber-400/90">Background:</strong> A record 35 CVEs in March 2026 were traced directly to AI-generated code — up from 6 in January. Every piece of AI-generated code should be reviewed before it ships.
        </div>

        <div className="rounded-2xl border p-6 mb-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <select
                value={language}
                onChange={e => { setLanguage(e.target.value); setAutoDetected('') }}
                className="text-sm text-white rounded-lg px-3 py-2 outline-none"
                style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
              {autoDetected && (
                <span className="text-xs text-white/40">Auto-detected: <span className="text-amber-400/80">{autoDetected}</span></span>
              )}
            </div>
            <button onClick={() => { setCode(EXAMPLE_CODE); setAutoDetected('') }} className="text-xs text-white/40 hover:text-white/70 transition-colors">
              Load example →
            </button>
          </div>

          <textarea
            value={code}
            onChange={e => handleCodeChange(e.target.value)}
            placeholder="Paste your code here..."
            rows={14}
            className="w-full text-sm text-white/80 placeholder-white/20 outline-none resize-y font-mono"
            style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '14px 16px', minHeight: 300 }}
          />

          {vibeRisk && (
            <div className="mt-3 flex items-start gap-3 p-3 rounded-lg" style={{ background: `${VIBE_RISK_COLOR[vibeRisk.level]}0d`, border: `1px solid ${VIBE_RISK_COLOR[vibeRisk.level]}22` }}>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex-shrink-0 mt-0.5" style={{ background: `${VIBE_RISK_COLOR[vibeRisk.level]}18`, color: VIBE_RISK_COLOR[vibeRisk.level], border: `1px solid ${VIBE_RISK_COLOR[vibeRisk.level]}44` }}>
                Vibe Risk: {vibeRisk.level}
              </span>
              <div className="min-w-0">
                <p className="text-xs" style={{ color: VIBE_RISK_COLOR[vibeRisk.level] }}>
                  {vibeRisk.level === 'High' ? 'This looks heavily AI-generated — scan carefully.' : vibeRisk.level === 'Medium' ? 'Some AI patterns detected — review before shipping.' : 'Looks manually reviewed.'}
                </p>
                {vibeRisk.signals.length > 0 && (
                  <p className="text-[11px] text-white/35 mt-0.5">{vibeRisk.signals.join(' · ')}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-4">
            <label className="flex items-center gap-2 text-xs text-white/50 cursor-pointer hover:text-white/70 transition-colors">
              <input type="checkbox" checked={compliance.gdpr} onChange={e => setCompliance(p => ({ ...p, gdpr: e.target.checked }))} className="accent-blue-400" />
              GDPR
            </label>
            <label className="flex items-center gap-2 text-xs text-white/50 cursor-pointer hover:text-white/70 transition-colors">
              <input type="checkbox" checked={compliance.soc2} onChange={e => setCompliance(p => ({ ...p, soc2: e.target.checked }))} className="accent-violet-400" />
              SOC2
            </label>
            <label className="flex items-center gap-2 text-xs text-white/50 cursor-pointer hover:text-white/70 transition-colors">
              <input type="checkbox" checked={compliance.hipaa} onChange={e => setCompliance(p => ({ ...p, hipaa: e.target.checked }))} className="accent-pink-400" />
              HIPAA
            </label>
          </div>

          <div className="flex items-center justify-between mt-4 gap-4 flex-wrap">
            <span className="text-xs text-white/30">{code.split('\n').length} lines · {code.length} chars</span>
            <button
              onClick={scan}
              disabled={loading || !code.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 0 20px rgba(245,158,11,0.3)' }}
            >
              {loading ? 'Scanning…' : 'Scan for Vulnerabilities'}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>
        )}

        {paywall && !loading && (
          <div className="rounded-2xl border p-8 text-center mb-6" style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.2)' }}>
            <svg className="w-10 h-10 mx-auto mb-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>
            <h3 className="text-xl font-black text-white mb-2">Unlock unlimited scans</h3>
            <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">License this tool for your own platform or subscribe for access to all 51 tools. $49 one-time · or $99 for all 51 tools.</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                Get this tool — $49
              </Link>
              <Link href="/pricing" className="text-sm text-white/45 hover:text-white transition-colors">All 51 tools from $99 →</Link>
            </div>
          </div>
        )}

        {!result && !loading && (
          <div className="mt-10 mb-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/25">Sample Report</span>
              <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
            <p className="text-xs text-white/30 text-center mb-6">This is what a real scan looks like. Load the example above and click Scan to generate yours.</p>

            <div className="rounded-2xl border p-6 flex flex-wrap items-center gap-8 mb-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="text-center">
                <div className="text-6xl font-black text-red-400">22</div>
                <div className="text-xs text-white/40 mt-1 font-bold uppercase tracking-wider">Security Score</div>
              </div>
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[{ sev: 'critical', n: 2 }, { sev: 'high', n: 3 }, { sev: 'medium', n: 2 }, { sev: 'low', n: 1 }].map(({ sev, n }) => (
                  <div key={sev} className="text-center">
                    <div className="text-2xl font-black" style={{ color: SEV_COLOR[sev] }}>{n}</div>
                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: SEV_COLOR[sev] }}>{sev}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-white/30">15 lines scanned</div>
            </div>

            {[
              { sev: 'critical', name: 'SQL Injection', line: 5, msg: 'String concatenation used to build SQL query. An attacker can inject arbitrary SQL. Use parameterized queries instead.', snippet: 'const query = "SELECT * FROM users WHERE id = " + id;', owasp: 'A03' },
              { sev: 'critical', name: 'Hardcoded API Key', line: 2, msg: 'API key detected in source code. Anyone with access to this file can use your key. Move to environment variables immediately.', snippet: 'const apiKey = "sk-abc123xyz456def789";', owasp: 'A07' },
              { sev: 'high', name: 'Hardcoded Password', line: 1, msg: 'Password detected as a string literal. Rotate this credential and store in a secrets manager.', snippet: 'const password = "supersecret123";', owasp: 'A07' },
              { sev: 'high', name: 'XSS via innerHTML', line: 14, msg: 'Setting innerHTML from user-controlled data allows cross-site scripting. Use textContent or a sanitizer.', snippet: "document.getElementById('output').innerHTML = userInput;", owasp: 'A03' },
              { sev: 'high', name: 'Stack Trace Exposed', line: 9, msg: 'Sending err.stack to the client leaks internal paths and logic to attackers. Log server-side only.', snippet: 'res.json({ error: err.message, stack: err.stack });', owasp: 'A05' },
            ].map((f, i) => (
              <div key={i} className="rounded-xl border p-4 mb-2" style={{ background: '#0d1117', borderColor: `${SEV_COLOR[f.sev]}22` }}>
                <div className="flex items-start gap-3">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex-shrink-0 mt-0.5" style={{ background: `${SEV_COLOR[f.sev]}18`, color: SEV_COLOR[f.sev], border: `1px solid ${SEV_COLOR[f.sev]}44` }}>{f.sev}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-bold text-white">{f.name}</span>
                      <span className="text-xs text-white/30">Line {f.line}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(148,163,184,0.1)', color: '#94a3b8' }}>{f.owasp}</span>
                    </div>
                    <p className="text-xs text-white/55 mb-2">{f.msg}</p>
                    <code className="text-xs font-mono px-2 py-1 rounded text-white/60 block overflow-x-auto" style={{ background: '#070b14' }}>{f.snippet}</code>
                  </div>
                </div>
              </div>
            ))}
            <p className="text-[10px] text-white/20 text-center mt-3">← This is a sample. Your scan results will appear here.</p>
          </div>
        )}

        {result && (
          <div className="space-y-5">
            <div className="rounded-2xl border p-6 flex flex-wrap items-center gap-8" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="text-center">
                <div className="text-6xl font-black" style={{ color: scoreColor }}>{result.score}</div>
                <div className="text-xs text-white/40 mt-1 font-bold uppercase tracking-wider">Security Score</div>
              </div>
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(['critical', 'high', 'medium', 'low'] as const).map(sev => (
                  <div key={sev} className="text-center">
                    <div className="text-2xl font-black" style={{ color: SEV_COLOR[sev] }}>{result.summary[sev]}</div>
                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: SEV_COLOR[sev] }}>{sev}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-white/30">{result.linesScanned} lines scanned</div>
            </div>

            {result.findings.length === 0 ? (
              <div className="rounded-2xl border p-8 text-center" style={{ background: 'rgba(74,222,128,0.05)', borderColor: 'rgba(74,222,128,0.2)' }}>
                <svg className="w-10 h-10 mx-auto mb-3 text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <div className="text-lg font-black text-white mb-1">No vulnerabilities detected</div>
                <div className="text-sm text-white/45">Clean scan — no known insecure patterns found in this code.</div>
              </div>
            ) : (
              <div className="space-y-3">
                {(['critical', 'high', 'medium', 'low'] as const).map(sev => {
                  const sevFindings = result.findings.filter(f => f.severity === sev)
                  if (!sevFindings.length) return null
                  return (
                    <div key={sev}>
                      <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: SEV_COLOR[sev] }}>{sev} ({sevFindings.length})</div>
                      {sevFindings.map((f, i) => {
                        const repKey = `${sev}-${i}`
                        const expanded = expandedReplacements.has(repKey)
                        return (
                          <div key={i} className="rounded-xl border p-4 mb-2" style={{ background: '#0d1117', borderColor: `${SEV_COLOR[sev]}22` }}>
                            <div className="flex items-start gap-3">
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex-shrink-0 mt-0.5" style={{ background: `${SEV_COLOR[sev]}18`, color: SEV_COLOR[sev], border: `1px solid ${SEV_COLOR[sev]}44` }}>{sev}</span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="text-sm font-bold text-white">{f.name}</span>
                                  <span className="text-xs text-white/30">Line {f.line}</span>
                                  {f.owasp && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(148,163,184,0.1)', color: '#94a3b8' }}>{f.owasp}</span>
                                  )}
                                </div>
                                <p className="text-xs text-white/55 mb-2">{f.message}</p>
                                {f.snippet && (
                                  <code className="text-xs font-mono px-2 py-1 rounded text-white/60 block overflow-x-auto mb-2" style={{ background: '#070b14' }}>{f.snippet}</code>
                                )}
                                {f.secureReplacement && (
                                  <div>
                                    <button
                                      onClick={() => toggleReplacement(repKey)}
                                      className="text-[11px] font-bold transition-colors mb-1"
                                      style={{ color: expanded ? '#4ade80' : '#4ade8088' }}
                                    >
                                      {expanded ? '▾ Secure version' : '▸ Secure version →'}
                                    </button>
                                    {expanded && (
                                      <pre className="text-xs font-mono px-3 py-2 rounded overflow-x-auto" style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)', color: '#86efac' }}>{f.secureReplacement}</pre>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )}

            {complianceIssues.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-widest mb-2 text-white/50">Compliance Issues ({complianceIssues.length})</div>
                {complianceIssues.map((issue, i) => (
                  <div key={i} className="rounded-xl border p-4 mb-2" style={{ background: '#0d1117', borderColor: `${COMPLIANCE_COLOR[issue.type]}22` }}>
                    <div className="flex items-start gap-3">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex-shrink-0 mt-0.5" style={{ background: `${COMPLIANCE_COLOR[issue.type]}18`, color: COMPLIANCE_COLOR[issue.type], border: `1px solid ${COMPLIANCE_COLOR[issue.type]}44` }}>{issue.type}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {issue.line > 0 && <span className="text-xs text-white/30">Line {issue.line}</span>}
                        </div>
                        <p className="text-xs text-white/55 mb-1">{issue.message}</p>
                        {issue.snippet && (
                          <code className="text-xs font-mono px-2 py-1 rounded text-white/60 block overflow-x-auto" style={{ background: '#070b14' }}>{issue.snippet}</code>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
