'use client'
import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface SchemaResult { '@type': string; valid: boolean; errors: string[]; warnings: string[]; properties: string[] }
interface Result {
  url: string
  aiVisibilityScore: number
  schemasFound: number
  typesFound: string[]
  missingHighValueTypes: string[]
  recommendations: string[]
  schemas: SchemaResult[]
  hasMicrodata: boolean
  checkedAt: string
}

function ScoreRing({ score }: { score: number }) {
  const r = 44; const c = 2 * Math.PI * r
  const color = score >= 70 ? '#4ade80' : score >= 40 ? '#facc15' : '#f87171'
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
      <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={`${(score / 100) * c} ${c}`} strokeDashoffset={c * 0.25} style={{ transition: 'stroke-dasharray 0.6s ease' }}/>
      <text x="60" y="56" textAnchor="middle" fill="white" fontSize="26" fontWeight="900" fontFamily="inherit">{score}</text>
      <text x="60" y="72" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10" fontWeight="700" fontFamily="inherit">/ 100</text>
    </svg>
  )
}

export default function SchemaValidatorPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const analyze = async () => {
    if (!url.trim()) return
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    try {
      const res = await fetch('/api/tools/schema-validator', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (data.paywall || res.status === 402) { setPaywall(true); return }
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setResult(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Analysis failed') }
    finally { setLoading(false) }
  }

  const toggle = (i: number) => setExpanded(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n })

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/tools" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>All Tools
        </Link>
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#06d6ff', borderColor: 'rgba(6,214,255,0.3)', background: 'rgba(6,214,255,0.08)' }}>Live</span>
          <span className="text-sm font-bold text-white/30">2 free analyses/day Â· Unlimited with Pro</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">Schema.org <span style={{ color: '#06d6ff' }}>AI Visibility Validator</span></h1>
        <p className="text-white/55 text-base mb-8 max-w-xl">Extract and validate JSON-LD structured data from any URL. Get an AI visibility score showing how likely your content is to appear in ChatGPT, Perplexity, and Gemini answers.</p>

        <div className="rounded-2xl border p-6 mb-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Page URL</label>
          <div className="flex gap-3">
            <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && analyze()}
              placeholder="https://example.com/your-page" className="flex-1 text-sm text-white placeholder-white/20 outline-none"
              style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 16px' }} />
            <button onClick={analyze} disabled={loading || !url.trim()}
              className="px-5 py-3 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.02] disabled:opacity-50 whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 16px rgba(6,214,255,0.25)' }}>
              {loading ? 'Fetchingâ€¦' : 'Analyze'}
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>}
        {paywall && !loading && (
          <div className="rounded-2xl border p-8 text-center mb-6" style={{ background: 'rgba(6,214,255,0.05)', borderColor: 'rgba(6,214,255,0.2)' }}>
            <h3 className="text-xl font-black text-white mb-2">Full AI visibility monitoring with Pro</h3>
            <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">Pro includes monthly AI visibility scans across your entire site, schema recommendations, and competitor benchmarking â€” $79/month.</p>
            <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Start Pro â€” $79/month</Link>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="rounded-2xl border p-6 flex gap-6 items-center" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <ScoreRing score={result.aiVisibilityScore} />
              <div className="flex-1">
                <div className="text-lg font-black text-white mb-1">AI Visibility Score</div>
                <div className="text-xs text-white/40 mb-3">Based on Schema.org structured data extracted from your page</div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>{result.schemasFound} schema{result.schemasFound !== 1 ? 's' : ''} found</span>
                  {result.hasMicrodata && <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>Microdata present</span>}
                  {result.typesFound.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: 'rgba(6,214,255,0.08)', color: '#06d6ff', border: '1px solid rgba(6,214,255,0.2)' }}>{t}</span>)}
                </div>
              </div>
            </div>

            {result.recommendations.length > 0 && (
              <div className="rounded-xl border px-5 py-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="text-xs font-black uppercase tracking-widest text-white/35 mb-3">AI Visibility Recommendations</div>
                <ul className="space-y-2">
                  {result.recommendations.map((r, i) => <li key={i} className="text-sm text-white/65 flex items-start gap-2"><span style={{ color: '#06d6ff' }} className="flex-shrink-0 mt-0.5">â†’</span>{r}</li>)}
                </ul>
              </div>
            )}

            {result.missingHighValueTypes.length > 0 && (
              <div className="rounded-xl border px-5 py-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="text-xs font-black uppercase tracking-widest text-white/35 mb-3">High-Value Schema Types You&apos;re Missing</div>
                <div className="flex flex-wrap gap-2">
                  {result.missingHighValueTypes.map(t => <span key={t} className="text-xs px-3 py-1 rounded-full font-mono" style={{ background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>{t}</span>)}
                </div>
              </div>
            )}

            {result.schemas.map((s, i) => (
              <div key={i} className="rounded-xl border overflow-hidden" style={{ borderColor: s.valid ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)' }}>
                <button onClick={() => toggle(i)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black px-2 py-0.5 rounded" style={{ background: s.valid ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', color: s.valid ? '#4ade80' : '#f87171', border: `1px solid ${s.valid ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}` }}>{s.valid ? 'Valid' : 'Issues'}</span>
                    <span className="font-black text-white font-mono text-sm">{s['@type']}</span>
                  </div>
                  <svg className={`w-4 h-4 text-white/30 transition-transform ${expanded.has(i) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                </button>
                {expanded.has(i) && (
                  <div className="border-t px-5 py-4 space-y-3" style={{ background: '#0a0f1a', borderColor: 'rgba(255,255,255,0.05)' }}>
                    {s.errors.map((e, j) => <div key={j} className="text-xs text-red-400 flex gap-2"><span>âœ•</span>{e}</div>)}
                    {s.warnings.map((w, j) => <div key={j} className="text-xs text-yellow-400 flex gap-2"><span>!</span>{w}</div>)}
                    <div><div className="text-xs font-black text-white/30 mb-1.5 uppercase tracking-wider">Properties</div>
                      <div className="flex flex-wrap gap-1.5">{s.properties.map(p => <span key={p} className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>{p}</span>)}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className="rounded-xl border px-5 py-4" style={{ background: 'rgba(6,214,255,0.04)', borderColor: 'rgba(6,214,255,0.15)' }}>
              <p className="text-xs text-white/50">Want a full AI visibility report across your entire site? <Link href="/pricing" className="font-bold text-cyan-400 hover:underline">Queldrex Pro</Link> monitors all your pages monthly and tracks how often you appear in AI-generated answers.</p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
