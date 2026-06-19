'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import PricingSection from '@/components/PricingSection'
import Footer from '@/components/Footer'
import ScanForm from '@/components/ScanForm'
import ScoreGauge from '@/components/ScoreGauge'
import BlurredPreview from '@/components/BlurredPreview'
import UpcomingTools from '@/components/UpcomingTools'
import type { ScanChecks, ExtendedChecks } from '@/lib/framework/types'

type PageState = 'idle' | 'scanning' | 'results' | 'error'

interface ScanData {
  scanId: string
  score: number
  checks: ScanChecks
  extendedChecks: ExtendedChecks
  blockedAiBots: string[]
  responseTimeMs: number
  businessName: string
  domain: string
  topRecommendation: string
}

const EXTENDED_LABELS: Record<keyof ExtendedChecks, { label: string; desc: string; why: string }> = {
  faqSchema:    { label: 'FAQ Schema',       desc: 'No FAQPage schema — excluded from Google AI Overviews snippets', why: 'Google AI Overviews' },
  reviewSchema: { label: 'Review Schema',    desc: 'No AggregateRating schema — AI cannot show your star rating', why: 'Authority signal' },
  aboutPage:    { label: 'About / Team',     desc: 'No About page found — E-E-A-T authorship signal missing', why: 'E-E-A-T' },
  contentFresh: { label: 'Content Freshness',desc: 'No dateModified found — AI systems deprioritize stale content', why: 'Recency signal' },
  jsHeavy:      { label: 'JS Rendering',     desc: 'Site appears JS-rendered — AI crawlers see near-empty content', why: 'Crawlability' },
}

const SIGNAL_LABELS: Record<keyof ScanChecks, { label: string; desc: string }> = {
  llmsTxt:             { label: 'llms.txt',          desc: 'No llms.txt file found at root level' },
  localBusinessSchema: { label: 'LocalBusiness',      desc: 'No LocalBusiness schema markup found' },
  jsonLd:              { label: 'JSON-LD',            desc: 'No valid JSON-LD structured data found' },
  sitemapXml:          { label: 'Sitemap',            desc: 'No sitemap.xml detected for AI crawlers' },
  openGraph:           { label: 'AI Metadata',        desc: 'Missing OpenGraph metadata tags' },
  httpsEnabled:        { label: 'HTTPS',              desc: 'Site is not served over HTTPS — AI crawlers deprioritize HTTP sites' },
  robotsTxt:           { label: 'Crawler Access',     desc: 'No robots.txt found for crawler guidance' },
  canonicalTag:        { label: 'Canonical URL',      desc: 'No canonical tag found — AI may cite wrong URL variant' },
}

function getStatusInfo(score: number) {
  if (score >= 80) return { label: 'GOOD', color: 'rgba(34,197,94,0.06)', border: 'rgba(34,197,94,0.2)', iconColor: 'text-green-400', iconBg: 'rgba(34,197,94,0.12)', iconBorder: 'rgba(34,197,94,0.25)', textColor: 'text-green-400', note: 'Your website has strong AI visibility signals.' }
  if (score >= 50) return { label: 'NEEDS WORK', color: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)', iconColor: 'text-amber-400', iconBg: 'rgba(245,158,11,0.12)', iconBorder: 'rgba(245,158,11,0.25)', textColor: 'text-amber-400', note: 'Your website is missing several AI visibility signals.' }
  return { label: 'CRITICAL', color: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.2)', iconColor: 'text-red-400', iconBg: 'rgba(239,68,68,0.12)', iconBorder: 'rgba(239,68,68,0.25)', textColor: 'text-red-400', note: 'Your website is missing critical AI visibility signals and structured data.' }
}

