'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

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
        <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6"
            style={{ background: 'rgba(6,214,255,0.08)', border: '1px solid rgba(6,214,255,0.2)', color: '#06d6ff' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Monthly automated monitoring — $29/month
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Never lose your<br />
            <span style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI visibility ranking
            </span>
          </h1>
          <p className="text-lg text-white/55 max-w-2xl mx-auto leading-relaxed">
            AI assistants like ChatGPT and Perplexity rescan the web constantly. We scan your site every month and alert you the moment your score drops — so you can fix it before customers stop finding you.
          </p>
        </section>

        {/* Feature cards */}
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: '📅', title: 'Monthly Rescan', desc: 'Automated scan on the same 14 signals as the full scanner' },
              { icon: '🔔', title: 'Drop Alerts', desc: 'Email alert the moment your score falls 5+ points' },
              { icon: '📈', title: 'Score History', desc: '12 months of trend data so you can see what\'s working' },
              { icon: '❌', title: 'Cancel Anytime', desc: 'No contracts. Cancel from your dashboard or email us' },
            ].map(f => (
              <div key={f.title} className="rounded-xl p-5" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-2xl mb-3">{f.icon}</div>
                <div className="text-sm font-bold text-white mb-1.5">{f.title}</div>
                <div className="text-xs text-white/45 leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Signup form */}
        <section className="max-w-lg mx-auto px-6 pb-16">
          <div className="rounded-2xl p-8" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="text-xl font-black text-white mb-1">Start monitoring</h2>
            <p className="text-sm text-white/45 mb-6">$29/month — first scan within 24 hours of signup</p>
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Email address</label>
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={subEmail}
                  onChange={e => setSubEmail(e.target.value)}
                  className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-cyan-400/50"
                  style={{ background: '#070b14', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Domain to monitor</label>
                <input
                  type="text"
                  required
                  placeholder="yoursite.com"
                  value={subDomain}
                  onChange={e => setSubDomain(e.target.value)}
                  className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-cyan-400/50"
                  style={{ background: '#070b14', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              {subError && <p className="text-xs text-red-400">{subError}</p>}
              <button
                type="submit"
                disabled={subLoading}
                className="w-full py-3.5 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 20px rgba(6,182,212,0.3)' }}
              >
                {subLoading ? 'Redirecting to checkout…' : 'Start Monitoring — $29/month →'}
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
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="flex-1 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-cyan-400/50"
                  style={{ background: '#070b14', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="px-4 py-2.5 rounded-lg text-sm font-bold text-black flex-shrink-0 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}
                >
                  {loginLoading ? '…' : 'Send link'}
                </button>
              </form>
            )}
            {loginError && <p className="text-xs text-red-400 mt-2">{loginError}</p>}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
