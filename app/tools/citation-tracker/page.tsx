'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const INDUSTRIES = [
  'Plumbing', 'HVAC', 'Electrician', 'Restaurant', 'Law Firm',
  'Accounting / CPA', 'Dentist', 'Real Estate', 'Auto Repair',
  'Landscaping', 'Marketing Agency', 'Web Design / Development',
  'Personal Trainer', 'General Contractor', 'Roofing', 'Pest Control',
  'Cleaning Service', 'Chiropractor', 'Veterinarian', 'Other',
]

interface CitationResult {
  businessName: string
  city: string
  industry: string
  mentioned: boolean
  mentionContext: string
  competitors: string
  improvements: string
  scanId: string
  scannedAt: string
}

export default function CitationTrackerPage() {
  const [businessName, setBusinessName] = useState('')
  const [city, setCity] = useState('')
  const [industry, setIndustry] = useState('')
  const [customIndustry, setCustomIndustry] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CitationResult | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)
  const [setupRequired, setSetupRequired] = useState(false)
  const [used, setUsed] = useState(false)

  const effectiveIndustry = industry === 'Other' ? customIndustry : industry

  const check = async () => {
    if (!businessName.trim() || !city.trim() || !effectiveIndustry.trim()) return
    if (used) { setPaywall(true); return }
    setLoading(true)
    setError('')
    setResult(null)
    setPaywall(false)
    try {
      const res = await fetch('/api/tools/citation-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName: businessName.trim(), city: city.trim(), industry: effectiveIndustry.trim() }),
      })
      const data = await res.json()
      if (data.setup_required) { setSetupRequired(true); return }
      if (data.paywall || res.status === 402) { setPaywall(true); return }
      if (!res.ok) throw new Error(data.error || 'Check failed')
      setResult(data)
      setUsed(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Check failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/tools" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#06d6ff', borderColor: 'rgba(6,214,255,0.3)', background: 'rgba(6,214,255,0.08)' }}>New Tool</span>
          <span className="text-sm font-bold text-white/30">Pro · Unlimited with $29/month</span>
        </div>

        <h1 className="text-4xl font-black text-white mb-3">
          Does ChatGPT Know<br /><span style={{ color: '#06d6ff' }}>Your Business?</span>
        </h1>
        <p className="text-white/55 text-base mb-10 max-w-2xl">
          We ask ChatGPT the same questions your customers do — and tell you exactly what it says about your business, who it recommends instead, and what to fix.
        </p>

        {setupRequired && (
          <div className="rounded-2xl border p-8 mb-6 text-center" style={{ background: 'rgba(6,214,255,0.05)', borderColor: 'rgba(6,214,255,0.2)' }}>
            <svg className="w-10 h-10 mx-auto mb-4 text-cyan-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"/></svg>
            <h3 className="text-xl font-black text-white mb-2">OpenAI API Key Required</h3>
            <p className="text-white/50 text-sm mb-2 max-w-md mx-auto">The AI Citation Tracker needs an OpenAI API key to query ChatGPT.</p>
            <p className="text-white/35 text-xs">Admin: add <code className="bg-white/5 px-1.5 py-0.5 rounded text-cyan-400">OPENAI_API_KEY</code> to Vercel environment variables to enable this tool.</p>
          </div>
        )}

        {!setupRequired && (
          <div className="rounded-2xl border p-6 mb-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="e.g. Sunrise Plumbing"
                  className="w-full text-sm text-white placeholder-white/20 outline-none rounded-lg px-4 py-2.5"
                  style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">City &amp; State</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Denver, CO"
                  className="w-full text-sm text-white placeholder-white/20 outline-none rounded-lg px-4 py-2.5"
                  style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">Industry / Category</label>
              <select
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full text-sm text-white outline-none rounded-lg px-4 py-2.5 mb-2"
                style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <option value="">Select an industry…</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              {industry === 'Other' && (
                <input
                  type="text"
                  value={customIndustry}
                  onChange={e => setCustomIndustry(e.target.value)}
                  placeholder="Describe your industry or category"
                  className="w-full text-sm text-white placeholder-white/20 outline-none rounded-lg px-4 py-2.5"
                  style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              )}
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p className="text-xs text-white/25">1 free check · Unlimited with Pro ($29/month)</p>
              <button
                onClick={check}
                disabled={loading || !businessName.trim() || !city.trim() || !effectiveIndustry.trim()}
                className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 20px rgba(6,182,212,0.3)' }}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Asking ChatGPT…
                  </>
                ) : 'Check My AI Citations →'}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>
        )}

        {paywall && (
          <div className="rounded-2xl border p-8 text-center mb-6" style={{ background: 'rgba(6,214,255,0.05)', borderColor: 'rgba(6,214,255,0.2)' }}>
            <svg className="w-10 h-10 mx-auto mb-4 text-cyan-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>
            <h3 className="text-xl font-black text-white mb-2">Unlock Unlimited Checks with Pro</h3>
            <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">You&apos;ve used your free AI citation check. Pro subscribers get unlimited checks across all tools — $29/month, cancel anytime.</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/monitor" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
                Start Pro — $29/month
              </Link>
              <Link href="/pricing" className="text-sm text-white/45 hover:text-white transition-colors">See all features →</Link>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Status banner */}
            {result.mentioned ? (
              <div className="rounded-2xl border p-5 flex items-center gap-4" style={{ background: 'rgba(74,222,128,0.07)', borderColor: 'rgba(74,222,128,0.25)' }}>
                <svg className="w-7 h-7 flex-shrink-0 text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <div>
                  <p className="text-base font-black text-green-400">ChatGPT knows about {result.businessName}</p>
                  <p className="text-xs text-white/40 mt-0.5">Your business has some AI visibility. Monitor it monthly to stay ahead.</p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border p-5 flex items-center gap-4" style={{ background: 'rgba(248,113,113,0.07)', borderColor: 'rgba(248,113,113,0.25)' }}>
                <svg className="w-7 h-7 flex-shrink-0 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
                <div>
                  <p className="text-base font-black text-red-400">ChatGPT doesn&apos;t seem to know about {result.businessName}</p>
                  <p className="text-xs text-white/40 mt-0.5">Your business is invisible to AI search. See the fix checklist below.</p>
                </div>
              </div>
            )}

            {/* What ChatGPT says */}
            <div className="rounded-2xl border p-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-white/35 mb-3">What ChatGPT Says About You</p>
              <blockquote className="text-sm text-white/65 leading-relaxed italic border-l-2 border-white/10 pl-4">
                {result.mentionContext}
              </blockquote>
            </div>

            {/* Competitors */}
            <div className="rounded-2xl border p-6" style={{ background: '#0d1117', borderColor: 'rgba(248,113,113,0.15)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-red-400/70 mb-1">Who ChatGPT Recommends Instead</p>
              <p className="text-xs text-white/30 mb-3">When customers ask ChatGPT for {result.industry} in {result.city}, it currently recommends:</p>
              <div className="text-sm text-white/65 leading-relaxed whitespace-pre-wrap">{result.competitors}</div>
            </div>

            {/* Improvements */}
            <div className="rounded-2xl border p-6" style={{ background: 'rgba(6,214,255,0.04)', borderColor: 'rgba(6,214,255,0.15)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-400/70 mb-3">How to Get ChatGPT to Cite You</p>
              <div className="text-sm text-white/65 leading-relaxed whitespace-pre-wrap">{result.improvements}</div>
            </div>

            {/* CTA */}
            <div className="rounded-2xl border p-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div>
                <p className="text-base font-black text-white mb-1">
                  {result.mentioned ? 'Keep your citation status.' : 'Start fixing your AI visibility.'}
                </p>
                <p className="text-sm text-white/45">
                  {result.mentioned
                    ? 'Monitor monthly so you know if ChatGPT stops recommending you.'
                    : 'Scan your site free to see exactly which signals are missing.'}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
                {result.mentioned ? (
                  <Link href="/monitor" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
                    Monitor Monthly →
                  </Link>
                ) : (
                  <>
                    <Link href="/scanner" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
                      Fix It — Free Scan →
                    </Link>
                    <Link href="/monitor" className="text-sm text-white/45 hover:text-white transition-colors">Monitor monthly →</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