function SignalCard({ label, desc, pass }: { label: string; desc: string; pass: boolean }) {
  return (
    <div className="rounded-xl p-4 border flex flex-col gap-2" style={{ background: 'rgba(255,255,255,0.02)', borderColor: pass ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.07)' }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-white/70">{label}</span>
        {pass
          ? <div className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center"><svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></div>
          : <div className="w-5 h-5 rounded-full border-2 border-red-500 flex items-center justify-center"><svg className="w-2.5 h-2.5 text-red-500" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></div>
        }
      </div>
      <p className={`text-xs leading-relaxed ${pass ? 'text-green-500/70' : 'text-red-400/70'}`}>
        {pass ? 'Signal detected' : desc}
      </p>
    </div>
  )
}

export default function ScannerPage() {
  const [state, setState] = useState<PageState>('idle')
  const [scanData, setScanData] = useState<ScanData | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [scannedDomain, setScannedDomain] = useState('')
  const formRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  async function handleScan(url: string, email: string) {
    setState('scanning')
    setScannedDomain(url.replace(/^https?:\/\//, '').replace(/\/$/, ''))
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, email }),
      })
      let json: { status?: string; error?: string; scanId?: string; score?: number; checks?: ScanChecks; extendedChecks?: ExtendedChecks; businessInfo?: { name?: string; domain?: string }; recommendations?: { title: string }[]; blockedAiBots?: string[]; responseTimeMs?: number }
      try { json = await res.json() } catch { throw new Error('Unexpected server response. Please try again.') }
      if (!res.ok || json.status === 'ERROR') throw new Error(json.error || 'Scan failed. Check the URL and try again.')
      setScanData({
        scanId: json.scanId!,
        score: json.score ?? 0,
        checks: json.checks ?? { robotsTxt: false, sitemapXml: false, llmsTxt: false, openGraph: false, jsonLd: false, localBusinessSchema: false, httpsEnabled: false, canonicalTag: false },
        extendedChecks: json.extendedChecks ?? { faqSchema: false, reviewSchema: false, aboutPage: false, contentFresh: false, jsHeavy: false },
        blockedAiBots: json.blockedAiBots ?? [],
        responseTimeMs: json.responseTimeMs ?? 0,
        businessName: json.businessInfo?.name || '',
        domain: json.businessInfo?.domain || '',
        topRecommendation: json.recommendations?.[0]?.title || '',
      })
      setState('results')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.')
      setState('error')
    }
  }

  async function handleUnlock() {
    if (!scanData) return
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scanId: scanData.scanId, tier: 'bundle' }) })
      const json = await res.json()
      if (!res.ok || !json.checkoutUrl) throw new Error(json.error || 'Could not start checkout.')
      window.location.href = json.checkoutUrl
    } catch (err) {
      setCheckoutLoading(false)
      alert(err instanceof Error ? err.message : 'Checkout failed.')
    }
  }


  const [dfyLoading, setDfyLoading] = useState(false)
  function handleDfy() {
    if (!scanData) return
    const params = new URLSearchParams({ scanId: scanData.scanId, url: scanData.domain, score: String(scanData.score) })
    window.location.href = `/apply?${params}`
  }

  return (
    <div className="min-h-screen text-white" style={{ background: '#070b14' }}>
      <Header />

      {/* Marketing hero */}
      {state === 'idle' && (
        <section className="relative overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(6,182,212,0.07) 0%, transparent 60%)' }} />
          <div className="max-w-4xl mx-auto px-6 pt-16 pb-14 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/25 bg-cyan-500/8 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-8">
              AI Visibility Scanner · Free
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-5">
              Is your business invisible<br className="hidden sm:block" /> to AI search?
            </h1>
            <p className="text-lg text-white/65 leading-relaxed mb-4 max-w-2xl mx-auto">
              ChatGPT, Claude, and Perplexity are recommending businesses to millions of users every day. The ones getting recommended have something most sites are missing.
            </p>
            <p className="text-base text-white/50 leading-relaxed mb-10 max-w-xl mx-auto">
              We scan your site for 8 signals AI assistants look for — including whether ChatGPT and Claude are being blocked from reading your site. You get a score, a breakdown, and the exact files to fix it.
            </p>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-10 max-w-3xl mx-auto">
              {['llms.txt', 'JSON-LD', 'LocalBusiness', 'Open Graph', 'Sitemap', 'HTTPS', 'Canonical', 'Robots.txt'].map((s) => (
                <div key={s} className="rounded-lg px-2 py-2.5 border border-white/8 text-center" style={{ background: 'rgba(6,182,212,0.04)' }}>
                  <span className="text-xs font-bold text-cyan-400/80">{s}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.03]"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 32px rgba(6,182,212,0.3)' }}
            >
              Scan My Site for Free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <p className="text-white/35 text-xs mt-4">Free scan. No account required. Results in under 30 seconds.</p>
          </div>
        </section>
      )}

      {state === 'idle' && (
        <section className="border-b border-white/5">
          <div className="max-w-5xl mx-auto px-6 py-14">
            <p className="text-cyan-500 text-xs font-bold tracking-[0.28em] uppercase text-center mb-8">What You Get</p>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  tier: 'Free Scan',
                  price: '$0',
                  color: 'rgba(255,255,255,0.02)',
                  border: 'rgba(255,255,255,0.08)',
                  items: ['AI Visibility Score (0-100)', 'Missing signal breakdown', 'AI crawler block check', 'One priority recommendation', 'No account required'],
                },
                {
                  tier: 'Full Report Bundle',
                  price: '$149',
                  color: 'rgba(6,182,212,0.04)',
                  border: 'rgba(6,182,212,0.3)',
                  featured: true,
                  items: ['Everything in Free Scan', 'Complete llms.txt file', 'JSON-LD schema file', 'robots.txt recommendations', 'Full HTML report', 'Deploy instructions'],
                },
                {
                  tier: 'Done-For-You',
                  price: 'Starting at $499',
                  color: 'rgba(255,255,255,0.02)',
                  border: 'rgba(255,255,255,0.08)',
                  items: ['Everything in the Bundle', 'We install all files for you', 'Schema deployment', 'Final verification scan', '30-day email support'],
                },
              ].map(({ tier, price, color, border, featured, items }) => (
                <div key={tier} className="rounded-2xl border p-6 flex flex-col" style={{ background: color, borderColor: border, boxShadow: featured ? '0 0 32px rgba(6,182,212,0.08)' : 'none' }}>
                  {featured && <span className="inline-block text-[10px] font-black uppercase tracking-wider text-black px-2.5 py-1 rounded-full mb-3 self-start" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Most Popular</span>}
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: featured ? '#06d6ff' : 'rgba(255,255,255,0.4)' }}>{tier}</p>
                  <p className="text-2xl font-black text-white mb-4">{price}</p>
                  <ul className="space-y-2 flex-1">
                    {items.map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm text-white/60">
                        <svg className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-6 pt-10 pb-2">
        <div className="flex items-center gap-2 text-xs text-white/30 mb-6">
          <Link href="/" className="hover:text-white transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>
          </Link>
          <span>/</span>
          <span className="text-white/50">scanner</span>
        </div>
        {state === 'idle' && (
          <>
            <h2 className="text-2xl font-black text-white mb-1">Run your free scan</h2>
            <p className="text-white/50 text-sm mb-6">Enter any public website URL to check its AI visibility score.</p>
          </>
        )}
        {state !== 'idle' && (
          <>
            <h1 className="text-3xl font-black text-white mb-1">AI Visibility Scanner</h1>
            <p className="text-white/55 text-sm mb-8">Analyze your website&apos;s visibility to AI systems and search engines.</p>
          </>
        )}
      </div>

      <div ref={formRef} className="max-w-7xl mx-auto px-6 pb-8">
        <div className="rounded-2xl border border-white/8 p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <ScanForm onScan={handleScan} loading={state === 'scanning'} />
          {state === 'error' && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">{errorMsg}</div>
          )}
        </div>
      </div>

      <div ref={resultsRef} className="max-w-7xl mx-auto px-6 pb-24">
        {state === 'scanning' && (
          <div className="rounded-2xl border border-white/8 p-12 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
              <svg className="w-7 h-7 text-cyan-400 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Scanning {scannedDomain}...</h2>
            <p className="text-white/45 text-sm max-w-xs mx-auto">Checking 8 AI visibility signals and generating your fix package.</p>
          </div>
        )}

        {state === 'results' && scanData && (
          <div className="grid xl:grid-cols-[1fr_420px] gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Audit Results</h2>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/25">Scanned {new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                  <button onClick={() => { setState('idle'); setScanData(null) }} className="text-xs text-cyan-500 hover:text-cyan-300 transition-colors font-semibold">Scan another</button>
                </div>
              </div>

              {(() => {
                const status = getStatusInfo(scanData.score)
                return (
                  <div className="rounded-xl px-5 py-4 flex items-center gap-4 border" style={{ background: status.color, borderColor: status.border }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: status.iconBg, border: `1px solid ${status.iconBorder}` }}>
                      <svg className={`w-5 h-5 ${status.iconColor}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-0.5">
                        <span className="text-xs font-bold text-white/40 uppercase tracking-wider">AI Visibility Status</span>
                        {scanData.score < 80 && <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider">(HIDDEN FROM CHATGPT / CLAUDE)</span>}
                      </div>
                      <p className={`text-2xl font-black ${status.textColor}`}>{status.label}</p>
                      <p className="text-xs text-white/45 mt-0.5">{status.note}</p>
                    </div>
                  </div>
                )
              })()}

              <div className="rounded-xl border border-white/8 p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <ScoreGauge score={scanData.score} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(Object.entries(scanData.checks) as [keyof ScanChecks, boolean][]).map(([key, pass]) => {
                  const meta = SIGNAL_LABELS[key]
                  return <SignalCard key={key} label={meta.label} desc={meta.desc} pass={pass} />
                })}
              </div>

              {/* Advanced Analysis — 5 deeper signals */}
              <div className="rounded-xl border border-white/6 p-4" style={{ background: 'rgba(255,255,255,0.015)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/30">Advanced Analysis</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" style={{ background: 'rgba(6,182,212,0.1)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.2)' }}>5 signals</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {(Object.entries(scanData.extendedChecks) as [keyof ExtendedChecks, boolean][]).map(([key, value]) => {
                    const meta = EXTENDED_LABELS[key]
                    // jsHeavy is bad when TRUE (inverted logic)
                    const pass = key === 'jsHeavy' ? !value : value
                    return (
                      <div key={key} className="rounded-lg p-3 border flex flex-col gap-1.5" style={{ background: 'rgba(255,255,255,0.02)', borderColor: pass ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.07)' }}>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold text-white/60 leading-tight">{meta.label}</span>
                          {pass
                            ? <div className="w-4 h-4 rounded-full border-2 border-green-500 flex items-center justify-center flex-shrink-0"><svg className="w-2.5 h-2.5 text-green-500" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></div>
                            : <div className="w-4 h-4 rounded-full border-2 border-red-500/60 flex items-center justify-center flex-shrink-0"><svg className="w-2 h-2 text-red-400" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></div>
                          }
                        </div>
                        <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: pass ? 'rgba(34,197,94,0.5)' : 'rgba(6,182,212,0.5)' }}>{meta.why}</span>
                      </div>
                    )
                  })}
                </div>
              </div>


              {scanData.blockedAiBots.length > 0 && (
                <div className="rounded-xl border border-red-500/30 p-5" style={{ background: 'rgba(239,68,68,0.05)' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-red-400 mb-1">AI Crawlers Are Being Blocked</p>
                      <p className="text-xs text-white/55 mb-3 leading-relaxed">
                        Your robots.txt is preventing these AI assistants from reading your site. They cannot recommend your business to users.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {scanData.blockedAiBots.map(bot => (
                          <span key={bot} className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)' }}>
                            {bot}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {scanData.responseTimeMs > 3000 && (
                <div className="rounded-xl border border-amber-500/25 px-5 py-4 flex items-center gap-3" style={{ background: 'rgba(245,158,11,0.04)' }}>
                  <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <p className="text-xs text-amber-400/80">
                    <span className="font-bold">Slow load: {(scanData.responseTimeMs / 1000).toFixed(1)}s.</span> AI crawlers may time out before indexing your content. Aim for under 2 seconds.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Generated Optimization Preview</h2>
                <p className="text-sm text-white/45">Your complete optimized files are ready. Unlock to view and download.</p>
              </div>
              <BlurredPreview
                llmsTxtSnippet=""
                jsonLdSnippet=""
                topRecommendation={scanData.topRecommendation}
                onUnlock={handleUnlock}
                loading={checkoutLoading}
                onDfy={handleDfy}
                dfyLoading={dfyLoading}
              />
            </div>
          </div>
        )}

        {state === 'idle' && (
          <div className="text-center py-12 text-white/25 text-sm">Results will appear here after your scan.</div>
        )}

        {state === 'results' && (
          <div className="mt-16 pt-12 border-t border-white/6">
            <UpcomingTools />
          </div>
        )}
      </div>

      <div className="border-t border-white/5 py-8" style={{ background: 'rgba(6,182,212,0.02)' }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>, title: 'Secure', sub: 'Stripe Secured Checkout' },
              { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>, title: 'Instant Delivery', sub: 'Auto-delivered to your email' },
              { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>, title: '15-Minute Guarantee', sub: 'Files in your inbox fast' },
            ].map(({ icon, title, sub }) => (
              <div key={title} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-cyan-400" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">{icon}</svg>
                </div>
                <p className="text-sm font-bold text-white">{title}</p>
                <p className="text-xs text-white/40">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PricingSection />
      <Footer />
    </div>
  )
}
