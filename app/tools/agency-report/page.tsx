'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PaywallCard from '@/components/PaywallCard'
import BuyToolButton from '@/components/BuyToolButton'

const SERVICE_TYPES = ['SEO / Content', 'Paid Ads / PPC', 'Social Media', 'Web Development', 'Design', 'Email Marketing', 'Full-Service Digital', 'PR / Communications', 'Other']
const TONES = ['Professional & Confident', 'Warm & Collaborative', 'Data-Driven & Direct', 'Friendly & Approachable']

interface Metric { name: string; value: string; change: string }
interface Section { title: string; content: string }
interface Result {
  reportTitle: string; executiveSummary: string; sections: Section[]
  keyAchievements: string[]; metricsNarrative: string
  challengesAndSolutions: string; nextMonthPlan: string; closingNote: string
  clientName: string; agencyName: string; period: string
}

export default function AgencyReportPage() {
  const [clientName, setClientName] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [period, setPeriod] = useState('')
  const [serviceType, setServiceType] = useState(SERVICE_TYPES[0])
  const [tone, setTone] = useState(TONES[0])
  const [metrics, setMetrics] = useState<Metric[]>([{ name: '', value: '', change: '' }])
  const [wins, setWins] = useState('')
  const [challenges, setChallenges] = useState('')
  const [nextSteps, setNextSteps] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)
  const [copied, setCopied] = useState(false)

  const addMetric = () => setMetrics(m => [...m, { name: '', value: '', change: '' }])
  const updateMetric = (i: number, field: keyof Metric, val: string) => setMetrics(m => m.map((x, idx) => idx === i ? { ...x, [field]: val } : x))
  const removeMetric = (i: number) => setMetrics(m => m.filter((_, idx) => idx !== i))

  const generate = async () => {
    if (!clientName.trim() || (!wins.trim() && !metrics.filter(m => m.name && m.value).length)) return
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    const cleanMetrics = metrics.filter(m => m.name.trim() && m.value.trim())
    try {
      const res = await fetch('/api/tools/agency-report', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, agencyName, period, serviceType, tone, metrics: cleanMetrics, wins, challenges, nextSteps }),
      })
      const data = await res.json()
      if (data.paywall || res.status === 402) { setPaywall(true); return }
      if (!res.ok) throw new Error(data.error || 'Report generation failed')
      setResult(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Report generation failed') }
    finally { setLoading(false) }
  }

  const copyReport = () => {
    if (!result) return
    const text = [
      result.reportTitle, '',
      'Executive Summary', result.executiveSummary, '',
      ...result.sections.flatMap(s => [s.title, s.content, '']),
      'Key Achievements', ...result.keyAchievements.map((a, i) => `${i + 1}. ${a}`), '',
      'Metrics', result.metricsNarrative, '',
      'Challenges & Solutions', result.challengesAndSolutions, '',
      'Next Month Plan', result.nextMonthPlan, '',
      result.closingNote,
    ].join('\n')
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
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
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#a78bfa', borderColor: 'rgba(167,139,250,0.3)', background: 'rgba(167,139,250,0.08)' }}>Live</span>
          <span className="text-sm font-bold text-white/30">Agency Tool · 1 free report/day · Unlimited with Pro</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">Agency Client <span style={{ color: '#a78bfa' }}>Report Generator</span></h1>
        <p className="text-white/55 text-base mb-4 max-w-2xl">Enter your client's metrics, wins, and goals — get a polished monthly report ready to send. Stop spending hours writing what AI can generate in seconds.</p>
        <div className="flex gap-3 flex-wrap mb-8">
          <BuyToolButton toolId="agency-report" price={49} className="inline-flex items-center gap-1 text-sm font-black px-4 py-2 rounded-xl text-black cursor-pointer" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }} />
          <Link href="/pricing" className="inline-flex items-center gap-1 text-sm font-black px-4 py-2 rounded-xl border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>All 51 tools — from $149 →</Link>
        </div>

        <div className="rounded-2xl border p-6 mb-6 space-y-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Client Name <span className="text-red-400">*</span></label>
              <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Acme Corp" className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} /></div>
            <div><label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Your Agency Name</label>
              <input value={agencyName} onChange={e => setAgencyName(e.target.value)} placeholder="Bright Digital" className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} /></div>
            <div><label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Report Period</label>
              <input value={period} onChange={e => setPeriod(e.target.value)} placeholder="June 2026" className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} /></div>
            <div><label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Service Type</label>
              <select value={serviceType} onChange={e => setServiceType(e.target.value)} className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }}>
                {SERVICE_TYPES.map(s => <option key={s}>{s}</option>)}</select></div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-white/30 font-bold uppercase tracking-wider">Key Metrics</label>
              <button onClick={addMetric} className="text-xs font-bold text-purple-400 hover:text-purple-300">+ Add Metric</button>
            </div>
            <div className="space-y-2">
              {metrics.map((m, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={m.name} onChange={e => updateMetric(i, 'name', e.target.value)} placeholder="Metric name" className="flex-1 text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <input value={m.value} onChange={e => updateMetric(i, 'value', e.target.value)} placeholder="Value" className="w-28 text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <input value={m.change} onChange={e => updateMetric(i, 'change', e.target.value)} placeholder="±Change" className="w-24 text-sm text-white rounded-lg px-3 py-2 outline-none" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }} />
                  {metrics.length > 1 && <button onClick={() => removeMetric(i)} className="text-white/20 hover:text-red-400 font-black text-lg leading-none">×</button>}
                </div>
              ))}
            </div>
          </div>

          <div><label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Wins / Highlights <span className="text-red-400">*</span></label>
            <textarea value={wins} onChange={e => setWins(e.target.value)} placeholder="Launched new landing page that increased conversions 40%. Ranked #3 for target keyword. Campaign ROAS improved from 2.1x to 3.4x." rows={4} className="w-full text-sm text-white/80 placeholder-white/20 outline-none resize-y" style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '12px 14px' }} /></div>
          <div><label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Challenges (Optional)</label>
            <textarea value={challenges} onChange={e => setChallenges(e.target.value)} placeholder="Competitor increased ad spend significantly. Seasonality impacted traffic in first two weeks." rows={3} className="w-full text-sm text-white/80 placeholder-white/20 outline-none resize-y" style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '12px 14px' }} /></div>
          <div><label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Next Steps (Optional)</label>
            <textarea value={nextSteps} onChange={e => setNextSteps(e.target.value)} placeholder="A/B test new ad creative. Launch email nurture sequence. Expand to new ad platform." rows={3} className="w-full text-sm text-white/80 placeholder-white/20 outline-none resize-y" style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '12px 14px' }} /></div>
          <div><label className="text-xs text-white/30 font-bold uppercase tracking-wider mb-1.5 block">Report Tone</label>
            <div className="flex flex-wrap gap-2">{TONES.map(t => <button key={t} onClick={() => setTone(t)} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all" style={tone === t ? { background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' } : { background: 'transparent', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>{t}</button>)}</div></div>

          <div className="flex justify-end">
            <button onClick={generate} disabled={loading || !clientName.trim() || (!wins.trim() && !metrics.filter(m => m.name && m.value).length)}
              className="px-6 py-3 rounded-xl text-sm font-black text-white transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 20px rgba(124,58,237,0.35)' }}>
              {loading ? 'Generating…' : 'Generate Report'}
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>}
        {/* ── SAMPLE OUTPUT ─────────────────────────────────── */}
        <div className="rounded-2xl border overflow-hidden mb-6" style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#0d1117' }}>
          <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
            <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>Example output — Monthly client report</span>
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}>Preview</span>
          </div>
          <div className="p-5 space-y-4 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <div className="pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="font-bold text-sm mb-0.5" style={{ color: 'rgba(255,255,255,0.8)' }}>Monthly Performance Report — May 2026</p>
              <p style={{ color: 'rgba(255,255,255,0.3)' }}>Prepared for: Acme Retail Co. · Agency: Your Agency · Period: May 1–31, 2026</p>
            </div>
            <div>
              <p className="font-bold mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>EXECUTIVE SUMMARY</p>
              <p className="leading-relaxed">May was a strong month. Organic traffic grew 18% month-over-month, driven by the blog content campaign we launched in April. Paid search ROAS improved to 4.2x (up from 3.1x in April) following bid strategy adjustments. Three new landing pages launched and are indexed.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {([['Organic Traffic', '+18%', '#4ade80'], ['Paid ROAS', '4.2x', '#4ade80'], ['New Leads', '47', '#06d6ff']] as [string, string, string][]).map(([label, val, col]) => (
                <div key={label} className="rounded-xl p-3 text-center border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="text-xl font-black mb-0.5" style={{ color: col }}>{val}</div>
                  <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</div>
                </div>
              ))}
            </div>
            <div>
              <p className="font-bold mb-1.5" style={{ color: 'rgba(255,255,255,0.65)' }}>KEY WINS THIS MONTH</p>
              <p>✓ Blog post &quot;How to Choose a CRM&quot; ranking #3 for target keyword (est. 2,400 searches/mo)</p>
              <p>✓ Reduced cost-per-click 22% by pausing underperforming ad groups</p>
              <p>✓ Email open rate improved to 31% (industry avg: 21%)</p>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.2)' }}><em>Continues: Next month priorities, budget summary, campaign breakdown, recommendations...</em></p>
          </div>
          <div className="px-5 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>Generated in ~30 seconds. Paste your metrics and wins — AI writes the narrative, formats the stats, and adds next-steps.</p>
          </div>
        </div>

        {paywall && !loading && <PaywallCard toolId="agency-report" toolName="Agency Report Generator" oneTimePrice={49} freeLimit={1} accent="#06d6ff" />}

        {result && (
          <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-black text-white">{result.reportTitle}</h2>
              <button onClick={copyReport} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all" style={{ background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)', color: copied ? '#4ade80' : 'rgba(255,255,255,0.5)', border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                {copied ? 'Copied!' : 'Copy Report'}
              </button>
            </div>

            <div className="rounded-xl border p-5" style={{ background: 'rgba(167,139,250,0.05)', borderColor: 'rgba(167,139,250,0.15)' }}>
              <p className="text-xs font-black uppercase tracking-widest text-purple-400 mb-3">Executive Summary</p>
              <p className="text-sm text-white/70 leading-relaxed">{result.executiveSummary}</p>
            </div>

            {result.keyAchievements?.length > 0 && (
              <div className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-black uppercase tracking-widest text-green-400 mb-3">Key Achievements</p>
                <ul className="space-y-2">{result.keyAchievements.map((a, i) => <li key={i} className="flex items-start gap-2 text-sm text-white/65"><svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-green-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>{a}</li>)}</ul>
              </div>
            )}

            {result.metricsNarrative && (
              <div className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-3">Metrics Analysis</p>
                <p className="text-sm text-white/65 leading-relaxed">{result.metricsNarrative}</p>
              </div>
            )}

            {result.sections?.map((s, i) => (
              <div key={i} className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-3">{s.title}</p>
                <div className="text-sm text-white/65 leading-relaxed whitespace-pre-wrap">{s.content}</div>
              </div>
            ))}

            {result.challengesAndSolutions && (
              <div className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-black uppercase tracking-widest text-orange-400 mb-3">Challenges & Solutions</p>
                <p className="text-sm text-white/65 leading-relaxed">{result.challengesAndSolutions}</p>
              </div>
            )}

            {result.nextMonthPlan && (
              <div className="rounded-xl border p-5" style={{ background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.15)' }}>
                <p className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-3">Next Month Plan</p>
                <p className="text-sm text-white/65 leading-relaxed whitespace-pre-wrap">{result.nextMonthPlan}</p>
              </div>
            )}

            {result.closingNote && (
              <div className="rounded-xl border p-5" style={{ background: 'rgba(167,139,250,0.04)', borderColor: 'rgba(167,139,250,0.15)' }}>
                <p className="text-sm text-white/60 leading-relaxed italic">{result.closingNote}</p>
              </div>
            )}
          </div>
        )}
        <div className="mt-10 mb-8">
          <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Who This Is For</p>
          <ul className="space-y-2 text-sm text-white/55">
            <li>• Agency account managers generating monthly client reports in minutes</li>
            <li>• Freelancers summarizing deliverables, wins, and next steps for retainer clients</li>
            <li>• Marketing teams presenting campaign results with a professional narrative</li>
            <li>• Consultants creating structured progress reports across 9 service types</li>
          </ul>
        </div>

        {/* ── FAQ ─────────────────────────────────────────── */}
        <div className="mt-10 mb-6 space-y-3">
          <h2 className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>Common questions</h2>
          {[
            { q: "What data do I need to generate a report?", a: "You need the client name, reporting period, service type, and key metrics (traffic, revenue, leads — whatever applies). The AI turns those numbers into a structured narrative with wins, challenges, and next steps. No template or spreadsheet required." },
            { q: "Can I white-label the output?", a: "Yes. The generated report is plain text with no Queldrex branding. Paste it into your own report template, branded Google Doc, or client portal before delivery." },
            { q: "Does Queldrex store my client data?", a: "No. Client names, metrics, and performance data entered into the tool are used to generate the report and are not stored or logged after the response is returned." },
            { q: "How do I handle metrics I don't have?", a: "Leave those fields blank or enter 0 — the AI will omit those metrics from the narrative rather than fabricating numbers. Focus on the metrics you can speak to confidently; the report will still be complete." },
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

        <div className="mt-14 rounded-2xl border p-6 text-center" style={{ background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.15)' }}>
          <p className="text-white font-black mb-1">Add agency report generation to your platform</p>
          <p className="text-white/40 text-sm mb-4">9 service types, dynamic metrics table, wins/challenges/next steps, AI-generated full report. One-time license.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <BuyToolButton toolId="agency-report" price={49} className="px-5 py-2.5 rounded-xl text-sm font-black text-black cursor-pointer" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }} />
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>All 51 tools — from $149 →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
