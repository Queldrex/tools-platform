import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Portfolio — What We\'ve Built | Queldrex',
  description: 'Every tool on queldrex.com was designed, engineered, and deployed by Queldrex. See our work — SaaS platforms, security tools, admin systems, and subscription infrastructure.',
  alternates: { canonical: 'https://queldrex.com/portfolio' },
  openGraph: {
    title: 'Portfolio — What We\'ve Built | Queldrex',
    description: 'Every tool on queldrex.com was designed, engineered, and deployed by Queldrex.',
    url: 'https://queldrex.com/portfolio',
    siteName: 'Queldrex',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Portfolio — What We\'ve Built | Queldrex',
    description: 'Every tool on queldrex.com was designed, engineered, and deployed by Queldrex.',
  },
}

const PROJECTS = [
  {
    name: 'AI Visibility Scanner Platform',
    type: 'Full-Stack SaaS Product',
    stack: ['Next.js 16', 'TypeScript', 'Redis/Upstash', 'Stripe', 'Resend'],
    desc: 'A 14-signal automated scanner that checks how visible any business is to ChatGPT, Perplexity, Google AI, and other AI search engines. Includes Stripe checkout, HTML report generation, email delivery, and a full admin triage system.',
    highlights: [
      'Scan completes in under 30 seconds, report delivered within minutes',
      'Dynamic OG image generation — every result is shareable on Twitter/LinkedIn',
      'Full admin panel with TOTP 2FA, IP lockout, and attack alerting',
    ],
    href: 'https://queldrex.com/scanner',
    color: 'rgba(6,182,212,0.06)',
    border: 'rgba(6,182,212,0.2)',
    accent: '#06d6ff',
    mock: (
      <div style={{ background: '#0d1117', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(239,68,68,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>sunrise-plumbing.com</span>
          <span style={{ fontSize: 9, fontWeight: 800, color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 99, padding: '2px 8px', letterSpacing: '0.1em' }}>CRITICAL</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 36, fontWeight: 900, color: '#ef4444', lineHeight: 1 }}>35</span>
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.2)', paddingBottom: 4 }}>/100</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {[['llms.txt', false], ['Schema.org', false], ['robots.txt', true]].map(([label, pass]) => (
            <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>{String(label)}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: pass ? '#4ade80' : '#f87171' }}>{pass ? '✓ Pass' : '✗ Fail'}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    name: 'AI Visibility Monitor + Subscription System',
    type: 'Subscription SaaS',
    stack: ['Next.js 16', 'Stripe Webhooks', 'Redis', 'Resend', 'Cron Jobs'],
    desc: 'A $79/month recurring subscription product with magic-link authentication, monthly automated rescans via Vercel cron, score history tracking, and email alerts when scores drop more than 5 points.',
    highlights: [
      'Full Stripe webhook integration — checkout, cancellation, payment failure handling',
      'Passwordless auth: magic links with 15-minute expiry, one-time use tokens',
      'Automated cron jobs rescan all active monitors monthly and email alerts',
    ],
    href: 'https://queldrex.com/monitor',
    color: 'rgba(99,102,241,0.05)',
    border: 'rgba(99,102,241,0.18)',
    accent: 'rgb(99,102,241)',
    mock: (
      <div style={{ background: '#0d1117', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgb(99,102,241)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Monitor Active</span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>$79/mo</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[['Jan', 52], ['Feb', 61], ['Mar', 67], ['Apr', 74]].map(([month, score]) => (
            <div key={String(month)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', width: 24 }}>{String(month)}</span>
              <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 99 }}>
                <div style={{ width: `${Number(score)}%`, height: '100%', background: 'rgb(99,102,241)', borderRadius: 99 }} />
              </div>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', width: 20 }}>{String(score)}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    name: 'Agency Multi-Client Dashboard',
    type: 'B2B SaaS Dashboard',
    stack: ['Next.js 16', 'Redis', 'Stripe', 'TypeScript'],
    desc: 'A $199/month agency product where users manage AI visibility scanning for up to 25 client domains from a single dashboard. White-label HTML reports let agencies deliver branded results directly to their clients.',
    highlights: [
      'Magic-link authentication — no passwords, no OAuth complexity',
      'Quota system: 25 scans/month with real-time usage tracking per agency',
      'White-label output — client-facing reports never show Queldrex branding',
    ],
    href: 'https://queldrex.com/agency',
    color: 'rgba(16,185,129,0.05)',
    border: 'rgba(16,185,129,0.18)',
    accent: '#10b981',
    mock: (
      <div style={{ background: '#0d1117', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(16,185,129,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Agency Dashboard</span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>8 / 25 scans</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {[['client-a.com', 82, 'A'], ['client-b.com', 61, 'C'], ['client-c.com', 44, 'D']].map(([d, s, g]) => (
            <div key={String(d)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>{String(d)}</span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{String(s)}</span>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#10b981', background: 'rgba(16,185,129,0.1)', borderRadius: 4, padding: '1px 5px' }}>{String(g)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    name: 'Security Tool Suite (3 Tools)',
    type: 'Developer Tools',
    stack: ['Next.js 16', 'TypeScript', 'OWASP Patterns', 'OpenAPI Parser'],
    desc: 'Three real-data security analysis tools: Vibe Coding Security Shield (14 OWASP Top 10 pattern checks on AI-generated code), API Schema Drift Scanner (OpenAPI spec comparison), and Database Migration Safety Checker (SQL risk analysis with line-level findings).',
    highlights: [
      'Zero external API dependencies — all analysis runs server-side in pure TypeScript',
      'Line-number accurate findings with code snippets for every detected issue',
      'Severity scoring: Critical / High / Medium / Low with remediation guidance',
    ],
    href: 'https://queldrex.com/tools',
    color: 'rgba(245,158,11,0.05)',
    border: 'rgba(245,158,11,0.18)',
    accent: '#f59e0b',
    mock: (
      <div style={{ background: '#0d1117', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(245,158,11,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Security Scan</span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>Score: 58/100</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {[['SQL Injection', 'CRITICAL', '#ef4444'], ['XSS Risk', 'HIGH', '#f97316'], ['CORS Config', 'MEDIUM', '#f59e0b']].map(([name, sev, color]) => (
            <div key={String(name)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>{String(name)}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: String(color) }}>{String(sev)}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    name: 'Real-Time Threat Intelligence Feed',
    type: 'Security Data Tool',
    stack: ['Next.js 16', 'URLhaus API', 'Feodo Tracker', 'TypeScript'],
    desc: 'Live cyber threat intelligence sourced from URLhaus and Feodo Tracker — two of the most trusted public threat feeds. No API keys required. Parses, normalizes, and displays threat indicators in real time.',
    highlights: [
      'No API subscription required — uses public free threat intelligence sources',
      'Real-time feed: malware URLs, C2 botnet IPs, threat types, confidence scores',
      'First 10 entries free, gated behind Pro plan for full access',
    ],
    href: 'https://queldrex.com/tools/threat-feed',
    color: 'rgba(239,68,68,0.05)',
    border: 'rgba(239,68,68,0.18)',
    accent: '#ef4444',
    mock: (
      <div style={{ background: '#0d1117', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(239,68,68,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Live Threats</span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>↻ Live</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {[['185.220.x.x', 'C2 Botnet', 'Emotet'], ['malware.net/d', 'Malware URL', 'Loader'], ['91.108.x.x', 'C2 Botnet', 'Qakbot']].map(([ip, type, family]) => (
            <div key={String(ip)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{String(ip)}</span>
              <span style={{ fontSize: 9, color: '#ef4444' }}>{String(family)}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    name: 'Admin Triage System with 2FA',
    type: 'Internal Admin Tool',
    stack: ['Next.js 16', 'Redis', 'TOTP (custom)', 'AES-256-GCM'],
    desc: 'A full-featured admin panel managing incoming scan requests, DFY applications, feedback, build requests, and tool requests. Built with zero third-party auth dependencies — TOTP is a pure TypeScript implementation, session tokens stored in Redis with 4-hour TTL.',
    highlights: [
      'Pure TOTP implementation — no library, no vendor dependency',
      'AES-256-GCM credential encryption with per-record IVs',
      'IP lockout after 5 failed login attempts, with email attack alerting at 3',
    ],
    href: null,
    color: 'rgba(148,163,184,0.04)',
    border: 'rgba(148,163,184,0.14)',
    accent: 'rgba(148,163,184,0.8)',
    mock: (
      <div style={{ background: '#0d1117', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Admin Panel</span>
          <span style={{ fontSize: 9, color: '#4ade80' }}>● Authenticated</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {[['Scans', '12 pending'], ['Build Requests', '3 new'], ['Feedback', '7 unread']].map(([label, val]) => (
            <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{String(label)}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{String(val)}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
]

export default function PortfolioPage() {
  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-12">
        <div className="max-w-2xl">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase mb-8"
            style={{ borderColor: 'rgba(6,182,212,0.25)', background: 'rgba(6,182,212,0.08)', color: '#06d6ff' }}
          >
            Portfolio
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white leading-[1.08] tracking-tight mb-5">
            What We&apos;ve Built
          </h1>
          <p className="text-lg text-white/60 leading-relaxed mb-3">
            Every tool on queldrex.com was designed, engineered, and deployed by Queldrex. This is what we build for clients.
          </p>
          <p className="text-base text-white/40 leading-relaxed">
            Six live systems — SaaS products, subscription infrastructure, security tools, admin panels. All built in TypeScript on Next.js 16, deployed on Vercel, with Redis, Stripe, and Resend.
          </p>
        </div>
      </section>

      {/* PROJECTS GRID */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid lg:grid-cols-2 gap-6">
          {PROJECTS.map((project) => (
            <div
              key={project.name}
              className="rounded-2xl border p-7 flex flex-col gap-5"
              style={{ background: project.color, borderColor: project.border }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span
                    className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border mb-2"
                    style={{ color: project.accent, borderColor: `${project.accent}40`, background: `${project.accent}10` }}
                  >
                    {project.type}
                  </span>
                  <h2 className="text-base font-black text-white leading-snug">{project.name}</h2>
                </div>
                {project.href && (
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-xs font-bold transition-opacity hover:opacity-80 whitespace-nowrap"
                    style={{ color: project.accent }}
                  >
                    View live →
                  </a>
                )}
              </div>

              {/* Mock UI */}
              <div>{project.mock}</div>

              {/* Stack tags */}
              <div className="flex flex-wrap gap-1.5">
                {project.stack.map((s) => (
                  <span
                    key={s}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-sm text-white/55 leading-relaxed">{project.desc}</p>

              {/* Highlights */}
              <ul className="space-y-2">
                {project.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5 text-sm text-white/65">
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: project.accent }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* HOW WE BUILD */}
      <section className="border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/25 mb-3">Our Standards</p>
            <h2 className="text-2xl font-black text-white mb-2">How we build everything.</h2>
            <p className="text-white/40 text-sm max-w-xl mx-auto">The same standards we apply to every Queldrex product — applied to every client build.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'TypeScript only', desc: 'Every project is fully typed. No JavaScript drift, no runtime surprises.' },
              { label: 'Zero fake data', desc: 'All tools and systems use real APIs and real data. Nothing is mocked in production.' },
              { label: 'You own the code', desc: 'Full source delivery. Deploy anywhere. No vendor lock-in, ever.' },
              { label: 'Vercel-native', desc: 'Next.js App Router on Vercel with Redis, Stripe, and Resend as needed. Fast, scalable, no ops overhead.' },
            ].map(item => (
              <div key={item.label} className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="w-4 h-0.5 rounded-full mb-3 bg-cyan-400/50" />
                <p className="text-sm font-black text-white mb-1.5">{item.label}</p>
                <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES CTA */}
      <section className="border-t border-white/5 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ready to build something like this?</h2>
          <p className="text-white/55 text-base mb-3">
            Custom tools · Automation systems · AI integrations · SaaS products · Internal dashboards
          </p>
          <p className="text-white/35 text-sm mb-10">
            Fixed-price projects. Fast turnaround. No agency overhead.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/services"
              className="flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.03]"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 28px rgba(6,182,212,0.3)' }}
            >
              Get a Quote
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a
              href="mailto:hello@queldrex.com?subject=Custom Build Inquiry"
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              Or email hello@queldrex.com with what you have in mind
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
