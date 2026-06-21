'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const EXAMPLE_NPM = `{
  "dependencies": {
    "react": "^18.2.0",
    "next": "14.0.0",
    "langchain-helpers": "^1.0.0",
    "openai-utils-pro": "^2.1.0",
    "axios": "^1.6.0",
    "lodash": "^4.17.21"
  }
}`

const EXAMPLE_PYTHON = `requests==2.31.0
fastapi==0.104.1
langchain==0.0.350
anthropic==0.7.0
ai-helper-utils==1.0.0
numpy==1.24.0
pydantic==2.5.0`

const RISK_CONFIG: Record<string, { color: string; label: string; bg: string; border: string }> = {
  clean: { color: '#4ade80', label: 'All Clear', bg: 'rgba(74,222,128,0.05)', border: 'rgba(74,222,128,0.2)' },
  low: { color: '#facc15', label: 'Low Risk', bg: 'rgba(250,204,21,0.05)', border: 'rgba(250,204,21,0.2)' },
  medium: { color: '#fb923c', label: 'Medium Risk', bg: 'rgba(251,146,60,0.05)', border: 'rgba(251,146,60,0.2)' },
  critical: { color: '#f87171', label: 'Critical', bg: 'rgba(248,113,113,0.05)', border: 'rgba(248,113,113,0.2)' },
}

const LEVEL_COLOR: Record<string, string> = {
  'not-found': '#f87171',
  'very-new': '#fb923c',
  'new': '#facc15',
  'none': '#4ade80',
}

const LEVEL_LABEL: Record<string, string> = {
  'not-found': 'NOT FOUND',
  'very-new': 'VERY NEW',
  'new': 'NEW',
  'none': 'VERIFIED',
}

interface PackageResult {
  name: string
  version: string
  exists: boolean
  ageInDays: number | null
  suspicious: boolean
  suspicionLevel: string
  reason: string
  registryUrl: string
}

interface ScanResult {
  type: string
  totalChecked: number
  truncated: boolean
  results: PackageResult[]
  summary: { notFound: number; veryNew: number; new: number; clean: number }
  riskLevel: string
  checkedAt: string
}

export default function PackageHallucinationPage() {
  const [content, setContent] = useState('')
  const [type, setType] = useState<'npm' | 'python'>('npm')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)

  const scan = async () => {
    if (!content.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    setPaywall(false)
    try {
      const res = await fetch('/api/tools/package-hallucination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type }),
      })
      const data = await res.json()
      if (data.paywall || res.status === 402) { setPaywall(true); return }
      if (!res.ok) throw new Error(data.error || 'Scan failed')
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scan failed')
    } finally {
      setLoading(false)
    }
  }

  const riskCfg = result ? (RISK_CONFIG[result.riskLevel] ?? RISK_CONFIG.clean) : null
  const suspicious = result?.results.filter(r => r.suspicious) ?? []
  const clean = result?.results.filter(r => !r.suspicious) ?? []

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/tools" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#fb923c', borderColor: 'rgba(251,146,60,0.3)', background: 'rgba(251,146,60,0.08)' }}>Live</span>
          <span className="text-sm font-bold text-white/30">Pro Tool · 2 free scans/day · Unlimited with $79/month</span>
        </div>

        <h1 className="text-4xl font-black text-white mb-3">Hallucinated <span style={{ color: '#fb923c' }}>Package Detector</span></h1>
        <p className="text-white/55 text-base mb-8 max-w-2xl">
          AI coding assistants invent package names that don&apos;t exist — or reference packages so new they&apos;re likely malicious. Paste your <code className="text-orange-400">package.json</code> or <code className="text-orange-400">requirements.txt</code> and verify every dependency against the live registry.
        </p>

        <div className="rounded-2xl border p-6 mb-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setType('npm')}
                className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                style={type === 'npm' ? { background: 'rgba(251,146,60,0.15)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.3)' } : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                npm (package.json)
              </button>
              <button
                onClick={() => setType('python')}
                className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                style={type === 'python' ? { background: 'rgba(251,146,60,0.15)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.3)' } : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Python (requirements.txt)
              </button>
            </div>
            <button
              onClick={() => setContent(type === 'npm' ? EXAMPLE_NPM : EXAMPLE_PYTHON)}
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Load example →
            </button>
          </div>

          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={type === 'npm' ? 'Paste your package.json here...' : 'Paste your requirements.txt here...'}
            rows={14}
            className="w-full text-sm text-white/80 placeholder-white/20 outline-none resize-y font-mono"
            style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '14px 16px', minHeight: 280 }}
          />

          <div className="flex items-center justify-end mt-4">
            <button
              onClick={scan}
              disabled={loading || !content.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 0 20px rgba(249,115,22,0.35)' }}
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Checking registry…
                </>
              ) : 'Verify All Packages'}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>
        )}

        {paywall && !loading && (
          <div className="rounded-2xl border p-8 text-center mb-6" style={{ background: 'rgba(251,146,60,0.05)', borderColor: 'rgba(251,146,60,0.2)' }}>
            <svg className="w-10 h-10 mx-auto mb-4 text-orange-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>
            <h3 className="text-xl font-black text-white mb-2">Unlimited checks with Pro</h3>
            <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">Pro subscribers get unlimited package verification, all security tools, and monthly AI visibility monitoring — $79/month, cancel anytime.</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/monitor" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
                Start Pro — $79/month
              </Link>
              <Link href="/pricing" className="text-sm text-white/45 hover:text-white transition-colors">See all features →</Link>
            </div>
          </div>
        )}

        {result && riskCfg && (
          <div className="space-y-5">
            {/* Summary */}
            <div className="rounded-2xl border p-6" style={{ background: riskCfg.bg, borderColor: riskCfg.border }}>
              <div className="flex flex-wrap items-center gap-8">
                <div>
                  <p className="text-3xl font-black mb-1" style={{ color: riskCfg.color }}>{riskCfg.label}</p>
                  <p className="text-sm text-white/50">{result.totalChecked} packages verified against live {result.type === 'python' ? 'PyPI' : 'npm'} registry</p>
                  {result.truncated && <p className="text-xs text-white/30 mt-1">Limited to first 50 packages</p>}
                </div>
                <div className="flex gap-6 flex-wrap">
                  {[
                    { label: 'Not Found', value: result.summary.notFound, color: '#f87171' },
                    { label: 'Very New (<7d)', value: result.summary.veryNew, color: '#fb923c' },
                    { label: 'New (<30d)', value: result.summary.new, color: '#facc15' },
                    { label: 'Verified', value: result.summary.clean, color: '#4ade80' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center">
                      <p className="text-2xl font-black" style={{ color }}>{value}</p>
                      <p className="text-xs text-white/40">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Suspicious packages */}
            {suspicious.length > 0 && (
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-white/35 mb-3">Flagged ({suspicious.length})</p>
                <div className="space-y-2">
                  {suspicious.map((pkg, i) => (
                    <div key={i} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: `${LEVEL_COLOR[pkg.suspicionLevel]}22` }}>
                      <div className="flex items-start gap-3 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex-shrink-0" style={{ background: `${LEVEL_COLOR[pkg.suspicionLevel]}18`, color: LEVEL_COLOR[pkg.suspicionLevel], border: `1px solid ${LEVEL_COLOR[pkg.suspicionLevel]}44` }}>
                          {LEVEL_LABEL[pkg.suspicionLevel]}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-bold text-white font-mono">{pkg.name}</span>
                            {pkg.version && <span className="text-xs text-white/35 font-mono">{pkg.version}</span>}
                            <a href={pkg.registryUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-white/25 hover:text-white/50 transition-colors">registry →</a>
                          </div>
                          <p className="text-xs text-white/50">{pkg.reason}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clean packages */}
            {clean.length > 0 && (
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-white/35 mb-3">Verified Clean ({clean.length})</p>
                <div className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="flex flex-wrap gap-2">
                    {clean.map((pkg, i) => (
                      <a key={i} href={pkg.registryUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-mono transition-colors hover:bg-white/10"
                        style={{ background: 'rgba(74,222,128,0.06)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.15)' }}>
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        {pkg.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!result && !loading && !paywall && (
          <div className="mt-8 rounded-xl border p-6" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-xs font-black uppercase tracking-widest text-white/25 mb-4">Why this matters</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: 'AI hallucination', desc: 'ChatGPT, Claude, and Copilot regularly suggest package names that don\'t exist in any registry. Installing them can pull malicious lookalikes.' },
                { title: 'Dependency confusion', desc: 'Attackers register packages with the same name as private internal packages. Your CI/CD installs the malicious public version instead.' },
                { title: 'Typosquatting', desc: 'Packages named similarly to popular ones (requets, lodashs) are registered to capture copy-paste mistakes.' },
                { title: 'Supply chain attacks', desc: 'Newly registered packages are the highest risk period. Verifying age catches packages created to look legitimate but aren\'t.' },
              ].map(({ title, desc }) => (
                <div key={title} className="flex items-start gap-2.5">
                  <div className="w-1 h-1 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white/60 mb-0.5">{title}</p>
                    <p className="text-xs text-white/30 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
