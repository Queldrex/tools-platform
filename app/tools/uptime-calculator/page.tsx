'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const PRESETS = [
  { label: 'Two 9s', value: '99', note: 'Basic hosting' },
  { label: 'Three 9s', value: '99.9', note: 'Typical SaaS' },
  { label: 'Four 9s', value: '99.99', note: 'High availability' },
  { label: 'Five 9s', value: '99.999', note: 'Enterprise / telecom' },
  { label: 'Six 9s', value: '99.9999', note: 'Near-zero downtime' },
]

function calcDowntime(uptimePct: number) {
  const downtimePct = 1 - uptimePct / 100
  const year = downtimePct * 365 * 24 * 60 * 60
  const month = downtimePct * 30.44 * 24 * 60 * 60
  const week = downtimePct * 7 * 24 * 60 * 60
  const day = downtimePct * 24 * 60 * 60
  return { year, month, week, day }
}

function fmtSeconds(secs: number): string {
  if (secs < 1) return `${(secs * 1000).toFixed(1)} ms`
  if (secs < 60) return `${secs.toFixed(2)} seconds`
  if (secs < 3600) {
    const m = Math.floor(secs / 60)
    const s = Math.round(secs % 60)
    return `${m}m ${s}s`
  }
  if (secs < 86400) {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    return `${h}h ${m}m`
  }
  const d = Math.floor(secs / 86400)
  const h = Math.floor((secs % 86400) / 3600)
  return `${d}d ${h}h`
}

function formatMins(mins: number): string {
  if (mins < 0) return 'Exhausted'
  const totalSecs = Math.round(mins * 60)
  const h = Math.floor(totalSecs / 3600)
  const m = Math.floor((totalSecs % 3600) / 60)
  const s = totalSecs % 60
  return [h > 0 && `${h}h`, m > 0 && `${m}m`, `${s}s`].filter(Boolean).join(' ')
}

function getStatus(pct: number): { label: string; color: string } {
  if (pct >= 99.999) return { label: 'Enterprise Grade', color: '#06d6ff' }
  if (pct >= 99.99) return { label: 'High Availability', color: '#34d399' }
  if (pct >= 99.9) return { label: 'Standard SaaS', color: 'rgb(251,191,36)' }
  if (pct >= 99) return { label: 'Basic', color: '#f97316' }
  return { label: 'Unreliable', color: '#f87171' }
}

interface ServiceEntry { id: number; name: string; uptime: number }
let svcNextId = 1

