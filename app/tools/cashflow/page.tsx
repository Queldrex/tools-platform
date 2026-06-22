'use client'
import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface PlannedExpense { month: number; amount: number; description: string }

interface MonthRow {
  month: number; label: string; revenue: number; variableCosts: number; fixedCosts: number
  plannedExpense: number; totalCosts: number; netCashFlow: number; cashBalance: number; profitable: boolean
}

interface Summary {
  startingCash: number; endingCash: number; totalRevenue: number; totalCosts: number
  netProfit: number; runway: number | null; breakEvenMonth: number | null
  peakCash: number; peakCashMonth: number; lowestCash: number; lowestCashMonth: number
  averageMonthlyProfit: number
}

interface Result { months: MonthRow[]; summary: Summary; alerts: string[]; horizonMonths: number }

const fmt = (n: number) => n < 0 ? `-$${Math.abs(n).toLocaleString()}` : `$${n.toLocaleString()}`

function SummaryCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.06)' }}>
      <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-1">{label}</p>
      <p className="text-xl font-black" style={{ color: color ?? 'white' }}>{value}</p>
    </div>
  )
}

function BarChart({ months }: { months: MonthRow[] }) {
  if (!months.length) return null
  const maxVal = Math.max(...months.map(m => Math.max(m.revenue, m.totalCosts)), 1)
  const W = 560; const H = 180
  const PAD = { top: 8, right: 8, bottom: 28, left: 8 }
  const cW = W - PAD.left - PAD.right
  const cH = H - PAD.top - PAD.bottom
  const groupW = cW / months.length
  const barW = Math.max(2, groupW * 0.38)

  return (
    <div className="mt-1">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 180 }}>
        {months.map((m, i) => {
          const x = PAD.left + i * groupW
          const revH = (m.revenue / maxVal) * cH
          const costH = (m.totalCosts / maxVal) * cH
          const isProfit = m.profitable
          return (
            <g key={m.month}>
              <rect
                x={x + groupW * 0.08} y={PAD.top + cH - revH}
                width={barW} height={revH} rx="2"
                fill={isProfit ? 'rgba(74,222,128,0.7)' : 'rgba(74,222,128,0.35)'}
              />
              <rect
                x={x + groupW * 0.08 + barW + 2} y={PAD.top + cH - costH}
                width={barW} height={costH} rx="2"
                fill="rgba(248,113,113,0.55)"
              />
              {months.length <= 12 && (
                <text x={x + groupW / 2} y={H - 6} fontSize="8" fill="rgba(255,255,255,0.25)" textAnchor="middle">
                  {m.label.replace(/\s\d{4}/, '').slice(0, 3)}
                </text>
              )}
            </g>
          )
        })}
        <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + cH} y2={PAD.top + cH} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      </svg>
      <div className="flex gap-5 justify-center mt-2">
        <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(74,222,128,0.7)' }} /> Revenue
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(248,113,113,0.55)' }} /> Total Costs
        </div>
      </div>
    </div>
  )
}

