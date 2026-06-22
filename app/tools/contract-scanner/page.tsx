'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PaywallCard from '@/components/PaywallCard'

const SEV_COLOR: Record<string, string> = {
  critical: '#f87171',
  high: '#fb923c',
  medium: '#facc15',
  low: '#94a3b8',
}

const RISK_CONFIG: Record<string, { color: string; label: string }> = {
  low: { color: '#4ade80', label: 'Low Risk' },
  medium: { color: '#facc15', label: 'Medium Risk' },
  high: { color: '#fb923c', label: 'High Risk' },
  critical: { color: '#f87171', label: 'Critical Risk' },
}

const EXAMPLE = `SERVICE AGREEMENT

This Agreement is entered into between ACME Corp ("Company") and Contractor.

1. INTELLECTUAL PROPERTY. All work product, inventions, and developments created by Contractor during or related to this engagement shall be the sole and exclusive property of Company. Contractor irrevocably assigns all rights worldwide in perpetuity.

2. NON-COMPETE. For a period of 24 months following termination, Contractor shall not engage in any business that competes with Company's business anywhere in the United States.

3. LIABILITY. Company's total liability shall not exceed $100. Company shall not be liable for any indirect, incidental, or consequential damages.

4. TERMINATION. Company may terminate this agreement at any time for any reason with 0 days notice.

5. AUTOMATIC RENEWAL. This agreement renews automatically for successive 12-month terms unless written notice is provided 90 days prior to renewal.

6. AMENDMENT. Company reserves the right to amend these terms at any time with or without notice to Contractor.`

interface Clause {
  name: string
  severity: string
  quote: string
  risk: string
  recommendation: string
}

interface AnalysisResult {
  riskScore: number
  riskLevel: string
  summary: string
  clauses: Clause[]
  positives: string[]
  redFlags: string[]
  recommendations: string[]
  wordCount: number
}

