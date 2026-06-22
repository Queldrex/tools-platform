'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const FEATURES = [
  {
    title: 'Monthly Rescan',
    desc: 'Automated scan on the same 14 signals as the full scanner. Runs on the same day every month.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
    ),
  },
  {
    title: 'Drop Alerts',
    desc: 'Email alert the moment your score falls 5+ points since your last scan. Catch problems before customers do.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
      </svg>
    ),
  },
  {
    title: 'Score History',
    desc: '12-month trend chart showing your AI visibility score over time — so you can see what fixes actually moved the needle.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
      </svg>
    ),
  },
  {
    title: 'Cancel Anytime',
    desc: 'No contracts. Cancel instantly from your Stripe billing portal — no forms, no calls.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
]

const SAMPLE_SIGNALS = [
  { label: 'llms.txt present', pass: true },
  { label: 'LocalBusiness JSON-LD', pass: true },
  { label: 'Open Graph meta tags', pass: true },
  { label: 'sitemap.xml accessible', pass: true },
  { label: 'robots.txt allows GPTBot', pass: false },
  { label: 'Business description consistency', pass: true },
  { label: 'NAP data structured', pass: false },
  { label: 'Schema.org markup valid', pass: true },
]

export default function MonitorPage() {
  const [subEmail, setSubEmail] = useState('')
  const [subDomain, setSubDomain] = useState('')
  const [subLoading, setSubLoading] = useState(false)
  const [subError, setSubError] = useState('')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginSent, setLoginSent] = useState(false)
  const [loginError, setLoginError] = useState('')

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    setSubError('')
    setSubLoading(true)
    try {
      const res = await fetch('/api/monitor/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subEmail, domain: subDomain }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setSubError(data.error || 'Something went wrong. Please try again.')
        return
      }
      window.location.href = data.url
    } catch {
      setSubError('Network error. Please try again.')
    } finally {
      setSubLoading(false)
    }
  }

  async function handleLoginLink(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const res = await fetch('/api/monitor/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail }),
      })
      const data = await res.json()
      if (!res.ok) {
        setLoginError(data.error || 'Could not send link.')
        return
      }
      setLoginSent(true)
    } catch {
      setLoginError('Network error. Please try again.')
    } finally {
      setLoginLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main>

        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pt-20 pb-14 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-6"
            style={{ background: 'rgba(6,214,255,0.08)', border: '1px solid rgba(6,214,255,0.2)', color: '#06d6ff' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Monthly automated monitoring — $79/month
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-5 leading-tight">
            Never lose your<br />
            <span style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI visibility ranking
            </span>
          </h1>
          <p className="text-lg text-white/55 max-w-2xl mx-auto leading-relaxed mb-8">
            AI assistants like ChatGPT and Perplexity rescan the web constantly. We scan your site every month and alert you the moment your score drops — so you can fix it before customers stop finding you.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-white/30">
            {['14 signals checked monthly', 'Alert within hours of a score drop', 'Cancel from Stripe, any time', 'Included in Pro ($79/mo)'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <svg className="w-3 h-3 text-cyan-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* What you get each month */}
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="grid lg:grid-cols-2 gap-8 items-start">

            {/* Feature cards */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white/25 mb-5">What you get every month</p>
              <div className="space-y-3">
                {FEATURES.map(f => (
                  <div key={f.title} className="flex gap-4 rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-cyan-400"
                      style={{ background: 'rgba(6,214,255,0.08)', border: '1px solid rgba(6,214,255,0.15)' }}>
                      {f.icon}
                    </div>
                    <div>
                      <p className="text-sm font-black text-white mb-1">{f.title}</p>
                      <p className="text-xs text-white/45 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample monthly report */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white/25 mb-5">Sample monthly report</p>
              <div className="rounded-2xl border overflow-hidden" style={{ background: '#0d1117', borderColor: 'rgba(6,214,255,0.2)' }}>
                <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(6,214,255,0.04)' }}>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Monthly AI Visibility Report</p>
                    <p className="text-xs text-white/40 mt-0.5">queldrex.com · June 2026</p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full text-black"
                    style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
                    GOOD
                  </span>
                </div>

                <div className="p-5">
                  {/* Score comparison */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { label: 'Last month', score: 61, color: 'rgba(255,255,255,0.3)' },
                      { label: 'This month', score: 74, color: '#06d6ff' },
                      { label: 'Change', score: '+13', color: '#34d399' },
                    ].map(s => (
                      <div key={s.label} className="text-center rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <p className="text-xl font-black" style={{ color: s.color }}>{s.score}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Signal breakdown */}
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-3">Signal Results</p>
                  <div className="space-y-1.5 mb-4">
                    {SAMPLE_SIGNALS.map(s => (
                      <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                        <span className="text-xs text-white/55">{s.label}</span>
                        {s.pass ? (
                          <span className="text-[10px] font-bold text-green-400 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                            Pass
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-red-400 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                            Fix needed
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Score trend bars */}
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-3">12-Month Trend</p>
                  <div className="flex items-end gap-1.5 h-12">
                    {[38, 42, 45, 51, 58, 61, 74].map((s, i) => (
                      <div key={i} className="flex-1 rounded-sm" style={{ height: `${(s / 80) * 100}%`, background: i === 6 ? '#06d6ff' : 'rgba(6,214,255,0.2)' }} />
                    ))}
                    {[null, null, null, null, null].map((_, i) => (
                      <div key={`empty-${i}`} className="flex-1 rounded-sm" style={{ height: '10%', background: 'rgba(255,255,255,0.05)' }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-white/15">Dec</span>
                    <span className="text-[9px] text-white/15">Jun</span>
                    <span className="text-[9px] text-white/15">Nov</span>
                  </div>
                </div>

                <div className="px-5 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                  <p className="text-[10px] text-white/30">Delivered to your inbox on the same day every month.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Signup form */}
        <section className="max-w-lg mx-auto px-6 pb-16">
          <div className="rounded-2xl p-8" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="text-xl font-black text-white mb-1">Start monitoring</h2>
            <p className="text-sm text-white/45 mb-6">$79/month — first scan within 24 hours of signup</p>
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Email address</label>
                <input
                  type="email" required placeholder="you@company.com"
                  value={subEmail} onChange={e => setSubEmail(e.target.value)}
                  className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-cyan-400/50"
                  style={{ background: '#070b14', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Domain to monitor</label>
                <input
                  type="text" required placeholder="yoursite.com"
                  value={subDomain} onChange={e => setSubDomain(e.target.value)}
                  className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-cyan-400/50"
                  style={{ background: '#070b14', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              {subError && <p className="text-xs text-red-400">{subError}</p>}
              <button type="submit" disabled={subLoading}
                className="w-full py-3.5 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 20px rgba(6,182,212,0.3)' }}>
                {subLoading ? 'Redirecting to checkout…' : 'Start Monitoring — $79/month · Includes all 48 Pro tools →'}
              </button>
              <p className="text-center text-xs text-white/30">Secure payment via Stripe · Cancel anytime</p>
            </form>
          </div>

          {/* Magic link login */}
          <div className="mt-6 rounded-xl p-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-sm font-semibold text-white/60 mb-4">Already a subscriber? Get your dashboard login link</p>
            {loginSent ? (
              <div className="text-center py-2">
                <div className="text-cyan-400 font-bold text-sm mb-1">Link sent!</div>
                <p className="text-xs text-white/40">Check your inbox — the link expires in 15 minutes.</p>
              </div>
            ) : (
              <form onSubmit={handleLoginLink} className="flex gap-2">
                <input
                  type="email" required placeholder="your@email.com"
                  value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                  className="flex-1 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-cyan-400/50"
                  style={{ background: '#070b14', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <button type="submit" disabled={loginLoading}
                  className="px-4 py-2.5 rounded-lg text-sm font-bold text-black flex-shrink-0 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
                  {loginLoading ? '…' : 'Send link'}
                </button>
              </form>
            )}
            {loginError && <p className="text-xs text-red-400 mt-2">{loginError}</p>}
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-white/25">Not ready to subscribe?</p>
            <Link href="/scanner" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
              Run a free AI visibility scan first →
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
