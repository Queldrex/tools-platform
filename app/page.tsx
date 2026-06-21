import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

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
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(239,68,68,0.07) 0%, transparent 70%)' }} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] text-white/30 font-mono mb-0.5">yourwebsite.com</p>
            <p className="text-sm font-bold text-white">AI Visibility Scan</p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)' }}>CRITICAL</span>
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
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  Found
                </span>
              ) : (
                <span className="text-[11px] font-bold text-red-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                  Missing
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="rounded-xl px-4 py-3 text-center border border-white/6" style={{ background: 'rgba(6,182,212,0.06)' }}>
          <p className="text-xs text-white/40">Fix package generated and ready</p>
          <p className="text-xs font-bold text-cyan-400 mt-0.5">Unlock for $149 one-time →</p>
        </div>
      </div>
    </div>
  )
}

const CATEGORIES = [
  {
    label: 'AI Visibility',
    color: '#06d6ff',
    bg: 'rgba(6,182,212,0.06)',
    border: 'rgba(6,182,212,0.25)',
    description: 'Get found by ChatGPT, Perplexity, Claude, and Gemini. Track your score monthly. Run your agency clients.',
    href: '/tools#ai-visibility',
    tools: [
      { name: 'AI Visibility Scanner', price: '$149' },
      { name: 'AI Monitor', price: '$29/mo' },
      { name: 'AI Citation Tracker', price: 'Pro' },
      { name: 'Agency Plan', price: '$99/mo' },
    ],
  },
  {
    label: 'Security',
    color: 'rgb(245,158,11)',
    bg: 'rgba(245,158,11,0.05)',
    border: 'rgba(245,158,11,0.2)',
    description: 'Audit AI-generated code for vulnerabilities, check breach exposure, and monitor live global threat indicators.',
    href: '/tools#security',
    tools: [
      { name: 'Vibe Security Shield', price: 'Pro' },
      { name: 'Breach Lookup', price: 'Free' },
      { name: 'Threat Intelligence Feed', price: 'Free' },
    ],
  },
  {
    label: 'Developer Tools',
    color: 'rgb(99,102,241)',
    bg: 'rgba(99,102,241,0.05)',
    border: 'rgba(99,102,241,0.2)',
    description: 'Catch breaking API changes, validate SQL migrations, and map site structures before they cause problems.',
    href: '/tools#developer',
    tools: [
      { name: 'API Schema Drift Scanner', price: 'Pro' },
      { name: 'DB Migration Checker', price: 'Pro' },
      { name: 'Directory Extractor', price: 'Free' },
    ],
  },
]

