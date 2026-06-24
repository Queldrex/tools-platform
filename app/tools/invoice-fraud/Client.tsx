'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PaywallCard from '@/components/PaywallCard'
import BuyToolButton from '@/components/BuyToolButton'

const SEV_COLOR: Record<string, string> = { critical: '#f87171', high: '#fb923c', medium: '#facc15', low: '#94a3b8' }
const RISK_CONFIG: Record<string, { color: string; label: string; bg: string }> = {
  clear: { color: '#4ade80', label: 'Clear', bg: 'rgba(74,222,128,0.1)' },
  low: { color: '#a3e635', label: 'Low Risk', bg: 'rgba(163,230,53,0.08)' },
  medium: { color: '#facc15', label: 'Caution', bg: 'rgba(250,204,21,0.08)' },
  high: { color: '#fb923c', label: 'High Risk', bg: 'rgba(251,146,60,0.1)' },
  critical: { color: '#f87171', label: 'DO NOT PAY', bg: 'rgba(239,68,68,0.1)' },
}

interface Flag { severity: string; type: string; detail: string; recommendation: string }
interface Result {
  riskLevel: string; verdict: string; flags: Flag[]
  summary: { critical: number; high: number; medium: number; low: number; total: number }
  invoice: { vendorName?: string; invoiceNumber?: string; amount?: number; email?: string }
}

