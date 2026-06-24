'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PaywallCard from '@/components/PaywallCard'

interface Vendor { name: string; category: string; totalSpend: number; transactions: number }
interface Result {
  totalTransactions: number; saasTransactions: number; matchRate: number
  totalSaasSpend: number; annualProjection: number; potentialSavings: number
  vendors: Vendor[]; byCategory: Record<string, number>; flags: string[]
}

export default function SaasSpendPage() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)

  const analyze = async () => {
    if (!content.trim()) return
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    try {
      const res = await fetch('/api/tools/saas-spend', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const data = await res.json()
      if (data.paywall || res.status === 402) { setPaywall(true); return }
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setResult(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Analysis failed') }
    finally { setLoading(false) }
  }

  const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const EXAMPLE_STATEMENT = `2024-01-05\tSLACK*MONTHLY SUBSCRIPTION\t18.75
2024-01-07\tGITHUB.COM/SUBSCRIPTIONS\t21.00
2024-01-08\tZOOM.US/BILLING\t15.99
2024-01-10\tNOTION.SO*PLUS\t16.00
2024-01-12\tFIGMA.COM/MONTHLY\t15.00
2024-01-14\tLINEAR.APP/SUBSCRIPTION\t8.00
2024-01-15\tVERCEL.COM/PRO\t20.00
2024-01-17\tDATADOG INC\t31.00
2024-01-19\t1PASSWORD.COM\t3.99
2024-01-20\tLOOM*SUBSCRIPTION\t12.50
2024-01-22\tHUBSPOT.COM/BILLING\t50.00
2024-01-23\tMAILCHIMP/SUBSCRIPTION\t13.00
2024-01-25\tAWS/USAGE\t187.42
2024-01-28\tDIGITALOCEAN.COM\t24.00
2024-01-29\tCLOUDFLARE PRO PLAN\t20.00
2024-01-30\tINTERCOM.IO/MONTHLY\t74.00`

  const loadExample = () => {
    setContent(EXAMPLE_STATEMENT)
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    fetch('/api/tools/saas-spend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: EXAMPLE_STATEMENT }) })
      .then(r => r.json()).then(data => {
        if (data.paywall) { setPaywall(true); return }
        if (data.error) throw new Error(data.error)
        setResult(data)
      }).catch(e => setError(e.message)).finally(() => setLoading(false))
  }

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/tools" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#4ade80', borderColor: 'rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.08)' }}>Live</span>
          <span className="text-sm font-bold text-white/30">Pro Tool · 1 free analysis/day · Unlimited with Pro</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">SaaS Spend <span style={{ color: '#4ade80' }}>Optimizer</span></h1>
        <p className="text-white/55 text-base mb-4 max-w-2xl">Paste your bank or credit card statement export and instantly see all SaaS subscriptions, total spend, category breakdown, and consolidation opportunities.</p>
        <div className="flex gap-3 flex-wrap mb-6">
          <Link href="/pricing" className="inline-flex items-center gap-1 text-sm font-black px-4 py-2 rounded-xl text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Get this tool — $49 →</Link>
          <Link href="/pricing" className="inline-flex items-center gap-1 text-sm font-black px-4 py-2 rounded-xl border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>All 51 tools — from $99 →</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">How it works</p>
            <p className="text-sm text-white/60 leading-relaxed">Parses CSV or tab-separated bank/card statement exports and matches transaction descriptions against a database of 60+ SaaS vendor name patterns. Identifies duplicate tools in the same category, calculates annual run-rate, and estimates potential savings from consolidation. Your data never leaves your browser — parsing happens server-side in memory and is not stored.</p>
          </div>
          <div className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">What you get</p>
            <ul className="space-y-2">
              {['Every SaaS subscription identified from your statement', 'Monthly and annual spend per vendor', 'Category breakdown (Communication, DevOps, Marketing, etc.)', 'Consolidation flags: duplicate tools in the same category', 'Estimated savings at 25% consolidation rate'].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/55">
                  <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border p-5 mb-5" style={{ background: 'rgba(74,222,128,0.04)', borderColor: 'rgba(74,222,128,0.15)' }}>
          <p className="text-xs font-bold text-green-400 mb-1">How to export your transactions</p>
          <p className="text-xs text-white/50">In your bank or card portal, export the last 1-3 months as CSV. Paste the content below. Columns needed: <span className="font-mono text-white/65">date, description, amount</span> (tab, comma, or pipe separated).</p>
        </div>

        <div className="rounded-2xl border p-6 mb-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <textarea value={content} onChange={e => setContent(e.target.value)}
            placeholder={`Paste CSV or tab-separated bank statement:\n\n2024-01-05\tSLACK*MONTHLY\t18.75\n2024-01-07\tGITHUB.COM\t21.00\n2024-01-10\tZOOM.US\t15.99\n2024-01-12\tNOTION.SO\t16.00`}
            rows={14} className="w-full text-sm text-white/75 placeholder-white/20 outline-none resize-y font-mono"
            style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '14px 16px', minHeight: 300 }} />
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={loadExample} className="px-4 py-3 rounded-xl text-sm font-bold border transition-colors hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>Try Example →</button>
            <button onClick={analyze} disabled={loading || !content.trim()}
              className="px-6 py-3 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#4ade80,#16a34a)', boxShadow: '0 0 20px rgba(74,222,128,0.3)' }}>
              {loading ? 'Analyzing…' : 'Analyze Spend'}
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>}
        {paywall && !loading && <PaywallCard toolId="saas-spend" toolName="SaaS Spend Optimizer" oneTimePrice={49} freeLimit={1} accent="#4ade80" />}



        {result && (
          <div className="space-y-5">
            <div className="rounded-2xl border p-6 grid grid-cols-2 md:grid-cols-4 gap-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="text-center">
                <div className="text-4xl font-black text-white">{fmt(result.totalSaasSpend)}</div>
                <div className="text-xs text-white/40 mt-1 font-bold uppercase tracking-wider">Monthly SaaS</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black" style={{ color: '#f87171' }}>{fmt(result.annualProjection)}</div>
                <div className="text-xs text-white/40 mt-1 font-bold uppercase tracking-wider">Annual Run-rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black" style={{ color: '#4ade80' }}>{fmt(result.potentialSavings)}</div>
                <div className="text-xs text-white/40 mt-1 font-bold uppercase tracking-wider">Est. Savings (25%)</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-white">{result.vendors?.length ?? 0}</div>
                <div className="text-xs text-white/40 mt-1 font-bold uppercase tracking-wider">SaaS Vendors</div>
              </div>
            </div>

            {result.flags?.length > 0 && (
              <div className="rounded-xl border p-5" style={{ background: 'rgba(251,146,60,0.05)', borderColor: 'rgba(251,146,60,0.2)' }}>
                <p className="text-xs font-black uppercase tracking-widest text-orange-400 mb-3">Optimization Flags</p>
                {result.flags.map((f, i) => <p key={i} className="text-sm text-white/65 mb-1.5 flex items-start gap-2"><span className="text-orange-400 flex-shrink-0">!</span>{f}</p>)}
              </div>
            )}

            {result.byCategory && Object.keys(result.byCategory).length > 0 && (
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-white/35 mb-3">Spend by Category</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(result.byCategory).map(([cat, spend]) => (
                    <div key={cat} className="rounded-xl border px-4 py-3 flex items-center justify-between" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.06)' }}>
                      <span className="text-sm text-white/60">{cat}</span>
                      <span className="text-sm font-black text-white">{fmt(spend as number)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.vendors?.length > 0 && (
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-white/35 mb-3">Vendor Breakdown</p>
                <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <table className="w-full text-sm">
                    <thead><tr style={{ background: '#0a0f1a' }}>
                      <th className="text-left px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white/30">Vendor</th>
                      <th className="text-left px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white/30">Category</th>
                      <th className="text-right px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white/30">Monthly</th>
                      <th className="text-right px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white/30">Txns</th>
                    </tr></thead>
                    <tbody>
                      {result.vendors.map((v, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? '#0d1117' : '#0a0f1a', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                          <td className="px-4 py-2.5 font-bold text-white">{v.name}</td>
                          <td className="px-4 py-2.5 text-white/50">{v.category}</td>
                          <td className="px-4 py-2.5 text-right font-black text-white">{fmt(v.totalSpend)}</td>
                          <td className="px-4 py-2.5 text-right text-white/40">{v.transactions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-10 mb-8">
          <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Who This Is For</p>
          <ul className="space-y-2 text-sm text-white/55">
            <li>• Startup founders auditing SaaS subscriptions before a fundraise or board review</li>
            <li>• Finance teams spotting duplicate tools and unused subscriptions from bank exports</li>
            <li>• CTOs identifying shadow IT and vendor sprawl from CSV transaction data</li>
            <li>• Operations leads finding 25%+ savings before a quarterly budget review</li>
          </ul>
        </div>

        <div className="mt-14 rounded-2xl border p-6 text-center" style={{ background: 'rgba(6,214,255,0.04)', borderColor: 'rgba(6,214,255,0.12)' }}>
          <p className="text-white font-black mb-1">Add SaaS spend analysis to your platform</p>
          <p className="text-white/40 text-sm mb-4">60+ vendor pattern matching, duplicate flags, category breakdown, CSV import. One-time license.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Get this tool — $49 →</Link>
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>All 51 tools — from $99 →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
