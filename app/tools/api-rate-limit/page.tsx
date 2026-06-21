'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const PROVIDERS = [
  { name: 'OpenAI GPT-4o', rpm: 500, rpd: 10000, tpm: 30000, tpd: null },
  { name: 'OpenAI GPT-4o (Free)', rpm: 3, rpd: 200, tpm: 40000, tpd: null },
  { name: 'Groq Llama (Free)', rpm: 30, rpd: 14400, tpm: 6000, tpd: null },
  { name: 'Anthropic Claude Sonnet', rpm: 1000, rpd: null, tpm: 80000, tpd: null },
  { name: 'Stripe (Live)', rpm: 100, rpd: null, tpm: null, tpd: null },
  { name: 'GitHub API', rpm: 60, rpd: null, tpm: null, tpd: null },
  { name: 'Twitter/X API (Free)', rpm: null, rpd: 17, tpm: null, tpd: null },
  { name: 'Custom', rpm: null, rpd: null, tpm: null, tpd: null },
]

interface Limits { rpm: number | null; rpd: number | null; tpm: number | null; tpd: number | null }

function timeUntilExhausted(usage: number, limit: number, windowSecs: number): string {
  if (usage <= 0) return 'Never'
  const ratePerSec = usage / windowSecs
  const secsToExhaust = limit / ratePerSec
  if (secsToExhaust < 60) return `${secsToExhaust.toFixed(0)}s`
  if (secsToExhaust < 3600) return `${(secsToExhaust / 60).toFixed(1)}m`
  if (secsToExhaust < 86400) return `${(secsToExhaust / 3600).toFixed(1)}h`
  return `${(secsToExhaust / 86400).toFixed(1)}d`
}

function usagePct(usage: number, limit: number | null): number {
  if (!limit || usage <= 0) return 0
  return Math.min(100, (usage / limit) * 100)
}

function statusColor(pct: number): string {
  if (pct >= 90) return '#f87171'
  if (pct >= 70) return '#fbbf24'
  if (pct >= 40) return '#34d399'
  return '#06d6ff'
}

