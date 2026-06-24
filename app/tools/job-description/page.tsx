'use client'

import { useState } from 'react'
import Link from 'next/link'
import BuyToolButton from '@/components/BuyToolButton'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PaywallCard from '@/components/PaywallCard'

const INDUSTRIES = ['Technology', 'Healthcare', 'Finance', 'Marketing', 'Sales', 'Design', 'Operations', 'Legal', 'Education', 'Retail', 'Manufacturing', 'Real Estate', 'Other']
const EXP_LEVELS = [{ val: 'entry', label: 'Entry Level (0-2 yrs)' }, { val: 'mid', label: 'Mid Level (3-5 yrs)' }, { val: 'senior', label: 'Senior (6-10 yrs)' }, { val: 'lead', label: 'Lead / Staff' }, { val: 'executive', label: 'Executive / Director' }]
const TONES = [{ val: 'professional', label: 'Professional' }, { val: 'casual', label: 'Casual & Warm' }, { val: 'startup-energy', label: 'Startup Energy' }]

interface Section { heading: string; content: string }
interface Result { jobTitle: string; sections: Section[]; fullText: string; characterCount: number; estimatedReadTime: string; company: string }

export default function JobDescriptionPage() {
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [industry, setIndustry] = useState('Technology')
  const [employmentType, setEmploymentType] = useState('full-time')
  const [location, setLocation] = useState('')
  const [remote, setRemote] = useState('hybrid')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('mid')
  const [keyResponsibilities, setKeyResponsibilities] = useState('')
  const [requiredSkills, setRequiredSkills] = useState('')
  const [niceToHave, setNiceToHave] = useState('')
  const [companyBlurb, setCompanyBlurb] = useState('')
  const [tone, setTone] = useState('professional')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)
  const [copied, setCopied] = useState(false)

  const generate = async () => {
    if (!jobTitle.trim() || !company.trim() || !keyResponsibilities.trim()) return
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    try {
      const res = await fetch('/api/tools/job-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle, company, industry, employmentType, location, remote, salaryMin: Number(salaryMin) || undefined, salaryMax: Number(salaryMax) || undefined, experienceLevel, keyResponsibilities, requiredSkills, niceToHave, companyBlurb, tone }),
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

  const renderContent = (content: string) =>
    content.split('\n').map((line, i) => {
      if (line.startsWith('•') || line.startsWith('-')) return <li key={i} className="text-sm text-white/65 mb-1 ml-2">{line.replace(/^[•\-]\s*/, '')}</li>
      if (line.trim() === '') return <div key={i} className="h-2" />
      return <p key={i} className="text-sm text-white/65 mb-1">{line}</p>
    })

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <style>{`@media print { header, footer, nav, .no-print { display: none !important; } .print-content { color: black !important; background: white !important; } body { background: white !important; } }`}</style>
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <Link href="/tools" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          All Tools
        </Link>
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#06d6ff', borderColor: 'rgba(6,214,255,0.3)', background: 'rgba(6,214,255,0.08)' }}>HR</span>
          <span className="text-sm font-bold text-white/30">2 free/day · Unlimited with Pro</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">Job Description <span style={{ color: '#06d6ff' }}>Writer</span></h1>
        <p className="text-white/55 text-base mb-3 max-w-2xl">Enter your rough notes and get a complete, ready-to-post job description in seconds. Attract better candidates with professionally written postings.</p>
        <div className="flex gap-3 flex-wrap mt-3 mb-4">
          <BuyToolButton toolId="job-description" price={15} className="inline-flex items-center gap-1 text-sm font-black px-4 py-2 rounded-xl text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }} />
          <Link href="/pricing" className="inline-flex items-center gap-1 text-sm font-black px-4 py-2 rounded-xl border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>All 51 tools — from $149 →</Link>
        </div>
        <div className="mb-6 px-4 py-3 rounded-xl border text-xs leading-relaxed" style={{ background: 'rgba(251,191,36,0.05)', borderColor: 'rgba(251,191,36,0.2)', color: 'rgba(251,191,36,0.7)' }}>
          AI-generated job descriptions are a starting point only. Review all output for compliance with federal and state employment law (including equal opportunity requirements and salary disclosure obligations) before posting. This tool does not provide legal or HR compliance advice.
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="rounded-2xl border p-6 space-y-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Job Title <span className="text-red-400">*</span></label>
                <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Senior Product Manager"
                  className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div>
                <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Company <span className="text-red-400">*</span></label>
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Corp"
                  className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div>
                <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Industry</label>
                <select value={industry} onChange={e => setIndustry(e.target.value)} className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Location</label>
                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Denver, CO"
                  className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div>
                <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Work Model</label>
                <div className="flex gap-1">
                  {['remote', 'hybrid', 'onsite'].map(r => (
                    <button key={r} onClick={() => setRemote(r)} className="flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all"
                      style={remote === r ? { background: 'rgba(6,214,255,0.15)', color: '#06d6ff', border: '1px solid rgba(6,214,255,0.3)' } : { background: 'transparent', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Experience Level</label>
              <div className="flex flex-wrap gap-1.5">
                {EXP_LEVELS.map(l => (
                  <button key={l.val} onClick={() => setExperienceLevel(l.val)} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={experienceLevel === l.val ? { background: 'rgba(6,214,255,0.15)', color: '#06d6ff', border: '1px solid rgba(6,214,255,0.3)' } : { background: 'transparent', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Salary Min (optional)</label>
                <input type="number" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} placeholder="80000"
                  className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div>
                <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Salary Max (optional)</label>
                <input type="number" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} placeholder="120000"
                  className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Key Responsibilities <span className="text-red-400">*</span></label>
              <textarea value={keyResponsibilities} onChange={e => setKeyResponsibilities(e.target.value)} rows={3}
                placeholder="Lead product roadmap, work with engineering teams, gather customer feedback, define metrics..."
                className="w-full text-sm text-white/80 placeholder-white/20 outline-none resize-none rounded-lg px-3 py-2"
                style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Required Skills</label>
              <textarea value={requiredSkills} onChange={e => setRequiredSkills(e.target.value)} rows={2}
                placeholder="5+ years product management, SQL, data analysis, stakeholder management..."
                className="w-full text-sm text-white/80 placeholder-white/20 outline-none resize-none rounded-lg px-3 py-2"
                style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Nice to Have</label>
              <input value={niceToHave} onChange={e => setNiceToHave(e.target.value)} placeholder="MBA, startup experience, Figma..."
                className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Company Blurb (optional)</label>
              <textarea value={companyBlurb} onChange={e => setCompanyBlurb(e.target.value)} rows={2}
                placeholder="We're a fast-growing SaaS company helping businesses with AI visibility..."
                className="w-full text-sm text-white/80 placeholder-white/20 outline-none resize-none rounded-lg px-3 py-2"
                style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Tone</label>
              <div className="flex gap-2">
                {TONES.map(t => (
                  <button key={t.val} onClick={() => setTone(t.val)} className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                    style={tone === t.val ? { background: 'rgba(6,214,255,0.15)', color: '#06d6ff', border: '1px solid rgba(6,214,255,0.3)' } : { background: 'transparent', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={generate} disabled={loading || !jobTitle.trim() || !company.trim() || !keyResponsibilities.trim()}
              className="w-full py-3 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.01] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 20px rgba(6,214,255,0.3)' }}>
              {loading ? 'Writing Job Description…' : 'Generate Job Description'}
            </button>
          </div>

          {/* Preview */}
          <div>
            {error && <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-4 text-sm text-red-400">{error}</div>}
            {paywall && !loading && <PaywallCard toolId="job-description" toolName="Job Description Writer" oneTimePrice={15} freeLimit={2} accent="#06d6ff" />}
            {!result && !loading && !error && !paywall && (
              <div className="rounded-2xl border p-8 text-center h-full flex items-center justify-center" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.05)' }}>
                <p className="text-white/20 text-sm">Your job description will appear here</p>
              </div>
            )}
            {loading && (
              <div className="rounded-2xl border p-8 text-center h-64 flex items-center justify-center" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-white/40 text-sm">Writing your job description…</p>
                </div>
              </div>
            )}
            {result && (
              <div className="rounded-2xl border p-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <div>
                    <h2 className="text-lg font-black text-white">{result.jobTitle}</h2>
                    <p className="text-xs text-white/35">{result.company} · {result.estimatedReadTime} · {result.characterCount?.toLocaleString()} chars</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>⬇ Save as PDF</button>
                    <button onClick={copy} className="px-4 py-1.5 rounded-lg text-xs font-black transition-all"
                      style={copied ? { background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' } : { background: 'rgba(6,214,255,0.1)', color: '#06d6ff', border: '1px solid rgba(6,214,255,0.3)' }}>
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 print-content">
                  <p className="text-xs text-white/25">Generated on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  {result.sections?.map((s, i) => (
                    <div key={i}>
                      <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">{s.heading}</p>
                      <ul className="space-y-0.5">{renderContent(s.content)}</ul>
                    </div>
                  ))}
                  <p className="text-xs mt-4 pt-4 border-t" style={{ color: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.06)' }}>Generated by Queldrex · queldrex.com</p>
                </div>
                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <p className="text-xs text-white/25">Tip: Copy and paste directly to LinkedIn, Indeed, or your careers page. Personalize before posting.</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-10 mb-8">
          <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Who This Is For</p>
          <ul className="space-y-2 text-sm text-white/55">
            <li>• Hiring managers writing job posts without an HR team or copywriter</li>
            <li>• Founders drafting their first engineering, sales, or ops role descriptions</li>
            <li>• Recruiters generating consistent, bias-checked JDs across 13 industries</li>
            <li>• Agencies creating client job descriptions at scale with tone and level controls</li>
          </ul>
        </div>

        {/* ── FAQ ─────────────────────────────────────────── */}
        <div className="mt-10 mb-6 space-y-3">
          <h2 className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>Common questions</h2>
          {[
            { q: "Is the output compliant with equal opportunity employment law?", a: "The generator avoids protected-class language and uses inclusive phrasing by default. It's not a substitute for legal review — have your HR or legal team check descriptions for roles in regulated industries or jurisdictions with specific hiring disclosure requirements." },
            { q: "Can I generate descriptions for multiple roles at once?", a: "One role per generation. For multiple roles, run the tool once per position. Each takes under 60 seconds, so generating 5–10 descriptions is still faster than writing them from scratch." },
            { q: "Does Queldrex store the company information I enter?", a: "No. Company name, role details, and requirements are used to generate the description and are not stored or retained after the response is returned." },
            { q: "What's the best way to customize the output?", a: "Copy it into your ATS or job board editor. Add your specific tech stack versions, team size, company perks, and compensation range — the AI intentionally leaves these as placeholders since they vary by role. Review the requirements section and trim anything that's a nice-to-have, not a must-have." },
          ].map(({ q, a }) => (
            <details key={q} className="rounded-xl border group" style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#0d1117' }}>
              <summary className="px-4 py-3.5 text-sm font-bold cursor-pointer list-none flex items-center justify-between" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {q}
                <svg className="w-4 h-4 flex-shrink-0 transition-transform group-open:rotate-180" style={{ color: 'rgba(255,255,255,0.3)' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </summary>
              <div className="px-4 pb-4 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{a}</div>
            </details>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border p-6 text-center" style={{ background: 'rgba(6,214,255,0.04)', borderColor: 'rgba(6,214,255,0.12)' }}>
          <p className="text-white font-black mb-1">Add job description generation to your platform</p>
          <p className="text-white/40 text-sm mb-4">13 industries, 5 experience levels, 3 tones, work model, AI-generated with legal disclaimer. One-time license.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <BuyToolButton toolId="job-description" price={15} className="px-5 py-2.5 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }} />
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>All 51 tools — from $149 →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
