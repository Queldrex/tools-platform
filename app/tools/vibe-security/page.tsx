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
}

interface ScanResult {
  findings: Finding[]
  summary: { critical: number; high: number; medium: number; low: number; total: number }
  linesScanned: number
  score: number
}

export default function VibeSecurityPage() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('JavaScript')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')
  const [scanCount, setScanCount] = useState(0)

  const scan = async () => {
    if (!code.trim()) return
    if (scanCount >= 1) return // show paywall
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/tools/vibe-security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Scan failed')
      setResult(data)
      setScanCount(c => c + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scan failed')
    }
    setLoading(false)
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
          <span className="text-sm font-bold text-white/30">Pro Tool · Unlimited with $29/month</span>
        </div>

        <h1 className="text-4xl font-black text-white mb-3">Vibe Coding <span style={{ color: 'rgb(245,158,11)' }}>Security Shield</span></h1>
        <p className="text-white/55 text-base mb-8 max-w-2xl">Paste any AI-generated code. Instantly scan for OWASP vulnerabilities, hardcoded secrets, injection risks, and insecure patterns before they ship.</p>

        <div className="rounded-2xl border p-6 mb-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="text-sm text-white rounded-lg px-3 py-2 outline-none"
              style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
            <button
              onClick={() => setCode(EXAMPLE_CODE)}
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Load example →
            </button>
          </div>

          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Paste your code here..."
            rows={14}
            className="w-full text-sm text-white/80 placeholder-white/20 outline-none resize-y font-mono"
            style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '14px 16px', minHeight: 300 }}
          />

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

        {/* Paywall */}
        {scanCount >= 1 && !loading && (
          <div className="rounded-2xl border p-8 text-center mb-6" style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.2)' }}>
            <svg className="w-10 h-10 mx-auto mb-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>
            <h3 className="text-xl font-black text-white mb-2">Unlimited scans with Pro</h3>
            <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">Pro subscribers get unlimited code scans, all tools, and monthly AI visibility monitoring — $29/month, cancel anytime.</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/monitor" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
                Start Pro — $29/month
              </Link>
              <Link href="/pricing" className="text-sm text-white/45 hover:text-white transition-colors">See all features →</Link>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-5">
            {/* Score */}
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
                      {sevFindings.map((f, i) => (
                        <div key={i} className="rounded-xl border p-4 mb-2" style={{ background: '#0d1117', borderColor: `${SEV_COLOR[sev]}22` }}>
                          <div className="flex items-start gap-3">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex-shrink-0 mt-0.5" style={{ background: `${SEV_COLOR[sev]}18`, color: SEV_COLOR[sev], border: `1px solid ${SEV_COLOR[sev]}44` }}>{sev}</span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-sm font-bold text-white">{f.name}</span>
                                <span className="text-xs text-white/30">Line {f.line}</span>
                              </div>
                              <p className="text-xs text-white/55 mb-2">{f.message}</p>
                              {f.snippet && (
                                <code className="text-xs font-mono px-2 py-1 rounded text-white/60 block overflow-x-auto" style={{ background: '#070b14' }}>{f.snippet}</code>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