const FAQ = [
  {
    q: 'What is Queldrex?',
    a: 'Queldrex is a platform of precision tools and products for AI visibility, security auditing, and developer workflows. Every product solves a specific problem — free scans to start, Pro plan unlocks everything at $29/month.',
  },
  {
    q: 'What does the Pro plan include?',
    a: 'Pro is $29/month and gives you unlimited access to all "Pro" tools: Vibe Security Shield, API Schema Drift Scanner, Database Migration Checker, and AI Citation Tracker. It also includes the AI Monitor (monthly rescans + score alerts). Cancel anytime from your Stripe portal.',
  },
  {
    q: 'What is the difference between the Scanner and the Monitor?',
    a: 'The Scanner is a one-time $149 purchase — you get your full 14-signal report, generated llms.txt, JSON-LD schema, HTML report, and deployment instructions emailed in minutes. The Monitor ($29/month, included in Pro) reruns those same signals every month and alerts you when your score drops.',
  },
  {
    q: 'What tools are completely free?',
    a: 'Breach Lookup, Threat Intelligence Feed, Directory Extractor, and the initial AI Visibility Scan (score + signal preview) are all free with no account required.',
  },
  {
    q: 'What is the Agency Plan?',
    a: '25 client AI visibility scans per month, white-label PDF reports with your branding, and a bulk client dashboard — $99/month. Built for web agencies that want to offer AI visibility audits as a service.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 80% at 15% 50%, rgba(6,182,212,0.05) 0%, transparent 60%)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 50% 60% at 85% 20%, rgba(99,102,241,0.04) 0%, transparent 60%)' }} />
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-16">
          <div className="max-w-3xl">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase mb-8"
              style={{ borderColor: 'rgba(6,182,212,0.25)', background: 'rgba(6,182,212,0.08)', color: '#06d6ff' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Queldrex · Precision Tools · Colorado
            </div>

            <h1 className="text-5xl lg:text-[3.5rem] font-black leading-[1.05] tracking-tight text-white mb-6">
              The tools your business<br />
              needs in the age of AI.
            </h1>

            <p className="text-lg text-white/65 leading-relaxed mb-8 max-w-2xl">
              Ten products covering AI visibility, security auditing, and developer safety — all in one place.
              Free to start. Pro unlocks everything for{' '}
              <span className="text-white font-bold">$29/month</span>.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-12">
              <Link
                href="/tools"
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.03]"
                style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 32px rgba(6,182,212,0.35)' }}
              >
                Browse All Products
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/scanner"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold border transition-all hover:border-white/25 hover:text-white"
                style={{ color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.15)' }}
              >
                Free AI Scan →
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-8">
              {[
                { value: '10', label: 'Tools live now' },
                { value: 'Free', label: 'to start, no card' },
                { value: '$29', label: '/mo Pro plan' },
                { value: '$99', label: '/mo Agency plan' },
              ].map(({ value, label }) => (
                <div key={label} className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-white">{value}</span>
                  <span className="text-xs text-white/35">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* THREE CATEGORIES */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <p className="text-cyan-500 text-xs font-bold tracking-[0.32em] uppercase mb-3">Our Tool Suite</p>
          <h2 className="text-3xl font-black text-white mb-3">Ten products across three categories, all live and ready to use.</h2>
          <p className="text-white/45 text-sm max-w-xl mx-auto">
            Every Queldrex tool solves one specific problem. Pick what you need — no platform lock-in.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="rounded-2xl border p-7 flex flex-col gap-5 hover:border-white/20 transition-colors group"
              style={{ background: cat.bg, borderColor: cat.border }}
            >
              <div>
                <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: cat.color }}>{cat.label}</p>
                <p className="text-sm text-white/55 leading-relaxed">{cat.description}</p>
              </div>
              <div className="space-y-2 flex-1">
                {cat.tools.map((tool) => (
                  <div key={tool.name} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-sm text-white/70 font-medium">{tool.name}</span>
                    <span className="text-xs font-bold text-white/40 ml-3 flex-shrink-0">{tool.price}</span>
                  </div>
                ))}
              </div>
              <span className="text-xs font-bold flex items-center gap-1.5 group-hover:gap-2.5 transition-all" style={{ color: cat.color }}>
                Explore tools
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              </span>
            </Link>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link href="/tools" className="text-sm text-white/30 hover:text-white/60 transition-colors">
            View all products with full descriptions →
          </Link>
        </div>
      </section>

      {/* PRICING */}
      <section className="border-t border-white/5 py-20" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-cyan-500 text-xs font-bold tracking-[0.32em] uppercase mb-3">Pricing</p>
            <h2 className="text-3xl font-black text-white mb-3">Simple, honest pricing.</h2>
            <p className="text-white/45 text-sm">Start free. Subscribe when you need ongoing monitoring or unlimited Pro access.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mb-6">
            {/* Free */}
            <div className="rounded-2xl border p-6 flex flex-col gap-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-white/30 mb-1">Free</div>
                <div className="text-3xl font-black text-white">$0</div>
                <div className="text-xs text-white/25 mt-1">No credit card needed</div>
              </div>
              <ul className="space-y-2 flex-1">
                {['AI Visibility Scan (score + preview)', 'Breach Lookup — unlimited', 'Threat Intelligence Feed', 'Directory Extractor'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-white/45">
                    <svg className="w-3.5 h-3.5 flex-shrink-0 text-white/20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/scanner" className="block text-center py-2.5 rounded-xl text-sm font-bold" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}>
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
                <div className="text-xs text-white/25 mt-1">Cancel anytime</div>
              </div>
              <ul className="space-y-2 flex-1">
                {[
                  'Everything in Free',
                  'AI Monitor — monthly rescans + alerts',
                  'Vibe Security Shield — unlimited',
                  'API Schema Drift Scanner — unlimited',
                  'DB Migration Checker — unlimited',
                  'AI Citation Tracker — unlimited',
                  'All future tools included',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-white/65">
                    <svg className="w-3.5 h-3.5 flex-shrink-0 text-cyan-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/monitor" className="block text-center py-2.5 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 20px rgba(6,182,212,0.25)' }}>
                Start Pro — $29/mo
              </Link>
            </div>

            {/* Agency */}
            <div className="rounded-2xl border p-6 flex flex-col gap-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.1)' }}>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-white/30 mb-1">Agency</div>
                <div className="flex items-end gap-1"><span className="text-3xl font-black text-white">$99</span><span className="text-white/35 text-xs mb-1.5">/month</span></div>
                <div className="text-xs text-white/25 mt-1">Cancel anytime</div>
              </div>
              <ul className="space-y-2 flex-1">
                {[
                  'Everything in Pro',
                  '25 client scans/month',
                  'White-label PDF reports',
                  'Bulk client dashboard',
                  'Monthly auto-reports to clients',
                  'Priority support',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-white/65">
                    <svg className="w-3.5 h-3.5 flex-shrink-0 text-white/35" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/agency" className="block text-center py-2.5 rounded-xl text-sm font-bold" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.14)' }}>
                Start Agency Plan
              </Link>
            </div>
          </div>

          {/* One-time scanner note */}
          <div className="rounded-xl border p-5 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.15)' }}>
            <div>
              <p className="text-sm font-bold text-white mb-1">AI Visibility Scanner — $149 one-time</p>
              <p className="text-xs text-white/45">Not a subscription. Full 14-signal scan, generated llms.txt, LocalBusiness JSON-LD, HTML report, and deployment guide — emailed in minutes.</p>
            </div>
            <Link href="/scanner" className="flex-shrink-0 text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors whitespace-nowrap">
              Scan free first →
            </Link>
          </div>

          <p className="text-center mt-5">
            <Link href="/pricing" className="text-sm text-white/30 hover:text-white/60 transition-colors">Full pricing details and FAQ →</Link>
          </p>
        </div>
      </section>

      {/* SCANNER SPOTLIGHT */}
      <section className="border-t border-white/5 py-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[10px] font-black uppercase tracking-wider text-black px-2.5 py-1 rounded-full" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
                Flagship Tool
              </span>
              <span className="text-xs text-white/35 font-semibold">AI Visibility Scanner · 14 signals</span>
            </div>
            <h2 className="text-3xl font-black text-white leading-tight mb-4">
              AI search is recommending<br />your competitors. Find out why.
            </h2>
            <p className="text-white/60 text-base leading-relaxed mb-4">
              ChatGPT, Perplexity, Claude, and Gemini answer millions of business questions every day. The businesses they recommend pass 14 specific technical signals. Most sites are missing the majority of them.
            </p>
            <p className="text-white/45 text-sm leading-relaxed mb-8">
              We scan your site in under 30 seconds and show you your exact score. The full fix package — generated llms.txt, LocalBusiness JSON-LD schema, HTML report, and deployment instructions — is $149 one-time, delivered to your inbox in minutes.
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

      {/* WHO IT'S FOR */}
      <section className="border-t border-white/5 py-20" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-cyan-500 text-xs font-bold tracking-[0.32em] uppercase mb-3">Built For</p>
            <h2 className="text-3xl font-black text-white mb-3">Businesses. Agencies. Developers.</h2>
            <p className="text-white/45 text-sm max-w-xl mx-auto">Every Queldrex tool is built to work in a real professional context.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border p-6" style={{ background: 'rgba(6,182,212,0.05)', borderColor: 'rgba(6,182,212,0.15)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3">Business Owners</p>
              <p className="text-white font-black text-base mb-2">Know if AI can find you.</p>
              <p className="text-white/50 text-sm leading-relaxed mb-5">
                Free AI visibility scan in 30 seconds. See exactly where your business stands with ChatGPT, Perplexity, and Claude. Get the complete fix package for $149 one-time.
              </p>
              <Link href="/scanner" className="text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors">Scan your site →</Link>
            </div>
            <div className="rounded-2xl border p-6" style={{ background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.15)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgb(99,102,241)' }}>Agencies</p>
              <p className="text-white font-black text-base mb-2">Sell AI visibility as a service.</p>
              <p className="text-white/50 text-sm leading-relaxed mb-5">
                25 client scans/month, white-label PDF reports, bulk dashboard. The Agency Plan at $99/month gives you everything you need to offer AI visibility audits professionally.
              </p>
              <Link href="/agency" className="text-sm font-bold hover:opacity-80 transition-opacity" style={{ color: 'rgb(99,102,241)' }}>See Agency plan →</Link>
            </div>
            <div className="rounded-2xl border p-6" style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.15)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3">Developers</p>
              <p className="text-white font-black text-base mb-2">Ship safer code, faster.</p>
              <p className="text-white/50 text-sm leading-relaxed mb-5">
                Vibe Security Shield catches OWASP Top 10 issues in AI-generated code. API Schema Drift Scanner catches breaking changes. DB Migration Checker catches dangerous SQL — all before you ship.
              </p>
              <Link href="/tools#developer" className="text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors">See dev tools →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/5 py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-cyan-500 text-xs font-bold tracking-[0.32em] uppercase mb-5">About Queldrex</p>
            <h2 className="text-3xl font-black text-white leading-tight mb-6">
              Built by developers.<br />No fluff. No lock-in.
            </h2>
            <p className="text-white/60 text-base leading-relaxed mb-5">
              Queldrex is a Colorado-based software tools company. We build focused, production-ready tools for businesses and developers — each one solving a single specific problem, precisely and without unnecessary complexity.
            </p>
            <p className="text-white/50 text-base leading-relaxed mb-8">
              Free tools are always free. Subscriptions are month-to-month — cancel anytime from your Stripe portal, no forms, no phone calls.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '10 Tools Live', sub: 'All working, all real' },
                { label: 'Free to Start', sub: 'No credit card required' },
                { label: 'Cancel Anytime', sub: 'Stripe portal, instant' },
                { label: 'Colorado-Based', sub: 'Queldrex LLC' },
              ].map(({ label, sub }) => (
                <div key={label} className="rounded-xl border p-4" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}>
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
                <div key={q} className="rounded-xl border p-5" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <h4 className="text-sm font-bold text-white mb-2">{q}</h4>
                  <p className="text-white/55 text-sm leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COMING NEXT */}
      <section className="border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-cyan-500 text-xs font-bold tracking-[0.28em] uppercase mb-2">What&apos;s Next</p>
              <h3 className="text-2xl font-black text-white">More tools in development.</h3>
            </div>
            <Link href="/roadmap" className="hidden md:flex items-center gap-1.5 text-sm text-white/40 hover:text-cyan-400 transition-colors">
              See full roadmap
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { name: 'Competitor AI Visibility Gap', desc: 'See exactly how your AI visibility compares to competitors across every signal.', label: 'In Dev', color: 'rgba(6,182,212,0.05)', border: 'rgba(6,182,212,0.15)' },
              { name: 'Local Business AI Pack', desc: 'One-click generate schema, llms.txt, and citation strategy for any local business category.', label: 'Planned', color: 'rgba(245,158,11,0.05)', border: 'rgba(245,158,11,0.15)' },
              { name: 'AI Search Monitor — Perplexity', desc: 'Dedicated monitoring for Perplexity and Google AI Overviews tracked separately from ChatGPT.', label: 'Planned', color: 'rgba(99,102,241,0.05)', border: 'rgba(99,102,241,0.15)' },
            ].map((tool) => (
              <div key={tool.name} className="rounded-xl p-5 border" style={{ background: tool.color, borderColor: tool.border }}>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border inline-block mb-3" style={{ color: 'rgba(255,255,255,0.35)', borderColor: 'rgba(255,255,255,0.12)' }}>{tool.label}</span>
                <h4 className="text-sm font-bold text-white mb-2">{tool.name}</h4>
                <p className="text-xs text-white/45 leading-relaxed">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-28 pt-8">
        <div
          className="rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8"
          style={{
            background: 'linear-gradient(135deg,rgba(6,182,212,0.07) 0%,rgba(6,182,212,0.02) 100%)',
            border: '1px solid rgba(6,182,212,0.14)',
          }}
        >
          <div>
            <h3 className="text-2xl font-black text-white mb-2">10 tools live. Free to start.</h3>
            <p className="text-white/55 text-sm">
              No account required for free tools. Pro subscription is $29/month — cancel anytime.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              href="/tools"
              className="flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.03]"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 28px rgba(6,182,212,0.3)' }}
            >
              Explore All Tools
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/scanner"
              className="flex items-center gap-2 px-7 py-4 rounded-xl text-sm font-semibold text-white/60 border border-white/15 hover:border-white/25 hover:text-white transition-all"
            >
              Free AI Scan →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
