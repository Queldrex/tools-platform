import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PricingSection from '@/components/PricingSection'
import UpcomingTools from '@/components/UpcomingTools'

const TOOLS = [
  {
    name: 'AI Visibility Scanner',
    hook: 'ChatGPT won\'t recommend businesses it can\'t find. Most sites are invisible to AI right now.',
    desc: 'Scan any website for the signals AI assistants use to find and recommend businesses.',
    price: '$149',
    status: 'live' as const,
    href: '/scanner',
    color: 'rgba(6,182,212,0.15)',
    border: 'rgba(6,182,212,0.35)',
  },
  {
    name: 'API Schema Drift Scanner',
    hook: 'Your API breaks silently. Users hit errors before you do. Catch drift before it ships.',
    desc: 'Detect breaking changes between live API responses and your OpenAPI specification.',
    price: null,
    status: 'soon' as const,
    href: null,
    color: 'rgba(99,102,241,0.1)',
    border: 'rgba(99,102,241,0.2)',
  },
  {
    name: 'Database Migration Middleware',
    hook: 'One botched migration means downtime, corrupted data, and a very bad morning.',
    desc: 'Run schema migrations with automatic rollback triggers and zero-downtime deployment.',
    price: null,
    status: 'soon' as const,
    href: null,
    color: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.18)',
  },
  {
    name: 'Vibe Coding Security Shield',
    hook: 'AI writes code fast. It also writes SQL injection holes and exposed secrets.',
    desc: 'Scan AI-generated code for OWASP top-10 vulnerabilities before shipping to production.',
    price: null,
    status: 'soon' as const,
    href: null,
    color: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.18)',
  },
  {
    name: 'High-Speed Directory Extractor',
    hook: 'Manual scraping breaks after 50 rows and takes all day. Extract thousands of clean listings in minutes.',
    desc: 'Extract, deduplicate, and export business listings from any directory at scale.',
    price: null,
    status: 'soon' as const,
    href: null,
    color: 'rgba(236,72,153,0.08)',
    border: 'rgba(236,72,153,0.18)',
  },
]

