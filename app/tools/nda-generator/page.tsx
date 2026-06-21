'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PaywallCard from '@/components/PaywallCard'

const DURATIONS = ['6 months', '1 year', '2 years', '3 years', '5 years', 'Indefinite']

interface Result {
  title: string
  document: string
  disclaimer: string
  type: string
  parties: { disclosing: string; receiving: string }
  duration: string
  jurisdiction: string
}

export default function NDAGeneratorPage() {
  const [type, setType] = useState<'mutual' | 'one-way'>('mutual')
  const [disclosingParty, setDisclosingParty] = useState('')
  const [receivingParty, setReceivingParty] = useState('')
  const [purpose, setPurpose] = useState('')
  const [duration, setDuration] = useState('2 years')
  const [jurisdiction, setJurisdiction] = useState('Colorado, USA')
  const [includeNonSolicit, setIncludeNonSolicit] = useState(false)
  const [includeNonCompete, setIncludeNonCompete] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)
  const [copied, setCopied] = useState(false)

  const loadExample = () => {
    setType('mutual')
    setDisclosingParty('Acme Software Inc.')
    setReceivingParty('Bright Labs LLC')
    setPurpose('Evaluating a potential technology partnership and licensing agreement')
    setDuration('2 years')
    setJurisdiction('Colorado, USA')
    setIncludeNonSolicit(false)
    setIncludeNonCompete(false)
  }

  const generate = async () => {
    if (!disclosingParty.trim() || !receivingParty.trim() || !purpose.trim()) return
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    try {
      const res = await fetch('/api/tools/nda-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, disclosingParty, receivingParty, purpose, duration, jurisdiction, includeNonSolicit, includeNonCompete }),
      })
      const data = await res.json()
      if (data.paywall || res.status === 402) { setPaywall(true); return }
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setResult(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Generation failed') }
    finally { setLoading(false) }
  }

  const copyDoc = () => {
    if (!result) return
    navigator.clipboard.writeText(result.document.replace(/\*\*(.*?)\*\*/g, '$1')).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  const printDoc = () => window.print()

  const downloadDoc = () => {
    if (!result) return
    const blob = new Blob([result.document.replace(/\*\*(.*?)\*\*/g, '$1')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'nda.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const renderDocument = (text: string) =>
    text.split('\n\n').map((para, i) => {
      const isBold = para.startsWith('**') && para.includes('**')
      if (isBold) {
        const cleaned = para.replace(/\*\*(.*?)\*\*/g, '$1')
        return <p key={i} className="font-black text-white text-sm mt-5 mb-1 uppercase tracking-wider">{cleaned}</p>
      }
      return <p key={i} className="text-sm text-white/70 leading-relaxed mb-3">{para}</p>
    })

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <style>{`@media print { header, footer, nav, .no-print { display: none !important; } .print-content { color: black !important; background: white !important; } body { background: white !important; } }`}</style>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/tools" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          All Tools
        </Link>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#a78bfa', borderColor: 'rgba(167,139,250,0.3)', background: 'rgba(167,139,250,0.08)' }}>Legal</span>
          <span className="text-sm font-bold text-white/30">1 free NDA/day · Unlimited with $79/month</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">NDA <span style={{ color: '#a78bfa' }}>Generator</span></h1>
        <p className="text-white/55 text-base mb-6 max-w-2xl">Generate a complete, professionally worded Non-Disclosure Agreement in seconds. Fill in the details — get a ready-to-sign document.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">How it works</p>
            <p className="text-sm text-white/60 leading-relaxed">Generates a complete, professionally structured Non-Disclosure Agreement using the details you provide. The output includes all standard NDA provisions: recitals, definition of confidential information, obligations, exclusions, term and termination, return of materials, injunctive relief, and governing law. Copy, print, or download as .txt — then have an attorney review before signing.</p>
          </div>
          <div className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">What you get</p>
            <ul className="space-y-2">
              {['Complete NDA — not a template, a fully drafted document', 'Mutual or one-way NDA structure based on your selection', 'Jurisdiction-specific governing law clause', 'Optional non-solicitation and non-compete addendums', 'Disclaimer reminding you to have an attorney review'].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/55">
                  <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border p-6 mb-6 space-y-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          {/* NDA Type */}
          <div>
            <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-2 block">NDA Type</label>
            <div className="flex gap-2">
              {(['mutual', 'one-way'] as const).map(t => (
                <button key={t} onClick={() => setType(t)}
                  className="px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize"
                  style={type === t ? { background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' } : { background: 'transparent', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {t === 'mutual' ? 'Mutual (Both Ways)' : 'One-Way (Unilateral)'}
                </button>
              ))}
            </div>
            <p className="text-xs text-white/30 mt-1.5">{type === 'mutual' ? 'Both parties share confidential information with each other.' : 'Only one party shares confidential information.'}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">{type === 'mutual' ? 'Party A Name' : 'Disclosing Party'} <span className="text-red-400">*</span></label>
              <input value={disclosingParty} onChange={e => setDisclosingParty(e.target.value)} placeholder="Acme Corp or John Smith"
                className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">{type === 'mutual' ? 'Party B Name' : 'Receiving Party'} <span className="text-red-400">*</span></label>
              <input value={receivingParty} onChange={e => setReceivingParty(e.target.value)} placeholder="Beta LLC or Jane Doe"
                className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Purpose of Disclosure <span className="text-red-400">*</span></label>
            <textarea value={purpose} onChange={e => setPurpose(e.target.value)} rows={2}
              placeholder="e.g. Evaluating a potential business partnership for co-developing a SaaS product"
              className="w-full text-sm text-white/80 placeholder-white/20 outline-none resize-none rounded-lg px-3 py-2"
              style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Duration</label>
              <select value={duration} onChange={e => setDuration(e.target.value)}
                className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }}>
                {DURATIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Governing Law / Jurisdiction</label>
              <input value={jurisdiction} onChange={e => setJurisdiction(e.target.value)} placeholder="Colorado, USA"
                className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={includeNonSolicit} onChange={e => setIncludeNonSolicit(e.target.checked)} className="rounded" />
              <span className="text-sm text-white/60">Include Non-Solicitation Clause</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={includeNonCompete} onChange={e => setIncludeNonCompete(e.target.checked)} className="rounded" />
              <span className="text-sm text-white/60">Include Non-Compete Clause</span>
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={loadExample} className="px-4 py-3 rounded-xl text-sm font-bold border transition-colors hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>Try Example →</button>
            <button onClick={generate} disabled={loading || !disclosingParty.trim() || !receivingParty.trim() || !purpose.trim()}
              className="px-6 py-3 rounded-xl text-sm font-black text-white transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 20px rgba(124,58,237,0.35)' }}>
              {loading ? 'Generating NDA…' : 'Generate NDA'}
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>}

        {paywall && !loading && <PaywallCard toolId="nda-generator" toolName="NDA Generator" monthlyPrice={12} freeLimit={1} accent="#a78bfa" />}

        {result && (
          <div className="space-y-4">
            {/* Legal disclaimer */}
            <div className="rounded-xl border px-5 py-3 flex items-start gap-3" style={{ background: 'rgba(251,191,36,0.06)', borderColor: 'rgba(251,191,36,0.25)' }}>
              <span className="text-yellow-400 text-lg flex-shrink-0">⚠</span>
              <p className="text-xs text-yellow-200/70 leading-relaxed">{result.disclaimer}</p>
            </div>

            {/* Document */}
            <div className="rounded-2xl border p-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <h2 className="text-base font-black text-white">{result.title}</h2>
                <div className="flex gap-2">
                  <button onClick={printDoc} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>⬇ Save as PDF</button>
                  <button onClick={downloadDoc} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors hover:bg-white/5" style={{ color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }}>Download .txt</button>
                  <button onClick={copyDoc} className="px-4 py-1.5 rounded-lg text-xs font-black transition-all"
                    style={copied ? { background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' } : { background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }}>
                    {copied ? 'Copied!' : 'Copy Document'}
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

        <section className="mt-16 pt-8 border-t max-w-2xl" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-lg font-black text-white mb-4">What an NDA actually does (and doesn&apos;t do)</h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#A1A1AA' }}>An NDA (Non-Disclosure Agreement) creates a legal obligation for the receiving party to keep specified information confidential. It defines what counts as confidential information, how it may be used, and for how long the obligation lasts. What it does not do: it cannot prevent disclosure to courts under subpoena, protect information that was already public, or stop a determined bad actor — it only gives you legal recourse after a breach, not before.</p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#A1A1AA' }}>Mutual NDAs protect both parties equally — both disclose and both receive confidential information. This is common in partnerships and vendor evaluations. One-way (unilateral) NDAs protect only the disclosing party and are standard when only one side is sharing sensitive information, such as sharing a business plan with a potential investor. Duration matters: perpetual NDAs (no end date) are often unenforceable in many jurisdictions because courts view them as unreasonably restricting trade. Most enforceable NDAs run 1 to 5 years, with trade secrets sometimes carved out for longer protection.</p>
          <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>Governing law determines which state or country&apos;s courts will hear disputes and which rules apply. Use the jurisdiction where your business is incorporated or where most business activity occurs. Delaware is popular for corporate disputes; California NDAs cannot prevent employees from working for competitors. This generator produces a solid starting template — for anything involving significant business value, have a licensed attorney review the final document before signing.</p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
