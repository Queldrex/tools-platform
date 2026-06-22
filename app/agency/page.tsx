'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

const FEATURES = [
  { title: '25 client scans/month', desc: 'Normally $9,975 at one-off scanner pricing. Included in your plan.' },
  { title: 'White-label PDF reports', desc: 'Your client sees their domain and score — not Queldrex branding.' },
  { title: 'Bulk client dashboard', desc: 'All your clients, all their scores, all their history in one view.' },
  { title: 'Monthly auto-reports', desc: 'We email each client their updated score every month automatically.' },
  { title: 'Priority email support', desc: 'Agency partners get faster response times than standard users.' },
  { title: 'Cancel anytime', desc: 'No annual contracts. No setup fees. Cancel from your dashboard.' },
]

const FAQS = [
  {
    q: 'What counts as a client scan?',
    a: 'Running the full 14-signal AI Visibility scan for one domain. Each month your counter resets to 25.',
  },
  {
    q: 'Can I resell reports to clients?',
    a: 'Yes. Reports are white-labeled and yours to deliver however you like — PDF, email, in a proposal deck.',
  },
  {
    q: 'What happens if I need more than 25 scans?',
    a: 'Contact us at hello@queldrex.com. We\'ll set up a custom plan for high-volume agencies.',
  },
  {
    q: 'Is there a contract?',
    a: 'No contract. Month-to-month. Cancel anytime from your dashboard or by emailing us.',
  },
  {
    q: 'Do my clients need Queldrex accounts?',
    a: 'No. You manage everything. Clients only see the reports you send them.',
  },
]

function AgencyContent() {
  const searchParams = useSearchParams()
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [email, setEmail] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (searchParams.get('billing') === 'annual') setBilling('annual')
  }, [searchParams])

  const [loginEmail, setLoginEmail] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginSent, setLoginSent] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/agency/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, agency_name: agencyName, billing }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }
      window.location.href = data.url
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleLoginLink(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const res = await fetch('/api/agency/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail }),
      })
      const data = await res.json()
      if (!res.ok) { setLoginError(data.error || 'Could not send link.'); return }
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
            Agency Plan — {billing === 'annual' ? '$996/yr ($83/mo)' : '$99/month'} · Up to 25 clients
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            The AI Visibility Platform<br />
            <span style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Built for Agencies
            </span>
          </h1>
          <p className="text-lg text-white/55 max-w-2xl mx-auto leading-relaxed mb-10">
            Scan all your clients, deliver white-label reports, and become their AI visibility expert.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#signup"
              className="px-8 py-4 rounded-xl text-sm font-black text-black transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 24px rgba(6,182,212,0.35)' }}>
              {billing === 'annual' ? 'Start Agency Plan — $996/yr →' : 'Start Agency Plan — $99/month →'}
            </a>
            <a href="#how" className="text-sm font-semibold text-white/50 hover:text-white transition-colors">
              See how it works ↓
            </a>
          </div>
        </section>

        {/* Who it's for */}
        <section id="how" className="max-w-5xl mx-auto px-6 pb-16">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/25 text-center mb-8">Who it&apos;s for</p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
                  </svg>
                ),
                title: 'Web & SEO Agencies',
                desc: 'Add AI visibility audits to your service menu overnight. No extra infrastructure required.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                  </svg>
                ),
                title: 'Digital Marketing Firms',
                desc: 'Show clients why AI search matters before competitors do. Lead with data.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                ),
                title: 'Freelance Consultants',
                desc: 'Manage up to 25 clients from one dashboard. Package it into a premium retainer.',
              },
            ].map(item => (
              <div key={item.title} className="rounded-2xl p-6" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(6,214,255,0.08)', color: '#06d6ff' }}>
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/25 text-center mb-8">Everything included</p>
          <div className="grid md:grid-cols-2 gap-4">
            {FEATURES.map(f => (
              <div key={f.title} className="flex gap-4 rounded-xl p-5" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="#06d6ff" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-white mb-1">{f.title}</div>
                  <div className="text-xs text-white/45 leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing card + signup form */}
        <section id="signup" className="max-w-lg mx-auto px-6 pb-16">
          <div className="rounded-2xl p-8" style={{ background: '#0d1117', border: '1px solid rgba(6,214,255,0.3)', boxShadow: '0 0 40px rgba(6,214,255,0.08)' }}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-xs font-bold tracking-[0.15em] uppercase text-cyan-400 mb-1">Agency Plan</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{billing === 'annual' ? '$83' : '$99'}</span>
                  <span className="text-white/40 text-sm">/mo</span>
                  {billing === 'annual' && <span className="text-white/25 text-sm line-through ml-1">$99</span>}
                </div>
                {billing === 'annual' && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-white/30">$996/yr</span>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}>Save $192/yr</span>
                  </div>
                )}
              </div>
              <div className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(6,214,255,0.12)', color: '#06d6ff' }}>
                25 clients/mo
              </div>
            </div>

            <ul className="space-y-2 mb-8">
              {FEATURES.map(f => (
                <li key={f.title} className="flex items-center gap-2.5 text-sm text-white/65">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="#06d6ff" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {f.title}
                </li>
              ))}
            </ul>

            <form onSubmit={handleSubscribe} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Agency / Company name</label>
                <input
                  type="text"
                  required
                  placeholder="Acme Digital Agency"
                  value={agencyName}
                  onChange={e => setAgencyName(e.target.value)}
                  className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-cyan-400/50"
                  style={{ background: '#070b14', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Email address</label>
                <input
                  type="email"
                  required
                  placeholder="you@agency.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-cyan-400/50"
                  style={{ background: '#070b14', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 20px rgba(6,182,212,0.3)' }}
              >
                {loading ? 'Redirecting to checkout…' : billing === 'annual' ? 'Start Agency Plan — $996/yr →' : 'Start Agency Plan — $99/month →'}
              </button>
              <p className="text-center text-xs text-white/30">Secure payment via Stripe · Cancel anytime · No contract</p>
            </form>
          </div>

          {/* Magic link login */}
          <div className="mt-6 rounded-xl p-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-sm font-semibold text-white/60 mb-4">Already an agency subscriber? Get your dashboard link</p>
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
                  placeholder="your@agency.com"
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

        {/* FAQ */}
        <section className="max-w-2xl mx-auto px-6 pb-24">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/25 text-center mb-8">Frequently asked questions</p>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-xl overflow-hidden" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
                >
                  <span className="text-sm font-semibold text-white">{faq.q}</span>
                  <svg
                    className={`w-4 h-4 text-white/40 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-white/50 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="text-sm text-white/40 mb-2">Questions before signing up?</p>
            <a href="mailto:hello@queldrex.com" className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
              hello@queldrex.com →
            </a>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}

export default function AgencyPage() {
  return <Suspense fallback={null}><AgencyContent /></Suspense>
}
