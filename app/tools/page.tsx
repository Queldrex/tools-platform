import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'All Tools — Queldrex',
  description: 'Precision software tools for AI visibility, security auditing, and developer workflows. All live and free to start.',
}

const AI_VISIBILITY_TOOLS = [
  {
    name: 'AI Visibility Scanner',
    tagline: 'Find out if AI can discover your business, and get the exact files to fix it.',
    description: 'ChatGPT, Perplexity, Claude, and Gemini answer millions of business questions every day. The businesses they recommend have specific technical signals. We scan your site for 14 of them — free — and generate the complete fix package for $149.',
    price: '$149',
    priceSub: 'one-time',
    href: '/scanner',
    accent: '#06d6ff',
    color: 'rgba(6,182,212,0.08)',
    border: 'rgba(6,182,212,0.28)',
    features: [
      '14 AI visibility signals scanned in seconds',
      'Generated llms.txt and LocalBusiness JSON-LD schema',
      'Full HTML report with prioritized fix checklist',
      'Done-For-You implementation available for $499',
    ],
    cta: 'Try Free',
  },
  {
    name: 'AI Citation Tracker',
    tagline: 'Does ChatGPT mention your business when customers ask for recommendations?',
    description: 'We ask ChatGPT the same questions your customers do and report back exactly what it says — whether it knows about your business, who it recommends instead, and the three most important things you can do to get cited.',
    price: 'Pro',
    priceSub: '$29/month',
    href: '/tools/citation-tracker',
    accent: '#06d6ff',
    color: 'rgba(6,214,255,0.06)',
    border: 'rgba(6,214,255,0.2)',
    features: [
      'Direct ChatGPT citation check for your business',
      'See who ChatGPT recommends instead of you',
      'Actionable improvement plan from ChatGPT itself',
      '1 free check included, unlimited with Pro',
    ],
    cta: 'Check My Citations',
  },
]

const SECURITY_TOOLS = [
  {
    name: 'Vibe Coding Security Shield',
    tagline: 'AI writes code fast. It also writes SQL injection holes. Catch them before they ship.',
    description: 'Paste any AI-generated code and instantly scan for OWASP Top 10 vulnerabilities, hardcoded secrets, injection risks, and insecure patterns. Line numbers, severity ratings, and fix guidance included.',
    price: 'Pro',
    priceSub: '$29/month',
    href: '/tools/vibe-security',
    accent: 'rgb(245,158,11)',
    color: 'rgba(245,158,11,0.05)',
    border: 'rgba(245,158,11,0.18)',
    features: [
      '14 OWASP checks: hardcoded secrets, SQL injection, XSS, and more',
      'Severity rating per finding: Critical, High, Medium, Low',
      'Line numbers and code snippets for every issue',
      '1 free scan included, unlimited with Pro',
    ],
    cta: 'Scan Code',
  },
  {
    name: 'Breach Lookup',
    tagline: 'Check if a password has been exposed in known breaches, and audit your domain\'s security configuration.',
    description: 'Two tools in one. The password tab uses HaveIBeenPwned\'s k-anonymity API to check if a password has appeared in breaches — your password is hashed locally and never sent in full. The domain tab audits your security headers (HTTPS, HSTS, CSP) and email authentication (DMARC, SPF). Both are completely free.',
    price: 'Free',
    priceSub: 'always',
    href: '/tools/breach-lookup',
    accent: '#f87171',
    color: 'rgba(248,113,113,0.06)',
    border: 'rgba(248,113,113,0.2)',
    features: [
      'Password breach check via HaveIBeenPwned k-anonymity',
      'Your password is hashed locally, never sent in full',
      'Domain security audit: HTTPS, HSTS, CSP, X-Frame-Options',
      'Email authentication check: DMARC and SPF records',
    ],
    cta: 'Check Breaches',
  },
  {
    name: 'Threat Intelligence Feed',
    tagline: 'Live stream of malware and phishing indicators from active threat intelligence sources.',
    description: 'Malware hashes, phishing domains, botnet C2 servers, and malicious URLs — pulled in real time from URLhaus and Feodo Tracker, two of the most active open-source threat intelligence feeds. Filter by category. Free, no login required.',
    price: 'Free',
    priceSub: 'always',
    href: '/tools/threat-feed',
    accent: '#22d3ee',
    color: 'rgba(34,211,238,0.06)',
    border: 'rgba(34,211,238,0.2)',
    features: [
      'Live malware URLs and botnet C2 indicators',
      'Sourced from URLhaus and Feodo Tracker',
      'Filter by threat category and severity',
      'No login required',
    ],
    cta: 'View Live Feed',
  },
]