export default function ApiRateLimitPage() {
  const [provider, setProvider] = useState('Custom')
  const [limits, setLimits] = useState<Limits>({ rpm: 60, rpd: 1000, tpm: null, tpd: null })
  const [usage, setUsage] = useState({ rpm: 0, rpd: 0, tpm: 0, tpd: 0 })
  const [requestsPerHour, setRequestsPerHour] = useState(500)
  const [tokensPerRequest, setTokensPerRequest] = useState(500)

  function applyProvider(name: string) {
    setProvider(name)
    const p = PROVIDERS.find(x => x.name === name)
    if (p && name !== 'Custom') setLimits({ rpm: p.rpm, rpd: p.rpd, tpm: p.tpm, tpd: p.tpd })
  }

  // derived projections from usage pattern
  const projectedRpm = requestsPerHour / 60
  const projectedRpd = requestsPerHour * 24
  const projectedTpm = projectedRpm * tokensPerRequest
  const projectedTpd = projectedRpd * tokensPerRequest

  const rpmPct = usagePct(projectedRpm, limits.rpm)
  const rpdPct = usagePct(projectedRpd, limits.rpd)
  const tpmPct = usagePct(projectedTpm, limits.tpm)
  const tpdPct = usagePct(projectedTpd, limits.tpd)

  const rpmTime = limits.rpm ? timeUntilExhausted(projectedRpm, limits.rpm, 60) : '—'
  const rpdTime = limits.rpd ? timeUntilExhausted(projectedRpd, limits.rpd, 86400) : '—'

  const bottleneck = [
    { label: 'RPM', pct: rpmPct, active: limits.rpm !== null },
    { label: 'RPD', pct: rpdPct, active: limits.rpd !== null },
    { label: 'TPM', pct: tpmPct, active: limits.tpm !== null },
    { label: 'TPD', pct: tpdPct, active: limits.tpd !== null },
  ].filter(x => x.active).sort((a, b) => b.pct - a.pct)[0]

  const Meter = ({ label, pct, limit, projected, unit }: { label: string; pct: number; limit: number | null; projected: number; unit: string }) => {
    if (!limit) return null
    const color = statusColor(pct)
    return (
      <div className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black uppercase tracking-wider text-white/50">{label}</span>
          <span className="text-xs font-bold font-mono" style={{ color }}>{pct.toFixed(1)}% of limit</span>
        </div>
        <div className="h-2 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
        </div>
        <div className="flex justify-between text-[10px] text-white/30">
          <span className="font-mono">{projected.toLocaleString(undefined, { maximumFractionDigits: 1 })} projected / {limit.toLocaleString()} limit {unit}</span>
          <span>{pct >= 100 ? '🔴 Over limit' : pct >= 80 ? '⚠️ Near limit' : '✓ OK'}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-10">

        <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/30 hover:text-white/60 transition-colors mb-8">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase mb-3"
            style={{ borderColor: 'rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.08)', color: 'rgb(99,102,241)' }}>
            Free Tool · Developer
          </div>
          <h1 className="text-3xl font-black text-white mb-1">API Rate Limit Calculator</h1>
          <p className="text-white/40 text-sm">Enter your expected usage pattern and see exactly how close you are to hitting API rate limits. Includes presets for OpenAI, Groq, Anthropic, Stripe, and GitHub.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-5 mb-6">
          {/* Provider + Limits */}
          <div className="space-y-4">
            <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-black uppercase tracking-widest text-white/25 mb-3">API Provider</p>
              <select value={provider} onChange={e => applyProvider(e.target.value)}
                className="w-full bg-transparent border rounded-lg px-3 py-2.5 text-white/70 text-sm outline-none mb-4"
                style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#0d1117' }}>
                {PROVIDERS.map(p => <option key={p.name} value={p.name} style={{ background: '#0d1117' }}>{p.name}</option>)}
              </select>

              <p className="text-xs font-black uppercase tracking-widest text-white/25 mb-3">Rate Limits</p>
              <div className="grid grid-cols-2 gap-2">
                {(['rpm', 'rpd', 'tpm', 'tpd'] as const).map(key => (
                  <div key={key}>
                    <label className="block text-[10px] font-bold text-white/25 uppercase tracking-wider mb-1">{key.toUpperCase()}</label>
                    <input type="number" value={limits[key] ?? ''} onChange={e => setLimits(l => ({ ...l, [key]: e.target.value ? Number(e.target.value) : null }))}
                      placeholder="None"
                      className="w-full bg-transparent border rounded px-2 py-1.5 text-white/60 text-xs outline-none font-mono"
                      style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-white/20 mt-2">RPM = requests/min · RPD = requests/day · TPM = tokens/min · TPD = tokens/day</p>
            </div>
          </div>

          {/* Usage pattern */}
          <div className="space-y-4">
            <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-black uppercase tracking-widest text-white/25 mb-4">Your Usage Pattern</p>

              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-wider">Requests per hour</label>
                  <span className="text-xs font-black text-white tabular-nums">{requestsPerHour.toLocaleString()}</span>
                </div>
                <input type="range" min={1} max={10000} value={requestsPerHour} onChange={e => setRequestsPerHour(Number(e.target.value))}
                  className="w-full" style={{ accentColor: '#06d6ff' }} />
                <div className="flex justify-between text-[10px] text-white/20 mt-0.5"><span>1</span><span>10,000</span></div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-wider">Tokens per request (avg)</label>
                  <span className="text-xs font-black text-white tabular-nums">{tokensPerRequest.toLocaleString()}</span>
                </div>
                <input type="range" min={50} max={8000} value={tokensPerRequest} onChange={e => setTokensPerRequest(Number(e.target.value))}
                  className="w-full" style={{ accentColor: '#06d6ff' }} />
                <div className="flex justify-between text-[10px] text-white/20 mt-0.5"><span>50</span><span>8,000</span></div>
              </div>

              <div className="mt-4 p-3 rounded-xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-[10px] text-white/30 mb-1">Derived usage</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] font-mono text-white/50">
                  <span>RPM: {projectedRpm.toFixed(2)}</span>
                  <span>RPD: {projectedRpd.toLocaleString()}</span>
                  <span>TPM: {projectedTpm.toLocaleString()}</span>
                  <span>TPD: {(projectedTpd).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert */}
        {bottleneck && bottleneck.pct >= 80 && (
          <div className="mb-5 px-4 py-3 rounded-xl border" style={{ background: bottleneck.pct >= 100 ? 'rgba(248,113,113,0.08)' : 'rgba(251,191,36,0.08)', borderColor: bottleneck.pct >= 100 ? 'rgba(248,113,113,0.25)' : 'rgba(251,191,36,0.25)' }}>
            <p className="text-sm font-bold" style={{ color: bottleneck.pct >= 100 ? '#f87171' : 'rgb(251,191,36)' }}>
              {bottleneck.pct >= 100 ? `You will exceed your ${bottleneck.label} limit` : `Warning: ${bottleneck.label} is at ${bottleneck.pct.toFixed(1)}% of limit`}
            </p>
            <p className="text-xs text-white/40 mt-0.5">
              {bottleneck.pct >= 100 ? 'Reduce your request rate or upgrade to a higher tier.' : 'At current usage, you\'re close to hitting this limit. Monitor closely.'}
            </p>
          </div>
        )}

        {/* Meters */}
        <div className="space-y-3">
          <Meter label="Requests per Minute (RPM)" pct={rpmPct} limit={limits.rpm} projected={projectedRpm} unit="rpm" />
          <Meter label="Requests per Day (RPD)" pct={rpdPct} limit={limits.rpd} projected={projectedRpd} unit="rpd" />
          <Meter label="Tokens per Minute (TPM)" pct={tpmPct} limit={limits.tpm} projected={projectedTpm} unit="tpm" />
          <Meter label="Tokens per Day (TPD)" pct={tpdPct} limit={limits.tpd} projected={projectedTpd} unit="tpd" />
        </div>

        <p className="text-xs text-white/15 mt-6 text-center">
          All calculations run in your browser. Rate limits vary by account tier — check your provider dashboard for exact limits.
        </p>

        {/* How It Works */}
        <div className="mt-14 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-xl font-black text-white mb-1">How It Works</h2>
          <p className="text-white/35 text-sm mb-8">Know exactly when your API usage will hit limits — before you hit them in production.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { n: '01', title: 'Select your provider', body: 'Choose from OpenAI GPT-4o, Anthropic Claude, Groq, Stripe, GitHub, Twitter, or enter custom limits from your dashboard.' },
              { n: '02', title: 'Set your usage', body: 'Enter requests per hour and tokens per request (for LLM APIs). The calculator derives RPM, RPD, TPM, and TPD automatically.' },
              { n: '03', title: 'See your headroom', body: 'Color-coded meters show how close you are to each limit. Bottleneck detection highlights which limit you\'ll hit first.' },
            ].map(s => (
              <div key={s.n} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-xs font-black text-white/20 mb-2">{s.n}</div>
                <div className="text-sm font-black text-white mb-1">{s.title}</div>
                <div className="text-xs text-white/45 leading-relaxed">{s.body}</div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-4">Example — OpenAI GPT-4o, 500 req/hr, 4096 tokens/req</p>
            <div className="space-y-2">
              {[
                { label: 'Requests/min (RPM)', usage: '8.3', limit: '500', pct: 2, color: '#06d6ff', status: 'OK' },
                { label: 'Requests/day (RPD)', usage: '200', limit: '10,000', pct: 2, color: '#34d399', status: 'OK' },
                { label: 'Tokens/min (TPM)', usage: '34,133', limit: '800,000', pct: 4, color: '#34d399', status: 'OK' },
                { label: 'Tokens/day (TPD)', usage: '819,200', limit: '800,000', pct: 102, color: '#f87171', status: 'OVER LIMIT' },
              ].map(r => (
                <div key={r.label} className="flex items-center gap-3">
                  <span className="text-xs text-white/40 w-40 flex-shrink-0">{r.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(r.pct, 100)}%`, background: r.color }} />
                  </div>
                  <span className="text-xs font-mono text-white/50 w-28 text-right">{r.usage} / {r.limit}</span>
                  <span className="text-[10px] font-black w-20 flex-shrink-0" style={{ color: r.color }}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
