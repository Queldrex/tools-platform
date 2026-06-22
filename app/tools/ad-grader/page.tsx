'use client'
import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

type Platform = 'google' | 'meta' | 'linkedin' | 'twitter' | 'email'
const PLATFORMS: { id: Platform; label: string }[] = [
  { id: 'google', label: 'Google Ads' },
  { id: 'meta', label: 'Meta / Facebook' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'twitter', label: 'Twitter / X' },
  { id: 'email', label: 'Email Subject' },
]

interface Result {
  score: number; grade: string; platform: string; characterCount: number; wordCount: number
  breakdown: { length: number; cta: number; clarity: number; urgency: number; socialProof: number; spamFlags: number; spamFlagList: string[] }
  qualitative: { emotionalAppeal: number; valueProposition: number; brandVoice: number; summary: string; topImprovement: string; rewrittenVersion: string }
}

const GRADE_COLOR: Record<string, string> = { 'A+': '#4ade80', A: '#86efac', B: '#facc15', C: '#fb923c', F: '#f87171' }

function ScoreBar({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = Math.round((score / max) * 100)
  const color = pct >= 70 ? '#4ade80' : pct >= 40 ? '#facc15' : '#f87171'
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-white/50">{label}</span>
        <span className="font-bold" style={{ color }}>{score}/{max}</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export default function AdGraderPage() {
  const [copy, setCopy] = useState('')
  const [platform, setPlatform] = useState<Platform>('meta')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)
  const [copied, setCopied] = useState(false)

  const grade = async () => {
    if (!copy.trim()) return
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    try {
      const res = await fetch('/api/tools/ad-grader', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ copy, platform }) })
      const data = await res.json()
      if (data.paywall || res.status === 402) { setPaywall(true); return }
      if (!res.ok) throw new Error(data.error || 'Grading failed')
      setResult(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Grading failed') }
    finally { setLoading(false) }
  }

  const gradeColor = result ? (GRADE_COLOR[result.grade] ?? '#fb923c') : '#fb923c'

  const loadExample = () => {
    const exampleCopy = "Tired of overpaying for security tools? Get real CVE scanning, SSL inspection, and email deliverability checks — all in one place. Start free, no credit card. 48 professional tools for developers and businesses. Try Queldrex today."
    setPlatform('meta')
    setCopy(exampleCopy)
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    fetch('/api/tools/ad-grader', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ copy: exampleCopy, platform: 'meta' }) })
      .then(r => r.json()).then(data => {
        if (data.paywall) { setPaywall(true); return }
        setResult(data)
      }).catch(e => setError(e.message)).finally(() => setLoading(false))
  }

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/tools" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          All Tools
        </Link>
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#fb923c', borderColor: 'rgba(251,146,60,0.3)', background: 'rgba(251,146,60,0.08)' }}>Live</span>
          <span className="text-sm font-bold text-white/30">3 free grades/day · Unlimited with $79/month Pro</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">Ad Copy <span style={{ color: '#fb923c' }}>Grader</span></h1>
        <p className="text-white/55 text-base mb-6 max-w-2xl">Paste any ad copy and get an instant score on length, CTA strength, clarity, urgency, and social proof — plus an AI-improved rewrite.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">How it works</p>
            <p className="text-sm text-white/60 leading-relaxed">Scores your ad copy across 6 deterministic dimensions (length, CTA strength, clarity, urgency, social proof, spam flags) plus 3 AI-scored dimensions (emotional appeal, value proposition, brand voice). The AI also rewrites your copy with the same length constraints — so you get an improved version you can A/B test immediately.</p>
          </div>
          <div className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">What you get</p>
            <ul className="space-y-2">
              {['Overall score (0-100) with letter grade', 'Breakdown by dimension — see exactly what to fix', 'Rewritten version of your copy, same platform/length', 'Spam flag detection — words that trigger spam filters', 'Platform-specific length scoring (Google vs Meta vs LinkedIn)'].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/55">
                  <span className="text-green-400 mt-0.5 flex-shrink-0">âœ“</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border p-6 mb-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex flex-wrap gap-2 mb-4">
            {PLATFORMS.map(p => (
              <button key={p.id} onClick={() => setPlatform(p.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={platform === p.id ? { background: 'rgba(251,146,60,0.15)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.3)' } : { background: 'transparent', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {p.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <textarea value={copy} onChange={e => setCopy(e.target.value)} placeholder="Paste your ad copy here..." rows={6}
              className="w-full text-sm text-white/80 placeholder-white/20 outline-none resize-y"
              style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '14px 16px', minHeight: 140 }} />
            <span className="absolute bottom-3 right-3 text-xs text-white/25 font-mono">{copy.length} chars</span>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={loadExample} className="px-4 py-3 rounded-xl text-sm font-bold border transition-colors hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>Try Example →</button>
            <button onClick={grade} disabled={loading || !copy.trim()}
              className="px-6 py-3 rounded-xl text-sm font-black text-white disabled:opacity-40 transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 0 20px rgba(249,115,22,0.3)' }}>
              {loading ? 'Grading…' : 'Grade My Copy'}
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-900/40 bg-red-950/20 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>}
        {paywall && !loading && (
          <div className="rounded-2xl border p-8 text-center mb-6" style={{ background: 'rgba(251,146,60,0.05)', borderColor: 'rgba(251,146,60,0.2)' }}>
            <h3 className="text-xl font-black text-white mb-2">Unlimited grading with Pro</h3>
            <p className="text-white/50 text-sm mb-6">Grade unlimited ad copy across all platforms — $79/month.</p>
            <Link href="/pricing" className="inline-flex px-6 py-3 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Start Pro — $79/month</Link>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="rounded-2xl border p-6 flex items-center gap-8" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="text-center flex-shrink-0">
                <div className="text-7xl font-black leading-none" style={{ color: gradeColor }}>{result.grade}</div>
                <div className="text-xs text-white/35 mt-1 font-bold uppercase tracking-wider">Grade</div>
              </div>
              <div className="flex-1">
                <div className="text-3xl font-black text-white mb-1">{result.score}<span className="text-lg text-white/30">/100</span></div>
                <p className="text-sm text-white/55">{result.characterCount} characters · {result.wordCount} words · {result.platform}</p>
                {result.qualitative.summary && <p className="text-sm text-white/60 mt-2 italic">"{result.qualitative.summary}"</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-4">Score Breakdown</p>
                <ScoreBar label="Length" score={result.breakdown.length} max={20} />
                <ScoreBar label="Call to Action" score={result.breakdown.cta} max={20} />
                <ScoreBar label="Clarity" score={result.breakdown.clarity} max={20} />
                <ScoreBar label="Urgency" score={result.breakdown.urgency} max={15} />
                <ScoreBar label="Social Proof" score={result.breakdown.socialProof} max={15} />
                {result.breakdown.spamFlagList?.length > 0 && (
                  <div className="mt-3 rounded-lg px-3 py-2" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <p className="text-xs font-bold text-red-400">Spam flags: {result.breakdown.spamFlagList.join(', ')}</p>
                  </div>
                )}
              </div>

              <div className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-4">AI Analysis</p>
                <ScoreBar label="Emotional Appeal" score={Number(result.qualitative.emotionalAppeal)} max={10} />
                <ScoreBar label="Value Proposition" score={Number(result.qualitative.valueProposition)} max={10} />
                <ScoreBar label="Brand Voice" score={Number(result.qualitative.brandVoice)} max={10} />
                {result.qualitative.topImprovement && (
                  <div className="mt-3 rounded-lg px-3 py-2" style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)' }}>
                    <p className="text-xs font-black uppercase tracking-widest text-orange-400 mb-1">Top Fix</p>
                    <p className="text-xs text-white/60">{result.qualitative.topImprovement}</p>
                  </div>
                )}
              </div>
            </div>

            {result.qualitative.rewrittenVersion && (
              <div className="rounded-xl border p-5" style={{ background: 'rgba(251,146,60,0.04)', borderColor: 'rgba(251,146,60,0.2)' }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-black uppercase tracking-widest text-orange-400">Improved Version</p>
                  <button onClick={() => { navigator.clipboard.writeText(result.qualitative.rewrittenVersion); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
                    className="text-xs font-bold px-3 py-1 rounded-lg transition-all"
                    style={copied ? { background: 'rgba(74,222,128,0.15)', color: '#4ade80' } : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-sm text-white/75 leading-relaxed">{result.qualitative.rewrittenVersion}</p>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
