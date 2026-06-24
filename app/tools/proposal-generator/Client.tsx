'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PaywallCard from '@/components/PaywallCard'

const TONES = [{ val: 'formal', label: 'Formal' }, { val: 'confident', label: 'Confident' }, { val: 'collaborative', label: 'Collaborative' }]
const SERVICE_TYPES = ['Website Design & Development', 'SEO & Content Marketing', 'Custom Software Development', 'Mobile App Development', 'Digital Marketing Campaign', 'Brand Strategy', 'IT Consulting', 'Accounting & Finance', 'Legal Services', 'Social Media Management', 'Video Production', 'Business Consulting', 'Other']

interface Section { heading: string; content: string }
interface Result { title: string; executiveSummary: string; sections: Section[]; fullText: string; yourCompany: string; clientCompany: string }

export default function ProposalGeneratorPage() {
  const [yourCompany, setYourCompany] = useState('')
  const [clientCompany, setClientCompany] = useState('')
  const [projectTitle, setProjectTitle] = useState('')
  const [serviceType, setServiceType] = useState('Website Design & Development')
  const [projectScope, setProjectScope] = useState('')
  const [timeline, setTimeline] = useState('8 weeks')
  const [budget, setBudget] = useState('')
  const [yourStrengths, setYourStrengths] = useState('')
  const [deliverables, setDeliverables] = useState('')
  const [tone, setTone] = useState('confident')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)
  const [copied, setCopied] = useState(false)

  const generate = async () => {
    if (!yourCompany.trim() || !clientCompany.trim() || !projectScope.trim()) return
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    try {
      const res = await fetch('/api/tools/proposal-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yourCompany, clientCompany, projectTitle, serviceType, projectScope, timeline, budget, yourStrengths, deliverables, tone }),
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
    navigator.clipboard.writeText(result.fullText).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const loadExample = () => {
    setYourCompany('Acme Consulting LLC')
    setClientCompany('Mountain West Realty Group')
    setProjectTitle('Website Redesign & Lead Generation System')
    setServiceType('Website Design & Development')
    setProjectScope('Complete redesign of the company website with a focus on lead capture, mobile performance, and local SEO. Includes contact forms, property listing integration, and Google Analytics setup.')
    setTimeline('8 weeks')
    setBudget('$12,500')
    setYourStrengths('Full-stack development team, 50+ website projects delivered, specializing in real estate and professional services')
    setDeliverables('New website (up to 12 pages), mobile-responsive design, lead capture forms, CMS for easy updates, 30-day post-launch support')
    setTone('confident')
  }

  const download = () => {
    if (!result) return
    const blob = new Blob([result.fullText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `proposal-${result.clientCompany.replace(/\s+/g, '-').toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

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
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#4ade80', borderColor: 'rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.08)' }}>Business</span>
          <span className="text-sm font-bold text-white/30">1 free proposal/day · Unlimited with Pro</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">Business Proposal <span style={{ color: '#4ade80' }}>Generator</span></h1>
        <p className="text-white/55 text-base mb-4 max-w-2xl">Turn your rough notes into a complete, professional business proposal in seconds. Win more clients with polished, persuasive proposals.</p>
        <div className="flex gap-3 flex-wrap mb-6">
          <Link href="/pricing" className="inline-flex items-center gap-1 text-sm font-black px-4 py-2 rounded-xl text-black" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>Get this tool — $29 →</Link>
          <Link href="/pricing" className="inline-flex items-center gap-1 text-sm font-black px-4 py-2 rounded-xl border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>All 51 tools — from $99 →</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">How it works</p>
            <p className="text-sm text-white/60 leading-relaxed">Generates a complete client-ready business proposal with 9 structured sections: executive summary, understanding of the challenge, proposed solution, scope of work, timeline, investment breakdown, why your company, next steps, and terms. The output is formatted for professional presentation — copy it, personalize the details, and send.</p>
          </div>
          <div className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">What you get</p>
            <ul className="space-y-2">
              {['9-section professional proposal — ready to customize and send', 'Executive summary written to hook the client on page one', 'Scope of work with phases and deliverables clearly defined', 'Investment framed as ROI, not just a price', 'Download as .txt for easy editing in any word processor'].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/55"><span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border p-6 mb-6 space-y-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Your Company <span className="text-red-400">*</span></label>
              <input value={yourCompany} onChange={e => setYourCompany(e.target.value)} placeholder="Your Company Name"
                className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Client Company <span className="text-red-400">*</span></label>
              <input value={clientCompany} onChange={e => setClientCompany(e.target.value)} placeholder="Acme Corporation"
                className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Project Title (optional)</label>
              <input value={projectTitle} onChange={e => setProjectTitle(e.target.value)} placeholder="E-commerce Website Redesign"
                className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Service Type</label>
              <select value={serviceType} onChange={e => setServiceType(e.target.value)} className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }}>
                {SERVICE_TYPES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Project Scope <span className="text-red-400">*</span></label>
            <textarea value={projectScope} onChange={e => setProjectScope(e.target.value)} rows={3}
              placeholder="Describe what you're proposing to do for the client. E.g. Complete redesign of their e-commerce site including new product catalog, checkout flow, mobile optimization, and Shopify migration..."
              className="w-full text-sm text-white/80 placeholder-white/20 outline-none resize-none rounded-lg px-3 py-2"
              style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Timeline</label>
              <input value={timeline} onChange={e => setTimeline(e.target.value)} placeholder="8 weeks"
                className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Budget / Investment</label>
              <input value={budget} onChange={e => setBudget(e.target.value)} placeholder="$8,500 or TBD"
                className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Your Strengths / Why Choose You</label>
            <textarea value={yourStrengths} onChange={e => setYourStrengths(e.target.value)} rows={2}
              placeholder="10 years experience, 200+ clients, specializing in B2B SaaS, certified Google partner..."
              className="w-full text-sm text-white/80 placeholder-white/20 outline-none resize-none rounded-lg px-3 py-2"
              style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>

          <div>
            <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Key Deliverables</label>
            <textarea value={deliverables} onChange={e => setDeliverables(e.target.value)} rows={2}
              placeholder="New Shopify store, 50-page migration, SEO setup, 3 months support, training session..."
              className="w-full text-sm text-white/80 placeholder-white/20 outline-none resize-none rounded-lg px-3 py-2"
              style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>

          <div>
            <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Proposal Tone</label>
            <div className="flex gap-2">
              {TONES.map(t => (
                <button key={t.val} onClick={() => setTone(t.val)} className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                  style={tone === t.val ? { background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' } : { background: 'transparent', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button onClick={loadExample} className="px-4 py-3 rounded-xl text-sm font-bold border transition-colors hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>Try Example →</button>
            <button onClick={generate} disabled={loading || !yourCompany.trim() || !clientCompany.trim() || !projectScope.trim()}
              className="px-6 py-3 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#4ade80,#16a34a)', boxShadow: '0 0 20px rgba(74,222,128,0.3)' }}>
              {loading ? 'Writing Proposal…' : 'Generate Proposal'}
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>}

        {paywall && !loading && <PaywallCard toolId="proposal-generator" toolName="Proposal Generator" monthlyPrice={19} freeLimit={1} accent="#4ade80" />}

        {result && (
          <div className="rounded-2xl border p-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="rounded-xl border px-5 py-3 flex items-start gap-3 mb-6" style={{ background: 'rgba(251,191,36,0.06)', borderColor: 'rgba(251,191,36,0.25)' }}>
              <span className="text-yellow-400 text-sm flex-shrink-0">✏</span>
              <p className="text-xs text-yellow-200/70">Review and personalize before sending to client. Add specific details, testimonials, and case studies that are unique to your company.</p>
            </div>

            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="text-base font-black text-white">{result.title}</h2>
              <div className="flex gap-2">
                <button onClick={download} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white/50 hover:text-white/80 transition-colors" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>Download .txt</button>
                <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>⬇ Save as PDF</button>
                <button onClick={copy} className="px-4 py-1.5 rounded-lg text-xs font-black transition-all"
                  style={copied ? { background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' } : { background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}>
                  {copied ? 'Copied!' : 'Copy Proposal'}
                </button>
              </div>
            </div>

            <div className="space-y-6 print-content">
              <p className="text-xs text-white/25">Generated on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              {result.sections?.map((s, i) => (
                <div key={i} className="border-t pt-5" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#4ade80' }}>{s.heading}</p>
                  <div className="text-sm text-white/65 leading-relaxed whitespace-pre-line">{s.content}</div>
                </div>
              ))}
              <p className="text-xs mt-4 pt-4 border-t" style={{ color: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.06)' }}>Generated by Queldrex · queldrex.com</p>
            </div>
          </div>
        )}
        <div className="mt-10 mb-8">
          <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Who This Is For</p>
          <ul className="space-y-2 text-sm text-white/55">
            <li>• Freelancers and consultants creating polished client proposals in minutes</li>
            <li>• Agencies generating first drafts across 13 service types with tone controls</li>
            <li>• Founders writing their first outbound proposal without a sales team</li>
            <li>• Sales leads customizing proposals for enterprise clients with deliverable details</li>
          </ul>
        </div>
        <div className="mt-14 rounded-2xl border p-6 text-center" style={{ background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.15)' }}>
          <p className="text-white font-black mb-1">Add proposal generation to your platform</p>
          <p className="text-white/40 text-sm mb-4">13 service types, 3 tones, timeline/budget/deliverables, AI-generated full proposal. One-time license.</p>
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
