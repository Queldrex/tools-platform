'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Scenario { units: number; revenue: number; profit: number }
interface ProfitTarget { targetProfit: number; unitsNeeded: number; revenueNeeded: number }
interface Results {
  contributionMargin: number; contributionMarginPct: number
  breakEvenUnits: number; breakEvenRevenue: number
  currentRevenue: number | null; currentProfit: number | null
  marginOfSafety: number | null; marginOfSafetyPct: number | null
}
interface FullResult { results: Results; profitTargets: ProfitTarget[]; scenarios: Scenario[]; explanation: string; isAlreadyProfitable: boolean }

function fmt(n: number) { return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }
function fmtMoney(n: number) { return `$${fmt(n)}` }
function fmtPct(n: number) { return `${n.toFixed(1)}%` }

export default function BreakEvenPage() {
  const [fixedCosts, setFixedCosts] = useState('')
  const [variableCost, setVariableCost] = useState('')
  const [price, setPrice] = useState('')
  const [currentUnits, setCurrentUnits] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<FullResult | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)

  const calculate = async () => {
    if (!fixedCosts || !price) return
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    try {
      const res = await fetch('/api/tools/break-even', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fixedCosts: +fixedCosts, variableCostPerUnit: +variableCost || 0, pricePerUnit: +price, currentUnits: currentUnits ? +currentUnits : undefined }),
      })
      const data = await res.json()
      if (data.paywall || res.status === 402) { setPaywall(true); return }
      if (!res.ok) throw new Error(data.error || 'Calculation failed')
      setResult(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Calculation failed') }
    finally { setLoading(false) }
  }

  const r = result?.results
  const progressPct = r && currentUnits && r.breakEvenUnits > 0
    ? Math.min(100, (parseInt(currentUnits) / r.breakEvenUnits) * 100) : null

  const loadExample = async () => {
    const ex = { fixedCosts: 8500, variableCostPerUnit: 8, pricePerUnit: 49, currentUnits: 300 }
    setFixedCosts('8500'); setVariableCost('8'); setPrice('49'); setCurrentUnits('300')
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    try {
      const res = await fetch('/api/tools/break-even', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ex) })
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
      <main className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/tools" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#a78bfa', borderColor: 'rgba(167,139,250,0.3)', background: 'rgba(167,139,250,0.08)' }}>Free</span>
          <span className="text-sm font-bold text-white/30">Small business tool · No account needed</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">Break-Even <span style={{ color: '#a78bfa' }}>Calculator</span></h1>
        <p className="text-white/55 text-base mb-6 max-w-xl">Enter your costs and price — find out exactly how many units you need to sell to cover your expenses and start making profit.</p>
        <div className="flex gap-3 flex-wrap mt-3 mb-6">
          <Link href="/pricing" className="inline-flex items-center gap-1 text-sm font-black px-4 py-2 rounded-xl text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Get this tool — $15 →</Link>
          <Link href="/pricing" className="inline-flex items-center gap-1 text-sm font-black px-4 py-2 rounded-xl border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>All 51 tools — from $149 →</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">How it works</p>
            <p className="text-sm text-white/60 leading-relaxed">Calculates your break-even point using contribution margin analysis — the same method used by finance teams and MBA programs. Enter your fixed costs (rent, salaries, software), variable cost per unit (materials, shipping, payment processing), and selling price. The tool instantly shows units needed to break even, target revenue, and profit at any sales volume.</p>
          </div>
          <div className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">What you get</p>
            <ul className="space-y-2">
              {['Break-even units — exactly how many you need to sell', 'Break-even revenue — total sales needed to cover all costs', 'Contribution margin per unit and as a percentage', 'Profit/loss at any target sales volume you enter', 'Visual progress bar showing how close you are to profitability'].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/55"><span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border p-6 mb-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="col-span-2">
              <label className="text-xs font-bold text-white/35 uppercase tracking-wider mb-1.5 block">Monthly Fixed Costs * <span className="text-white/20 normal-case font-normal">(rent, salaries, software, etc.)</span></label>
              <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)', background: '#161b22' }}>
                <span className="text-white/40 px-3">$</span>
                <input type="number" min={0} value={fixedCosts} onChange={e => setFixedCosts(e.target.value)} placeholder="5000"
                  className="flex-1 text-sm text-white py-2.5 px-2 outline-none" style={{ background: 'transparent' }} />
                <span className="text-white/30 text-xs px-3">/month</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-white/35 uppercase tracking-wider mb-1.5 block">Price Per Unit *</label>
              <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)', background: '#161b22' }}>
                <span className="text-white/40 px-3">$</span>
                <input type="number" min={0} value={price} onChange={e => setPrice(e.target.value)} placeholder="49"
                  className="flex-1 text-sm text-white py-2.5 px-2 outline-none" style={{ background: 'transparent' }} />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-white/35 uppercase tracking-wider mb-1.5 block">Variable Cost Per Unit</label>
              <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)', background: '#161b22' }}>
                <span className="text-white/40 px-3">$</span>
                <input type="number" min={0} value={variableCost} onChange={e => setVariableCost(e.target.value)} placeholder="0"
                  className="flex-1 text-sm text-white py-2.5 px-2 outline-none" style={{ background: 'transparent' }} />
              </div>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-white/35 uppercase tracking-wider mb-1.5 block">Current Monthly Units Sold <span className="text-white/20 normal-case font-normal">(optional — shows your progress)</span></label>
              <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)', background: '#161b22' }}>
                <input type="number" min={0} value={currentUnits} onChange={e => setCurrentUnits(e.target.value)} placeholder="Leave blank if unknown"
                  className="flex-1 text-sm text-white py-2.5 px-3 outline-none" style={{ background: 'transparent' }} />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button onClick={loadExample} disabled={loading} className="px-4 py-3 rounded-xl text-sm font-bold border transition-colors hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>Try Example →</button>
            <button onClick={calculate} disabled={loading || !fixedCosts || !price}
              className="px-6 py-3 rounded-xl text-sm font-black text-white transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 20px rgba(124,58,237,0.35)' }}>
              {loading ? 'Calculating…' : 'Calculate Break-Even'}
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>}
        {paywall && !loading && (
          <div className="rounded-2xl border p-8 text-center" style={{ background: 'rgba(167,139,250,0.05)', borderColor: 'rgba(167,139,250,0.2)' }}>
            <h3 className="text-xl font-black text-white mb-2">Unlimited calculations with Pro</h3>
            <Link href="/pricing" className="inline-flex px-6 py-3 rounded-xl text-sm font-black text-black mt-4" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Upgrade to Pro →</Link>
          </div>
        )}

        {result && r && (
          <div className="space-y-5">
            <div className="rounded-2xl border p-6" style={{ background: result.isAlreadyProfitable ? 'rgba(74,222,128,0.06)' : '#0d1117', borderColor: result.isAlreadyProfitable ? 'rgba(74,222,128,0.25)' : 'rgba(167,139,250,0.25)' }}>
              <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: result.isAlreadyProfitable ? '#4ade80' : '#a78bfa' }}>Break-Even Point</p>
              <div className="flex flex-wrap gap-8 mb-3">
                <div>
                  <p className="text-4xl font-black text-white">{fmt(r.breakEvenUnits)} <span className="text-lg text-white/40">units</span></p>
                </div>
                <div>
                  <p className="text-4xl font-black text-white">{fmtMoney(r.breakEvenRevenue)} <span className="text-lg text-white/40">revenue</span></p>
                </div>
              </div>
              <p className="text-sm text-white/65">{result.explanation}</p>

              {progressPct !== null && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-white/40 mb-1.5">
                    <span>Current: {fmt(parseInt(currentUnits))} units</span>
                    <span>{progressPct.toFixed(0)}% to break-even</span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, background: result.isAlreadyProfitable ? 'linear-gradient(90deg,#4ade80,#16a34a)' : 'linear-gradient(90deg,#a78bfa,#7c3aed)' }} />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <p className="text-xs font-black uppercase tracking-wider text-white/35 mb-1">Contribution Margin</p>
                <p className="text-2xl font-black text-white">{fmtMoney(r.contributionMargin)}</p>
                <p className="text-xs text-white/35 mt-0.5">{fmtPct(r.contributionMarginPct)} of revenue per unit</p>
              </div>
              {r.currentProfit !== null && (
                <div className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: r.currentProfit >= 0 ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)' }}>
                  <p className="text-xs font-black uppercase tracking-wider text-white/35 mb-1">Current Monthly Profit</p>
                  <p className="text-2xl font-black" style={{ color: r.currentProfit >= 0 ? '#4ade80' : '#f87171' }}>{r.currentProfit >= 0 ? '+' : ''}{fmtMoney(r.currentProfit)}</p>
                  <p className="text-xs text-white/35 mt-0.5">{r.currentProfit >= 0 ? 'You are profitable' : 'Operating at a loss'}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white/35 mb-3">Units Needed for Profit Targets</p>
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <table className="w-full text-sm">
                  <thead><tr style={{ background: '#0a0f1a' }}>
                    <th className="text-left px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white/30">Target Profit</th>
                    <th className="text-right px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white/30">Units Needed</th>
                    <th className="text-right px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white/30">Revenue Needed</th>
                  </tr></thead>
                  <tbody>
                    {result.profitTargets.map((t, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#0d1117' : '#0a0f1a', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <td className="px-4 py-2.5 font-bold text-white">{fmtMoney(t.targetProfit)}/mo</td>
                        <td className="px-4 py-2.5 text-right text-white/70">{fmt(t.unitsNeeded)}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-white">{fmtMoney(t.revenueNeeded)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {(() => {
              const fc = +fixedCosts || 0
              const vc = +variableCost || 0
              const p = +price || 1
              const beu = r.breakEvenUnits
              const maxUnits = Math.max(beu * 1.8, currentUnits ? +currentUnits * 1.3 : beu * 1.8)
              const maxVal = p * maxUnits
              const W = 560; const H = 260
              const PAD = { top: 20, right: 20, bottom: 36, left: 56 }
              const cW = W - PAD.left - PAD.right
              const cH = H - PAD.top - PAD.bottom
              const toX = (u: number) => PAD.left + (u / maxUnits) * cW
              const toY = (v: number) => PAD.top + cH - Math.min(1, v / maxVal) * cH
              const pts = [0, beu * 0.3, beu * 0.7, beu, maxUnits]
              const costPts = pts.map(u => `${toX(u)},${toY(fc + vc * u)}`).join(' ')
              const revPts = pts.map(u => `${toX(u)},${toY(p * u)}`).join(' ')
              const bex = toX(beu)
              const bey = toY(p * beu)
              return (
                <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Break-Even Chart</p>
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 260 }}>
                    {[0.25, 0.5, 0.75, 1].map(f => (
                      <line key={f} x1={PAD.left} x2={W - PAD.right} y1={PAD.top + cH * (1 - f)} y2={PAD.top + cH * (1 - f)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    ))}
                    <polyline points={costPts} fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points={revPts} fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx={bex} cy={bey} r="5" fill="#a78bfa" />
                    <line x1={bex} x2={bex} y1={bey} y2={PAD.top + cH} stroke="rgba(167,139,250,0.3)" strokeWidth="1" strokeDasharray="4,4" />
                    <text x={PAD.left - 6} y={PAD.top + cH + 4} fill="rgba(255,255,255,0.25)" fontSize="10" textAnchor="end">$0</text>
                    <text x={PAD.left - 6} y={PAD.top + 4} fill="rgba(255,255,255,0.25)" fontSize="10" textAnchor="end">${Math.round(maxVal).toLocaleString()}</text>
                    <text x={bex} y={PAD.top + cH + 26} fill="#a78bfa" fontSize="10" textAnchor="middle">{beu.toLocaleString()} units</text>
                    <text x={W - PAD.right} y={PAD.top + cH + 26} fill="rgba(255,255,255,0.2)" fontSize="9" textAnchor="end">{Math.round(maxUnits).toLocaleString()} units</text>
                  </svg>
                  <div className="flex items-center gap-6 mt-2 justify-center">
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}><div className="w-6 h-0.5 rounded" style={{ background: '#f87171' }} /> Total Cost</div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}><div className="w-6 h-0.5 rounded" style={{ background: '#4ade80' }} /> Revenue</div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}><div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: '#a78bfa' }} /> Break-even</div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        <div className="mt-10 mb-8">
          <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Who This Is For</p>
          <ul className="space-y-2 text-sm text-white/55">
            <li>• Founders pricing a new product and calculating how many units to sell to break even</li>
            <li>• E-commerce operators setting minimum order quantities and margin targets</li>
            <li>• Finance leads presenting contribution margin and profit-target scenarios to the board</li>
            <li>• Consultants modeling client pricing strategies with fixed vs variable cost breakdowns</li>
          </ul>
        </div>
        <div className="mt-6 mb-10 rounded-2xl border p-6 text-center" style={{ background: 'rgba(6,214,255,0.04)', borderColor: 'rgba(6,214,255,0.12)' }}>
          <p className="text-white font-black mb-1">Add break-even analysis to your platform</p>
          <p className="text-white/40 text-sm mb-4">Break-even units and revenue, contribution margin, profit-target table, visual chart. One-time license.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Get this tool — $15 →</Link>
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>All 51 tools — from $149 →</Link>
          </div>
        </div>
        <section className="mt-16 pt-8 border-t max-w-2xl" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-lg font-black text-white mb-4">Understanding break-even and contribution margin</h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#A1A1AA' }}>Contribution margin is what&apos;s left from each sale after subtracting variable costs. If you sell a product for $100 and it costs $30 to produce and ship, your contribution margin is $70 (70%). Every unit sold contributes $70 toward covering your fixed costs. Once your total contribution margin equals your fixed costs, you&apos;ve broken even. Every unit after that is pure profit.</p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#A1A1AA' }}>Fixed costs are expenses that don&apos;t change with sales volume — rent, salaries, SaaS subscriptions, insurance. Variable costs change directly with each sale — materials, payment processing fees, shipping, commissions. The distinction matters because high fixed cost businesses (software, media) have dramatically better unit economics as they scale: fixed costs stay flat while contribution margin compounds. High variable cost businesses (manufacturing, services) scale more linearly.</p>
          <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>Healthy gross margins vary significantly by industry. SaaS companies typically target 70–85% gross margin. E-commerce businesses run 30–50%. Manufacturing businesses often see 25–40%. Agencies and services run 40–60%. If your contribution margin per unit is very low, break-even requires enormous volume — which is either the business model (high-volume commodities) or a signal to raise prices or reduce variable costs before scaling further.</p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
