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

interface ProbeResult {
  index: number
  status: number
  latencyMs: number
  rateLimitHeaders: Record<string, string>
  retryAfter: string | null
  error?: string
}

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

function probeStatusColor(status: number): string {
  if (status === 0) return '#6b7280'
  if (status >= 200 && status < 300) return '#06d6ff'
  if (status === 429) return '#f87171'
  if (status >= 500) return '#fbbf24'
  return '#a78bfa'
}

export default function ApiRateLimitPage() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'probe'>('calculator')

  // Calculator state
  const [provider, setProvider] = useState('Custom')
  const [limits, setLimits] = useState<Limits>({ rpm: 60, rpd: 1000, tpm: null, tpd: null })
  const [requestsPerHour, setRequestsPerHour] = useState(500)
  const [tokensPerRequest, setTokensPerRequest] = useState(500)

  // Probe state
  const [probeUrl, setProbeUrl] = useState('')
  const [probeMethod, setProbeMethod] = useState<'GET' | 'POST'>('GET')
  const [probeCount, setProbeCount] = useState(20)
  const [probeRate, setProbeRate] = useState<'burst' | '1ps' | '5ps' | '10ps'>('burst')
  const [authHeader, setAuthHeader] = useState('')
  const [probeResults, setProbeResults] = useState<ProbeResult[]>([])
  const [probeRunning, setProbeRunning] = useState(false)
  const [probeError, setProbeError] = useState('')
  const [probeAbort, setProbeAbort] = useState<AbortController | null>(null)

  function applyProvider(name: string) {
    setProvider(name)
    const p = PROVIDERS.find(x => x.name === name)
    if (p && name !== 'Custom') setLimits({ rpm: p.rpm, rpd: p.rpd, tpm: p.tpm, tpd: p.tpd })
  }

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

  async function runProbe() {
    if (!probeUrl.trim()) { setProbeError('Enter a URL to probe'); return }
    let cleanUrl = probeUrl.trim()
    if (!/^https?:\/\//i.test(cleanUrl)) cleanUrl = `https://${cleanUrl}`

    const ac = new AbortController()
    setProbeAbort(ac)
    setProbeRunning(true)
    setProbeResults([])
    setProbeError('')

    const delayMs = probeRate === 'burst' ? 0 : probeRate === '1ps' ? 1000 : probeRate === '5ps' ? 200 : 100

    const headers: Record<string, string> = { 'Accept': 'application/json' }
    if (authHeader.trim()) headers['Authorization'] = authHeader.trim()

    for (let i = 0; i < probeCount; i++) {
      if (ac.signal.aborted) break
      const start = performance.now()
      try {
        const res = await fetch(cleanUrl, {
          method: probeMethod,
          headers,
          signal: ac.signal,
          mode: 'cors',
        })
        const latencyMs = Math.round(performance.now() - start)

        const rateLimitHeaders: Record<string, string> = {}
        const rlKeys = [
          'x-ratelimit-limit', 'x-ratelimit-remaining', 'x-ratelimit-reset',
          'x-ratelimit-retry-after', 'ratelimit-limit', 'ratelimit-remaining',
          'ratelimit-reset', 'retry-after', 'x-rate-limit-limit',
          'x-rate-limit-remaining', 'x-rate-limit-reset',
        ]
        rlKeys.forEach(k => { const v = res.headers.get(k); if (v) rateLimitHeaders[k] = v })

        const retryAfter = res.headers.get('retry-after') ?? res.headers.get('x-ratelimit-retry-after') ?? null

        setProbeResults(prev => [...prev, { index: i + 1, status: res.status, latencyMs, rateLimitHeaders, retryAfter }])
      } catch (err: unknown) {
        const latencyMs = Math.round(performance.now() - start)
        if (ac.signal.aborted) break
        const msg = err instanceof Error ? err.message : 'Request failed'
        const isCors = msg.toLowerCase().includes('cors') || msg.toLowerCase().includes('network') || msg.toLowerCase().includes('failed to fetch')
        setProbeResults(prev => [...prev, {
          index: i + 1, status: 0, latencyMs, rateLimitHeaders: {}, retryAfter: null,
          error: isCors ? 'CORS blocked — API must allow cross-origin requests' : msg,
        }])
      }

      if (delayMs > 0 && i < probeCount - 1) await new Promise(r => setTimeout(r, delayMs))
    }

    setProbeRunning(false)
    setProbeAbort(null)
  }

  function exportCsv() {
    const rows = ['index,status,latencyMs,retryAfter', ...probeResults.map(r => `${r.index},${r.status},${r.latencyMs},${r.retryAfter ?? ''}`)]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'probe-results.csv'
    a.click()
  }

  const btnBase = 'text-xs font-bold px-2.5 py-1 rounded-lg transition-all'
  const btnActive = { background: 'rgba(6,214,255,0.1)', color: '#06d6ff', border: '1px solid rgba(6,214,255,0.2)' }
  const btnInactive = { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }

  const count200 = probeResults.filter(r => r.status >= 200 && r.status < 300).length
  const count429 = probeResults.filter(r => r.status === 429).length
  const countErr = probeResults.filter(r => r.status === 0).length
  const avgMs = probeResults.length ? Math.round(probeResults.reduce((a, r) => a + r.latencyMs, 0) / probeResults.length) : 0
  const first429 = probeResults.find(r => r.status === 429)
  const allCors = probeResults.length > 0 && probeResults.every(r => r.error?.includes('CORS'))

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
          <span>{pct >= 100 ? 'Over limit' : pct >= 80 ? 'Near limit' : 'OK'}</span>
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
            Free Tool · Browser-Based · No CLI Required
          </div>
          <h1 className="text-3xl font-black text-white mb-1">API Rate Limit Calculator</h1>
          <p className="text-white/40 text-sm mb-4">Calculate exactly when your API usage will hit rate limits, then probe any endpoint live from your browser to see 429s in real time. License from $15, or get all 51 tools from $149.</p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/pricing" className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-black text-black"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
              Get this tool — $15 →
            </Link>
            <Link href="/pricing" className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-black border text-white/60"
              style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
              All 51 tools — from $149 →
            </Link>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {(['calculator', 'probe'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
              style={activeTab === tab
                ? { background: 'rgba(6,214,255,0.1)', color: '#06d6ff', border: '1px solid rgba(6,214,255,0.2)' }
                : { color: 'rgba(255,255,255,0.35)' }}>
              {tab === 'calculator' ? 'Calculator' : 'Live Probe ⚡'}
            </button>
          ))}
        </div>

        {/* CALCULATOR TAB */}
        {activeTab === 'calculator' && (
          <>
            <div className="grid lg:grid-cols-2 gap-5 mb-6">
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
                      <span>TPD: {projectedTpd.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {bottleneck && bottleneck.pct >= 80 && (
              <div className="mb-5 px-4 py-3 rounded-xl border" style={{ background: bottleneck.pct >= 100 ? 'rgba(248,113,113,0.08)' : 'rgba(251,191,36,0.08)', borderColor: bottleneck.pct >= 100 ? 'rgba(248,113,113,0.25)' : 'rgba(251,191,36,0.25)' }}>
                <p className="text-sm font-bold" style={{ color: bottleneck.pct >= 100 ? '#f87171' : 'rgb(251,191,36)' }}>
                  {bottleneck.pct >= 100 ? `You will exceed your ${bottleneck.label} limit` : `Warning: ${bottleneck.label} is at ${bottleneck.pct.toFixed(1)}% of limit`}
                </p>
                <p className="text-xs text-white/40 mt-0.5">
                  {bottleneck.pct >= 100 ? 'Reduce your request rate or upgrade to a higher tier.' : "At current usage, you're close to hitting this limit. Monitor closely."}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Meter label="Requests per Minute (RPM)" pct={rpmPct} limit={limits.rpm} projected={projectedRpm} unit="rpm" />
              <Meter label="Requests per Day (RPD)" pct={rpdPct} limit={limits.rpd} projected={projectedRpd} unit="rpd" />
              <Meter label="Tokens per Minute (TPM)" pct={tpmPct} limit={limits.tpm} projected={projectedTpm} unit="tpm" />
              <Meter label="Tokens per Day (TPD)" pct={tpdPct} limit={limits.tpd} projected={projectedTpd} unit="tpd" />
            </div>

            <p className="text-xs text-white/15 mt-6 text-center">
              All calculations run in your browser. Rate limits vary by account tier — check your provider dashboard for exact limits.
            </p>
          </>
        )}

        {/* LIVE PROBE TAB */}
        {activeTab === 'probe' && (
          <>
            <div className="rounded-2xl border p-5 mb-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <select value={probeMethod} onChange={e => setProbeMethod(e.target.value as 'GET' | 'POST')}
                    className="bg-transparent border rounded-lg px-3 py-2.5 text-white/70 text-sm outline-none flex-shrink-0"
                    style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#0d1117' }}>
                    <option value="GET" style={{ background: '#0d1117' }}>GET</option>
                    <option value="POST" style={{ background: '#0d1117' }}>POST</option>
                  </select>
                  <input value={probeUrl} onChange={e => setProbeUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !probeRunning && runProbe()}
                    placeholder="https://api.github.com/rate_limit"
                    className="flex-1 bg-transparent border rounded-xl px-4 py-2.5 text-white/70 text-sm outline-none font-mono"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                </div>
                <input value={authHeader} onChange={e => setAuthHeader(e.target.value)}
                  placeholder="Authorization header (e.g. Bearer ghp_...)"
                  className="w-full bg-transparent border rounded-xl px-4 py-2.5 text-white/60 text-sm outline-none"
                  style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                <div className="flex gap-3 flex-wrap items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-white/30">Requests:</span>
                    {[10, 20, 50, 100].map(n => (
                      <button key={n} onClick={() => setProbeCount(n)} className={btnBase} style={probeCount === n ? btnActive : btnInactive}>{n}</button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-white/30">Rate:</span>
                    {([['burst', 'Burst'], ['1ps', '1/s'], ['5ps', '5/s'], ['10ps', '10/s']] as [string, string][]).map(([val, label]) => (
                      <button key={val} onClick={() => setProbeRate(val as 'burst' | '1ps' | '5ps' | '10ps')} className={btnBase}
                        style={probeRate === val ? btnActive : btnInactive}>{label}</button>
                    ))}
                  </div>
                  <button onClick={probeRunning ? () => { probeAbort?.abort(); setProbeRunning(false) } : runProbe}
                    className="ml-auto px-5 py-2 rounded-xl text-sm font-black transition-all"
                    style={{ background: probeRunning ? 'rgba(248,113,113,0.1)' : 'linear-gradient(135deg,#06d6ff,#0891b2)', color: probeRunning ? '#f87171' : '#000', border: probeRunning ? '1px solid rgba(248,113,113,0.3)' : 'none' }}>
                    {probeRunning ? 'Stop' : 'Run Probe'}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-white/20 mt-3">Requests sent directly from your browser via fetch. CORS must be enabled on the target API. Auth headers never reach our servers.</p>
            </div>

            {probeError && (
              <div className="mb-4 px-4 py-3 rounded-xl border text-sm text-red-400"
                style={{ background: 'rgba(248,113,113,0.07)', borderColor: 'rgba(248,113,113,0.2)' }}>
                {probeError}
              </div>
            )}

            {probeResults.length > 0 && (
              <div className="space-y-4">
                {/* Timeline */}
                <div className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-black uppercase tracking-widest text-white/25">Response Timeline</p>
                    <button onClick={exportCsv} className="text-xs font-bold px-3 py-1 rounded-lg transition-all"
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      Export CSV
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-0.5 mb-3">
                    {probeResults.map(r => (
                      <div key={r.index}
                        className="w-3 h-3 rounded-sm flex-shrink-0 cursor-default"
                        title={`#${r.index}: ${r.status === 0 ? 'Error' : `HTTP ${r.status}`} (${r.latencyMs}ms)`}
                        style={{ background: probeStatusColor(r.status) }} />
                    ))}
                    {probeRunning && (
                      <div className="w-3 h-3 rounded-sm flex-shrink-0 animate-pulse" style={{ background: 'rgba(255,255,255,0.2)' }} />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-white/50">
                    <span style={{ color: '#06d6ff' }}>2xx: {count200}</span>
                    <span style={{ color: '#f87171' }}>429: {count429}</span>
                    <span style={{ color: '#6b7280' }}>Err: {countErr}</span>
                    <span>Avg: {avgMs}ms</span>
                    {first429 && <span style={{ color: '#f87171' }}>First 429: #{first429.index}</span>}
                  </div>
                </div>

                {/* Rate limit headers from first 429 */}
                {first429 && Object.keys(first429.rateLimitHeaders).length > 0 && (
                  <div className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(248,113,113,0.2)' }}>
                    <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#f87171' }}>Rate Limit Headers (from first 429)</p>
                    <div className="space-y-1.5">
                      {Object.entries(first429.rateLimitHeaders).map(([k, v]) => (
                        <div key={k} className="flex items-start gap-3">
                          <span className="text-[10px] font-mono text-white/30 w-44 flex-shrink-0">{k}</span>
                          <span className="text-xs font-mono text-white/70">{v}</span>
                        </div>
                      ))}
                    </div>
                    {first429.retryAfter && (
                      <div className="mt-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
                        <span className="text-xs font-bold text-red-400">Reset in {first429.retryAfter} seconds</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Results table */}
                <div className="rounded-xl border overflow-hidden" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                  <p className="text-xs font-black uppercase tracking-widest text-white/25 p-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    Last {Math.min(probeResults.length, 20)} results
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-[10px] text-white/25 uppercase tracking-wider">
                          <th className="text-left px-3 py-2">#</th>
                          <th className="text-left px-3 py-2">Status</th>
                          <th className="text-left px-3 py-2">Latency</th>
                          <th className="text-left px-3 py-2">RL-Remaining</th>
                        </tr>
                      </thead>
                      <tbody>
                        {probeResults.slice(-20).map(r => (
                          <tr key={r.index} className="border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                            <td className="px-3 py-1.5 font-mono text-white/30">{r.index}</td>
                            <td className="px-3 py-1.5 font-mono font-bold" style={{ color: probeStatusColor(r.status) }}>
                              {r.status === 0 ? 'ERR' : r.status}
                            </td>
                            <td className="px-3 py-1.5 font-mono text-white/50">{r.latencyMs}ms</td>
                            <td className="px-3 py-1.5 font-mono text-white/40">
                              {r.rateLimitHeaders['x-ratelimit-remaining'] ?? r.rateLimitHeaders['ratelimit-remaining'] ?? r.rateLimitHeaders['x-rate-limit-remaining'] ?? '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* CORS tip */}
                {allCors && (
                  <div className="rounded-xl border p-4" style={{ background: 'rgba(251,191,36,0.05)', borderColor: 'rgba(251,191,36,0.2)' }}>
                    <p className="text-xs font-bold text-amber-400 mb-1">CORS tip</p>
                    <p className="text-xs text-white/50">Most public APIs block browser direct requests. Try <code className="text-cyan-400">api.github.com/rate_limit</code> — it allows CORS. Or test your own API if it sends <code className="text-white/40">Access-Control-Allow-Origin</code> headers.</p>
                  </div>
                )}
              </div>
            )}

            {probeResults.length === 0 && !probeRunning && (
              <div className="text-center py-16 text-white/20">
                <p className="text-sm">Enter a URL above and click Run Probe to see the 429 timeline.</p>
                <p className="text-xs mt-2 text-white/15">Try: api.github.com/rate_limit</p>
              </div>
            )}
          </>
        )}

        {/* Who This Is For */}
        <div className="mt-10 rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-3">Who This Is For</p>
          <ul className="space-y-1.5">
            {[
              'Backend developers building integrations who need to understand provider limits',
              'DevOps engineers monitoring API quota consumption across services',
              'Developers debugging 429 errors — use Live Probe to confirm limit and Retry-After',
              'SaaS teams planning API tier upgrades before hitting production limits',
            ].map(item => (
              <li key={item} className="text-xs text-white/50 flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5 flex-shrink-0">→</span>{item}
              </li>
            ))}
          </ul>
        </div>

        {/* How It Works */}
        <div className="mt-14 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-xl font-black text-white mb-1">How It Works</h2>
          <p className="text-white/35 text-sm mb-8">Two tools in one: plan usage before you hit limits, then probe live to see exactly when 429s kick in.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { n: '01', title: 'Calculator — plan ahead', body: 'Select a provider (OpenAI, Anthropic, Groq, GitHub…), set your expected req/hr and tokens/req. Color-coded meters show headroom for all 4 limit types.' },
              { n: '02', title: 'Live Probe — see 429s', body: 'Paste any CORS-enabled API URL, choose burst or rate-limited mode, run up to 100 requests, and watch the colored timeline squares turn red when rate limits kick in.' },
              { n: '03', title: 'Parse rate-limit headers', body: 'When a 429 hits, the tool automatically reads X-RateLimit-Limit, X-RateLimit-Remaining, and Retry-After from the response and highlights the reset time.' },
            ].map(s => (
              <div key={s.n} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-xs font-black text-white/20 mb-2">{s.n}</div>
                <div className="text-sm font-black text-white mb-1">{s.title}</div>
                <div className="text-xs text-white/45 leading-relaxed">{s.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* License CTA */}
        <div className="mt-6 rounded-2xl border p-6 text-center" style={{ background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.15)' }}>
          <p className="text-white font-black mb-1">Add rate limit tooling to your platform</p>
          <p className="text-white/40 text-sm mb-4">Calculator + live probe with 429 timeline. Client-side only, one-time license.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>Get this tool — $15 →</Link>
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>All 51 tools — from $149 →</Link>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  )
}