function ProductGrid() {
  return (
    <div className="w-full flex flex-col gap-2.5">
      {TOOLS.map((tool) => (
        <div key={tool.name} className="rounded-xl px-4 py-3.5 flex items-center gap-4 border" style={{ background: tool.color, borderColor: tool.border }}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-0.5">
              <span className="text-sm font-bold text-white truncate">{tool.name}</span>
              {tool.status === 'live'
                ? <span className="flex-shrink-0 text-[10px] font-black uppercase tracking-wider text-black px-2 py-0.5 rounded-full" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Live</span>
                : <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider text-white/40 border border-white/15 px-2 py-0.5 rounded-full">Soon</span>
              }
            </div>
            <p className="text-xs text-white/55 leading-snug truncate">{tool.desc}</p>
          </div>
          {tool.price
            ? <span className="text-sm font-black text-white/60 flex-shrink-0">{tool.price}</span>
            : <span className="text-xs font-medium text-white/25 flex-shrink-0">TBD</span>
          }
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 70% at 20% 50%, rgba(6,182,212,0.07) 0%, transparent 60%)' }} />
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-8 grid lg:grid-cols-[1fr_480px] gap-16 items-center" style={{ minHeight: 560 }}>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/25 bg-cyan-500/8 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-8">
              Queldrex LLC · Software Tools
            </div>
            <h1 className="text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-white mb-6">
              Precision Software.<br/>
              <span style={{ color: '#06d6ff' }}>One-Time Payment.</span><br/>
              Built to Ship.
            </h1>
            <p className="text-lg text-white/70 leading-relaxed mb-5 max-w-lg">
              Queldrex is a software tools company. We build focused, production-ready tools for developers and businesses. Our suite covers AI visibility, API validation, database migrations, security, and data extraction.
            </p>
            <p className="text-base text-white/60 leading-relaxed mb-10 max-w-lg">
              Every tool is a one-time purchase. You pay once and own the result. No subscriptions, no recurring fees, no account required to get started.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/scanner" className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.03]" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 32px rgba(6,182,212,0.35)' }}>
                Try Our Free Tool
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              </Link>
              <a href="#tools" className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white/65 border border-white/15 hover:border-white/25 hover:text-white transition-all">
                See all tools
              </a>
            </div>
          </div>

          <div className="hidden lg:block">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/35 mb-4">Our Tool Suite</p>
            <ProductGrid />
          </div>
        </div>
      </section>

      {/* Three pillars */}
      <div className="border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 divide-x divide-white/5">
            {[
              { title: 'One-Time Payment', body: 'Every product is a single purchase. No subscriptions, no renewals, no accounts. You pay once and own the result.' },
              { title: 'Instant Delivery', body: 'Reports, files, and outputs are generated and delivered in minutes. No human review step, no waiting.' },
              { title: 'Production-Ready Output', body: 'What you receive is ready to use. Not a suggestion or a template. These are actual files you can deploy immediately.' },
            ].map(({ title, body }) => (
              <div key={title} className="px-10 py-12" style={{ background: '#070b14' }}>
                <h3 className="text-sm font-black text-white mb-3">{title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All 5 tools */}
      <section id="tools" className="max-w-7xl mx-auto px-6 py-28">
        <div className="mb-12">
          <p className="text-cyan-500 text-xs font-bold tracking-[0.32em] uppercase mb-4">Our Tools</p>
          <h2 className="text-4xl font-black text-white mb-4">Five tools. One suite.</h2>
          <p className="text-white/60 text-base max-w-xl leading-relaxed">
            Each tool is built to solve one specific problem. Start with the AI Visibility Scanner now. The rest are coming.
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {TOOLS.map((tool) => (
            <div key={tool.name} className="rounded-2xl border p-7 flex flex-col" style={{ background: tool.status === 'live' ? 'rgba(6,182,212,0.04)' : 'rgba(255,255,255,0.018)', borderColor: tool.border }}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  {tool.status === 'live'
                    ? <span className="inline-block text-[10px] font-black uppercase tracking-wider text-black px-2.5 py-1 rounded-full mb-3" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Available Now</span>
                    : <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-white/40 border border-white/15 px-2.5 py-1 rounded-full mb-3">In Development</span>
                  }
                  <h3 className="text-base font-black text-white leading-snug">{tool.name}</h3>
                </div>
                {tool.price
                  ? <span className="text-xl font-black text-white/55 flex-shrink-0">{tool.price}</span>
                  : <span className="text-xs font-medium text-white/25 flex-shrink-0 mt-1">Pricing TBD</span>
                }
              </div>
              <p className="text-sm font-semibold text-white/85 leading-snug mb-2">{tool.hook}</p>
              <p className="text-white/50 text-xs leading-relaxed flex-1 mb-6">{tool.desc}</p>
              {tool.href
                ? <Link href={tool.href} className="inline-flex items-center gap-2 text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
                    Try it free
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                  </Link>
                : <a href={`mailto:hello@queldrex.com?subject=Notify%20me%3A%20${encodeURIComponent(tool.name)}`} className="inline-flex items-center gap-2 text-xs font-bold text-white/40 hover:text-cyan-400 transition-colors">
                    Notify me when it launches
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                  </a>
              }
            </div>
          ))}

          <div className="rounded-2xl border border-dashed border-white/10 p-7 flex flex-col items-start justify-between" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div>
              <p className="text-xs font-bold text-white/35 uppercase tracking-wider mb-3">More on the roadmap</p>
              <p className="text-white/55 text-sm leading-relaxed">
                Queldrex is an expanding suite. New tools are evaluated and built on a rolling basis based on real developer and business needs.
              </p>
            </div>
            <a href="mailto:hello@queldrex.com?subject=Tool%20Request" className="mt-6 text-xs font-bold text-white/40 hover:text-cyan-400 transition-colors">
              Suggest a tool
            </a>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="border-t border-white/5 py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-cyan-500 text-xs font-bold tracking-[0.32em] uppercase mb-5">About Queldrex</p>
            <h2 className="text-3xl font-black text-white leading-tight mb-6">
              Software built by people who use software
            </h2>
            <p className="text-white/65 text-base leading-relaxed mb-5">
              Queldrex is a Colorado-based software tools company. We identify gaps in developer and business workflows where good software does not yet exist, and we build tools to fill them. Precisely, professionally, and without unnecessary complexity.
            </p>
            <p className="text-white/60 text-base leading-relaxed mb-5">
              Our business model is straightforward: you buy a tool, you get the tool. No account creation, no subscriptions, no vendor lock-in. The output is yours.
            </p>
            <p className="text-white/60 text-base leading-relaxed">
              We are a small team. Every tool ships when it is ready, not on an arbitrary schedule, and never before it works.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { q: 'Who are these tools for?', a: 'Developers, agencies, and business owners who need a specific problem solved without paying for a bloated platform. Our tools do one thing well and cost a fixed amount.' },
              { q: 'Do I need a subscription?', a: 'No. Every Queldrex tool is a one-time purchase. You pay the listed price and receive the output immediately. There are no recurring charges.' },
              { q: 'What if I need help implementing?', a: 'We offer a Done-For-You implementation service for the AI Visibility Scanner. If you need professional installation instead of a self-service download, we handle the full deployment. Contact us at hello@queldrex.com to get started.' },
              { q: 'When will the other tools launch?', a: 'We publish tools when they are ready and tested. You can email us at hello@queldrex.com to be notified when a specific tool becomes available.' },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-white/8 p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <h4 className="text-sm font-bold text-white mb-2">{q}</h4>
                <p className="text-white/60 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming tools */}
      <section className="border-t border-white/5 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <UpcomingTools />
        </div>
      </section>

      <PricingSection />

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8" style={{ background: 'linear-gradient(135deg,rgba(6,182,212,0.07) 0%,rgba(6,182,212,0.02) 100%)', border: '1px solid rgba(6,182,212,0.14)' }}>
          <div>
            <h3 className="text-2xl font-black text-white mb-2">Start with the AI Visibility Scanner</h3>
            <p className="text-white/60 text-sm">Free scan. No account required. Results in under 30 seconds.</p>
          </div>
          <Link href="/scanner" className="flex-shrink-0 flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.03]" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 28px rgba(6,182,212,0.3)' }}>
            Scan your site free
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
