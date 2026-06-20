import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'About Queldrex — AI Visibility Tools, Colorado',
  description: 'Queldrex LLC builds precision AI visibility tools and custom software for businesses, agencies, and government. Castle Rock, Colorado.',
}

const WHAT_WE_BUILD = [
  {
    title: 'AI Visibility Tools',
    desc: 'Software that analyzes how AI platforms discover and represent businesses. 14 signals. Real data. Actionable fixes.',
    color: 'rgba(6,182,212,0.07)',
    border: 'rgba(6,182,212,0.2)',
    accent: '#06d6ff',
  },
  {
    title: 'Monitoring & Alerts',
    desc: 'Ongoing tracking so businesses never go dark to AI search without knowing. Monthly rescans. Instant alerts.',
    color: 'rgba(99,102,241,0.07)',
    border: 'rgba(99,102,241,0.2)',
    accent: 'rgb(99,102,241)',
  },
  {
    title: 'Custom Development',
    desc: 'Bespoke tools, automations, and web apps built for businesses and agencies. Fixed price. You own the code.',
    color: 'rgba(16,185,129,0.07)',
    border: 'rgba(16,185,129,0.2)',
    accent: 'rgb(16,185,129)',
  },
  {
    title: 'Agency Solutions',
    desc: 'White-label and reseller programs for agencies managing multiple clients. One dashboard. Your branding.',
    color: 'rgba(245,158,11,0.07)',
    border: 'rgba(245,158,11,0.2)',
    accent: 'rgb(245,158,11)',
  },
]

const FACTS = [
  { label: 'Castle Rock, CO', sub: 'Colorado LLC' },
  { label: 'Founded 2026', sub: 'New but moving fast' },
  { label: '14 AI Signals', sub: 'Scanned per domain' },
  { label: 'Real Data Only', sub: 'No simulated results, ever' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <p className="text-xs font-bold tracking-[0.28em] uppercase text-cyan-500 mb-4">About Queldrex</p>
        <h1 className="text-4xl lg:text-5xl font-black text-white leading-[1.08] mb-6 max-w-3xl">
          Built by a developer who got tired of businesses being invisible to AI.
        </h1>
        <p className="text-lg text-white/55 leading-relaxed max-w-2xl">
          Queldrex LLC is a software company based in Castle Rock, Colorado. We build precision tools that help businesses understand and improve how AI search engines see them.
        </p>
      </section>

      {/* THE PROBLEM */}
      <section className="border-t border-white/5 py-16" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-bold tracking-[0.28em] uppercase text-white/30 mb-4">The Problem We Solve</p>
          <p className="text-white/65 text-lg leading-relaxed max-w-3xl">
            When someone asks ChatGPT &ldquo;what&rsquo;s the best plumber in Denver?&rdquo; — the businesses that answer are the ones AI can actually find and trust. Most businesses have no idea if they&rsquo;re in that group. We built the tools to find out, monitor it, and fix it.
          </p>
        </div>
      </section>

      {/* WHAT WE BUILD */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-xs font-bold tracking-[0.28em] uppercase text-white/30 mb-8">What We Build</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {WHAT_WE_BUILD.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border p-6 flex flex-col gap-3"
              style={{ background: item.color, borderColor: item.border }}
            >
              <div className="w-8 h-0.5 rounded-full" style={{ background: item.accent }} />
              <h3 className="text-base font-black text-white">{item.title}</h3>
              <p className="text-sm text-white/55 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMPANY FACTS */}
      <section className="border-t border-white/5 py-14" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {FACTS.map((f) => (
              <div
                key={f.label}
                className="rounded-xl border p-5 text-center"
                style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}
              >
                <p className="text-base font-black text-white mb-1">{f.label}</p>
                <p className="text-xs text-white/35">{f.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR AGENCIES */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-5">
          {/* Agencies */}
          <div
            className="rounded-2xl border p-8"
            style={{ background: 'rgba(6,182,212,0.05)', borderColor: 'rgba(6,182,212,0.2)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">For Agencies</span>
            </div>
            <p className="text-white/65 text-sm leading-relaxed mb-6">
              We&rsquo;re actively building agency partnerships. If you manage websites or digital marketing for multiple clients, we offer reseller pricing and white-label reports. Email us to talk.
            </p>
            <a
              href="mailto:hello@queldrex.com?subject=Agency Partnership"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-black"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}
            >
              Start a Partnership
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>

          {/* Accelerators */}
          <div
            className="rounded-2xl border p-8"
            style={{ background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.2)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full" style={{ background: 'rgb(99,102,241)' }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgb(99,102,241)' }}>For Accelerators & Investors</span>
            </div>
            <p className="text-white/65 text-sm leading-relaxed mb-6">
              Queldrex is a Colorado LLC with a live product, real customers, and a clear market in AI search visibility. We&rsquo;re open to accelerator programs that provide customer access and mentorship.
            </p>
            <a
              href="mailto:hello@queldrex.com?subject=Accelerator Inquiry"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-colors hover:border-indigo-400/60"
              style={{ color: 'rgb(99,102,241)', borderColor: 'rgba(99,102,241,0.35)', background: 'transparent' }}
            >
              Get in Touch
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 py-16">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-white font-black text-xl mb-1">See what we&rsquo;ve built.</p>
            <p className="text-white/45 text-sm">Real tools, live now.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/tools" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
              Browse Tools
            </Link>
            <Link href="/sample-audit" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white/55 border border-white/12 hover:text-white transition-colors">
              See Sample Report →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
