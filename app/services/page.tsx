import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Custom Build Services — Queldrex',
  description: 'Need something built? Queldrex builds custom tools, automations, AI integrations, and web apps for businesses. Fast turnaround. Fixed pricing.',
}

const SERVICES = [
  {
    name: 'Custom Tool',
    tagline: 'A focused tool that solves one specific problem for your business.',
    examples: ['Internal dashboard', 'Client-facing calculator or scanner', 'Data processing tool', 'Report generator'],
    price: '$1,500',
    priceSub: 'starting from',
    delivery: '5–10 days',
    color: 'rgba(6,182,212,0.07)',
    border: 'rgba(6,182,212,0.22)',
    accent: '#06d6ff',
  },
  {
    name: 'Business Automation',
    tagline: 'Eliminate repetitive manual work. Connect your tools and let them run.',
    examples: ['Form → CRM → email workflows', 'Invoice and contract generation', 'Data sync between platforms', 'Scheduled reporting'],
    price: '$750',
    priceSub: 'starting from',
    delivery: '3–7 days',
    color: 'rgba(99,102,241,0.07)',
    border: 'rgba(99,102,241,0.22)',
    accent: 'rgb(99,102,241)',
  },
  {
    name: 'AI Integration',
    tagline: 'Add real AI capability to your existing business or website.',
    examples: ['AI chatbot for your site', 'Document summarizer or analyzer', 'AI-powered content or email generator', 'Custom AI workflow'],
    price: '$1,000',
    priceSub: 'starting from',
    delivery: '5–10 days',
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
    delivery: '2–4 weeks',
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
    desc: 'Scans 14 signals to determine if AI search engines can find and recommend a business. Paid report delivered in minutes.',
  },
  {
    name: 'Queldrex Triage System',
    desc: 'Full internal service desk — ticket tracking, DFY client pipeline, access logs, intrusion detection, health checks.',
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
  { step: '02', title: 'Get a quote in 24 hours', body: "We'll review your request and send you a fixed price and delivery estimate within one business day." },
  { step: '03', title: 'We build it', body: 'Once approved, we build fast. You get updates throughout and full delivery when done.' },
  { step: '04', title: 'You own it', body: 'Full source code, full ownership. No vendor lock-in. Deploy it anywhere.' },
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-14">
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase mb-6"
          style={{ borderColor: 'rgba(6,182,212,0.25)', background: 'rgba(6,182,212,0.08)', color: '#06d6ff' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Queldrex · Custom Builds
        </div>

        <h1 className="text-4xl lg:text-6xl font-black text-white leading-[1.05] mb-5">
          Need something built?<br />
          <span style={{ color: '#06d6ff' }}>We build it.</span>
        </h1>

        <p className="text-xl text-white/60 leading-relaxed mb-4 max-w-2xl">
          Custom tools, automations, AI integrations, and full web apps — built fast, priced fairly, delivered clean. You describe the problem. We build the solution.
        </p>
        <p className="text-base text-white/40 leading-relaxed mb-10 max-w-xl">
          Queldrex LLC is a Colorado-based software company. We build for businesses, startups, and teams who know what they need but don&apos;t have the time or resources to build it themselves.
        </p>

        <div className="flex flex-wrap gap-4">
          <a
            href="#request"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 32px rgba(6,182,212,0.3)' }}
          >
            Get a Quote
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <a
            href="mailto:hello@queldrex.com"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl text-sm font-semibold text-white/55 border border-white/12 hover:border-white/25 hover:text-white transition-all"
          >
            Email us directly →
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-6 mt-8 text-sm text-white/30">
          {['Fixed pricing — no surprises', 'Fast turnaround', 'You own the source code', 'Colorado LLC'].map((t, i) => (
            <span key={t} className="flex items-center gap-2">
              {i > 0 && <span className="text-white/10">·</span>}
              <svg className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-white/30 mb-6">What We Build</p>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {SERVICES.map((s) => (
            <div
              key={s.name}
              className="rounded-2xl border p-7 flex flex-col gap-4"
              style={{ background: s.color, borderColor: s.border }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: s.accent }}>
                    {s.delivery}
                  </div>
                  <h3 className="text-lg font-black text-white">{s.name}</h3>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-white/30">{s.priceSub}</div>
                  <div className="text-xl font-black text-white">{s.price}</div>
                </div>
              </div>

              <p className="text-sm text-white/55 leading-relaxed">{s.tagline}</p>

              <ul className="space-y-1.5 mt-auto">
                {s.examples.map((ex) => (
                  <li key={ex} className="flex items-start gap-2 text-xs text-white/40">
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
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-white/30 mb-2">Built By Us</p>
            <h2 className="text-2xl font-black text-white">We build what we sell.</h2>
            <p className="text-white/45 text-sm mt-2 max-w-lg">Every tool on queldrex.com was built in-house. This is the standard we hold ourselves to.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {PROOF.map((p) => (
              <div
                key={p.name}
                className="rounded-xl border p-5"
                style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-bold text-white">{p.name}</span>
                </div>
                <p className="text-xs text-white/45 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-white/30 mb-8">How It Works</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PROCESS.map((p) => (
            <div key={p.step} className="flex flex-col gap-3">
              <div className="text-3xl font-black" style={{ color: 'rgba(6,182,212,0.25)' }}>{p.step}</div>
              <h3 className="text-sm font-black text-white">{p.title}</h3>
              <p className="text-xs text-white/45 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* REQUEST FORM */}
      <section id="request" className="border-t border-white/5 py-16">
        <div className="max-w-2xl mx-auto px-6">
          <div className="mb-8">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-cyan-500 mb-3">Get a Quote</p>
            <h2 className="text-3xl font-black text-white mb-3">Tell us what you need.</h2>
            <p className="text-white/45 text-sm leading-relaxed">
              Fill this out and we&apos;ll respond with a fixed price and timeline within one business day. No commitment required.
            </p>
          </div>

          <form action="/api/build-request" method="POST" className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Your Name *</label>
                <input name="name" required type="text" placeholder="Jane Smith"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none"
                  style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Email *</label>
                <input name="email" required type="email" placeholder="you@company.com"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none"
                  style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Company / Website</label>
              <input name="company" type="text" placeholder="Acme Inc. / acme.com"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none"
                style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Service Type *</label>
              <select name="serviceType" required
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)' }}>
                <option value="">Select what you need...</option>
                <option value="custom-tool">Custom Tool</option>
                <option value="automation">Business Automation</option>
                <option value="ai-integration">AI Integration</option>
                <option value="web-app">Full Web App</option>
                <option value="retainer">Monthly Retainer</option>
                <option value="other">Something else</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">What do you need built? *</label>
              <textarea name="description" required rows={5}
                placeholder="Describe the problem you're solving, what it should do, who will use it, and any technical details you already know..."
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none resize-none"
                style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Budget Range</label>
              <select name="budget"
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)' }}>
                <option value="">Not sure yet</option>
                <option value="under-1k">Under $1,000</option>
                <option value="1k-3k">$1,000 – $3,000</option>
                <option value="3k-7k">$3,000 – $7,000</option>
                <option value="7k-plus">$7,000+</option>
                <option value="monthly">Monthly retainer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Timeline</label>
              <select name="timeline"
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)' }}>
                <option value="">Flexible</option>
                <option value="asap">ASAP</option>
                <option value="2-weeks">Within 2 weeks</option>
                <option value="1-month">Within 1 month</option>
                <option value="flexible">No hard deadline</option>
              </select>
            </div>

            <button type="submit"
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.01]"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 24px rgba(6,182,212,0.25)' }}>
              Submit Request — Get Quote in 24 Hours
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            <p className="text-xs text-white/25 text-center">
              No commitment. We&apos;ll send a fixed quote within one business day. hello@queldrex.com
            </p>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  )
}
