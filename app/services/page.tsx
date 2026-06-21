'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const QUICK_PACKAGES = [
  {
    name: 'Email Deliverability Setup',
    desc: 'We configure SPF, DKIM, and DMARC for your domain so your email lands in inboxes, not spam.',
    price: '$299',
    delivery: '1-2 days',
    accent: '#06d6ff',
    border: 'rgba(6,182,212,0.2)',
    bg: 'rgba(6,182,212,0.05)',
  },
  {
    name: 'Schema & AI Visibility Setup',
    desc: 'We add JSON-LD structured data markup to your entire site so AI systems can find and cite your content.',
    price: '$499',
    delivery: '2-3 days',
    accent: '#7c3aed',
    border: 'rgba(124,58,237,0.2)',
    bg: 'rgba(124,58,237,0.05)',
  },
  {
    name: 'Security Audit',
    desc: 'We run our full security toolkit against your app or site and deliver a written report with prioritized fixes.',
    price: '$799',
    delivery: '3-5 days',
    accent: '#f87171',
    border: 'rgba(248,113,113,0.2)',
    bg: 'rgba(248,113,113,0.05)',
  },
]

const SERVICES = [
  {
    name: 'Custom Tool',
    tagline: 'A focused tool that solves one specific problem for your business.',
    examples: ['Internal dashboard', 'Client-facing calculator or scanner', 'Data processing tool', 'Report generator'],
    price: '$1,500',
    priceSub: 'starting from',
    delivery: '5-10 days',
    color: 'rgba(6,182,212,0.07)',
    border: 'rgba(6,182,212,0.22)',
    accent: '#06d6ff',
  },
  {
    name: 'Business Automation',
    tagline: 'Eliminate repetitive manual work. Connect your tools and let them run.',
    examples: ['Form to CRM to email workflows', 'Invoice and contract generation', 'Data sync between platforms', 'Scheduled reporting'],
    price: '$750',
    priceSub: 'starting from',
    delivery: '3-7 days',
    color: 'rgba(99,102,241,0.07)',
    border: 'rgba(99,102,241,0.22)',
    accent: 'rgb(99,102,241)',
  },
  {
    name: 'AI Integration',
    tagline: 'Add real AI capability to your existing business or website.',
    examples: ['AI chatbot for your site', 'Document summarizer or analyzer', 'AI-powered email generator', 'Custom AI workflow'],
    price: '$1,000',
    priceSub: 'starting from',
    delivery: '5-10 days',
    color: 'rgba(245,158,11,0.07)',
    border: 'rgba(245,158,11,0.22)',
    accent: 'rgb(245,158,11)',
  },
  {
    name: 'Full Web App',
    tagline: 'A complete, production-ready web application built from scratch.',
    examples: ['SaaS product MVP', 'Customer portal or dashboard', 'Marketplace or directory', 'Internal operations platform'],
    price: '$3,500',
    priceSub: 'starting from',
    delivery: '2-4 weeks',
    color: 'rgba(16,185,129,0.07)',
    border: 'rgba(16,185,129,0.22)',
    accent: 'rgb(16,185,129)',
  },
  {
    name: 'Monthly Retainer',
    tagline: 'Ongoing builds, fixes, and improvements. Priority access, fixed monthly cost.',
    examples: ['New features every month', 'Bug fixes and maintenance', 'Performance improvements', 'Priority response time'],
    price: '$1,500',
    priceSub: 'per month',
    delivery: 'Ongoing',
    color: 'rgba(236,72,153,0.07)',
    border: 'rgba(236,72,153,0.22)',
    accent: 'rgb(236,72,153)',
  },
]

const PROOF = [
  {
    name: 'AI Visibility Scanner',
    desc: 'Scans 14 signals to determine if AI search engines can find and recommend a business. Report delivered in minutes.',
  },
  {
    name: 'Queldrex Triage System',
    desc: 'Full internal service desk: ticket tracking, DFY client pipeline, access logs, intrusion detection, health checks.',
  },
  {
    name: 'Threat Intelligence Feed',
    desc: 'Live threat indicator stream pulling from URLhaus and Feodo Tracker. Redis-cached, auto-refreshing, category-filtered.',
  },
  {
    name: 'Breach Lookup',
    desc: 'Password breach checker (HIBP k-anonymity) and 7-point domain security scanner. Zero fake data.',
  },
]

