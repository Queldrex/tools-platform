import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Queldrex AI Visibility Scanner — Lifetime Deal | AppSumo',
  description: 'Scan any business to see how visible it is to ChatGPT, Perplexity, and AI search. One-time payment, lifetime access. Queldrex on AppSumo.',
  robots: { index: false, follow: false },
}

const SIGNALS = [
  { name: 'robots.txt', desc: 'AI crawlers allowed to index your site' },
  { name: 'llms.txt', desc: 'AI-specific instructions file at root' },
  { name: 'Structured Data', desc: 'Schema.org markup for AI understanding' },
  { name: 'Google Business Profile', desc: 'Verified local business listing' },
  { name: 'Citation Consistency', desc: 'NAP match across directories' },
  { name: 'Social Media Presence', desc: 'Active profiles AI can reference' },
  { name: 'Directory Listings', desc: '15 major directories checked' },
  { name: 'Review Signals', desc: 'Star ratings and review volume' },
  { name: 'Page Load Speed', desc: 'Under 3 seconds for AI crawlers' },
  { name: 'HTTPS / Security', desc: 'Secure connection verified' },
  { name: 'Mobile Responsiveness', desc: 'Works on all devices' },
  { name: 'Sitemap Health', desc: 'Valid sitemap.xml for crawlers' },
  { name: 'Content Authority', desc: 'Topical expertise signals' },
  { name: 'AI-Readable Content', desc: 'Content accessible to AI parsers' },
]

const DEAL_FEATURES = [
  'Unlimited AI Visibility scans',
  '14-signal audit every scan',
  'Full HTML report download',
  'Score history tracking',
  'All future signal updates included',
  'Priority email support',
  '60-day AppSumo money-back guarantee',
]

const FOR_WHO = [
  {
    title: 'Local Business Owners',
    desc: 'Find out if ChatGPT recommends your plumbing, HVAC, law firm, or restaurant when someone asks.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016 2.993 2.993 0 002.25-1.016 3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"/>
      </svg>
    ),
  },
  {
    title: 'Marketing Consultants',
    desc: 'Add AI visibility audits to your service offering overnight. No technical skills needed.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"/>
      </svg>
    ),
  },
  {
    title: 'SEO Agencies',
    desc: 'Show clients the gap between their Google ranking and their AI visibility. Upsell AI optimization services.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/>
      </svg>
    ),
  },
  {
    title: 'Entrepreneurs',
    desc: 'Validate your AI discoverability before your competitors do. Know exactly what to fix and in what order.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
      </svg>
    ),
  },
]

const FAQ = [
  {
    q: 'What is AI Visibility?',
    a: 'AI Visibility is a measure of how easily AI search engines like ChatGPT, Perplexity, and Claude can find, understand, and recommend your business. A low score means AI assistants ignore your business when users ask for recommendations.',
  },
  {
    q: "What's included in one scan?",
    a: 'Every scan runs 14 signals: robots.txt, llms.txt, structured data (Schema.org), Google Business Profile verification, citation consistency, social signals, directory presence, review signals, page speed, HTTPS, mobile responsiveness, sitemap health, content authority, and AI readability. You get a 0–100 score, a full breakdown, and an HTML report.',
  },
  {
    q: 'Is this a one-time payment or subscription?',
    a: 'Truly one-time. Pay once through AppSumo, use forever. No recurring charges, no hidden fees, no annual renewal. Ever.',
  },
  {
    q: 'What happens when you add new signals?',
    a: 'All signal updates are included free forever. As AI search evolves and new visibility factors emerge, your scanner updates automatically.',
  },
  {
    q: 'Does this work for any business?',
    a: 'Yes — any business with a public web presence. Local businesses, e-commerce stores, SaaS companies, agencies, restaurants, law firms, medical practices, contractors. If you have a website, you can scan it.',
  },
  {
    q: 'How do I access my reports after purchase?',
    a: "After scanning, a login link is sent to your email. Click it to access your dashboard, view your HTML reports, and check your score history. No password to remember.",
  },
  {
    q: 'Is there a money-back guarantee?',
    a: "Yes — AppSumo's standard 60-day money-back guarantee applies. If you're not happy for any reason, AppSumo refunds you. No questions.",
  },
  {
    q: 'How is this different from SEO tools like Ahrefs or Semrush?',
    a: 'Traditional SEO tools optimize for Google PageRank — keywords, backlinks, SERP position. Queldrex optimizes for AI search engines specifically: structured data, AI crawler access, entity recognition, citation networks. These are fundamentally different ranking systems.',
  },
]

