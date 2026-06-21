'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const GRADE_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  Excellent: { color: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)' },
  Good: { color: '#a3e635', bg: 'rgba(163,230,53,0.1)', border: 'rgba(163,230,53,0.25)' },
  Concerning: { color: '#facc15', bg: 'rgba(250,204,21,0.1)', border: 'rgba(250,204,21,0.25)' },
  Critical: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
}

interface Metric { value: number | null; formatted: string; grade?: string | null; label: string; description: string }
interface Result { metrics: Record<string, Metric> }

function MetricCard({ m }: { m: Metric }) {
  const gs = m.grade ? GRADE_STYLE[m.grade] : null
  return (
    <div className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: gs ? gs.border : 'rgba(255,255,255,0.08)' }}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-xs font-black uppercase tracking-wider text-white/40">{m.label}</p>
        {m.grade && gs && <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ color: gs.color, background: gs.bg, border: `1px solid ${gs.border}` }}>{m.grade}</span>}
      </div>
      <p className="text-2xl font-black text-white mb-1">{m.formatted}</p>
      <p className="text-xs text-white/35 leading-relaxed">{m.description}</p>
    </div>
  )
}

function Field({ label, value, onChange, prefix = '', suffix = '', placeholder = '0' }: { label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-bold text-white/35 uppercase tracking-wider mb-1.5 block">{label}</label>
      <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)', background: '#161b22' }}>
        {prefix && <span className="text-white/40 text-sm px-3">{prefix}</span>}
        <input type="number" min={0} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="flex-1 text-sm text-white py-2 px-3 outline-none" style={{ background: 'transparent' }} />
        {suffix && <span className="text-white/40 text-sm px-3">{suffix}</span>}
      </div>
    </div>
  )
}

export default function SaasMetricsPage() {
  const [mrr, setMrr] = useState('')
  const [newMrr, setNewMrr] = useState('')
  const [churnedMrr, setChurnedMrr] = useState('')
  const [customers, setCustomers] = useState('')
  const [newCustomers, setNewCustomers] = useState('')
  const [lostCustomers, setLostCustomers] = useState('')
  const [cac, setCac] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)

  const calculate = async () => {
    if (!mrr || !customers) return
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    try {
      const res = await fetch('/api/tools/saas-metrics', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mrr: +mrr, newMrr: +newMrr, churnedMrr: +churnedMrr, customers: +customers, newCustomers: +newCustomers, lostCustomers: +lostCustomers, cac: +cac }),
      })
      const data = await res.json()
      if (data.paywall || res.status === 402) { setPaywall(true); return }
      if (!res.ok) throw new Error(data.error || 'Calculation failed')
      setResult(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Calculation failed') }
    finally { setLoading(false) }
  }

  const primaryMetrics = result ? ['mrr', 'arr', 'arpu', 'churnRate', 'ltv', 'ltvCacRatio', 'cacPayback', 'quickRatio', 'nrr', 'netMrrGrowth'] : []

  const loadExample = async () => {
    const ex = { mrr: 25000, newMrr: 4500, churnedMrr: 800, customers: 300, newCustomers: 54, lostCustomers: 10, cac: 320 }
    setMrr('25000'); setNewMrr('4500'); setChurnedMrr('800')
    setCustomers('300'); setNewCustomers('54'); setLostCustomers('10'); setCac('320')
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    try {
      const res = await fetch('/api/tools/saas-metrics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ex) })
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
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#06d6ff', borderColor: 'rgba(6,214,255,0.3)', background: 'rgba(6,214,255,0.08)' }}>Free</span>
          <span className="text-sm font-bold text-white/30">Founder tool Â· No account needed</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">SaaS <span style={{ color: '#06d6ff' }}>Metrics Calculator</span></h1>
        <p className="text-white/55 text-base mb-6 max-w-2xl">Enter your monthly numbers and get every metric that matters â€” MRR, ARR, LTV, Churn, Quick Ratio, CAC Payback â€” with health grades.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">How it works</p>
            <p className="text-sm text-white/60 leading-relaxed">Calculates the 6 metrics that SaaS investors and operators use to evaluate business health. All calculations use standard industry formulas: LTV = ARPU Ã· Churn Rate, Quick Ratio = (New MRR + Expansion MRR) Ã· (Churned MRR + Contraction MRR), CAC Payback = CAC Ã· (ARPU Ã— Gross Margin). Each metric is graded against real-world SaaS benchmarks.</p>
          </div>
          <div className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">What you get</p>
            <ul className="space-y-2">
              {['MRR, ARR, and projected revenue at current growth', 'LTV:CAC ratio with benchmark grade (ideal is >3:1)', 'Net Revenue Retention (NRR) â€” the single most important SaaS metric', 'Quick Ratio graded: <1 = danger, 1-4 = growing, >4 = exceptional', 'CAC Payback Period: how many months to recover your acquisition cost'].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/55"><span className="text-green-400 mt-0.5 flex-shrink-0">âœ“</span>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border p-6 mb-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-4">This Month's Numbers</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
            <Field label="Total MRR *" value={mrr} onChange={setMrr} prefix="$" placeholder="10000" />
            <Field label="Total Customers *" value={customers} onChange={setCustomers} placeholder="200" />
            <Field label="New MRR Added" value={newMrr} onChange={setNewMrr} prefix="$" placeholder="1200" />
            <Field label="MRR Lost to Churn" value={churnedMrr} onChange={setChurnedMrr} prefix="$" placeholder="300" />
            <Field label="New Customers" value={newCustomers} onChange={setNewCustomers} placeholder="25" />
            <Field label="Customers Churned" value={lostCustomers} onChange={setLostCustomers} placeholder="6" />
            <Field label="Cost to Acquire Customer (CAC)" value={cac} onChange={setCac} prefix="$" placeholder="250" />
          </div>
          <div className="flex items-center justify-between">
            <button onClick={loadExample} disabled={loading} className="px-4 py-3 rounded-xl text-sm font-bold border transition-colors hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>Try Example â†’</button>
            <button onClick={calculate} disabled={loading || !mrr || !customers}
              className="px-6 py-3 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 20px rgba(6,214,255,0.3)' }}>
              {loading ? 'Calculatingâ€¦' : 'Calculate Metrics'}
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>}
        {paywall && !loading && (
          <div className="rounded-2xl border p-8 text-center" style={{ background: 'rgba(6,214,255,0.05)', borderColor: 'rgba(6,214,255,0.2)' }}>
            <h3 className="text-xl font-black text-white mb-2">Unlimited calculations with Pro</h3>
            <Link href="/pricing" className="inline-flex px-6 py-3 rounded-xl text-sm font-black text-black mt-4" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Start Pro â€” $79/month</Link>
          </div>
        )}

        {result && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {primaryMetrics.map(key => result.metrics[key] && <MetricCard key={key} m={result.metrics[key]} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