const DEV_TOOLS = [
  {
    name: 'API Schema Drift Scanner',
    tagline: 'Your API breaks silently. Users hit errors before your monitoring fires.',
    description: 'Paste two OpenAPI specifications and instantly see every breaking change and additive change between them. Renamed fields, removed endpoints, type changes, new required parameters — all flagged before they ship.',
    price: 'Pro',
    priceSub: '$29/month',
    href: '/tools/api-schema-drift',
    accent: 'rgb(99,102,241)',
    color: 'rgba(99,102,241,0.06)',
    border: 'rgba(99,102,241,0.2)',
    features: [
      'Paste two OpenAPI specs for instant comparison',
      'Breaking changes and additive changes clearly separated',
      'Renamed fields, removed params, type mismatches all caught',
      '1 free scan included, unlimited with Pro',
    ],
    cta: 'Compare Specs',
  },
  {
    name: 'Database Migration Safety Checker',
    tagline: 'One botched migration means downtime. The average outage costs $9,000 per minute.',
    description: 'Paste your SQL migration script and get an instant risk analysis. Dangerous patterns — table drops, column removals, missing transactions, and index-free foreign keys — are flagged before you run a single query.',
    price: 'Pro',
    priceSub: '$29/month',
    href: '/tools/database-migration',
    accent: 'rgb(16,185,129)',
    color: 'rgba(16,185,129,0.05)',
    border: 'rgba(16,185,129,0.18)',
    features: [
      'Catches DROP TABLE, irreversible changes, and missing rollbacks',
      'Flags missing transactions and unsafe patterns',
      'Risk rating: Safe, Caution, or High Risk',
      '1 free scan included, unlimited with Pro',
    ],
    cta: 'Check Migration',
  },
  {
    name: 'Directory Extractor',
    tagline: 'Map any website\'s full URL structure from its sitemap in seconds.',
    description: 'Enter any domain and we fetch its sitemap.xml, parse every URL, and display a full tree structure. Export as JSON or CSV. Free, no login, no limits.',
    price: 'Free',
    priceSub: 'always',
    href: '/tools/directory-extractor',
    accent: 'rgb(236,72,153)',
    color: 'rgba(236,72,153,0.05)',
    border: 'rgba(236,72,153,0.18)',
    features: [
      'Fetches and parses sitemap.xml automatically',
      'Full tree view with expand and collapse',
      'Export as JSON or CSV',
      'Free with no login or limits',
    ],
    cta: 'Extract URLs',
  },
]

function ToolCard({ tool }: { tool: typeof AI_VISIBILITY_TOOLS[0] }) {
  return (
    <div
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
            <span className="text-sm font-bold text-white/40">
              {tool.price}{' '}
              <span className="text-white/25 font-normal">/ {tool.priceSub}</span>
            </span>
          </div>
          <h3 className="text-2xl lg:text-3xl font-black text-white mb-3">{tool.name}</h3>
          <p className="text-base text-white/65 leading-relaxed mb-3 max-w-xl">{tool.tagline}</p>
          <p className="text-sm text-white/45 leading-relaxed mb-6 max-w-xl">{tool.description}</p>
          <Link
            href={tool.href}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 24px rgba(6,182,212,0.3)' }}
          >
            {tool.cta}
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
  )
}