export default function AppSumoPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: '#070b14' }}>

      {/* Top announcement bar */}
      <div className="w-full py-2.5 px-4 text-center text-sm font-bold text-black" style={{ background: '#06d6ff' }}>
        🔥 AppSumo Exclusive — One-time payment, lifetime access · No subscription ever
      </div>

      {/* Nav bar — minimal */}
      <div className="border-b border-white/6 py-4 px-6 flex items-center justify-between" style={{ background: '#070b14' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <span className="font-black text-white text-base tracking-tight">Queldrex</span>
          <span className="text-white/20 text-sm mx-1">×</span>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#f97316' }}>AppSumo</span>
        </div>
        <a
          href="https://appsumo.com/products/queldrex"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold px-5 py-2 rounded-lg text-black transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}
        >
          Get Lifetime Access →
        </a>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(6,182,212,0.09) 0%, transparent 60%)' }} />
        <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase mb-6" style={{ borderColor: 'rgba(249,115,22,0.3)', background: 'rgba(249,115,22,0.08)', color: '#fb923c' }}>
            AppSumo Lifetime Deal
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-5">
            Find Out If ChatGPT Recommends<br className="hidden sm:block" /> Your Business — In 60 Seconds
          </h1>
          <p className="text-lg text-white/65 leading-relaxed mb-10 max-w-2xl mx-auto">
            Queldrex AI Visibility Scanner checks 14 signals across ChatGPT, Google AI, Perplexity, and more. One scan tells you exactly why AI ignores your business — and what to fix.
          </p>

          {/* Stat boxes */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {[
              { num: '14', label: 'signals checked' },
              { num: '60s', label: 'per scan' },
              { num: 'PDF', label: 'report included' },
            ].map(({ num, label }) => (
              <div key={label} className="rounded-xl border border-white/10 px-6 py-4 text-center" style={{ background: 'rgba(6,182,212,0.04)' }}>
                <div className="text-2xl font-black text-white">{num}</div>
                <div className="text-xs text-white/45 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          <a
            href="https://appsumo.com/products/queldrex"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-10 py-4 rounded-xl text-base font-black text-black transition-all hover:scale-[1.03]"
            style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 40px rgba(6,182,212,0.35)' }}
          >
            Get Lifetime Access on AppSumo
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
          </a>
          <p className="text-white/30 text-xs mt-4">
            ✓ One-time payment &nbsp;·&nbsp; ✓ No subscription &nbsp;·&nbsp; ✓ 60-day money-back guarantee
          </p>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section className="border-b border-white/5 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl lg:text-3xl font-black text-white text-center mb-4">
            Your Customers Are Asking AI Who To Hire —<br className="hidden md:block" /> Are You Showing Up?
          </h2>
          <p className="text-white/50 text-center text-base mb-12 max-w-xl mx-auto leading-relaxed">
            When someone asks ChatGPT &ldquo;who&rsquo;s the best HVAC company in Denver?&rdquo; — does your business come up? If you don&rsquo;t know, you&rsquo;re already losing customers. Queldrex tells you exactly where you stand and what to fix.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                stat: '72%',
                desc: 'of buyers use AI assistants for business recommendations',
                note: 'based on 2025 consumer surveys',
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>,
              },
              {
                stat: 'Most',
                desc: 'small businesses are completely invisible to ChatGPT searches',
                note: 'missing structured data and AI crawler access',
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>,
              },
              {
                stat: '2027',
                desc: 'AI search will outpace Google for local business queries',
                note: 'industry analysts, 2025',
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/>,
              },
            ].map(({ stat, desc, note, icon }) => (
              <div key={stat} className="rounded-2xl border border-white/8 p-6 text-center" style={{ background: '#0d1117' }}>
                <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center text-cyan-400" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)' }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">{icon}</svg>
                </div>
                <div className="text-3xl font-black text-white mb-2">{stat}</div>
                <p className="text-white/60 text-sm leading-relaxed mb-2">{desc}</p>
                <p className="text-white/25 text-xs">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14 SIGNALS */}
      <section className="border-b border-white/5 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-center mb-3" style={{ color: '#06d6ff' }}>What You Get</p>
          <h2 className="text-2xl lg:text-3xl font-black text-white text-center mb-3">14-Signal AI Visibility Audit</h2>
          <p className="text-white/45 text-center text-sm mb-12 max-w-lg mx-auto">Every scan checks all 14 signals and tells you exactly which ones you&rsquo;re missing and why it matters.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {SIGNALS.map((s, i) => (
              <div key={s.name} className="flex items-center gap-4 rounded-xl border border-white/6 px-4 py-3.5" style={{ background: '#0d1117' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black" style={{ background: 'rgba(6,182,212,0.1)', color: '#06d6ff', border: '1px solid rgba(6,182,212,0.2)' }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white text-sm">{s.name}</div>
                  <div className="text-white/45 text-xs">{s.desc}</div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/25" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SAMPLE REPORT PREVIEW */}
      <section className="border-b border-white/5 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-center mb-3" style={{ color: '#06d6ff' }}>Real Output</p>
          <h2 className="text-2xl lg:text-3xl font-black text-white text-center mb-12">See a Real Report</h2>

          <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: '#0d1117' }}>
            {/* Report header */}
            <div className="px-6 py-5 border-b border-white/8 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-1">AI Visibility Audit</p>
                <p className="text-white font-bold">sunrise-plumbing-denver.com</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-3xl font-black text-white">67<span className="text-base text-white/30 font-normal">/100</span></div>
                  <div className="text-xs text-white/35">AI Visibility Score</div>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black border" style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)', color: '#fbbf24' }}>
                  C
                </div>
              </div>
            </div>

            {/* Signal rows */}
            <div className="divide-y divide-white/5">
              {[
                { signal: 'robots.txt', status: 'pass', badge: '✓ PASS', badgeStyle: { background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }, note: 'AI crawlers allowed' },
                { signal: 'llms.txt', status: 'fail', badge: '✗ FAIL', badgeStyle: { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }, note: 'No llms.txt found — AI agents have no context about your business' },
                { signal: 'Schema.org', status: 'partial', badge: '⚠ PARTIAL', badgeStyle: { background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }, note: 'LocalBusiness schema found, missing telephone and openingHours' },
              ].map(({ signal, badge, badgeStyle, note }) => (
                <div key={signal} className="px-6 py-4 flex items-center gap-4 flex-wrap">
                  <span className="text-sm font-bold text-white w-28 flex-shrink-0">{signal}</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0" style={badgeStyle}>{badge}</span>
                  <span className="text-xs text-white/50 flex-1 min-w-0">{note}</span>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-white/8">
              <Link
                href="/sample-audit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold transition-colors hover:text-white"
                style={{ color: '#06d6ff' }}
              >
                View full sample report →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* THE DEAL */}
      <section className="border-b border-white/5 py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-xs font-bold tracking-[0.25em] uppercase mb-3" style={{ color: '#06d6ff' }}>AppSumo Exclusive</p>
          <h2 className="text-2xl lg:text-3xl font-black text-white mb-12">The Deal</h2>

          <div className="rounded-2xl border p-8" style={{ background: '#0d1117', borderColor: '#06d6ff', boxShadow: '0 0 48px rgba(6,182,212,0.12)' }}>
            <div className="mb-2">
              <span className="text-white/30 text-base line-through">$149/scan</span>
            </div>
            <div className="text-4xl font-black text-white mb-1">Lifetime Deal Price</div>
            <p className="text-white/45 text-sm mb-8">Set by AppSumo · One-time payment · Lifetime access</p>

            <ul className="space-y-3 mb-8 text-left max-w-xs mx-auto">
              {DEAL_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-white/70">
                  <svg className="w-4 h-4 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  {f}
                </li>
              ))}
            </ul>

            <a
              href="https://appsumo.com/products/queldrex"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 w-full justify-center px-8 py-4 rounded-xl font-black text-black text-base transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 32px rgba(6,182,212,0.3)' }}
            >
              Get Lifetime Access
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </a>
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="border-b border-white/5 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl lg:text-3xl font-black text-white text-center mb-12">Perfect For</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {FOR_WHO.map(({ title, desc, icon }) => (
              <div key={title} className="rounded-2xl border border-white/8 p-6 flex gap-4" style={{ background: '#0d1117' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-cyan-400" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)' }}>
                  {icon}
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">{title}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-white/5 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl lg:text-3xl font-black text-white text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-white/8 p-6" style={{ background: '#0d1117' }}>
                <h3 className="font-bold text-white mb-2">{q}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS PLACEHOLDER */}
      <section className="border-b border-white/5 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-black text-white text-center mb-3">Sumo-lings Are Saying</h2>
          <p className="text-white/30 text-sm text-center mb-10">Reviews will appear here after the AppSumo launch.</p>
          <div className="grid md:grid-cols-3 gap-5">
            {[1, 2, 3].map(n => (
              <div key={n} className="rounded-2xl border border-white/6 p-6" style={{ background: '#0d1117' }}>
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-white/15" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  ))}
                </div>
                <p className="text-white/20 text-sm italic">[AppSumo review #{n} will appear here after launch]</p>
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-white/15 text-xs">Verified AppSumo buyer · Coming soon</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="rounded-2xl p-10" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(8,145,178,0.06))', border: '1px solid rgba(6,182,212,0.2)' }}>
            <h2 className="text-2xl lg:text-3xl font-black text-white mb-3">
              Don&rsquo;t let competitors get AI-visible<br className="hidden sm:block" /> while you&rsquo;re invisible.
            </h2>
            <p className="text-white/45 text-sm mb-8">Every day without an AI visibility strategy is customers going to someone else.</p>
            <a
              href="https://appsumo.com/products/queldrex"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-black text-black text-base transition-all hover:scale-[1.03]"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 40px rgba(6,182,212,0.3)' }}
            >
              Get Lifetime Access
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </a>
            <p className="text-white/25 text-xs mt-4">
              60-day money-back guarantee &nbsp;·&nbsp; Instant access &nbsp;·&nbsp; No subscription ever
            </p>
          </div>
        </div>
      </section>

      {/* Slim footer */}
      <footer className="border-t border-white/6 py-8 px-6 text-center" style={{ background: '#070b14' }}>
        <p className="text-white/30 text-xs mb-2">
          © 2026 Queldrex LLC · Castle Rock, Colorado · hello@queldrex.com ·{' '}
          <a href="https://queldrex.com" className="hover:text-white transition-colors">queldrex.com</a>
        </p>
        <div className="flex justify-center gap-4 text-xs">
          <Link href="/privacy" className="text-white/25 hover:text-white transition-colors">Privacy Policy</Link>
          <span className="text-white/15">·</span>
          <Link href="/terms" className="text-white/25 hover:text-white transition-colors">Terms of Service</Link>
          <span className="text-white/15">·</span>
          <Link href="/refunds" className="text-white/25 hover:text-white transition-colors">Refund Policy</Link>
        </div>
      </footer>

    </div>
  )
}
