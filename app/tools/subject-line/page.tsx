'use client'
import { useState, useCallback } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Breakdown {
  length: { score: number; max: number; label: string }
  spamScore: { score: number; max: number; matched: string[] }
  personalization: { score: number; max: number; label: string }
  powerWords: { score: number; max: number; matched: string[] }
  question: { score: number; max: number; label: string }
  emoji: { score: number; max: number; label: string; count: number }
  number: { score: number; max: number; hasNumber: boolean }
}

interface Result {
  score: number; grade: string; estimatedOpenRate: string
  characterCount: number; wordCount: number
  breakdown: Breakdown
  issues: string[]; alternatives: string[]
}

function DonutChart({ score }: { score: number }) {
  const r = 52, cx = 64, cy = 64
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  const color = score >= 70 ? '#06d6ff' : score >= 50 ? '#facc15' : '#f87171'
  return (
    <svg viewBox="0 0 128 128" className="w-32 h-32">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={12} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={12}
        strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: 'stroke-dasharray 0.4s ease' }} />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize={22} fontWeight="900">{score}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={11} fontWeight="600">/100</text>
    </svg>
  )
}

function ScoreBar({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = Math.round((score / max) * 100)
  const color = pct >= 70 ? '#06d6ff' : pct >= 40 ? '#facc15' : '#f87171'
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

let debounceTimer: ReturnType<typeof setTimeout>

export default function SubjectLinePage() {
  const [subject, setSubject] = useState('')
  const [preheader, setPreheader] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [paywall, setPaywall] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const analyze = useCallback(async (val: string) => {
    if (!val.trim()) { setResult(null); return }
    setLoading(true); setPaywall(false)
    try {
      const res = await fetch('/api/tools/subject-line', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject: val, preheader }) })
      const data = await res.json()
      if (data.paywall || res.status === 402) { setPaywall(true); return }
      if (res.ok) setResult(data)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [preheader])

  const handleChange = (val: string) => {
    setSubject(val)
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => analyze(val), 300)
  }

  const copyAlt = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 1500)
  }

  const gradeColor = result ? (result.score >= 70 ? '#06d6ff' : result.score >= 50 ? '#facc15' : '#f87171') : '#06d6ff'

  const loadExample = () => {
    handleChange("Your free trial expires in 24 hours — here's what you'll lose")
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
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#06d6ff', borderColor: 'rgba(6,214,255,0.3)', background: 'rgba(6,214,255,0.08)' }}>Instant</span>
          <span className="text-sm font-bold text-white/30">5 free tests/day · Unlimited with $79/month Pro</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">Email Subject Line <span style={{ color: '#06d6ff' }}>Tester</span></h1>
        <p className="text-white/55 text-base mb-6 max-w-2xl">Score your subject line in real time — spam risk, personalization, power words, emoji, and open rate estimate. No AI, no waiting.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">How it works</p>
            <p className="text-sm text-white/60 leading-relaxed">Scores email subject lines across 7 dimensions using deterministic rules — no AI, instant results. Checks length (35-50 chars is optimal), spam words, power words, personalization signals, question format, emoji usage, and number inclusion. Also generates 3 alternative subject lines and estimates open rate based on aggregate benchmarks.</p>
          </div>
          <div className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">What you get</p>
            <ul className="space-y-2">
              {['Score out of 100 with letter grade', 'Estimated open rate range based on score', '7-dimension breakdown with specific feedback', 'Spam word detection with list of flagged words', '3 alternative subject lines you can use immediately'].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/55">
                  <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border p-6 mb-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-widest text-white/35 mb-2">Subject Line</label>
            <input value={subject} onChange={e => handleChange(e.target.value)} placeholder="Your amazing email subject line..."
              className="w-full text-sm text-white placeholder-white/20 outline-none"
              style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '13px 16px' }} />
            <div className="flex justify-between text-xs mt-1.5">
              <span className="text-white/25">{subject.length} characters</span>
              {subject.length > 60 && <span className="text-amber-400 font-bold">May be cut off on mobile</span>}
              {subject.length <= 60 && subject.length >= 35 && <span className="text-green-400 font-bold">Perfect length</span>}
            </div>
          </div>
          <div className="flex justify-end -mt-1 mb-3">
            <button onClick={loadExample} className="px-4 py-2 rounded-xl text-sm font-bold border transition-colors hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>Try Example →</button>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-white/35 mb-2">Preheader (optional)</label>
            <input value={preheader} onChange={e => setPreheader(e.target.value)} placeholder="Preview text shown after the subject..."
              className="w-full text-sm text-white/70 placeholder-white/15 outline-none"
              style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: '11px 16px' }} />
          </div>
        </div>

        {paywall && (
          <div className="rounded-2xl border p-8 text-center mb-6" style={{ background: 'rgba(6,214,255,0.05)', borderColor: 'rgba(6,214,255,0.2)' }}>
            <h3 className="text-xl font-black text-white mb-2">Unlimited testing with Pro</h3>
            <p className="text-white/50 text-sm mb-6">Test unlimited subject lines — $79/month.</p>
            <Link href="/pricing" className="inline-flex px-6 py-3 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Start Pro — $79/month</Link>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="rounded-2xl border p-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-8">
                <DonutChart score={result.score} />
                <div className="flex-1">
                  <div className="text-2xl font-black mb-1" style={{ color: gradeColor }}>Grade {result.grade}</div>
                  <p className="text-sm text-white/55 mb-2">{result.estimatedOpenRate}</p>
                  <p className="text-xs text-white/30">{result.characterCount} chars · {result.wordCount} words</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-4">Score Breakdown</p>
                <ScoreBar label="Length" score={result.breakdown.length.score} max={20} />
                <ScoreBar label="Spam Safety" score={result.breakdown.spamScore.score} max={25} />
                <ScoreBar label="Personalization" score={result.breakdown.personalization.score} max={15} />
                <ScoreBar label="Power Words" score={result.breakdown.powerWords.score} max={15} />
                <ScoreBar label="Question Format" score={result.breakdown.question.score} max={10} />
                <ScoreBar label="Emoji" score={result.breakdown.emoji.score} max={10} />
                <ScoreBar label="Contains Number" score={result.breakdown.number.score} max={5} />
              </div>

              <div className="space-y-3">
                {result.issues.length > 0 && (
                  <div className="rounded-xl border p-4" style={{ background: 'rgba(251,191,36,0.05)', borderColor: 'rgba(251,191,36,0.2)' }}>
                    <p className="text-xs font-black uppercase tracking-widest text-amber-400 mb-3">Issues Found</p>
                    <ul className="space-y-1.5">
                      {result.issues.map((issue, i) => (
                        <li key={i} className="flex gap-2 text-xs text-white/60">
                          <span className="text-amber-400 flex-shrink-0">âš </span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.breakdown.powerWords.matched.length > 0 && (
                  <div className="rounded-xl border p-4" style={{ background: 'rgba(6,214,255,0.05)', borderColor: 'rgba(6,214,255,0.15)' }}>
                    <p className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-2">Power Words</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.breakdown.powerWords.matched.map((w, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-md font-bold" style={{ background: 'rgba(6,214,255,0.12)', color: '#06d6ff' }}>{w}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {result.alternatives.length > 0 && (
              <div className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-4">Suggested Alternatives</p>
                <div className="space-y-2">
                  {result.alternatives.map((alt, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 rounded-lg px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span className="text-sm text-white/70 flex-1">{alt}</span>
                      <button onClick={() => copyAlt(alt, i)}
                        className="text-xs font-bold px-3 py-1 rounded-lg flex-shrink-0 transition-all"
                        style={copiedIdx === i ? { background: 'rgba(74,222,128,0.15)', color: '#4ade80' } : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                        {copiedIdx === i ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {loading && !result && (
          <div className="flex items-center gap-3 text-sm text-white/35 py-8">
            <div className="w-4 h-4 border-2 border-white/15 border-t-cyan-400 rounded-full animate-spin" />
            Analyzing…
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