export default function ToolsPage() {
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
          Eight precision tools,{' '}
          <span style={{ color: '#06d6ff' }}>all live and free to start.</span>
        </h1>
        <p className="text-white/55 text-lg max-w-2xl leading-relaxed mb-6">
          Every Queldrex tool solves a specific problem. Try any of them free — pay only for the full report, Pro access, or ongoing monitoring.
        </p>
        <div className="flex flex-wrap items-center gap-6 text-sm text-white/35">
          <span><span className="text-cyan-400 font-bold">8</span> tools live today</span>
          <span>·</span>
          <span>Scanner is one-time $149 · Pro unlocks everything at $29/month</span>
        </div>
      </section>

      {/* AI VISIBILITY */}
      <section id="ai-visibility" className="max-w-7xl mx-auto px-6 pb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1" style={{ background: 'rgba(6,182,212,0.15)' }} />
          <p className="text-xs font-black uppercase tracking-[0.28em]" style={{ color: '#06d6ff' }}>AI Visibility</p>
          <div className="h-px flex-1" style={{ background: 'rgba(6,182,212,0.15)' }} />
        </div>
        <p className="text-sm text-white/45 max-w-2xl mb-6">
          Get found by ChatGPT, Perplexity, Claude, and Gemini. Track your score monthly. Run AI visibility audits for your agency clients.
        </p>
        {AI_VISIBILITY_TOOLS.map((tool) => (
          <ToolCard key={tool.name} tool={tool} />
        ))}
        <div className="mt-2 mb-8 rounded-xl border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.12)' }}>
          <div>
            <p className="text-sm font-bold text-white mb-0.5">AI Monitor</p>
            <p className="text-xs text-white/45">Monthly rescans on your domain with email alerts when your score drops. Included in Pro.</p>
          </div>
          <Link href="/monitor" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors whitespace-nowrap flex-shrink-0">
            Learn about Monitor →
          </Link>
        </div>
        <div className="rounded-xl border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.12)' }}>
          <div>
            <p className="text-sm font-bold text-white mb-0.5">Agency Plan — $99/month</p>
            <p className="text-xs text-white/45">25 client scans per month, white-label PDF reports with your branding, and a bulk client dashboard. Built for web agencies.</p>
          </div>
          <Link href="/agency" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors whitespace-nowrap flex-shrink-0">
            See Agency Plan →
          </Link>
        </div>
      </section>

      {/* SECURITY */}
      <section id="security" className="max-w-7xl mx-auto px-6 pb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1" style={{ background: 'rgba(245,158,11,0.15)' }} />
          <p className="text-xs font-black uppercase tracking-[0.28em]" style={{ color: 'rgb(245,158,11)' }}>Security</p>
          <div className="h-px flex-1" style={{ background: 'rgba(245,158,11,0.15)' }} />
        </div>
        <p className="text-sm text-white/45 max-w-2xl mb-6">
          Audit AI-generated code for vulnerabilities, check breach exposure, and monitor live global threat indicators.
        </p>
        {SECURITY_TOOLS.map((tool) => (
          <ToolCard key={tool.name} tool={tool} />
        ))}
      </section>

      {/* DEVELOPER TOOLS */}
      <section id="developer" className="max-w-7xl mx-auto px-6 pb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1" style={{ background: 'rgba(99,102,241,0.15)' }} />
          <p className="text-xs font-black uppercase tracking-[0.28em]" style={{ color: 'rgb(99,102,241)' }}>Developer Tools</p>
          <div className="h-px flex-1" style={{ background: 'rgba(99,102,241,0.15)' }} />
        </div>
        <p className="text-sm text-white/45 max-w-2xl mb-6">
          Catch breaking API changes, validate SQL migrations, and map site structures before they cause production problems.
        </p>
        {DEV_TOOLS.map((tool) => (
          <ToolCard key={tool.name} tool={tool} />
        ))}
      </section>

      {/* COMING NEXT */}
      <section className="max-w-7xl mx-auto px-6 pb-10">
        <div className="rounded-2xl border p-8 flex flex-col md:flex-row items-center justify-between gap-6" style={{ background: 'rgba(6,182,212,0.03)', borderColor: 'rgba(6,182,212,0.12)' }}>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-500 mb-2">On the Roadmap</p>
            <h3 className="text-xl font-black text-white mb-2">More tools in active development</h3>
            <p className="text-sm text-white/50 max-w-md">Competitor AI Visibility Gap, Bulk Agency Scanner, and Local Business AI Pack are in active development. See the full roadmap for timelines.</p>
          </div>
          <Link href="/roadmap" className="flex-shrink-0 text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors whitespace-nowrap">
            See full roadmap →
          </Link>
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
            <h3 className="text-2xl font-black text-white mb-2">Request a custom tool.</h3>
            <p className="text-white/50 text-sm max-w-md leading-relaxed">
              Have a specific problem that needs a purpose-built solution? Tell us what it is. We build tools on demand and prioritize based on what people actually need.
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
              Scan Your Site Free →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