const PROCESS = [
  { step: '01', title: 'Tell us what you need', body: 'Fill out the form below. Describe the problem, what you want built, and your timeline.' },
  { step: '02', title: 'Get a quote in 24 hours', body: "We'll review your request and send a fixed price and delivery estimate within one business day." },
  { step: '03', title: 'We build it', body: 'Once approved, we build fast. You get updates throughout and full delivery when done.' },
  { step: '04', title: 'You own it', body: 'Full source code, full ownership. No vendor lock-in. Deploy it anywhere.' },
]

type FormState = 'idle' | 'loading' | 'success' | 'error'

export default function ServicesPage() {
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormState('loading')
    setErrorMsg('')
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    try {
      const res = await fetch('/api/build-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setFormState('success')
      } else {
        const json = await res.json().catch(() => ({}))
        setErrorMsg(json.error || 'Something went wrong. Please try again.')
        setFormState('error')
      }
    } catch {
      setErrorMsg('Network error. Please try again or email hello@queldrex.com.')
      setFormState('error')
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#09090B' }}>
      <Header />

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-14">
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-purple-400 mb-5">Queldrex · Custom Builds</p>

        <h1 className="text-4xl lg:text-6xl font-black leading-[1.05] mb-5" style={{ color: '#FAFAFA' }}>
          Need something built?<br />
          <span className="text-purple-400">We build it.</span>
        </h1>

        <p className="text-xl leading-relaxed mb-4 max-w-2xl" style={{ color: '#A1A1AA' }}>
          Custom tools, automations, AI integrations, and full web apps. Built fast, priced fairly, delivered clean. You describe the problem. We build the solution.
        </p>
        <p className="text-base leading-relaxed mb-10 max-w-xl" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Queldrex LLC is based in Castle Rock, Colorado. We build for businesses, startups, and teams who know what they need but don&apos;t have the time or in-house talent to build it.
        </p>

        <div className="flex flex-wrap gap-4">
          <a href="#request"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-black text-white transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 32px rgba(109,40,217,0.3)' }}>
            Get a Quote
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <a href="mailto:hello@queldrex.com"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl text-sm font-semibold border hover:border-white/25 hover:text-white transition-all"
            style={{ color: 'rgba(255,255,255,0.55)', borderColor: 'rgba(255,255,255,0.12)' }}>
            Email us directly →
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-6 mt-8">
          {['Fixed pricing', 'Fast turnaround', 'You own the source code', 'Colorado LLC'].map(t => (
            <span key={t} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <svg className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* QUICK PACKAGES */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <p className="text-xs font-bold tracking-[0.25em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Fixed-Price Packages</p>
        <p className="text-sm mb-6" style={{ color: '#A1A1AA' }}>Need a specific outcome, not a custom quote? These are ready to go.</p>
        <div className="grid md:grid-cols-3 gap-4">
          {QUICK_PACKAGES.map(pkg => (
            <div key={pkg.name} className="rounded-2xl border p-6 flex flex-col gap-3"
              style={{ background: pkg.bg, borderColor: pkg.border }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: pkg.accent }}>{pkg.delivery}</div>
                  <h3 className="text-base font-black" style={{ color: '#FAFAFA' }}>{pkg.name}</h3>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-black" style={{ color: '#FAFAFA' }}>{pkg.price}</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>fixed price</div>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>{pkg.desc}</p>
              <a href="#request" className="text-xs font-bold mt-auto hover:opacity-80 transition-opacity" style={{ color: pkg.accent }}>
                Get started →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* CUSTOM SERVICES */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <p className="text-xs font-bold tracking-[0.25em] uppercase mb-6" style={{ color: 'rgba(255,255,255,0.3)' }}>Custom Builds</p>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {SERVICES.map((s) => (
            <div key={s.name} className="rounded-2xl border p-7 flex flex-col gap-4"
              style={{ background: s.color, borderColor: s.border }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: s.accent }}>{s.delivery}</div>
                  <h3 className="text-lg font-black" style={{ color: '#FAFAFA' }}>{s.name}</h3>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.priceSub}</div>
                  <div className="text-xl font-black" style={{ color: '#FAFAFA' }}>{s.price}</div>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>{s.tagline}</p>
              <ul className="space-y-1.5 mt-auto">
                {s.examples.map((ex) => (
                  <li key={ex} className="flex items-start gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <span className="flex-shrink-0 mt-0.5" style={{ color: s.accent }}>→</span>
                    {ex}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* PROOF */}
      <section className="border-t border-white/5 py-16" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <p className="text-xs font-bold tracking-[0.25em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Built by us</p>
            <h2 className="text-2xl font-black" style={{ color: '#FAFAFA' }}>We build what we sell.</h2>
            <p className="text-sm mt-2 max-w-lg" style={{ color: '#A1A1AA' }}>Every tool on queldrex.com was built in-house. This is the standard we hold ourselves to.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {PROOF.map((p) => (
              <div key={p.name} className="rounded-xl border p-5" style={{ background: '#111318', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-bold" style={{ color: '#FAFAFA' }}>{p.name}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#A1A1AA' }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-xs font-bold tracking-[0.25em] uppercase mb-8" style={{ color: 'rgba(255,255,255,0.3)' }}>How it works</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PROCESS.map((p) => (
            <div key={p.step} className="flex flex-col gap-3">
              <div className="text-3xl font-black text-purple-400/25">{p.step}</div>
              <h3 className="text-sm font-black" style={{ color: '#FAFAFA' }}>{p.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: '#A1A1AA' }}>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* REQUEST FORM */}
      <section id="request" className="border-t border-white/5 py-16">
        <div className="max-w-2xl mx-auto px-6">
          <div className="mb-8">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-purple-400 mb-3">Get a Quote</p>
            <h2 className="text-3xl font-black mb-3" style={{ color: '#FAFAFA' }}>Tell us what you need.</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>
              Fill this out and we will respond with a fixed price and timeline within one business day. No commitment required.
            </p>
          </div>

          {formState === 'success' ? (
            <div className="rounded-2xl border p-10 text-center" style={{ background: 'rgba(52,211,153,0.06)', borderColor: 'rgba(52,211,153,0.2)' }}>
              <svg className="w-10 h-10 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-black mb-2" style={{ color: '#FAFAFA' }}>Request received.</h3>
              <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: '#A1A1AA' }}>
                We will review what you need and reply with a fixed quote within one business day. Check your inbox.
              </p>
              <p className="text-xs mt-4" style={{ color: 'rgba(255,255,255,0.25)' }}>Questions? Email hello@queldrex.com</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Your Name *</label>
                  <input name="name" required type="text" placeholder="Jane Smith"
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none"
                    style={{ background: '#111318', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Email *</label>
                  <input name="email" required type="email" placeholder="you@company.com"
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none"
                    style={{ background: '#111318', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Company / Website</label>
                <input name="company" type="text" placeholder="Acme Inc. / acme.com"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none"
                  style={{ background: '#111318', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Service Type *</label>
                <select name="serviceType" required
                  className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                  style={{ background: '#111318', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <option value="">Select what you need...</option>
                  <option value="email-deliverability">Email Deliverability Setup ($299)</option>
                  <option value="schema-setup">Schema &amp; AI Visibility Setup ($499)</option>
                  <option value="security-audit">Security Audit ($799)</option>
                  <option value="custom-tool">Custom Tool</option>
                  <option value="automation">Business Automation</option>
                  <option value="ai-integration">AI Integration</option>
                  <option value="web-app">Full Web App</option>
                  <option value="retainer">Monthly Retainer</option>
                  <option value="other">Something else</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>What do you need? *</label>
                <textarea name="description" required rows={5}
                  placeholder="Describe the problem, what it should do, who will use it, and any technical details you know..."
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none resize-none"
                  style={{ background: '#111318', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Budget Range</label>
                  <select name="budget"
                    className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                    style={{ background: '#111318', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <option value="">Not sure yet</option>
                    <option value="under-1k">Under $1,000</option>
                    <option value="1k-3k">$1,000 to $3,000</option>
                    <option value="3k-7k">$3,000 to $7,000</option>
                    <option value="7k-plus">$7,000+</option>
                    <option value="monthly">Monthly retainer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Timeline</label>
                  <select name="timeline"
                    className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                    style={{ background: '#111318', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <option value="">Flexible</option>
                    <option value="asap">ASAP</option>
                    <option value="2-weeks">Within 2 weeks</option>
                    <option value="1-month">Within 1 month</option>
                    <option value="flexible">No hard deadline</option>
                  </select>
                </div>
              </div>

              {formState === 'error' && (
                <div className="px-4 py-3 rounded-xl border text-sm text-red-400"
                  style={{ background: 'rgba(248,113,113,0.07)', borderColor: 'rgba(248,113,113,0.2)' }}>
                  {errorMsg}
                </div>
              )}

              <button type="submit" disabled={formState === 'loading'}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-black text-white transition-all hover:scale-[1.01] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 24px rgba(109,40,217,0.25)' }}>
                {formState === 'loading' ? 'Sending...' : 'Submit Request — Get Quote in 24 Hours'}
                {formState !== 'loading' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                )}
              </button>

              <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
                No commitment. Fixed quote within one business day. hello@queldrex.com
              </p>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
