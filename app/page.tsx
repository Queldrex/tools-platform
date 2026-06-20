import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const TOOLS = [
  {
    name: 'AI Visibility Scanner',
    tagline: 'Get found by ChatGPT, Perplexity, Claude, Gemini — 14 signals, free scan, $149 full report.',
    price: '$149',
    href: '/scanner',
    live: true,
    color: 'rgba(6,182,212,0.08)',
    border: 'rgba(6,182,212,0.25)',
  },
  {
    name: 'Vibe Coding Security Shield',
    tagline: 'Audit AI-generated code against OWASP Top 10 before it reaches production.',
    price: 'Pro',
    href: '/tools/vibe-security',
    live: true,
    color: 'rgba(245,158,11,0.05)',
    border: 'rgba(245,158,11,0.14)',
  },
  {
    name: 'API Schema Drift Scanner',
    tagline: 'Catch breaking API changes before users do. Compare specs and ship with confidence.',
    price: 'Pro',
    href: '/tools/api-schema-drift',
    live: true,
    color: 'rgba(99,102,241,0.06)',
    border: 'rgba(99,102,241,0.15)',
  },
  {
    name: 'Database Migration Safety Checker',
    tagline: 'Spot dangerous SQL patterns before they cause downtime or data loss.',
    price: 'Pro',
    href: '/tools/database-migration',
    live: true,
    color: 'rgba(16,185,129,0.05)',
    border: 'rgba(16,185,129,0.14)',
  },
  {
    name: 'Directory Extractor',
    tagline: 'Map any site structure from its sitemap and export as JSON or CSV. Free.',
    price: 'Free',
    href: '/tools/directory-extractor',
    live: true,
    color: 'rgba(236,72,153,0.05)',
    border: 'rgba(236,72,153,0.14)',
  },
]

const UPCOMING = [
  {
    name: 'AI Citation Tracker',
    hook: 'Does ChatGPT mention your business by name? Find out which AI engines cite you and which ignore you.',
    color: 'rgba(6,182,212,0.05)',
    border: 'rgba(6,182,212,0.18)',
    label: 'Building Now',
    href: '/roadmap',
  },
  {
    name: 'Agency Bulk Scanner',
    hook: 'Scan all 25 agency clients in one run. Scheduled monthly with auto-delivered client reports.',
    color: 'rgba(99,102,241,0.06)',
    border: 'rgba(99,102,241,0.18)',
    label: 'Coming Soon',
    href: '/agency',
  },
  {
    name: 'Competitor AI Visibility Gap',
    hook: 'See exactly how your business compares to competitors across every AI search signal.',
    color: 'rgba(16,185,129,0.05)',
    border: 'rgba(16,185,129,0.16)',
    label: 'Coming Soon',
    href: '/roadmap',
  },
  {
    name: 'Local Business AI Pack',
    hook: 'One-click generate schema, llms.txt, and citation strategy for any local business category.',
    color: 'rgba(245,158,11,0.05)',
    border: 'rgba(245,158,11,0.16)',
    label: 'Planned',
    href: '/roadmap',
  },
]

