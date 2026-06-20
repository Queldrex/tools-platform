import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'All Tools — Queldrex',
  description: 'Precision software tools for developers and businesses. One problem, one tool, one payment. See everything we\'re building.',
}

const TOOLS = [
  {
    name: 'AI Visibility Scanner',
    tagline: 'Find out if AI can discover your business — and get the exact files to fix it.',
    description: 'ChatGPT, Perplexity, Claude, and Gemini answer millions of business questions every day. The businesses they recommend have specific technical signals. We scan your site for 14 of them — free — and generate the complete fix package for $149.',
    price: '$149',
    priceSub: '+ $499 Done-For-You',
    href: '/scanner',
    status: 'live' as const,
    color: 'rgba(6,182,212,0.08)',
    border: 'rgba(6,182,212,0.28)',
    accent: '#06d6ff',
    features: [
      '14 AI visibility signals scanned in seconds',
      'Generated llms.txt + LocalBusiness JSON-LD schema',
      'Full HTML report + prioritized fix checklist',
      'Done-For-You implementation option',
    ],
    cta: 'Try Free →',
  },
  {
    name: 'Threat Intelligence Feed',
    tagline: 'Live stream of cyber threat indicators from 12 global intelligence sources.',
    description: 'Malware hashes, phishing domains, C2 servers, botnets, exploit URLs — aggregated in real time from AbuseIPDB, VirusTotal, OTX, and more. Filter by category and severity. Free, no login.',
    price: 'Free',
    priceSub: 'always',
    href: '/tools/threat-feed',
    status: 'live' as const,
    color: 'rgba(34,211,238,0.06)',
    border: 'rgba(34,211,238,0.2)',
    accent: '#22d3ee',
    features: [
      'Live-updating feed of malware, phishing, C2, botnet, exploit IOCs',
      'Filter by category and severity level',
      'Aggregated from 12 sources: AbuseIPDB, VirusTotal, OTX, and more',
      'No login required',
    ],
    cta: 'View Live Feed →',
  },
  {
    name: 'Breach Lookup',
    tagline: 'Check if an email, username, domain, or IP has appeared in known data breaches.',
    description: 'Search our breach intelligence database of 14.8B records across 2,847 sources. See which breaches exposed your data, what fields were leaked, and the exact steps to secure your accounts. Free.',
    price: 'Free',
    priceSub: 'always',
    href: '/tools/breach-lookup',
    status: 'live' as const,
    color: 'rgba(248,113,113,0.06)',
    border: 'rgba(248,113,113,0.2)',
    accent: '#f87171',
    features: [
      'Search by email, username, domain, or IP address',
      '14.8B records across 2,847 known breach sources',
      'Severity ratings and exposed field breakdown',
      'Credentials redacted — safe to use',
    ],
    cta: 'Search Breaches →',
  },
  {
    name: 'Security Assistant',
    tagline: 'Ask any cybersecurity question and get a direct, technical answer.',
    description: 'A free security Q&A covering phishing, server hardening, SQL injection, zero-days, ransomware, 2FA, SSL/TLS, API security, OWASP Top 10, and breach response. No login, no account required.',
    price: 'Free',
    priceSub: 'always',
    href: '/tools/security-assistant',
    status: 'live' as const,
    color: 'rgba(167,139,250,0.06)',
    border: 'rgba(167,139,250,0.2)',
    accent: '#a78bfa',
    features: [
      'Covers phishing, zero-days, server hardening, SQL injection',
      'OWASP Top 10, API security, SSL/TLS, 2FA, breach response',
      'Chat interface with starter prompts',
      'No login, no account, always free',
    ],
    cta: 'Ask a Question →',
  },
  {
    name: 'Vibe Coding Security Shield',
    tagline: 'AI writes code fast. It also writes SQL injection holes. Catch them before they ship.',
    description: 'AI-generated code is in production everywhere — and nobody is auditing it properly. The Vibe Coding Security Shield will scan AI-written code against the OWASP Top 10, flag every vulnerability with a severity rating, and generate the exact patches needed.',
    price: '$149',
    priceSub: 'one-time',
    href: '/tools/vibe-security',
    status: 'planned' as const,
    color: 'rgba(245,158,11,0.05)',
    border: 'rgba(245,158,11,0.18)',
    accent: 'rgb(245,158,11)',
    features: [
      'OWASP Top 10 vulnerability audit',
      'Severity rating per issue (Critical / High / Medium)',
      'Exact patch generated for every finding',
      'Works on any AI-generated codebase',
    ],
    cta: 'Join waitlist →',
  },
  {
    name: 'API Schema Drift Scanner',
    tagline: 'Your API breaks silently. Users hit errors before your monitoring fires.',
    description: 'A field gets renamed, a required param gets added, a response format changes — and users start hitting 500 errors. The API Schema Drift Scanner will compare your live API responses against your documented schema, identify every breaking change, and generate the fix.',
    price: '$249',
    priceSub: 'one-time',
    href: '/tools/api-schema-drift',
    status: 'planned' as const,
    color: 'rgba(99,102,241,0.06)',
    border: 'rgba(99,102,241,0.2)',
    accent: 'rgb(99,102,241)',
    features: [
      'Compare live API against documented schema',
      'Catch renamed fields, removed params, type changes',
      'Auto-generated fix for every breaking change',
      'One scan, one report, one payment',
    ],
    cta: 'Join waitlist →',
  },
  {
    name: 'Database Migration Middleware',
    tagline: 'One botched migration means downtime. The average outage costs $9K/min.',
    description: 'Developers rush schema migrations and pray. Database Migration Middleware will generate zero-downtime migration scripts, validate schema changes against live data, and produce a complete rollback plan — before a single query runs.',
    price: '$199',
    priceSub: 'one-time',
    href: '/tools/database-migration',
    status: 'planned' as const,
    color: 'rgba(16,185,129,0.05)',
    border: 'rgba(16,185,129,0.18)',
    accent: 'rgb(16,185,129)',
    features: [
      'Zero-downtime migration script generation',
      'Schema validation against live data before execution',
      'Full rollback plan included',
      'Supports PostgreSQL, MySQL, and more',
    ],
    cta: 'Join waitlist →',
  },
  {
    name: 'High-Speed Directory Extractor',
    tagline: 'Extract thousands of structured listings in minutes, not days.',
    description: 'Directory sites hold thousands of structured listings — business names, addresses, categories, contact info. Manual extraction takes days. This tool will pull clean, structured data from any directory at scale and export as CSV or JSON.',
    price: '$99',
    priceSub: 'one-time',
    href: '/tools/directory-extractor',
    status: 'planned' as const,
    color: 'rgba(236,72,153,0.05)',
    border: 'rgba(236,72,153,0.18)',
    accent: 'rgb(236,72,153)',
    features: [
      'Extract at scale — thousands of listings in minutes',
      'Export as CSV or JSON, ready for your pipeline',
      'Structured output: name, address, category, contact',
      'No daily rate limits, no API costs',
    ],
    cta: 'Join waitlist →',
  },
]