export default function UptimeCalculatorPage() {
  const [input, setInput] = useState('99.9')
  const [customCost, setCustomCost] = useState('')
  const [services, setServices] = useState<ServiceEntry[]>([
    { id: svcNextId++, name: 'API Gateway', uptime: 99.9 },
    { id: svcNextId++, name: 'Database', uptime: 99.95 },
  ])
  const [sloTarget, setSloTarget] = useState(99.9)
  const [consumedMins, setConsumedMins] = useState<number | ''>('')

  const parsed = parseFloat(input)
  const valid = !isNaN(parsed) && parsed >= 0 && parsed <= 100
  const downtime = valid ? calcDowntime(parsed) : null
  const status = valid ? getStatus(parsed) : null

  const costPerHour = customCost ? parseFloat(customCost) : null
  const annualCostLoss = downtime && costPerHour ? (downtime.year / 3600) * costPerHour : null

  const combinedUptime = services.reduce((prod, s) => prod * (s.uptime / 100), 1) * 100
  const combinedDowntimeMinsPerYear = ((100 - combinedUptime) / 100) * 525960
  const combinedDowntimePerYear = fmtSeconds(combinedDowntimeMinsPerYear * 60)

  const errorBudgetMinsPerMonth = ((100 - sloTarget) / 100) * (525960 / 12)
  const remainingMins = consumedMins !== '' ? errorBudgetMinsPerMonth - Number(consumedMins) : errorBudgetMinsPerMonth
  const budgetPct = consumedMins !== '' ? Math.min(100, (Number(consumedMins) / errorBudgetMinsPerMonth) * 100) : 0
  const budgetExhausted = remainingMins < 0

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
            style={{ borderColor: 'rgba(6,182,212,0.25)', background: 'rgba(6,182,212,0.08)', color: '#06d6ff' }}>
            Free Tool · No API Key · Browser Only
          </div>
          <h1 className="text-3xl font-black text-white mb-1">Uptime SLA Calculator</h1>
          <p className="text-white/40 text-sm mb-4">Calculate downtime from SLA percentages, model compound multi-service availability, and track your monthly error budget. License from $29, or get all 51 tools from $99.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/pricing" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Get this tool — $29 →</Link>
            <Link href="/pricing" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black border text-white/60" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>All 51 tools — from $99 →</Link>
          </div>
        </div>

        {/* Input */}
        <div className="rounded-2xl border p-6 mb-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1">
              <label className="block text-xs font-bold text-white/30 uppercase tracking-wider mb-2">Uptime %</label>
              <div className="flex items-center gap-2">
                <input value={input} onChange={e => setInput(e.target.value)}
                  className="flex-1 text-4xl font-black bg-transparent border-b-2 text-white outline-none font-mono pb-1"
                  style={{ borderColor: status?.color || 'rgba(255,255,255,0.15)' }} />
                <span className="text-2xl font-black text-white/40">%</span>
              </div>
            </div>
            {status && (
              <div className="text-right">
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full"
                  style={{ color: status.color, background: `${status.color}18`, border: `1px solid ${status.color}35` }}>
                  {status.label}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <button key={p.value} onClick={() => setInput(p.value)}
                className="flex flex-col text-left px-3 py-2 rounded-lg transition-all"
                style={{
                  background: input === p.value ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${input === p.value ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.07)'}`,
                }}>
                <span className="text-xs font-bold text-white/70">{p.value}%</span>
                <span className="text-[10px] text-white/30">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {downtime && (
          <div className="space-y-3 mb-5">
            {[
              { period: 'Per year', secs: downtime.year, sub: '365 days' },
              { period: 'Per month', secs: downtime.month, sub: '30.44 days avg' },
              { period: 'Per week', secs: downtime.week, sub: '7 days' },
              { period: 'Per day', secs: downtime.day, sub: '24 hours' },
            ].map(({ period, secs, sub }) => (
              <div key={period} className="flex items-center justify-between rounded-xl border px-5 py-4"
                style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
                <div>
                  <p className="text-xs font-bold text-white/30 uppercase tracking-wider">{period}</p>
                  <p className="text-[10px] text-white/20">{sub}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black font-mono text-white">{fmtSeconds(secs)}</p>
                  <p className="text-[10px] text-white/25 font-mono">{secs < 1 ? `${(secs * 1000).toFixed(2)}ms` : `${secs.toFixed(2)}s`} exact</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Revenue impact */}
        <div className="rounded-2xl border p-5 mb-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <p className="text-xs font-black uppercase tracking-widest text-white/25 mb-3">Estimate Revenue Impact</p>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-white/40">$</span>
            <input type="number" value={customCost} onChange={e => setCustomCost(e.target.value)}
              placeholder="Cost per hour of downtime"
              className="flex-1 bg-transparent border rounded-lg px-3 py-2 text-white/70 text-sm outline-none placeholder:text-white/20"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            <span className="text-sm text-white/40">/ hour</span>
          </div>
          {annualCostLoss !== null && downtime && (
            <div className="rounded-xl border p-4" style={{ background: 'rgba(248,113,113,0.06)', borderColor: 'rgba(248,113,113,0.2)' }}>
              <p className="text-xs text-white/40 mb-1">Annual revenue at risk with {input}% uptime SLA:</p>
              <p className="text-3xl font-black font-mono text-red-400">
                ${annualCostLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-white/30 mt-1">
                {fmtSeconds(downtime.year)} of downtime/year × ${parseFloat(customCost).toLocaleString()}/hr
              </p>
            </div>
          )}
        </div>

        {/* Reference table */}
        <div className="rounded-2xl border overflow-hidden mb-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="px-5 py-3 border-b border-white/6">
            <p className="text-xs font-black uppercase tracking-widest text-white/25">SLA Reference Table</p>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/6">
                {['Uptime', 'Per Year', 'Per Month', 'Grade'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-white/25 font-bold uppercase tracking-wider text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRESETS.map(p => {
                const pct = parseFloat(p.value)
                const dt = calcDowntime(pct)
                const s = getStatus(pct)
                return (
                  <tr key={p.value} className="border-b border-white/4 hover:bg-white/2 cursor-pointer transition-colors"
                    onClick={() => setInput(p.value)}>
                    <td className="px-4 py-3 font-mono font-bold text-white">{p.value}%</td>
                    <td className="px-4 py-3 font-mono text-white/60">{fmtSeconds(dt.year)}</td>
                    <td className="px-4 py-3 font-mono text-white/60">{fmtSeconds(dt.month)}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: s.color, background: `${s.color}18` }}>{s.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Compound SLA */}
        <div className="mt-2 rounded-2xl border p-5 mb-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-black uppercase tracking-widest text-white/40">Multi-Service Compound SLA</p>
            <button onClick={() => setServices(s => [...s, { id: svcNextId++, name: 'Service', uptime: 99.9 }])}
              className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
              + Add Service
            </button>
          </div>
          <div className="space-y-2 mb-4">
            {services.map(svc => (
              <div key={svc.id} className="flex items-center gap-2">
                <input value={svc.name} onChange={e => setServices(s => s.map(x => x.id === svc.id ? { ...x, name: e.target.value } : x))}
                  className="flex-1 text-xs bg-transparent border rounded px-2 py-1.5 text-white/70 outline-none"
                  style={{ borderColor: 'rgba(255,255,255,0.1)' }} placeholder="Service name" />
                <input type="number" value={svc.uptime} min={0} max={100} step={0.001}
                  onChange={e => setServices(s => s.map(x => x.id === svc.id ? { ...x, uptime: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)) } : x))}
                  className="w-24 text-xs bg-transparent border rounded px-2 py-1.5 text-white/60 outline-none font-mono text-right"
                  style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                <span className="text-xs text-white/30">%</span>
                {services.length > 1 && (
                  <button onClick={() => setServices(s => s.filter(x => x.id !== svc.id))} className="text-white/20 hover:text-red-400 transition-colors text-xs px-1">×</button>
                )}
              </div>
            ))}
          </div>
          <div className="rounded-xl p-4 border" style={{ background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.15)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-white/40">Combined uptime ({services.length} services)</span>
              <span className="text-2xl font-black" style={{ color: combinedUptime >= 99.9 ? '#34d399' : combinedUptime >= 99 ? 'rgb(251,191,36)' : '#f87171' }}>
                {combinedUptime.toFixed(4)}%
              </span>
            </div>
            <p className="text-xs text-white/35">Max annual downtime: <span className="text-white font-bold">{combinedDowntimePerYear}</span></p>
            {services.length > 1 && (
              <p className="text-[11px] text-white/25 mt-1">
                {services.map(s => s.uptime + '%').join(' × ')} = {combinedUptime.toFixed(4)}%
              </p>
            )}
          </div>
        </div>

        {/* Error Budget */}
        <div className="rounded-2xl border p-5 mb-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Monthly Error Budget</p>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <div className="flex-1 min-w-32">
              <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">SLO Target</label>
              <div className="flex items-center gap-1">
                <input type="number" value={sloTarget} min={0} max={100} step={0.001}
                  onChange={e => setSloTarget(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-28 text-xs bg-transparent border rounded px-2 py-1.5 text-white/70 outline-none font-mono"
                  style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                <span className="text-xs text-white/30">%</span>
              </div>
            </div>
            <div className="flex-1 min-w-40">
              <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Downtime consumed (minutes)</label>
              <input type="number" value={consumedMins} min={0}
                onChange={e => setConsumedMins(e.target.value ? parseFloat(e.target.value) : '')}
                placeholder="0"
                className="w-full text-xs bg-transparent border rounded px-2 py-1.5 text-white/70 outline-none font-mono"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            </div>
          </div>
          <div className="rounded-xl p-4 border" style={{ background: budgetExhausted ? 'rgba(248,113,113,0.05)' : 'rgba(52,211,153,0.05)', borderColor: budgetExhausted ? 'rgba(248,113,113,0.2)' : 'rgba(52,211,153,0.15)' }}>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-white/40">Monthly budget ({sloTarget}% SLO)</span>
              <span className="text-xs font-mono text-white/60">{formatMins(errorBudgetMinsPerMonth)} total</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 mb-2 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, budgetPct)}%`, background: budgetExhausted ? '#f87171' : budgetPct > 75 ? 'rgb(251,191,36)' : '#34d399' }} />
            </div>
            <div className="flex justify-between">
              <span className="text-xs" style={{ color: budgetExhausted ? '#f87171' : '#34d399' }}>
                {budgetExhausted ? '⚠ Budget exhausted — freeze deploys' : `Remaining: ${formatMins(remainingMins)}`}
              </span>
              <span className="text-xs text-white/30">{budgetPct.toFixed(1)}% used</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-white/15 mt-4 text-center">
          All calculations run in your browser. Assumes 365.25 days/year and 30.44 days/month.
        </p>

        {/* Who This Is For */}
        <div className="mt-10 rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-3">Who This Is For</p>
          <ul className="space-y-1.5">
            {[
              'SRE and DevOps engineers setting and monitoring SLOs',
              'Platform teams negotiating vendor SLA contracts',
              'Startup CTOs determining acceptable downtime for early-stage products',
              'Engineering managers building the case for reliability investments',
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
          <p className="text-white/35 text-sm mb-8">Convert uptime percentages to real downtime and revenue impact — instantly in your browser.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { n: '01', title: 'Set your uptime %', body: 'Enter any SLA percentage — 99%, 99.9%, 99.99% — or click a tier in the reference table to load it automatically.' },
              { n: '02', title: 'Compound multi-service', body: 'Add multiple services to see combined SLA. Three 99.9% services yield 99.7% combined — a killer detail for architecture decisions.' },
              { n: '03', title: 'Track error budget', body: 'Set your SLO target and log downtime consumed. See remaining budget and a "freeze deploys" warning when exhausted.' },
            ].map(s => (
              <div key={s.n} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-xs font-black text-white/20 mb-2">{s.n}</div>
                <div className="text-sm font-black text-white mb-1">{s.title}</div>
                <div className="text-xs text-white/45 leading-relaxed">{s.body}</div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-4">Example — 99.9% uptime, $5,000/hr revenue</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { period: 'Per Year', downtime: '8h 45m 36s', impact: '$43,800' },
                { period: 'Per Month', downtime: '43m 50s', impact: '$3,650' },
                { period: 'Per Week', downtime: '10m 5s', impact: '$842' },
                { period: 'Per Day', downtime: '1m 26s', impact: '$120' },
              ].map(r => (
                <div key={r.period} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="text-xs font-bold text-white/40">{r.period}</span>
                  <span className="text-sm font-mono text-white/70">{r.downtime}</span>
                  <span className="text-sm font-bold text-red-400">{r.impact}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* License CTA */}
        <div className="mt-14 rounded-2xl border p-6 text-center" style={{ background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.15)' }}>
          <p className="text-white font-black mb-1">Add SLA tooling to your platform</p>
          <p className="text-white/40 text-sm mb-4">Uptime calculator, compound SLA, error budget tracker. Client-side only, one-time license.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>Get this tool — $29 →</Link>
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>All 51 tools — from $99 →</Link>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  )
}
