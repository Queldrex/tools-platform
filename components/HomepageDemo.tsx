'use client'
import { useEffect, useState } from 'react'

type Phase = 'idle' | 'scanning' | 'done'

const FINDINGS = [
  { level: 'HIGH',   color: '#f87171', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.18)',  icon: '🔴', text: 'Section 4.2 — IP Ownership: Client claims all work product in perpetuity' },
  { level: 'HIGH',   color: '#f87171', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.18)',  icon: '🔴', text: 'Section 11.1 — Non-Compete: 24-month clause, 3× above industry norm' },
  { level: 'MEDIUM', color: '#fbbf24', bg: 'rgba(251,191,36,0.06)', border: 'rgba(251,191,36,0.14)', icon: '🟡', text: 'Section 7.3 — Payment: NET-60 terms (industry standard is NET-30)' },
  { level: 'OK',     color: '#4ade80', bg: 'rgba(74,222,128,0.06)', border: 'rgba(74,222,128,0.14)', icon: '🟢', text: 'Section 9.1 — Liability cap at contract value — standard' },
]

const SCAN_LINES = [
  'Checking IP ownership clauses…',
  'Analyzing non-compete scope…',
  'Reviewing payment terms…',
  'Validating liability cap…',
]

export default function HomepageDemo() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [visibleFindings, setVisibleFindings] = useState(0)
  const [scanPct, setScanPct] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase('scanning')
      let pct = 0
      const interval = setInterval(() => {
        pct += 4
        setScanPct(Math.min(pct, 100))
        if (pct >= 100) {
          clearInterval(interval)
          setPhase('done')
        }
      }, 60)
      return () => clearInterval(interval)
    }, 1200)
    return () => clearTimeout(t1)
  }, [])

  useEffect(() => {
    if (phase !== 'done') return
    let i = 0
    const interval = setInterval(() => {
      i++
      setVisibleFindings(i)
      if (i >= FINDINGS.length) clearInterval(interval)
    }, 220)
    return () => clearInterval(interval)
  }, [phase])

  return (
    <div className="max-w-2xl mx-auto px-6 pb-10 -mt-4">
      <div className="rounded-2xl border overflow-hidden" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
        {/* Window chrome */}
        <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
          </div>
          <div className="flex-1 text-center text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Contract Risk Scanner — example_contract.pdf
          </div>
          <span
            className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-black"
            style={{
              background: 'linear-gradient(135deg,#a78bfa,#7c3aed)',
              opacity: phase === 'idle' ? 0 : 1,
              transition: 'opacity 0.3s',
            }}
          >
            Live
          </span>
        </div>

        <div className="p-5">
          {/* Idle */}
          {phase === 'idle' && (
            <div className="flex items-center gap-3 py-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(167,139,250,0.1)' }}>
                <svg className="w-4 h-4 animate-pulse" style={{ color: '#a78bfa' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Analyzing contract…</span>
            </div>
          )}

          {/* Scanning */}
          {phase === 'scanning' && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>Scanning contract…</span>
                <span className="text-xs font-black" style={{ color: '#a78bfa' }}>{scanPct}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${scanPct}%`, background: 'linear-gradient(90deg,#7c3aed,#a78bfa)', transition: 'width 75ms linear' }}
                />
              </div>
              <div className="mt-3 space-y-1.5">
                {SCAN_LINES.slice(0, Math.ceil(scanPct / 26)).map(l => (
                  <div key={l} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#a78bfa' }} />
                    <span className="text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {phase === 'done' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Risk Analysis</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                  2 HIGH RISKS FOUND
                </span>
              </div>
              <div className="space-y-2">
                {FINDINGS.map((f, i) => (
                  <div
                    key={f.text}
                    className="rounded-xl border px-3.5 py-2.5"
                    style={{
                      background: f.bg,
                      borderColor: f.border,
                      opacity: i < visibleFindings ? 1 : 0,
                      transform: i < visibleFindings ? 'translateY(0)' : 'translateY(8px)',
                      transition: 'opacity 0.25s ease, transform 0.25s ease',
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xs flex-shrink-0 mt-px">{f.icon}</span>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider mr-2" style={{ color: f.color }}>{f.level}</span>
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{f.text}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {visibleFindings >= FINDINGS.length && (
                <p className="text-center text-[11px] mt-4 font-bold" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  This is an example. Try it free on any real contract. →
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