export default function InvoiceFraudPage() {
  const [mode, setMode] = useState<'text' | 'form'>('text')
  const [rawText, setRawText] = useState('')
  const [vendorName, setVendorName] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [email, setEmail] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)

  const analyze = async () => {
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    const body = mode === 'text'
      ? { rawText }
      : { invoice: { vendorName, invoiceNumber, amount: Number(amount) || undefined, email, paymentTerms, address, description } }
    try {
      const res = await fetch('/api/tools/invoice-fraud', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.paywall || res.status === 402) { setPaywall(true); return }
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setResult(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Analysis failed') }
    finally { setLoading(false) }
  }

  const riskCfg = result ? (RISK_CONFIG[result.riskLevel] ?? RISK_CONFIG.medium) : null
  const hasInput = mode === 'text' ? rawText.trim().length > 0 : (vendorName.trim() || amount.trim())

  const EXAMPLE_TEXT = `INVOICE #1001 from Global Business Services LLC\nVendor: Global Business Services LLC\nEmail: billing@g00gle-services.com\nAmount: $5,000.00\nDue: IMMEDIATE PAYMENT REQUIRED - within 24 hours or service will be suspended\nBank Account Change Notice: Please update your records - we recently changed our banking details.\nNew account: Routing 021000021, Account 1234567890\nDescription: Consulting services rendered Q4\nNote: This invoice supersedes all previous invoices. Pay immediately to avoid late fees.`

  const loadExample = () => {
    setMode('text')
    setRawText(EXAMPLE_TEXT)
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    fetch('/api/tools/invoice-fraud', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rawText: EXAMPLE_TEXT }) })
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
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.08)' }}>Live</span>
          <span className="text-sm font-bold text-white/30">Pro Tool · 2 free checks/day · Unlimited with Pro</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">Invoice <span style={{ color: '#f87171' }}>Fraud Detector</span></h1>
        <p className="text-white/55 text-base mb-4 max-w-2xl">Instantly scan any invoice for fraud signals — round-number manipulation, BEC indicators, fake vendor patterns, urgency pressure, and more.</p>
        <div className="flex gap-3 flex-wrap mb-6">
          <BuyToolButton toolId="invoice-fraud" price={49} className="inline-flex items-center gap-1 text-sm font-black px-4 py-2 rounded-xl text-black cursor-pointer" style={{ background: 'linear-gradient(135deg,#f87171,#dc2626)' }} />
          <Link href="/pricing" className="inline-flex items-center gap-1 text-sm font-black px-4 py-2 rounded-xl border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>All 51 tools — from $149 →</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">How it works</p>
            <p className="text-sm text-white/60 leading-relaxed">Runs 20+ deterministic fraud detection rules against invoice text or structured fields. Checks for round-number manipulation (invoices ending in exactly $1,000, $5,000, etc.), Business Email Compromise (BEC) indicators in email domains, urgency pressure phrases, fake vendor patterns, suspicious address formats, and payment method red flags. All rules are explainable — every flag tells you exactly what triggered it.</p>
          </div>
          <div className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">What you get</p>
            <ul className="space-y-2">
              {['Risk level: Clear / Low / Medium / High / Critical / DO NOT PAY', 'Every triggered flag with severity and recommended action', 'BEC indicator detection (look-alike email domains)', 'Round-number manipulation detection', 'Urgency pressure phrase detection'].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/55">
                  <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border p-6 mb-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex gap-2 mb-5">
            {(['text', 'form'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} className="px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
                style={mode === m ? { background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' } : { background: 'transparent', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {m === 'text' ? 'Paste Invoice Text' : 'Enter Fields'}
              </button>
            ))}
          </div>

          {mode === 'text' ? (
            <textarea value={rawText} onChange={e => setRawText(e.target.value)}
              placeholder="Paste the full invoice text, email content, or any relevant details..."
              rows={12} className="w-full text-sm text-white/80 placeholder-white/20 outline-none resize-y"
              style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '14px 16px', minHeight: 280 }} />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Vendor Name</label>
                <input value={vendorName} onChange={e => setVendorName(e.target.value)} placeholder="Acme Services" className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} /></div>
              <div><label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Invoice #</label>
                <input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="INV-0001" className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} /></div>
              <div><label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Amount ($)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="5000" className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} /></div>
              <div><label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Vendor Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="billing@vendor.com" className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} /></div>
              <div><label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Payment Terms</label>
                <input value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} placeholder="Net 30" className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} /></div>
              <div><label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Vendor Address</label>
                <input value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St, City, State" className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} /></div>
              <div className="col-span-2"><label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Notes / Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Any notes, mentions of bank account changes, urgency requests, etc." rows={3} className="w-full text-sm text-white/80 placeholder-white/20 outline-none resize-y" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px' }} /></div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={loadExample} className="px-4 py-3 rounded-xl text-sm font-bold border transition-colors hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>Try Example →</button>
            <button onClick={analyze} disabled={loading || !hasInput}
              className="px-6 py-3 rounded-xl text-sm font-black text-white transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#dc2626,#b91c1c)', boxShadow: '0 0 20px rgba(220,38,38,0.35)' }}>
              {loading ? 'Scanning…' : 'Scan for Fraud'}
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>}
        {paywall && !loading && <PaywallCard toolId="invoice-fraud" toolName="Invoice Fraud Detector" oneTimePrice={49} freeLimit={2} accent="#f87171" />}

        <div className="mt-10 mb-8">
          <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Who This Is For</p>
          <ul className="space-y-2 text-sm text-white/55">
            <li>• Finance teams screening vendor invoices for manipulation before approving payment</li>
            <li>• Accounts payable staff flagging duplicate, inflated, or suspicious invoice patterns</li>
            <li>• Small business owners catching fraudulent invoices without enterprise AP software</li>
            <li>• Auditors running a quick pre-check before a deeper forensic review</li>
          </ul>
        </div>

        {result && riskCfg && (
          <div className="space-y-5">
            <div className="rounded-2xl border p-6" style={{ background: riskCfg.bg, borderColor: `${riskCfg.color}33` }}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-3xl font-black mb-1" style={{ color: riskCfg.color }}>{riskCfg.label}</div>
                  <p className="text-sm font-bold text-white/75">{result.verdict}</p>
                </div>
                <div className="flex gap-4 text-center">
                  {result.summary.critical > 0 && <div><div className="text-2xl font-black" style={{ color: '#f87171' }}>{result.summary.critical}</div><div className="text-[10px] text-white/35 font-bold uppercase tracking-wider">Critical</div></div>}
                  {result.summary.high > 0 && <div><div className="text-2xl font-black" style={{ color: '#fb923c' }}>{result.summary.high}</div><div className="text-[10px] text-white/35 font-bold uppercase tracking-wider">High</div></div>}
                  {result.summary.medium > 0 && <div><div className="text-2xl font-black" style={{ color: '#facc15' }}>{result.summary.medium}</div><div className="text-[10px] text-white/35 font-bold uppercase tracking-wider">Medium</div></div>}
                  {result.summary.low > 0 && <div><div className="text-2xl font-black text-white/50">{result.summary.low}</div><div className="text-[10px] text-white/35 font-bold uppercase tracking-wider">Low</div></div>}
                  {result.summary.total === 0 && <div><div className="text-2xl font-black" style={{ color: '#4ade80' }}>0</div><div className="text-[10px] text-white/35 font-bold uppercase tracking-wider">Flags</div></div>}
                </div>
              </div>
            </div>

            {result.flags?.length > 0 && (
              <div className="space-y-3">
                {result.flags.sort((a, b) => ['critical','high','medium','low'].indexOf(a.severity) - ['critical','high','medium','low'].indexOf(b.severity)).map((f, i) => (
                  <div key={i} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: `${SEV_COLOR[f.severity] ?? '#94a3b8'}22` }}>
                    <div className="flex items-start gap-3">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex-shrink-0" style={{ background: `${SEV_COLOR[f.severity]}18`, color: SEV_COLOR[f.severity], border: `1px solid ${SEV_COLOR[f.severity]}44` }}>{f.severity}</span>
                      <div>
                        <p className="text-sm font-bold text-white mb-1">{f.type}</p>
                        <p className="text-xs text-white/55 mb-1.5">{f.detail}</p>
                        <p className="text-xs text-white/35"><span className="font-bold text-white/25">Action:</span> {f.recommendation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="mt-14 rounded-2xl border p-6 text-center" style={{ background: 'rgba(248,113,113,0.04)', borderColor: 'rgba(248,113,113,0.15)' }}>
          <p className="text-white font-black mb-1">Add invoice fraud detection to your platform</p>
          <p className="text-white/40 text-sm mb-4">20+ deterministic fraud rules, risk level (Clear → DO NOT PAY), sorted flags with action guidance. One-time license.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <BuyToolButton toolId="invoice-fraud" price={49} className="px-5 py-2.5 rounded-xl text-sm font-black text-black cursor-pointer" style={{ background: 'linear-gradient(135deg,#f87171,#dc2626)' }} />
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>All 51 tools — from $149 →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
