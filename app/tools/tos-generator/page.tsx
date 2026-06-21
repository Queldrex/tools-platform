'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const BUSINESS_TYPES = [
  { value: 'saas', label: 'SaaS / Software' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'agency', label: 'Agency / Services' },
  { value: 'blog', label: 'Blog / Content' },
  { value: 'app', label: 'Mobile App' },
]

interface Result { title: string; effectiveDate: string; document: string; wordCount: number; disclaimer: string }

function renderDocument(doc: string) {
  return doc.split('\n\n').map((para, i) => {
    const boldified = para.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    return <p key={i} className="mb-4 text-sm text-white/65 leading-relaxed" dangerouslySetInnerHTML={{ __html: boldified }} />
  })
}

export default function TosGeneratorPage() {
  const [form, setForm] = useState({
    companyName: '', websiteUrl: '', serviceDescription: '', businessType: 'saas',
    jurisdiction: 'Colorado, USA', contactEmail: '', minimumAge: '13',
    hasSubscription: false, sellsPhysicalGoods: false, hasUserContent: false,
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)
  const [copied, setCopied] = useState(false)

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  const loadExample = () => {
    setForm({
      companyName: 'Queldrex LLC',
      websiteUrl: 'queldrex.com',
      serviceDescription: 'SaaS platform providing developer and business tools including security scanning, document generation, and business analytics',
      businessType: 'saas',
      jurisdiction: 'Colorado, USA',
      contactEmail: 'hello@queldrex.com',
      minimumAge: '13',
      hasSubscription: true,
      sellsPhysicalGoods: false,
      hasUserContent: false,
    })
  }

  const generate = async () => {
    if (!form.companyName.trim() || !form.serviceDescription.trim()) return
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    try {
      const res = await fetch('/api/tools/tos-generator', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, minimumAge: Number(form.minimumAge) }),
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
    const a = document.createElement('a'); a.href = url; a.download = 'terms-of-service.txt'; a.click()
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
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#a78bfa', borderColor: 'rgba(167,139,250,0.3)', background: 'rgba(167,139,250,0.08)' }}>Free</span>
          <span className="text-sm font-bold text-white/30">1 free generation/day · Unlimited with $79/month</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">Terms of Service <span style={{ color: '#a78bfa' }}>Generator</span></h1>
        <p className="text-white/55 text-base mb-4 max-w-2xl">Generate a complete, professional Terms of Service document tailored to your business. Fill in your details and get a ready-to-publish document in seconds.</p>
        <div className="mb-6 px-4 py-3 rounded-xl border text-xs leading-relaxed" style={{ background: 'rgba(251,191,36,0.05)', borderColor: 'rgba(251,191,36,0.2)', color: 'rgba(251,191,36,0.7)' }}>
          This tool generates document drafts using AI. Output is not legal advice and does not create an attorney-client relationship. Have a licensed attorney review any document before publishing.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">How it works</p>
            <p className="text-sm text-white/60 leading-relaxed">Generates a complete Terms of Service using 16 standard legal sections tailored to your business type. Covers user accounts, acceptable use, intellectual property, billing and subscriptions, disclaimers, limitation of liability, indemnification, dispute resolution, and more. Fully customized to whether you sell SaaS, physical goods, or services.</p>
          </div>
          <div className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">What you get</p>
            <ul className="space-y-2">
              {['Complete ToS — all 16 standard sections included', 'Customized for your business type (SaaS, ecommerce, marketplace, etc.)', 'Subscription billing clauses if you have recurring payments', 'UGC clauses if your platform hosts user content', 'Jurisdiction-specific governing law and dispute resolution'].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/55">
                  <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border p-6 mb-6 space-y-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/35 font-bold uppercase tracking-wider mb-1.5 block">Company Name *</label>
              <input value={form.companyName} onChange={e => set('companyName', e.target.value)} placeholder="Acme Corp" className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="text-xs text-white/35 font-bold uppercase tracking-wider mb-1.5 block">Website URL</label>
              <input value={form.websiteUrl} onChange={e => set('websiteUrl', e.target.value)} placeholder="https://yoursite.com" className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="text-xs text-white/35 font-bold uppercase tracking-wider mb-1.5 block">Contact Email</label>
              <input type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} placeholder="legal@yourcompany.com" className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="text-xs text-white/35 font-bold uppercase tracking-wider mb-1.5 block">Jurisdiction</label>
              <input value={form.jurisdiction} onChange={e => set('jurisdiction', e.target.value)} placeholder="Colorado, USA" className={inputCls} style={inputStyle} />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/35 font-bold uppercase tracking-wider mb-1.5 block">What Does Your Service Do? *</label>
            <textarea value={form.serviceDescription} onChange={e => set('serviceDescription', e.target.value)}
              placeholder="Describe what your product or service does in 2-3 sentences..." rows={3}
              className="w-full text-sm text-white/80 placeholder-white/25 outline-none resize-y rounded-lg px-3 py-2.5"
              style={{ background: '#070b14', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>

          <div>
            <label className="text-xs text-white/35 font-bold uppercase tracking-wider mb-2 block">Business Type</label>
            <div className="flex flex-wrap gap-2">
              {BUSINESS_TYPES.map(t => (
                <button key={t.value} onClick={() => set('businessType', t.value)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={form.businessType === t.value
                    ? { background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }
                    : { background: 'transparent', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/35 font-bold uppercase tracking-wider mb-1.5 block">Minimum Age</label>
              <input type="number" min={13} max={21} value={form.minimumAge} onChange={e => set('minimumAge', e.target.value)} className={inputCls} style={inputStyle} />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-xs text-white/35 font-bold uppercase tracking-wider block">Additional Sections to Include</label>
            {[
              { key: 'hasSubscription', label: 'Subscription & Billing (auto-renewal, cancellation, refunds)' },
              { key: 'sellsPhysicalGoods', label: 'Physical Goods, Shipping & Returns' },
              { key: 'hasUserContent', label: 'User-Generated Content (UGC ownership and licensing)' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer group">
                <div onClick={() => set(key, !form[key as keyof typeof form])}
                  className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background: form[key as keyof typeof form] ? 'rgba(167,139,250,0.2)' : 'transparent', border: `2px solid ${form[key as keyof typeof form] ? '#a78bfa' : 'rgba(255,255,255,0.15)'}` }}>
                  {form[key as keyof typeof form] && <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                </div>
                <span className="text-sm text-white/55 group-hover:text-white/75 transition-colors">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={loadExample} className="px-4 py-3 rounded-xl text-sm font-bold border transition-colors hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>Try Example →</button>
            <button onClick={generate} disabled={loading || !form.companyName.trim() || !form.serviceDescription.trim()}
              className="px-7 py-3 rounded-xl text-sm font-black text-white transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}>
              {loading ? 'Generating…' : 'Generate Terms of Service'}
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>}

        {paywall && !loading && (
          <div className="rounded-2xl border p-8 text-center mb-6" style={{ background: 'rgba(167,139,250,0.05)', borderColor: 'rgba(167,139,250,0.2)' }}>
            <h3 className="text-xl font-black text-white mb-2">Unlimited generations with Pro</h3>
            <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">Pro plan: unlimited document generation, all tools, and AI visibility monitoring. $79/month, cancel anytime.</p>
            <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Start Pro — $79/month</Link>
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
                  <h2 className="text-lg font-black text-white">{result.title}</h2>
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
                  <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black transition-all hover:bg-white/5" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
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
