'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Scenario { roi: number; netProfit: number }
interface Result {
  roi: number; annualizedRoi: number; netProfit: number; paybackMonths: number | null
  perDollarReturn: number; rating: string; verdict: string
  scenarios: { conservative: Scenario; base: Scenario; optimistic: Scenario }
  inputs: { investmentCost: number; expectedRevenue: number; timeframeMonths: number; additionalCosts: number; riskLevel: string }
}

const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 0 })
const fmtMoney = (n: number) => (n < 0 ? '-' : '') + '$' + fmt(Math.abs(n))
const fmtPct = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(1) + '%'

const RATING_COLORS: Record<string, string> = {
  Excellent: '#4ade80', Strong: '#86efac', Moderate: '#fbbf24', Marginal: '#fb923c', Negative: '#f87171',
}

export default function RoiCalculatorPage() {
  const [form, setForm] = useState({
    investmentCost: '', additionalCosts: '', expectedRevenue: '', timeframeMonths: 12, riskLevel: 'medium' as 'low' | 'medium' | 'high',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)

  const calculate = async () => {
    const invest = parseFloat(form.investmentCost.replace(/,/g, ''))
    const revenue = parseFloat(form.expectedRevenue.replace(/,/g, ''))
    if (!invest || invest <= 0 || !revenue || revenue < 0) { setError('Investment cost and expected revenue are required.'); return }
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    try {
      const res = await fetch('/api/tools/roi-calculator', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investmentCost: invest,
          additionalCosts: parseFloat(form.additionalCosts.replace(/,/g, '')) || 0,
          expectedRevenue: revenue,
          timeframeMonths: form.timeframeMonths,
          riskLevel: form.riskLevel,
        }),
      })
      const data = await res.json()
      if (data.paywall || res.status === 402) { setPaywall(true); return }
      if (!res.ok) throw new Error(data.error || 'Calculation failed')
      setResult(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Calculation failed') }
    finally { setLoading(false) }
  }

  const inputCls = "w-full text-sm text-white rounded-lg px-3 py-2.5 outline-none"
  const inputStyle = { background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)' }
  const roiColor = result ? (result.roi >= 0 ? '#4ade80' : '#f87171') : '#4ade80'

  const loadExample = async () => {
    const ex = { investmentCost: 75000, additionalCosts: 24000, expectedRevenue: 280000, timeframeMonths: 12, riskLevel: 'medium' as const }
    setForm({ investmentCost: '75000', additionalCosts: '24000', expectedRevenue: '280000', timeframeMonths: 12, riskLevel: 'medium' })
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    try {
      const res = await fetch('/api/tools/roi-calculator', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ex) })
      const data = await res.json()
      if (data.paywall || res.status === 402) { setPaywall(true); return }
      if (!res.ok) throw new Error(data.error || 'Calculation failed')
      setResult(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Calculation failed') }
    finally { setLoading(false) }
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
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#4ade80', borderColor: 'rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.08)' }}>Free</span>
          <span className="text-sm font-bold text-white/30">10 calculations/day free · Unlimited with $79/month</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">ROI <span style={{ color: '#4ade80' }}>Calculator</span></h1>
        <p className="text-white/55 text-base mb-4 max-w-2xl">Calculate return on investment, payback period, and risk-adjusted scenarios for any business investment. Pure math — no guesses.</p>
        <div className="flex gap-3 flex-wrap mb-6">
          <Link href="/pricing" className="inline-flex items-center gap-1 text-sm font-black px-4 py-2 rounded-xl text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Get this tool — $15 →</Link>
          <Link href="/pricing" className="inline-flex items-center gap-1 text-sm font-black px-4 py-2 rounded-xl border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>All 51 tools — from $99 →</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">How it works</p>
            <p className="text-sm text-white/60 leading-relaxed">Calculates return on investment using the standard finance formula: ROI = (Net Profit ÷ Investment Cost) × 100. Also calculates annualized ROI for fair comparison across different time horizons, payback period in months, and three risk-adjusted scenarios (conservative, base, optimistic) based on your selected risk level. No spreadsheet needed.</p>
          </div>
          <div className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">What you get</p>
            <ul className="space-y-2">
              {['ROI percentage and letter grade (Excellent / Strong / Moderate / Marginal / Negative)', 'Annualized ROI for apples-to-apples comparison', 'Payback period — how many months to recoup your investment', 'Three scenarios: conservative, base case, and optimistic', "Plain-English verdict: 'For every $1 invested, you get back $X.XX'"].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/55"><span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border p-6 mb-6 space-y-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/35 font-bold uppercase tracking-wider mb-1.5 block">Total Investment Cost ($) *</label>
              <input value={form.investmentCost} onChange={e => setForm(f => ({ ...f, investmentCost: e.target.value }))}
                placeholder="10000" className={inputCls} style={inputStyle} />
              <p className="text-[11px] text-white/25 mt-1">One-time cost (equipment, software, campaign, etc.)</p>
            </div>
            <div>
              <label className="text-xs text-white/35 font-bold uppercase tracking-wider mb-1.5 block">Expected Revenue / Return ($) *</label>
              <input value={form.expectedRevenue} onChange={e => setForm(f => ({ ...f, expectedRevenue: e.target.value }))}
                placeholder="35000" className={inputCls} style={inputStyle} />
              <p className="text-[11px] text-white/25 mt-1">Total revenue or value generated over the timeframe</p>
            </div>
            <div>
              <label className="text-xs text-white/35 font-bold uppercase tracking-wider mb-1.5 block">Ongoing Costs ($/year, optional)</label>
              <input value={form.additionalCosts} onChange={e => setForm(f => ({ ...f, additionalCosts: e.target.value }))}
                placeholder="2400" className={inputCls} style={inputStyle} />
              <p className="text-[11px] text-white/25 mt-1">Maintenance, subscriptions, staff — per year</p>
            </div>
          </div>

          <div>
            <label className="text-xs text-white/35 font-bold uppercase tracking-wider mb-2 block">Timeframe: {form.timeframeMonths} months</label>
            <input type="range" min={1} max={36} value={form.timeframeMonths}
              onChange={e => setForm(f => ({ ...f, timeframeMonths: Number(e.target.value) }))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, #4ade80 0%, #4ade80 ${(form.timeframeMonths / 36) * 100}%, rgba(255,255,255,0.1) ${(form.timeframeMonths / 36) * 100}%, rgba(255,255,255,0.1) 100%)` }} />
            <div className="flex justify-between text-[10px] text-white/25 mt-1">
              <span>1 mo</span><span>6 mo</span><span>12 mo</span><span>18 mo</span><span>24 mo</span><span>36 mo</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-white/35 font-bold uppercase tracking-wider mb-2 block">Risk Level (affects scenario modeling)</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map(r => (
                <button key={r} onClick={() => setForm(f => ({ ...f, riskLevel: r }))}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-all"
                  style={form.riskLevel === r
                    ? { background: r === 'low' ? 'rgba(74,222,128,0.15)' : r === 'medium' ? 'rgba(251,191,36,0.15)' : 'rgba(248,113,113,0.15)', color: r === 'low' ? '#4ade80' : r === 'medium' ? '#fbbf24' : '#f87171', border: `1px solid ${r === 'low' ? 'rgba(74,222,128,0.3)' : r === 'medium' ? 'rgba(251,191,36,0.3)' : 'rgba(248,113,113,0.3)'}` }
                    : { background: 'transparent', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {r.charAt(0).toUpperCase() + r.slice(1)} Risk
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button onClick={loadExample} disabled={loading} className="px-4 py-3 rounded-xl text-sm font-bold border transition-colors hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>Try Example →</button>
            <button onClick={calculate} disabled={loading || !form.investmentCost || !form.expectedRevenue}
              className="px-8 py-3 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#4ade80,#22c55e)', boxShadow: '0 0 20px rgba(74,222,128,0.3)' }}>
              {loading ? 'Calculating…' : 'Calculate ROI'}
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>}

        {paywall && !loading && (
          <div className="rounded-2xl border p-8 text-center mb-6" style={{ background: 'rgba(74,222,128,0.05)', borderColor: 'rgba(74,222,128,0.2)' }}>
            <h3 className="text-xl font-black text-white mb-2">Unlimited calculations with Pro</h3>
            <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">Upgrade for unlimited ROI calculations and access to all 51 tools.</p>
            <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Upgrade to Pro →</Link>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="rounded-2xl border p-8 text-center" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs text-white/35 font-bold uppercase tracking-widest mb-3">Return on Investment</p>
              <div className="text-7xl font-black mb-2" style={{ color: roiColor, textShadow: `0 0 40px ${roiColor}40` }}>
                {fmtPct(result.roi)}
              </div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-sm font-bold px-3 py-1 rounded-full"
                  style={{ background: `${RATING_COLORS[result.rating]}15`, color: RATING_COLORS[result.rating], border: `1px solid ${RATING_COLORS[result.rating]}30` }}>
                  {result.rating}
                </span>
                <span className="text-sm text-white/40">Annualized: {fmtPct(result.annualizedRoi)}/yr</span>
              </div>
              <div className="rounded-xl border px-6 py-4 mx-auto max-w-md" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-sm font-bold text-white">{result.verdict}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Net Profit', value: fmtMoney(result.netProfit), color: result.netProfit >= 0 ? '#4ade80' : '#f87171' },
                { label: 'Payback Period', value: result.paybackMonths != null ? `${result.paybackMonths} months` : 'N/A', color: '#60a5fa' },
                { label: 'Per $1 Invested', value: `$${result.perDollarReturn.toFixed(2)}`, color: '#a78bfa' },
              ].map(m => (
                <div key={m.label} className="rounded-xl border p-4 text-center" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <p className="text-xs text-white/35 font-bold uppercase tracking-wider mb-2">{m.label}</p>
                  <p className="text-2xl font-black" style={{ color: m.color }}>{m.value}</p>
                </div>
              ))}
            </div>

            {(() => {
              const invest = result.inputs.investmentCost
              const revenue = result.inputs.expectedRevenue
              const netProfit = result.netProfit
              const maxVal = Math.max(invest, revenue, Math.abs(netProfit)) * 1.15
              const investPct = Math.min(100, (invest / maxVal) * 100)
              const revPct = Math.min(100, (revenue / maxVal) * 100)
              const profitPct = Math.min(100, (Math.abs(netProfit) / maxVal) * 100)
              const isPos = netProfit >= 0
              return (
                <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <p className="text-xs font-black uppercase tracking-widest mb-5" style={{ color: 'rgba(255,255,255,0.3)' }}>Visual Breakdown</p>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        <span>Total Investment</span><span className="font-black" style={{ color: '#f87171' }}>${invest.toLocaleString()}</span>
                      </div>
                      <div className="h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${investPct}%`, background: 'linear-gradient(90deg,#f87171,#dc2626)' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        <span>Expected Revenue</span><span className="font-black" style={{ color: '#4ade80' }}>${revenue.toLocaleString()}</span>
                      </div>
                      <div className="h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${revPct}%`, background: 'linear-gradient(90deg,#4ade80,#16a34a)' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        <span>Net {isPos ? 'Gain' : 'Loss'}</span><span className="font-black" style={{ color: isPos ? '#4ade80' : '#f87171' }}>{isPos ? '+' : '-'}${Math.abs(netProfit).toLocaleString()}</span>
                      </div>
                      <div className="h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${profitPct}%`, background: isPos ? 'linear-gradient(90deg,#a78bfa,#7c3aed)' : 'linear-gradient(90deg,#f87171,#dc2626)', opacity: 0.85 }} />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}

            <div>
              <p className="text-xs text-white/35 font-bold uppercase tracking-widest mb-3">Risk-Adjusted Scenarios ({result.inputs.riskLevel} risk)</p>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { key: 'conservative', label: 'Conservative', desc: 'Downside case', bg: 'rgba(248,113,113,0.05)', border: 'rgba(248,113,113,0.15)' },
                  { key: 'base', label: 'Base Case', desc: 'Your estimate', bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.1)' },
                  { key: 'optimistic', label: 'Optimistic', desc: 'Upside case', bg: 'rgba(74,222,128,0.05)', border: 'rgba(74,222,128,0.15)' },
                ] as const).map(s => {
                  const sc = result.scenarios[s.key as keyof typeof result.scenarios]
                  const isPos = sc.roi >= 0
                  return (
                    <div key={s.key} className="rounded-xl border p-4" style={{ background: s.bg, borderColor: s.border }}>
                      <p className="text-xs font-bold text-white mb-0.5">{s.label}</p>
                      <p className="text-[10px] text-white/35 mb-3">{s.desc}</p>
                      <p className="text-xl font-black mb-1" style={{ color: isPos ? '#4ade80' : '#f87171' }}>{fmtPct(sc.roi)}</p>
                      <p className="text-xs text-white/40">{fmtMoney(sc.netProfit)}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-xl border px-5 py-4" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-[10px] text-white/25 font-bold uppercase tracking-widest mb-2">Inputs Used</p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-white/35">
                <span>Investment: {fmtMoney(result.inputs.investmentCost)}</span>
                <span>Expected Return: {fmtMoney(result.inputs.expectedRevenue)}</span>
                <span>Timeframe: {result.inputs.timeframeMonths} months</span>
                {result.inputs.additionalCosts > 0 && <span>Ongoing Costs: {fmtMoney(result.inputs.additionalCosts)}/yr</span>}
                <span>Risk: {result.inputs.riskLevel}</span>
              </div>
            </div>
          </div>
        )}
        <div className="mt-10 mb-8">
          <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Who This Is For</p>
          <ul className="space-y-2 text-sm text-white/55">
            <li>• Founders evaluating ROI of a new tool, hire, or marketing spend before committing</li>
            <li>• Sales teams building business cases for enterprise software purchases</li>
            <li>• Consultants modeling conservative, base, and optimistic scenarios for clients</li>
            <li>• Finance leads calculating payback period and annualized return on initiatives</li>
          </ul>
        </div>
        <div className="mt-14 rounded-2xl border p-6 text-center" style={{ background: 'rgba(6,214,255,0.04)', borderColor: 'rgba(6,214,255,0.12)' }}>
          <p className="text-white font-black mb-1">Add ROI calculation to your platform</p>
          <p className="text-white/40 text-sm mb-4">Annualized ROI, payback period, 3-scenario modeling, risk adjustment. One-time license.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Get this tool — $15 →</Link>
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>All 51 tools — from $99 →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