const FAQ = [
  {
    q: 'Who are these tools for?',
    a: 'Developers, agencies, and business owners who need a specific problem solved without paying for a bloated platform. Each tool does one thing well and costs a fixed amount.',
  },
  {
    q: 'Do I need a subscription?',
    a: 'The AI Visibility Scanner is a one-time $149 purchase — no recurring charges. The AI Monitor ($29/month) and Agency Plan ($99/month) are optional subscriptions for ongoing monitoring. Cancel either anytime, no questions asked.',
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
    q: 'What tools are live right now?',
    a: 'Seven tools are live: AI Visibility Scanner, Vibe Coding Security Shield, API Schema Drift Scanner, Database Migration Safety Checker, Directory Extractor, Threat Intelligence Feed, and Breach Lookup. The AI Citation Tracker is building now.',
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
              Queldrex · Precision Dev Tools · Colorado
            </div>

            <h1 className="text-5xl lg:text-[3.5rem] font-black leading-[1.05] tracking-tight text-white mb-6">
              AI is recommending<br />
              your competitors.<br />
              <span style={{ color: '#06d6ff' }}>Find out why. Fix it.</span>
            </h1>

            <p className="text-lg text-white/65 leading-relaxed mb-4 max-w-lg">
              Queldrex builds precision tools for businesses and agencies navigating the age of AI search. Seven tools live now — scan for free, pay only for what you need.
            </p>
            <p className="text-base text-white/50 leading-relaxed mb-10 max-w-lg">
              ChatGPT, Perplexity, Claude, and Gemini are recommending businesses every day. Most are invisible to every one of them. We scan your site across 14 signals and tell you exactly what to fix.
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
              <Link
                href="/monitor"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold border transition-all hover:border-white/25 hover:text-white"
                style={{ color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.15)' }}
              >
                Monitor Monthly — $29/mo
              </Link>
            </div>

            <p className="text-xs text-white/30 mt-5">
              No credit card for the free scan · Cancel monitoring anytime
            </p>
          </div>

          <div className="hidden lg:flex flex-col gap-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/25 mb-1">Our Tool Suite · 7 live tools</p>

            <Link href="/scanner" className="rounded-xl border p-4 flex items-center gap-3 hover:border-cyan-500/50 transition-colors group" style={{ background: 'rgba(6,182,212,0.08)', borderColor: 'rgba(6,182,212,0.28)' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-black px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Live</span>
                  <span className="text-sm font-bold text-white">AI Visibility Scanner</span>
                </div>
                <p className="text-xs text-white/45 leading-snug">Get found by ChatGPT, Perplexity, Claude &amp; Gemini</p>
              </div>
              <span className="text-sm font-black text-white/65 flex-shrink-0">$149</span>
            </Link>

            {TOOLS.slice(1).map((tool) => (
              <Link key={tool.name} href={tool.href} className="rounded-xl border p-3.5 flex items-center gap-3 opacity-50 hover:opacity-70 transition-opacity" style={{ background: tool.color, borderColor: tool.border }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-white/35 border border-white/12 px-1.5 py-0.5 rounded-full flex-shrink-0">Soon</span>
                    <span className="text-xs font-semibold text-white/65 truncate">{tool.name}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-white/30 flex-shrink-0">{tool.price}</span>
              </Link>
            ))}

            <p className="text-[10px] text-white/20 text-center mt-1">One-time purchase each · No subscriptions</p>
          </div>
        </div>
      </section>

      {/* OUR TOOL SUITE */}
      <section id="tools" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-cyan-500 text-xs font-bold tracking-[0.32em] uppercase mb-4">Our Tool Suite</p>
          <h2 className="text-4xl font-black text-white mb-4">Seven tools. All live. All real.</h2>
          <p className="text-white/55 text-base max-w-lg mx-auto">
            Every tool solves one specific problem. Free scans to start — pay only when you need the full report or monitoring.
          </p>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          <Link
            href="/scanner"
            className="md:col-span-2 xl:col-span-1 rounded-2xl border p-7 flex flex-col gap-4 hover:border-cyan-500/40 transition-colors group relative overflow-hidden"
            style={{ background: 'rgba(6,182,212,0.08)', borderColor: 'rgba(6,182,212,0.25)' }}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-black px-2.5 py-1 rounded-full" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
                Live Now
              </span>
              <span className="text-sm font-black text-white/70">$149</span>
            </div>
            <div>
              <h3 className="text-base font-black text-white mb-2">AI Visibility Scanner</h3>
              <p className="text-sm text-white/55 leading-relaxed">
                ChatGPT, Perplexity, Claude, Gemini — every AI assistant is answering questions about your industry. We scan your site for 13 signals that get you recommended. Free scan, $149 for the full fix package.
              </p>
            </div>
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
              Try it free
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </span>
          </Link>

          {TOOLS.slice(1).map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              className="rounded-2xl border p-6 flex flex-col gap-3 hover:border-white/20 transition-colors group"
              style={{ background: tool.color, borderColor: tool.border }}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-black px-2 py-0.5 rounded-full" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
                  Live
                </span>
                <span className="text-sm font-bold text-white/70">{tool.price}</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1.5">{tool.name}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{tool.tagline}</p>
              </div>
              <span className="text-xs text-white/30 group-hover:text-white/50 transition-colors">
                Learn more →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED TOOL SPOTLIGHT */}
      <section className="border-t border-white/5 py-20" style={{ background: 'rgba(6,182,212,0.02)' }}>
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[10px] font-black uppercase tracking-wider text-black px-2.5 py-1 rounded-full" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
                Live Now
              </span>
              <span className="text-xs text-white/35 font-semibold">AI Visibility Scanner · 14 Signals</span>
            </div>
            <h2 className="text-3xl font-black text-white leading-tight mb-4">
              AI search is recommending<br />your competitors. Find out why.
            </h2>
            <p className="text-white/60 text-base leading-relaxed mb-4">
              ChatGPT, Perplexity, Claude, and Gemini answer millions of business questions every day. The sites they recommend pass 14 specific technical signals. Most businesses are missing the majority of them.
            </p>
            <p className="text-white/45 text-sm leading-relaxed mb-8">
              We scan your site in under 30 seconds across 14 signals and show you exactly what&apos;s missing. The full fix package — generated llms.txt, LocalBusiness JSON-LD schema, HTML report, and deployment instructions — is $149 one-time, delivered to your inbox in minutes.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/scanner"
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.03]"
                style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 28px rgba(6,182,212,0.3)' }}
              >
                Scan My Site Free
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <span className="text-xs text-white/30">No account · 30 seconds · $149 for the full fix package</span>
            </div>
          </div>
          <div>
            <ScoreMock />
          </div>
        </div>
      </section>

      {/* B2B SECTION */}
      <section className="border-t border-white/5 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-cyan-500 text-xs font-bold tracking-[0.32em] uppercase mb-4">Built for Professionals</p>
            <h2 className="text-3xl font-black text-white mb-3">Agencies. Consultants. Businesses.</h2>
            <p className="text-white/45 text-sm max-w-xl mx-auto">Queldrex tools are built to work in a real business context — white-label ready, fixed pricing, no subscriptions.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border p-6" style={{ background: 'rgba(6,182,212,0.05)', borderColor: 'rgba(6,182,212,0.15)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3">For Agencies</p>
              <p className="text-white font-black text-base mb-2">Sell AI visibility as a service.</p>
              <p className="text-white/50 text-sm leading-relaxed mb-5">
                Run AI Visibility Scans for all your clients from one dashboard. 25 scans/month, white-label PDF reports your clients never know came from Queldrex. Agency plan is live at $99/month.
              </p>
              <Link href="/agency" className="text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
                See the Agency Plan →
              </Link>
            </div>
            <div className="rounded-2xl border p-6" style={{ background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.15)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgb(99,102,241)' }}>For Consultants</p>
              <p className="text-white font-black text-base mb-2">Add a credibility signal instantly.</p>
              <p className="text-white/50 text-sm leading-relaxed mb-5">
                Lead any client engagement with a real AI visibility audit. Professional PDF report included. One-time cost, no retainer needed.
              </p>
              <Link href="/scanner" className="text-sm font-bold hover:opacity-80 transition-opacity" style={{ color: 'rgb(99,102,241)' }}>
                Try the scanner →
              </Link>
            </div>
            <div className="rounded-2xl border p-6" style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.15)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3">For Businesses</p>
              <p className="text-white font-black text-base mb-2">Know if AI can find you.</p>
              <p className="text-white/50 text-sm leading-relaxed mb-5">
                Free scan in 30 seconds. See exactly where your business stands with ChatGPT, Perplexity, and Claude. Fix it for $149 one-time.
              </p>
              <Link href="/scanner" className="text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                Scan your site →
              </Link>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-8 py-6 border-t border-white/5">
            <Link href="/about" className="text-xs text-white/35 hover:text-white/70 transition-colors">About Queldrex →</Link>
            <Link href="/sample-audit" className="text-xs text-white/35 hover:text-white/70 transition-colors">See a sample report →</Link>
            <Link href="/roadmap" className="text-xs text-white/35 hover:text-white/70 transition-colors">Product roadmap →</Link>
            <Link href="/services" className="text-xs text-white/35 hover:text-white/70 transition-colors">Custom builds →</Link>
          </div>
        </div>
      </section>

      {/* ABOUT + FAQ */}
      <section className="border-t border-white/5 py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-cyan-500 text-xs font-bold tracking-[0.32em] uppercase mb-5">About Queldrex</p>
            <h2 className="text-3xl font-black text-white leading-tight mb-6">
              Built by developers.<br />No fluff. No lock-in.
            </h2>
            <p className="text-white/60 text-base leading-relaxed mb-5">
              Queldrex is a Colorado-based software tools company. We build focused, production-ready tools for developers and businesses — each one solving a single specific problem, precisely and without unnecessary complexity.
            </p>
            <p className="text-white/50 text-base leading-relaxed mb-8">
              The AI Visibility Scanner is a one-time purchase — pay once, own the output forever. The Monitor and Agency plans are optional subscriptions for ongoing visibility tracking. Cancel anytime, no contracts.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Pay for What You Need', sub: 'Scanner is one-time · Monitor optional' },
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
              <p className="text-cyan-500 text-xs font-bold tracking-[0.28em] uppercase mb-2">What&apos;s Next from Queldrex</p>
              <h3 className="text-2xl font-black text-white">Four more products on the roadmap.</h3>
            </div>
            <Link
              href="/roadmap"
              className="hidden md:flex items-center gap-1.5 text-sm text-white/40 hover:text-cyan-400 transition-colors"
            >
              See full roadmap
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {UPCOMING.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="rounded-xl p-5 border flex flex-col gap-3 hover:border-white/20 transition-colors group"
                style={{ background: tool.color, borderColor: tool.border }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                      style={{ color: 'rgba(255,255,255,0.35)', borderColor: 'rgba(255,255,255,0.12)' }}
                    >
                      {tool.label}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">{tool.name}</h4>
                </div>
                <p className="text-xs text-white/50 leading-relaxed flex-1">{tool.hook}</p>
                <span className="text-xs font-semibold text-white/30 group-hover:text-cyan-400 transition-colors">
                  Learn more →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="border-t border-white/5 py-20" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-cyan-500 text-xs font-bold tracking-[0.32em] uppercase mb-3">Pricing</p>
            <h2 className="text-3xl font-black text-white mb-3">Simple, honest pricing.</h2>
            <p className="text-white/45 text-sm">Free to start. Upgrade when you want monitoring and unlimited tools.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Free */}
            <div className="rounded-2xl border p-6 flex flex-col gap-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-white/30 mb-1">Free</div>
                <div className="text-3xl font-black text-white">$0</div>
              </div>
              <ul className="space-y-2 flex-1">
                {['Free AI Visibility Scan', 'Threat Feed preview', 'Breach Lookup (1 domain)'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-white/45">
                    <svg className="w-3.5 h-3.5 flex-shrink-0 text-white/20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/scanner" className="block text-center py-2.5 rounded-xl text-sm font-bold transition-colors" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}>
                Start Free
              </Link>
            </div>
            {/* Pro */}
            <div className="rounded-2xl border p-6 flex flex-col gap-4 relative" style={{ background: 'linear-gradient(160deg,rgba(6,182,212,0.08),rgba(8,145,178,0.03))', borderColor: 'rgba(6,182,212,0.4)', boxShadow: '0 0 40px rgba(6,182,212,0.09)' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
                Most Popular
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1">Pro</div>
                <div className="flex items-end gap-1"><span className="text-3xl font-black text-white">$29</span><span className="text-white/35 text-xs mb-1.5">/month</span></div>
              </div>
              <ul className="space-y-2 flex-1">
                {['AI Monitor — monthly rescans + alerts', 'Full Threat Intelligence Feed', 'Unlimited domain security scans', 'All future tools included'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-white/65">
                    <svg className="w-3.5 h-3.5 flex-shrink-0 text-cyan-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/monitor" className="block text-center py-2.5 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 20px rgba(6,182,212,0.25)' }}>
                Start Monitoring
              </Link>
            </div>
            {/* Agency */}
            <div className="rounded-2xl border p-6 flex flex-col gap-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-white/30 mb-1">Agency</div>
                <div className="flex items-end gap-1"><span className="text-3xl font-black text-white">$99</span><span className="text-white/35 text-xs mb-1.5">/month</span></div>
              </div>
              <ul className="space-y-2 flex-1">
                {['25 client scans/month', 'White-label PDF reports', 'Bulk client dashboard', 'Monthly auto-reports to clients'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-white/65">
                    <svg className="w-3.5 h-3.5 flex-shrink-0 text-white/40" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/agency" className="block text-center py-2.5 rounded-xl text-sm font-bold transition-colors" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.15)' }}>
                Start Agency Plan
              </Link>
            </div>
          </div>
          <p className="text-center mt-6">
            <Link href="/pricing" className="text-sm text-white/30 hover:text-white/60 transition-colors">Full pricing details →</Link>
          </p>
        </div>
      </section>

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
            <h3 className="text-2xl font-black text-white mb-2">Seven tools live. Free to start.</h3>
            <p className="text-white/55 text-sm">
              AI Visibility Scanner · Free scan · No account required · $149 for the full fix package.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              href="/scanner"
              className="flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.03]"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 28px rgba(6,182,212,0.3)' }}
            >
              Scan My Site Free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/tools"
              className="flex items-center gap-2 px-7 py-4 rounded-xl text-sm font-semibold text-white/60 border border-white/15 hover:border-white/25 hover:text-white transition-all"
            >
              See all tools →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