export default function ToolsPage() {
  const live = TOOLS.filter(t => t.status === 'live')
  const planned = TOOLS.filter(t => t.status === 'planned')

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase mb-6"
          style={{ borderColor: 'rgba(6,182,212,0.25)', background: 'rgba(6,182,212,0.08)', color: '#06d6ff' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Queldrex Tool Suite
        </div>
        <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
          One problem. One tool.<br />
          <span style={{ color: '#06d6ff' }}>One payment. Done.</span>
        </h1>
        <p className="text-white/55 text-lg max-w-2xl leading-relaxed mb-6">
          Every Queldrex tool solves a single specific problem — precisely, without bloat or subscriptions. Buy once, own the output forever.
        </p>
        <div className="flex flex-wrap items-center gap-6 text-sm text-white/35">
          <span><span className="text-white font-bold">{TOOLS.length}</span> tools total</span>
          <span>·</span>
          <span><span className="text-cyan-400 font-bold">{live.length}</span> live now</span>
          <span>·</span>
          <span><span className="text-white/50 font-bold">{planned.length}</span> in the pipeline</span>
          <span>·</span>
          <span>No subscriptions, ever</span>
        </div>
      </section>

      {/* LIVE TOOLS */}
      <section className="max-w-7xl mx-auto px-6 pb-10">
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-cyan-500 mb-5">Live Now</p>
        {live.map((tool) => (
          <div
            key={tool.name}
            className="rounded-2xl border p-8 lg:p-10 mb-4"
            style={{ background: tool.color, borderColor: tool.border }}
          >
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="text-[10px] font-black uppercase tracking-wider text-black px-3 py-1 rounded-full"
                    style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}
                  >
                    Live Now
                  </span>
                  <span className="text-sm font-bold text-white/40">{tool.price} <span className="text-white/25 font-normal">/ {tool.priceSub}</span></span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-black text-white mb-3">{tool.name}</h2>
                <p className="text-base text-white/65 leading-relaxed mb-3 max-w-xl">{tool.tagline}</p>
                <p className="text-sm text-white/45 leading-relaxed mb-6 max-w-xl">{tool.description}</p>
                <Link
                  href={tool.href}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 24px rgba(6,182,212,0.3)' }}
                >
                  Scan Your Site Free
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
              <div className="lg:w-64 flex-shrink-0">
                <p className="text-xs font-bold uppercase tracking-wider text-white/25 mb-3">What you get</p>
                <ul className="space-y-2.5">
                  {tool.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-white/60">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: tool.accent }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* PLANNED TOOLS */}
      <section className="max-w-7xl mx-auto px-6 pb-10">
        <div className="flex items-end justify-between gap-4 mb-5">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-white/35">In the Pipeline</p>
          <a
            href="mailto:hello@queldrex.com?subject=Queldrex%20tool%20waitlist"
            className="text-xs text-white/30 hover:text-cyan-400 transition-colors"
          >
            Get notified on launch →
          </a>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {planned.map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              className="rounded-2xl border p-7 flex flex-col gap-4 hover:border-white/20 transition-all group"
              style={{ background: tool.color, borderColor: tool.border }}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
                  style={{ color: 'rgba(255,255,255,0.35)', borderColor: 'rgba(255,255,255,0.12)' }}
                >
                  Planned
                </span>
                <span className="text-sm font-bold text-white/30">{tool.price}</span>
              </div>
              <div>
                <h3 className="text-lg font-black text-white mb-2 group-hover:text-white transition-colors">{tool.name}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{tool.tagline}</p>
              </div>
              <ul className="space-y-1.5">
                {tool.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-white/35">
                    <span className="mt-0.5 flex-shrink-0" style={{ color: tool.accent }}>→</span>
                    {f}
                  </li>
                ))}
              </ul>
              <span className="text-xs font-semibold text-white/25 group-hover:text-white/50 transition-colors mt-auto">
                {tool.cta}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* REQUEST A TOOL */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div
          className="rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8"
          style={{
            background: 'linear-gradient(135deg,rgba(255,255,255,0.02) 0%,rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/30 mb-3">Don&apos;t see what you need?</p>
            <h3 className="text-2xl font-black text-white mb-2">Request a tool.</h3>
            <p className="text-white/50 text-sm max-w-md leading-relaxed">
              Have a specific problem you need solved? Tell us what it is. We build on demand and prioritize based on what people actually need.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              href="/request-tool"
              className="flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.03]"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 24px rgba(6,182,212,0.25)' }}
            >
              Submit a Request
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/scanner"
              className="flex items-center gap-2 px-7 py-4 rounded-xl text-sm font-semibold text-white/60 border border-white/12 hover:border-white/22 hover:text-white transition-all"
            >
              Try Tool 1 Free →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