export default function CashFlowPage() {
  const [startingCash, setStartingCash] = useState('10000')
  const [monthlyRevenue, setMonthlyRevenue] = useState('5000')
  const [revenueGrowthRate, setRevenueGrowthRate] = useState('5')
  const [monthlyFixedCosts, setMonthlyFixedCosts] = useState('3000')
  const [variableCostPct, setVariableCostPct] = useState('20')
  const [months, setMonths] = useState('12')
  const [plannedExpenses, setPlannedExpenses] = useState<PlannedExpense[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)

  const addExpense = () => setPlannedExpenses(e => [...e, { month: 1, amount: 0, description: '' }])
  const removeExpense = (i: number) => setPlannedExpenses(e => e.filter((_, idx) => idx !== i))
  const updateExpense = (i: number, field: keyof PlannedExpense, val: string | number) =>
    setPlannedExpenses(e => e.map((item, idx) => idx === i ? { ...item, [field]: val } : item))

  const calculate = async () => {
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    try {
      const res = await fetch('/api/tools/cashflow', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startingCash: Number(startingCash), monthlyRevenue: Number(monthlyRevenue),
          revenueGrowthRate: Number(revenueGrowthRate), monthlyFixedCosts: Number(monthlyFixedCosts),
          variableCostPct: Number(variableCostPct), plannedExpenses, months: Number(months),
        }),
      })
      const data = await res.json()
      if (data.paywall || res.status === 402) { setPaywall(true); return }
      if (!res.ok) throw new Error(data.error || 'Calculation failed')
      setResult(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Calculation failed') }
    finally { setLoading(false) }
  }

  const inp = "w-full text-sm text-white/80 outline-none"
  const inpStyle = { background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '11px 16px' }

  const loadExample = async () => {
    const ex = { startingCash: 120000, monthlyRevenue: 18000, revenueGrowthRate: 8, monthlyFixedCosts: 22000, variableCostPct: 15, plannedExpenses: [], months: 12 }
    setStartingCash('120000'); setMonthlyRevenue('18000'); setRevenueGrowthRate('8')
    setMonthlyFixedCosts('22000'); setVariableCostPct('15'); setMonths('12'); setPlannedExpenses([])
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    try {
      const res = await fetch('/api/tools/cashflow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ex) })
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
      <main className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/tools" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          All Tools
        </Link>
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#4ade80', borderColor: 'rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.08)' }}>Free</span>
          <span className="text-sm font-bold text-white/30">5 free forecasts/day · Unlimited with $79/month Pro</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">Cash Flow <span style={{ color: '#4ade80' }}>Forecaster</span></h1>
        <p className="text-white/55 text-base mb-6 max-w-2xl">Project your business cash position month by month. Model revenue growth, fixed costs, variable costs, and one-time expenses to see runway and break-even.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">How it works</p>
            <p className="text-sm text-white/60 leading-relaxed">Projects your monthly cash flow for up to 24 months by compounding revenue growth against fixed and variable costs. Calculates your runway (months until cash hits zero if currently burning), break-even month (first month cumulative cash flow turns positive), and peak/lowest cash positions. Add one-time planned expenses (hiring, equipment, campaigns) to see their impact on runway.</p>
          </div>
          <div className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">What you get</p>
            <ul className="space-y-2">
              {['Month-by-month revenue, costs, net cash flow, and balance', 'Runway in months before cash runs out (if applicable)', 'Break-even month — when cumulative cash turns positive', 'Burn rate alerts when cash drops below 3 months of fixed costs', 'Color-coded table: green rows = profitable months, red = burning'].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/55"><span className=”text-green-400 mt-0.5 flex-shrink-0”>✓</span>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border p-6 mb-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-white/35 mb-1.5">Starting Cash</label>
              <div className="flex items-center gap-0" style={inpStyle}>
                <span className="text-white/30 text-sm mr-1">$</span>
                <input type="number" value={startingCash} onChange={e => setStartingCash(e.target.value)} className={`${inp} flex-1`} style={{ background: 'transparent' }} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-white/35 mb-1.5">Monthly Revenue</label>
              <div className="flex items-center gap-0" style={inpStyle}>
                <span className="text-white/30 text-sm mr-1">$</span>
                <input type="number" value={monthlyRevenue} onChange={e => setMonthlyRevenue(e.target.value)} className={`${inp} flex-1`} style={{ background: 'transparent' }} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-white/35 mb-1.5">Revenue Growth Rate</label>
              <div className="flex items-center gap-0" style={inpStyle}>
                <input type="number" value={revenueGrowthRate} onChange={e => setRevenueGrowthRate(e.target.value)} className={`${inp} flex-1`} style={{ background: 'transparent' }} />
                <span className="text-white/30 text-sm ml-1">%/mo</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-white/35 mb-1.5">Monthly Fixed Costs</label>
              <div className="flex items-center gap-0" style={inpStyle}>
                <span className="text-white/30 text-sm mr-1">$</span>
                <input type="number" value={monthlyFixedCosts} onChange={e => setMonthlyFixedCosts(e.target.value)} className={`${inp} flex-1`} style={{ background: 'transparent' }} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-white/35 mb-1.5">Variable Cost % of Revenue</label>
              <div className="flex items-center gap-0" style={inpStyle}>
                <input type="number" value={variableCostPct} onChange={e => setVariableCostPct(e.target.value)} className={`${inp} flex-1`} style={{ background: 'transparent' }} />
                <span className="text-white/30 text-sm ml-1">%</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-white/35 mb-1.5">Forecast Horizon</label>
              <div className="flex items-center gap-0" style={inpStyle}>
                <input type="number" value={months} min={1} max={24} onChange={e => setMonths(e.target.value)} className={`${inp} flex-1`} style={{ background: 'transparent' }} />
                <span className="text-white/30 text-sm ml-1">months</span>
              </div>
            </div>
          </div>

          <div className="border-t mb-4 pt-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black uppercase tracking-widest text-white/30">One-time Planned Expenses</p>
              <button onClick={addExpense} className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
                + Add Expense
              </button>
            </div>
            {plannedExpenses.map((exp, i) => (
              <div key={i} className="flex gap-3 mb-2 items-center">
                <div className="flex items-center" style={{ ...inpStyle, padding: '8px 12px', flex: '0 0 90px' }}>
                  <span className="text-white/30 text-xs mr-1">Mo.</span>
                  <input type="number" min={1} max={Number(months)} value={exp.month} onChange={e => updateExpense(i, 'month', Number(e.target.value))} className="w-full text-xs text-white/80 outline-none" style={{ background: 'transparent' }} />
                </div>
                <div className="flex items-center flex-1" style={{ ...inpStyle, padding: '8px 12px' }}>
                  <span className="text-white/30 text-xs mr-1">$</span>
                  <input type="number" value={exp.amount} onChange={e => updateExpense(i, 'amount', Number(e.target.value))} placeholder="Amount" className="w-full text-xs text-white/80 outline-none" style={{ background: 'transparent' }} />
                </div>
                <div className="flex-1" style={{ ...inpStyle, padding: '8px 12px' }}>
                  <input type="text" value={exp.description} onChange={e => updateExpense(i, 'description', e.target.value)} placeholder="Description (e.g. Trade show)" className="w-full text-xs text-white/80 outline-none" style={{ background: 'transparent' }} />
                </div>
                <button onClick={() => removeExpense(i)} className="text-white/25 hover:text-red-400 transition-colors text-lg font-bold">×</button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button onClick={loadExample} disabled={loading} className="px-4 py-3 rounded-xl text-sm font-bold border transition-colors hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>Try Example →</button>
            <button onClick={calculate} disabled={loading}
              className="px-6 py-3 rounded-xl text-sm font-black text-black disabled:opacity-40 transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg,#4ade80,#16a34a)', boxShadow: '0 0 20px rgba(74,222,128,0.25)' }}>
              {loading ? 'Calculating…' : 'Forecast Cash Flow'}
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-900/40 bg-red-950/20 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>}
        {paywall && !loading && (
          <div className="rounded-2xl border p-8 text-center mb-6" style={{ background: 'rgba(74,222,128,0.05)', borderColor: 'rgba(74,222,128,0.2)' }}>
            <h3 className="text-xl font-black text-white mb-2">Unlimited forecasts with Pro</h3>
            <p className="text-white/50 text-sm mb-6">Forecast up to 24 months, unlimited scenarios — $79/month.</p>
            <Link href="/pricing" className="inline-flex px-6 py-3 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#4ade80,#16a34a)' }}>Start Pro — $79/month</Link>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {result.alerts.length > 0 && (
              <div className="rounded-xl border p-4" style={{ background: 'rgba(251,191,36,0.05)', borderColor: 'rgba(251,191,36,0.25)' }}>
                <p className="text-xs font-black uppercase tracking-widest text-amber-400 mb-2">Alerts</p>
                {result.alerts.map((a, i) => <p key={i} className="text-sm text-white/65 flex gap-2"><span className="text-amber-400">⚠</span>{a}</p>)}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SummaryCard label="Ending Cash" value={fmt(result.summary.endingCash)} color={result.summary.endingCash >= 0 ? '#4ade80' : '#f87171'} />
              <SummaryCard label="Total Revenue" value={fmt(result.summary.totalRevenue)} color="#4ade80" />
              <SummaryCard label="Net Profit" value={fmt(result.summary.netProfit)} color={result.summary.netProfit >= 0 ? '#4ade80' : '#f87171'} />
              <SummaryCard label="Runway" value={result.summary.runway === null ? 'Healthy' : `${result.summary.runway} mo`} color={result.summary.runway === null ? '#4ade80' : result.summary.runway <= 3 ? '#f87171' : '#facc15'} />
            </div>

            {result.summary.breakEvenMonth && (
              <div className="rounded-xl border px-5 py-3 flex items-center gap-3" style={{ background: 'rgba(74,222,128,0.06)', borderColor: 'rgba(74,222,128,0.2)' }}>
                <span className=”text-green-400 text-lg”>✓</span>
                <p className="text-sm text-white/65">Breaks even in <span className="font-bold text-green-400">Month {result.summary.breakEvenMonth}</span> ({result.months[result.summary.breakEvenMonth - 1]?.label})</p>
              </div>
            )}

            <div className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-3">Cash Balance Trend</p>
              <BarChart months={result.months} />
            </div>

            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <th className="text-left px-4 py-3 font-black uppercase tracking-widest text-white/25">Month</th>
                      <th className="text-right px-4 py-3 font-black uppercase tracking-widest text-white/25">Revenue</th>
                      <th className="text-right px-4 py-3 font-black uppercase tracking-widest text-white/25">Costs</th>
                      <th className="text-right px-4 py-3 font-black uppercase tracking-widest text-white/25">Net</th>
                      <th className="text-right px-4 py-3 font-black uppercase tracking-widest text-white/25">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.months.map(m => (
                      <tr key={m.month} style={{ background: m.profitable ? 'rgba(74,222,128,0.03)' : 'rgba(248,113,113,0.04)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td className="px-4 py-2.5 text-white/55 font-medium">{m.label}</td>
                        <td className="px-4 py-2.5 text-right text-green-400/80 font-bold">{fmt(m.revenue)}</td>
                        <td className="px-4 py-2.5 text-right text-white/40">{fmt(m.totalCosts)}</td>
                        <td className="px-4 py-2.5 text-right font-bold" style={{ color: m.netCashFlow >= 0 ? '#4ade80' : '#f87171' }}>{fmt(m.netCashFlow)}</td>
                        <td className="px-4 py-2.5 text-right font-bold" style={{ color: m.cashBalance >= 0 ? 'white' : '#f87171' }}>{fmt(m.cashBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
