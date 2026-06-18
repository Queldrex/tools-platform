import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PricingSection from '@/components/PricingSection'

const UPCOMING = [
  {
    name: 'API Schema Drift Scanner',
    hook: 'Your API breaks silently. Users hit errors before you do. Catch drift before it ships.',
    color: 'rgba(99,102,241,0.06)',
    border: 'rgba(99,102,241,0.18)',
    price: '$249',
  },
  {
    name: 'Database Migration Middleware',
    hook: 'One botched migration means downtime and corrupted data. Deploy with confidence.',
    color: 'rgba(16,185,129,0.05)',
    border: 'rgba(16,185,129,0.16)',
    price: '$199',
  },
  {
    name: 'Vibe Coding Security Shield',
    hook: 'AI writes code fast. It also writes SQL injection holes. Catch them before they ship.',
    color: 'rgba(245,158,11,0.05)',
    border: 'rgba(245,158,11,0.16)',
    price: '$149',
  },
  {
    name: 'High-Speed Directory Extractor',
    hook: 'Extract thousands of clean, structured listings in minutes, not days.',
    color: 'rgba(236,72,153,0.05)',
    border: 'rgba(236,72,153,0.16)',
    price: '$99',
  },
]

const FAQ = [
  {
    q: 'Who are these tools for?',
    a: 'Developers, agencies, and business owners who need a specific problem solved without paying for a bloated platform. Each tool does one thing well and costs a fixed amount.',
  },
  {
    q: 'Do I need a subscription?',
    a: 'No. Every Queldrex tool is a one-time purchase. Pay once, receive the output immediately. No recurring charges, ever.',
  },
  {
    q: 'What exactly do I get for $149?',
    a: 'A complete AI optimization package: a generated llms.txt file, LocalBusiness JSON-LD schema, full HTML report, prioritized fix checklist, and deployment instructions — delivered to your email in minutes.',
  },
  {
    q: 'What if there is a delivery issue?',
    a: 'Contact us at hello@queldrex.com within 7 days of purchase. We will resolve the issue or issue a full refund — no questions asked.',
  },
  {
    q: 'When will the other tools launch?',
    a: 'We build when ready and tested. Email hello@queldrex.com to get notified when a specific tool launches.',
  },
]

