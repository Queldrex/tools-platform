'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const PRODUCT_TYPES = [
  { value: 'digital', label: 'Digital', icon: '💻' },
  { value: 'physical', label: 'Physical', icon: '📦' },
  { value: 'subscription', label: 'Subscription', icon: '🔄' },
  { value: 'service', label: 'Service', icon: '🛠️' },
  { value: 'mixed', label: 'Mixed', icon: '🔀' },
]

interface Result { document: string; wordCount: number; disclaimer: string; companyName: string; effectiveDate: string }

function renderDocument(doc: string) {
  return doc.split('\n\n').map((para, i) => {
    const boldified = para.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    return <p key={i} className="mb-4 text-sm text-white/65 leading-relaxed" dangerouslySetInnerHTML={{ __html: boldified }} />
  })
}

export default function RefundPolicyPage() {
  const [form, setForm] = useState({
    companyName: '', productType: 'digital', refundWindowDays: '30',
    refundMethod: 'original', requiresReturn: false, restockingFee: '0',
    nonRefundableItems: '', jurisdiction: 'Colorado, USA', contactEmail: '', processingDays: '5',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)
  const [copied, setCopied] = useState(false)

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  const generate = async () => {
    if (!form.companyName.trim()) return
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    try {
      const res = await fetch('/api/tools/refund-policy', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          refundWindowDays: Number(form.refundWindowDays),
          restockingFee: Number(form.restockingFee),
          processingDays: Number(form.processingDays),
        }),
      })
      const data = await res.json()
      if (data.paywall || res.status === 402) { setPaywall(true); return }
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setResult(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Generation failed') }
    finally { setLoading(false) }
  }

  const copy = () => {
    if (!result) return
    navigator.clipboard.writeText(result.document).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const download = () => {
    if (!result) return
    const blob = new Blob([result.document], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'refund-policy.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  const inputCls = "w-full text-sm text-white rounded-lg px-3 py-2.5 outline-none"
  const inputStyle = { background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)' }

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <style>{`@media print { header, footer, nav, .no-print { display: none !important; } .print-content { color: black !important; background: white !important; } body { background: white !important; } }`}</style>
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/tools" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#fb923c', borderColor: 'rgba(251,146,60,0.3)', background: 'rgba(251,146,60,0.08)' }}>Free</span>
          <span className="text-sm font-bold text-white/30">2 free generations/day · Unlimited with $79/month</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">Refund Policy <span style={{ color: '#fb923c' }}>Generator</span></h1>
        <p className="text-white/55 text-base mb-8 max-w-2xl">Generate a professional, customer-friendly refund policy tailored to your product type and business rules. Ready to publish in seconds.</p>

        <div className="rounded-2xl border p-6 mb-6 space-y-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div>
            <label className="text-xs text-white/35 font-bold uppercase tracking-wider mb-2 block">Product Type</label>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_TYPES.map(t => (
                <button key={t.value} onClick={() => set('productType', t.value)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={form.productType === t.value
                    ? { background: 'rgba(251,146,60,0.15)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.3)' }
                    : { background: 'transparent', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span>{t.icon}</span> {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/35 font-bold uppercase tracking-wider mb-1.5 block">Company Name *</label>
              <input value={form.companyName} onChange={e => set('companyName', e.target.value)} placeholder="Acme Corp" className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="text-xs text-white/35 font-bold uppercase tracking-wider mb-1.5 block">Contact Email</label>
              <input type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} placeholder="support@yourcompany.com" className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="text-xs text-white/35 font-bold uppercase tracking-wider mb-1.5 block">Refund Window (days)</label>
              <input type="number" min={0} max={365} value={form.refundWindowDays} onChange={e => set('refundWindowDays', e.target.value)} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="text-xs text-white/35 font-bold uppercase tracking-wider mb-1.5 block">Processing Time (business days)</label>
              <input type="number" min={1} max={30} value={form.processingDays} onChange={e => set('processingDays', e.target.value)} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="text-xs text-white/35 font-bold uppercase tracking-wider mb-1.5 block">Refund Method</label>
              <select value={form.refundMethod} onChange={e => set('refundMethod', e.target.value)} className={inputCls} style={inputStyle}>
                <option value="original">Original payment method</option>
                <option value="store-credit">Store credit only</option>
                <option value="both">Original method or store credit</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/35 font-bold uppercase tracking-wider mb-1.5 block">Restocking Fee (%)</label>
              <input type="number" min={0} max={50} value={form.restockingFee} onChange={e => set('restockingFee', e.target.value)} placeholder="0" className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="text-xs text-white/35 font-bold uppercase tracking-wider mb-1.5 block">Jurisdiction</label>
              <input value={form.jurisdiction} onChange={e => set('jurisdiction', e.target.value)} placeholder="Colorado, USA" className={inputCls} style={inputStyle} />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/35 font-bold uppercase tracking-wider mb-1.5 block">Non-Refundable Items / Exceptions (optional)</label>
            <input value={form.nonRefundableItems} onChange={e => set('nonRefundableItems', e.target.value)}
              placeholder="e.g. downloadable files once accessed, custom orders, gift cards" className={inputCls} style={inputStyle} />
          </div>

          {(form.productType === 'physical' || form.productType === 'mixed') && (
            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => set('requiresReturn', !form.requiresReturn)}
                className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                style={{ background: form.requiresReturn ? 'rgba(251,146,60,0.2)' : 'transparent', border: `2px solid ${form.requiresReturn ? '#fb923c' : 'rgba(255,255,255,0.15)'}` }}>
                {form.requiresReturn && <svg className="w-3 h-3 text-orange-400" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
              </div>
              <span className="text-sm text-white/55">Customers must return the item before receiving a refund</span>
            </label>
          )}

          <div className="flex justify-end">
            <button onClick={generate} disabled={loading || !form.companyName.trim()}
              className="px-7 py-3 rounded-xl text-sm font-black text-white transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 0 20px rgba(249,115,22,0.3)' }}>
              {loading ? 'Generating…' : 'Generate Refund Policy'}
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>}
        {paywall && !loading && (
          <div className="rounded-2xl border p-8 text-center mb-6" style={{ background: 'rgba(251,146,60,0.05)', borderColor: 'rgba(251,146,60,0.2)' }}>
            <h3 className="text-xl font-black text-white mb-2">Unlimited generations with Pro</h3>
            <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">Pro unlocks unlimited policy generation, all premium tools, and AI visibility monitoring — $79/month.</p>
            <Link href="/monitor" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Start Pro — $79/month</Link>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="rounded-xl border px-5 py-3" style={{ background: 'rgba(251,146,60,0.05)', borderColor: 'rgba(251,146,60,0.2)' }}>
              <p className="text-xs font-bold text-orange-400">Legal Disclaimer</p>
              <p className="text-xs text-white/45 mt-0.5">{result.disclaimer}</p>
            </div>
            <div className="rounded-2xl border p-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-black text-white">Refund Policy — {result.companyName}</h2>
                  <p className="text-xs text-white/35 mt-0.5">Effective {result.effectiveDate} · ~{result.wordCount} words</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={copy} className="px-4 py-2 rounded-lg text-xs font-black transition-all"
                    style={copied ? { background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' } : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button onClick={download} className="px-4 py-2 rounded-lg text-xs font-black transition-all" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    Download .txt
                  </button>
                  <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black transition-all hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    ⬇ Save as PDF
                  </button>
                </div>
              </div>
              <div className="border-t pt-5 print-content" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-xs text-white/25 mb-4">Generated on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                {renderDocument(result.document)}
                <p className="text-xs mt-8 pt-4 border-t" style={{ color: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.06)' }}>Generated by Queldrex · queldrex.com</p>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