export default function ContractScannerPage() {
  const [contractText, setContractText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)

  const analyze = async () => {
    if (!contractText.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    setPaywall(false)
    try {
      const res = await fetch('/api/tools/contract-scanner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractText }),
      })
      const data = await res.json()
      if (data.paywall || res.status === 402) { setPaywall(true); return }
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const riskCfg = result ? (RISK_CONFIG[result.riskLevel] ?? RISK_CONFIG.medium) : null

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/tools" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#a78bfa', borderColor: 'rgba(167,139,250,0.3)', background: 'rgba(167,139,250,0.08)' }}>Live</span>
          <span className="text-sm font-bold text-white/30">Pro Tool · 1 free scan/day · Unlimited with $79/month</span>
        </div>

        <h1 className="text-4xl font-black text-white mb-3">Contract <span style={{ color: '#a78bfa' }}>Risk Scanner</span></h1>
        <p className="text-white/55 text-base mb-4 max-w-2xl">
          Paste any contract, agreement, or terms document. AI instantly identifies risky clauses — one-sided IP grabs, overly broad non-competes, unlimited liability exposure, predatory auto-renewal, and more.
        </p>
        <div className="mb-6 px-4 py-3 rounded-xl border text-xs leading-relaxed" style={{ background: 'rgba(251,191,36,0.05)', borderColor: 'rgba(251,191,36,0.2)', color: 'rgba(251,191,36,0.7)' }}>
          This tool flags potentially risky language for your review. Output is not legal advice and does not create an attorney-client relationship. Have a licensed attorney review any contract before signing.
        </div>

        <div className="rounded-2xl border p-6 mb-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-white/35 font-mono">{contractText.split(/\s+/).filter(Boolean).length} words · {contractText.length} chars</span>
            <button onClick={() => setContractText(EXAMPLE)} className="text-xs text-white/40 hover:text-white/70 transition-colors">
              Load example →
            </button>
          </div>

          <textarea
            value={contractText}
            onChange={e => setContractText(e.target.value)}
            placeholder="Paste your contract, NDA, service agreement, employment contract, or any legal document here..."
            rows={16}
            className="w-full text-sm text-white/80 placeholder-white/20 outline-none resize-y"
            style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '14px 16px', minHeight: 320 }}
          />

          <div className="flex items-center justify-end mt-4">
            <button
              onClick={analyze}
              disabled={loading || !contractText.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 20px rgba(124,58,237,0.35)' }}
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Analyzing…
                </>
              ) : 'Scan for Risk'}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>
        )}

        {paywall && !loading && <PaywallCard toolId="contract-scanner" toolName="Contract Risk Scanner" monthlyPrice={19} freeLimit={1} accent="#f87171" />}

        {result && riskCfg && (
          <div className="space-y-5">
            {/* Risk Score */}
            <div className="rounded-2xl border p-6 flex flex-wrap items-center gap-8" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="text-center">
                <div className="text-6xl font-black" style={{ color: riskCfg.color }}>{result.riskScore}</div>
                <div className="text-xs text-white/40 mt-1 font-bold uppercase tracking-wider">Risk Score</div>
              </div>
              <div>
                <div className="text-xl font-black mb-1" style={{ color: riskCfg.color }}>{riskCfg.label}</div>
                <p className="text-sm text-white/60 max-w-xl leading-relaxed">{result.summary}</p>
                <p className="text-xs text-white/30 mt-2">{result.wordCount.toLocaleString()} words analyzed</p>
              </div>
            </div>

            {/* Red Flags */}
            {result.redFlags?.length > 0 && (
              <div className="rounded-xl border p-5" style={{ background: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.2)' }}>
                <p className="text-xs font-black uppercase tracking-widest text-red-400 mb-3">Red Flags ({result.redFlags.length})</p>
                <div className="space-y-1.5">
                  {result.redFlags.map((flag, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"/></svg>
                      {flag}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risky Clauses */}
            {result.clauses?.length > 0 && (
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-white/35 mb-3">Risky Clauses ({result.clauses.length})</p>
                <div className="space-y-3">
                  {result.clauses.map((clause, i) => (
                    <div key={i} className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: `${SEV_COLOR[clause.severity] ?? '#94a3b8'}22` }}>
                      <div className="flex items-start gap-3">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex-shrink-0 mt-0.5" style={{ background: `${SEV_COLOR[clause.severity]}18`, color: SEV_COLOR[clause.severity], border: `1px solid ${SEV_COLOR[clause.severity]}44` }}>
                          {clause.severity}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-white mb-2">{clause.name}</p>
                          {clause.quote && (
                            <blockquote className="text-xs text-white/45 italic border-l-2 pl-3 mb-2" style={{ borderColor: SEV_COLOR[clause.severity] }}>
                              "{clause.quote}"
                            </blockquote>
                          )}
                          <p className="text-xs text-white/55 mb-2"><span className="text-white/30 font-bold">Risk:</span> {clause.risk}</p>
                          <p className="text-xs text-white/55"><span className="text-white/30 font-bold">Negotiate:</span> {clause.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Positives */}
            {result.positives?.length > 0 && (
              <div className="rounded-xl border p-5" style={{ background: 'rgba(74,222,128,0.04)', borderColor: 'rgba(74,222,128,0.15)' }}>
                <p className="text-xs font-black uppercase tracking-widest text-green-400 mb-3">Favorable Language ({result.positives.length})</p>
                <div className="space-y-1.5">
                  {result.positives.map((pos, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-white/65">
                      <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-green-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      {pos}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations?.length > 0 && (
              <div className="rounded-xl border p-5" style={{ background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.15)' }}>
                <p className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-3">Top Recommendations</p>
                <ol className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-white/65">
                      <span className="text-xs font-black text-cyan-500 mt-0.5 flex-shrink-0">{i + 1}.</span>
                      {rec}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="text-center pt-2">
              <p className="text-xs text-white/25">This analysis is AI-generated and does not constitute legal advice. Consult a licensed attorney for binding decisions.</p>
            </div>
          </div>
        )}

        {!result && !loading && !paywall && (
          <div className="mt-8 rounded-xl border p-6" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-xs font-black uppercase tracking-widest text-white/25 mb-4">What gets flagged</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                ['IP Assignment', 'One-sided ownership grabs, perpetual rights transfer'],
                ['Non-Compete', 'Geographic scope, duration, breadth of restriction'],
                ['Liability Caps', 'Asymmetric limits, damage exclusions favoring one party'],
                ['Auto-Renewal', 'Long notice periods, difficult cancellation requirements'],
                ['Termination Rights', 'Unilateral termination, disproportionate notice periods'],
                ['Amendment Rights', 'Unilateral change clauses without consent'],
                ['Indemnification', 'Broad indemnity obligations, legal defense requirements'],
                ['Arbitration', 'Class action waivers, jurisdiction disadvantages'],
              ].map(([name, desc]) => (
                <div key={name} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white/60">{name}</p>
                    <p className="text-xs text-white/30">{desc}</p>
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