function ScoreMock() {
  const signals = [
    { label: 'llms.txt', pass: false },
    { label: 'JSON-LD Schema', pass: false },
    { label: 'LocalBusiness', pass: false },
    { label: 'Open Graph', pass: true },
    { label: 'Sitemap', pass: true },
    { label: 'Robots.txt', pass: true },
  ]
  return (
    <div
      className="rounded-2xl border p-7 relative overflow-hidden"
      style={{ background: '#0d1117', borderColor: 'rgba(239,68,68,0.2)', boxShadow: '0 0 60px rgba(239,68,68,0.06)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(239,68,68,0.07) 0%, transparent 70%)' }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] text-white/30 font-mono mb-0.5">yourwebsite.com</p>
            <p className="text-sm font-bold text-white">AI Visibility Scan</p>
          </div>
          <span
            className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border"
            style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)' }}
          >
            CRITICAL
          </span>
        </div>

        <div className="flex items-end gap-2 mb-1">
          <span className="text-7xl font-black leading-none" style={{ color: '#ef4444' }}>35</span>
          <span className="text-2xl text-white/25 pb-2">/100</span>
        </div>
        <p className="text-xs text-white/35 mb-6">AI assistants cannot find or describe your business</p>

        <div className="space-y-2.5 mb-6">
          {signals.map((s) => (
            <div key={s.label} className="flex items-center justify-between">
              <span className="text-xs text-white/55">{s.label}</span>
              {s.pass ? (
                <span className="text-[11px] font-bold text-green-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Found
                </span>
              ) : (
                <span className="text-[11px] font-bold text-red-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Missing
                </span>
              )}
            </div>
          ))}
        </div>

        <div
          className="rounded-xl px-4 py-3 text-center border border-white/6"
          style={{ background: 'rgba(6,182,212,0.06)' }}
        >
          <p className="text-xs text-white/40">Fix package generated and ready</p>
          <p className="text-xs font-bold text-cyan-400 mt-0.5">Unlock for $149 one-time →</p>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 60% 80% at 0% 50%, rgba(6,182,212,0.06) 0%, transparent 60%)' }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 40% 60% at 100% 20%, rgba(239,68,68,0.04) 0%, transparent 60%)' }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative z-10">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase mb-8"
              style={{ borderColor: 'rgba(6,182,212,0.25)', background: 'rgba(6,182,212,0.08)', color: '#06d6ff' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              AI Visibility Scanner · Free Scan
            </div>

            <h1 className="text-5xl lg:text-[3.5rem] font-black leading-[1.05] tracking-tight text-white mb-6">
              ChatGPT Won&apos;t<br />
              Recommend What<br />
              <span style={{ color: '#06d6ff' }}>It Can&apos;t Find.</span>
            </h1>

            <p className="text-lg text-white/65 leading-relaxed mb-4 max-w-lg">
              AI assistants are recommending businesses to millions of people every day. The ones getting recommended have 6 specific signals. Most sites are missing all of them.
            </p>
            <p className="text-base text-white/50 leading-relaxed mb-10 max-w-lg">
              We scan your site, show you exactly what&apos;s missing, and generate the ready-to-deploy fix files. Free scan. $149 one-time for the full package.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/scanner"
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.03]"
                style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 32px rgba(6,182,212,0.35)' }}
              >
                Scan My Site Free
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a
                href="#pricing"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white/60 border border-white/15 hover:border-white/25 hover:text-white transition-all"
              >
                See what&apos;s included
              </a>
            </div>

            <p className="text-xs text-white/30 mt-5">
              No account required · Results in under 30 seconds · One-time $149 for the full package
            </p>
          </div>

          <div className="hidden lg:block">
            <ScoreMock />
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
            {[
              { stat: '6', label: 'AI signals checked', sub: 'llms.txt, JSON-LD, schema, OG tags, sitemap, robots.txt' },
              { stat: '<30s', label: 'Results delivered', sub: 'Full scan and score in under 30 seconds, no account needed' },
              { stat: '$149', label: 'One-time · no subscriptions', sub: 'Buy once, own the output files forever' },
            ].map(({ stat, label, sub }) => (
              <div key={label} className="px-10 py-12">
                <p className="text-3xl font-black text-white mb-1">{stat}</p>
                <p className="text-sm font-bold text-white/70 mb-1">{label}</p>
                <p className="text-xs text-white/35 leading-relaxed">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-cyan-500 text-xs font-bold tracking-[0.32em] uppercase mb-4">How It Works</p>
          <h2 className="text-4xl font-black text-white mb-4">From URL to fix package in minutes.</h2>
          <p className="text-white/55 text-base max-w-lg mx-auto">Three steps. No account, no setup, no waiting.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              n: '01',
              title: 'Paste your URL',
              body: 'Enter any public website URL and your email address. We fetch and analyze it in real time — no login, no account.',
            },
            {
              n: '02',
              title: 'Get your AI Visibility Score',
              body: 'Your score (0–100) is generated instantly. You see exactly which of the 6 signals are missing and why each one matters for AI discoverability.',
            },
            {
              n: '03',
              title: 'Download your fix package',
              body: 'Unlock the $149 bundle: generated llms.txt, LocalBusiness JSON-LD schema, full HTML report, and prioritized fix checklist — delivered to your email in minutes.',
            },
          ].map(({ n, title, body }) => (
            <div
              key={n}
              className="rounded-2xl border p-8 flex flex-col"
              style={{ background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.12)' }}
            >
              <span className="text-5xl font-black leading-none mb-5" style={{ color: 'rgba(6,182,212,0.2)' }}>{n}</span>
              <h3 className="text-base font-black text-white mb-3">{title}</h3>
              <p className="text-white/55 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/scanner"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.03]"
            style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 28px rgba(6,182,212,0.3)' }}
          >
            Run Your Free Scan
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ABOUT + FAQ */}
      <section className="border-t border-white/5 py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-cyan-500 text-xs font-bold tracking-[0.32em] uppercase mb-5">About Queldrex</p>
            <h2 className="text-3xl font-black text-white leading-tight mb-6">
              Built by developers.<br />No fluff. No subscriptions.
            </h2>
            <p className="text-white/60 text-base leading-relaxed mb-5">
              Queldrex is a Colorado-based software tools company. We build focused, production-ready tools for developers and businesses — each one solving a single specific problem, precisely and without unnecessary complexity.
            </p>
            <p className="text-white/50 text-base leading-relaxed mb-8">
              Our business model is simple: you buy a tool, you get the output. No account creation, no subscriptions, no vendor lock-in. The files we generate are yours to deploy immediately.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'One-Time Purchase', sub: 'No recurring fees, ever' },
                { label: 'Instant Delivery', sub: 'Files sent within minutes' },
                { label: 'Production-Ready', sub: 'Deploy immediately' },
                { label: 'Colorado-Based', sub: 'Queldrex LLC' },
              ].map(({ label, sub }) => (
                <div
                  key={label}
                  className="rounded-xl border p-4"
                  style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}
                >
                  <p className="text-sm font-bold text-white mb-0.5">{label}</p>
                  <p className="text-xs text-white/40">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/35 mb-5">Frequently Asked Questions</p>
            <div className="space-y-3">
              {FAQ.map(({ q, a }) => (
                <div
                  key={q}
                  className="rounded-xl border p-5"
                  style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  <h4 className="text-sm font-bold text-white mb-2">{q}</h4>
                  <p className="text-white/55 text-sm leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COMING SOON TOOLS */}
      <section className="border-t border-white/5 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-cyan-500 text-xs font-bold tracking-[0.28em] uppercase mb-2">Coming from Queldrex</p>
              <h3 className="text-2xl font-black text-white">Four more tools in development.</h3>
            </div>
            <a
              href="mailto:hello@queldrex.com?subject=Queldrex%20tools%20updates"
              className="hidden md:flex items-center gap-1.5 text-sm text-white/40 hover:text-cyan-400 transition-colors"
            >
              Get notified when each one launches
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {UPCOMING.map((tool) => (
              <a
                key={tool.name}
                href={`mailto:hello@queldrex.com?subject=Notify%20me%3A%20${encodeURIComponent(tool.name)}`}
                className="rounded-xl p-5 border flex flex-col gap-3 hover:border-white/20 transition-colors group"
                style={{ background: tool.color, borderColor: tool.border }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                      style={{ color: 'rgba(255,255,255,0.35)', borderColor: 'rgba(255,255,255,0.12)' }}
                    >
                      In Development
                    </span>
                    <span className="text-xs font-bold text-white/30">{tool.price}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">{tool.name}</h4>
                </div>
                <p className="text-xs text-white/50 leading-relaxed flex-1">{tool.hook}</p>
                <span className="text-xs font-semibold text-white/30 group-hover:text-cyan-400 transition-colors">
                  Notify me when it launches →
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <PricingSection />

      {/* FINAL CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div
          className="rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8"
          style={{
            background: 'linear-gradient(135deg,rgba(6,182,212,0.07) 0%,rgba(6,182,212,0.02) 100%)',
            border: '1px solid rgba(6,182,212,0.14)',
          }}
        >
          <div>
            <h3 className="text-2xl font-black text-white mb-2">See where your site stands with AI search.</h3>
            <p className="text-white/55 text-sm">
              Free scan · No account · Results in 30 seconds · Fix package $149 one-time.
            </p>
          </div>
          <Link
            href="/scanner"
            className="flex-shrink-0 flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.03]"
            style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 28px rgba(6,182,212,0.3)' }}
          >
            Scan My Site Free
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
