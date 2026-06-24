'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useMemo } from 'react'
import BundleButton from '@/components/BundleButton'
import GoProButton from '@/components/GoProButton'

interface Tool {
  name: string
  tagline: string
  price: string
  href: string
  badge?: string
  screenshot: string
  icon: string
}

interface Category {
  id: string
  label: string
  accent: string
  accentBg: string
  accentBorder: string
  description: string
  icon: string
  tools: Tool[]
}

const FEATURED_TOOLS = [
  { name: 'Contract Risk Scanner', tagline: 'Paste any contract. AI flags the clauses that could cost you money before you sign.', price: 49, href: '/tools/contract-scanner', screenshot: 'contract-scanner' },
  { name: 'Vibe Security Shield', tagline: "Your AI wrote that code. We check if it's safe to ship.", price: 49, href: '/tools/vibe-security', screenshot: 'vibe-security' },
  { name: 'Invoice Fraud Detector', tagline: 'Before you pay that invoice — check it for fraud. 25 red flags detected instantly.', price: 49, href: '/tools/invoice-fraud', screenshot: 'invoice-fraud' },
  { name: 'NDA Generator', tagline: 'Stop writing NDAs from scratch at 11pm. Done in 60 seconds, ready to send.', price: 29, href: '/tools/nda-generator', screenshot: 'nda-generator' },
  { name: 'Proposal Generator', tagline: 'Turn a client brief into a polished proposal in 90 seconds. Win more work.', price: 29, href: '/tools/proposal-generator', screenshot: 'proposal-generator' },
]

export const CATEGORIES: Category[] = [
  {
    id: 'ai-visibility',
    label: 'AI Visibility',
    accent: '#06d6ff',
    accentBg: 'rgba(6,214,255,0.07)',
    accentBorder: 'rgba(6,214,255,0.18)',
    description: 'Get found by AI chatbots and citation engines — not just Google.',
    icon: '',
    tools: [
      { name: 'AI Visibility Scanner', tagline: "Find out why AI chatbots aren't recommending your business — and get the exact fixes.", price: '$399 one-time', href: '/scanner', badge: 'Flagship', screenshot: 'scanner', icon: '🔍' },
      { name: 'Structured Data Validator', tagline: 'Know if your schema markup is actually helping AI find your business.', price: 'Pro', href: '/tools/schema-validator', screenshot: 'schema-validator', icon: '🏗️' },
      { name: 'Schema Markup Generator', tagline: 'Generate the schema markup Google and AI crawlers need to understand your site.', price: 'Free', href: '/tools/schema-generator', screenshot: 'schema-generator', icon: '🏷️' },
      { name: 'robots.txt Generator', tagline: 'Control what AI bots can see on your site — one click, done.', price: 'Free', href: '/tools/robots-generator', screenshot: 'robots-generator', icon: '🤖' },
    ],
  },
  {
    id: 'security',
    label: 'Security',
    accent: '#f87171',
    accentBg: 'rgba(248,113,113,0.07)',
    accentBorder: 'rgba(248,113,113,0.18)',
    description: 'Find vulnerabilities before attackers do — no setup, no CLI, no account.',
    icon: '',
    tools: [
      { name: 'Vibe Coding Security Shield', tagline: "Your AI wrote that code. We check if it's safe to ship.", price: 'Pro', href: '/tools/vibe-security', screenshot: 'vibe-security', badge: 'Popular', icon: '🛡️' },
      { name: 'API Schema Drift Scanner', tagline: 'Catch breaking API changes before your users do.', price: 'Pro', href: '/tools/api-schema-drift', screenshot: 'api-schema-drift', icon: '🔀' },
      { name: 'Database Migration Safety Checker', tagline: 'Know if your migration will lock the table before you run it on production.', price: 'Pro', href: '/tools/database-migration', screenshot: 'database-migration', icon: '💾' },
      { name: 'Contract Risk Scanner', tagline: 'Paste any contract. AI flags the clauses that could cost you money before you sign.', price: 'Pro', href: '/tools/contract-scanner', screenshot: 'contract-scanner', badge: 'Popular', icon: '⚖️' },
      { name: 'Hallucinated Package Detector', tagline: 'Before you install: check if that AI-suggested package is real or a hallucination.', price: 'Pro', href: '/tools/package-hallucination', screenshot: 'package-hallucination', icon: '👻' },
      { name: 'SSL/TLS Inspector', tagline: 'Know your SSL grade, cert expiry, and security headers in one scan.', price: 'Free', href: '/tools/ssl-inspector', screenshot: 'ssl-inspector', icon: '🔐' },
      { name: 'Dependency CVE Scanner', tagline: 'Paste your package.json. Know which dependencies are actively exploited.', price: 'Pro', href: '/tools/dep-scanner', screenshot: 'dep-scanner', icon: '🦠' },
      { name: 'AI Prompt Injection Detector', tagline: 'Check if your AI prompt can be hijacked before it goes live.', price: 'Free', href: '/tools/prompt-injection', screenshot: 'prompt-injection', icon: '💉' },
      { name: 'Breach Lookup', tagline: 'Check if your password or email appeared in a data breach.', price: 'Free', href: '/tools/breach-lookup', screenshot: 'breach-lookup', icon: '🔓' },
      { name: 'Threat Intelligence Feed', tagline: 'Live feed of active malware domains and botnet IPs — updated hourly.', price: 'Free', href: '/tools/threat-feed', screenshot: 'threat-feed', icon: '⚡' },
      { name: 'Password Generator', tagline: 'Generate cryptographically secure passwords — in your browser, never sent anywhere.', price: 'Free', href: '/tools/password-generator', screenshot: 'password-generator', icon: '🔑' },
      { name: 'Hash Generator', tagline: 'Hash any text or file — SHA-256, SHA-512, SHA-384, SHA-1 instantly.', price: 'Free', href: '/tools/hash-generator', screenshot: 'hash-generator', icon: '#️⃣' },
    ],
  },
  {
    id: 'developer',
    label: 'Developer',
    accent: 'rgb(99,102,241)',
    accentBg: 'rgba(99,102,241,0.07)',
    accentBorder: 'rgba(99,102,241,0.18)',
    description: 'DNS, JWT, JSON, cron — utilities you reach for every week, instant results.',
    icon: '<//>',
    tools: [
      { name: 'JSON Formatter', tagline: "Paste broken JSON. Get clean JSON — with the exact error if it's invalid.", price: 'Free', href: '/tools/json-formatter', screenshot: 'json-formatter', badge: 'Popular', icon: '{ }' },
      { name: 'JWT Decoder', tagline: 'Paste a JWT. See everything inside it — header, payload, expiry, all claims.', price: 'Free', href: '/tools/jwt-decoder', screenshot: 'jwt-decoder', icon: '🎫' },
      { name: 'Base64 Encoder / Decoder', tagline: 'Encode or decode Base64 instantly — URL-safe variant, file support included.', price: 'Free', href: '/tools/base64', screenshot: 'base64', icon: '⌨️' },
      { name: 'Cron Expression Builder', tagline: 'Build cron schedules visually. Paste any expression to see when it next fires.', price: 'Free', href: '/tools/cron-builder', screenshot: 'cron-builder', icon: '⏰' },
      { name: 'Tech Stack Detector', tagline: 'Detect the exact tech stack any site runs — framework, CDN, analytics.', price: 'Free', href: '/tools/tech-stack', screenshot: 'tech-stack', icon: '🔧' },
      { name: 'API Rate Limit Calculator', tagline: 'Calculate exactly when your API calls will hit rate limits before you hit them.', price: 'Free', href: '/tools/api-rate-limit', screenshot: 'api-rate-limit', icon: '📊' },
      { name: 'Directory Extractor', tagline: "Map any site's full URL structure from its sitemap in seconds.", price: 'Free', href: '/tools/directory-extractor', screenshot: 'directory-extractor', icon: '🗂️' },
      { name: 'DNS Health Checker', tagline: 'Find out why your email is bouncing or your site is unreachable — DNS explained.', price: 'Free', href: '/tools/dns-health', screenshot: 'dns-health', badge: 'Popular', icon: '🌐' },
      { name: 'Email Deliverability Suite', tagline: 'Find out why your emails land in spam — SPF, DKIM, DMARC checked instantly.', price: 'Free', href: '/tools/email-deliverability', screenshot: 'email-deliverability', icon: '📧' },
      { name: 'Privacy Policy Analyzer', tagline: "Before signing up — know what a company's privacy policy actually does with your data.", price: 'Pro', href: '/tools/privacy-analyzer', screenshot: 'privacy-analyzer', icon: '🕵️' },
      { name: 'HTTP Header Inspector', tagline: "Audit any site's security headers — find missing CSP, HSTS, and CORS issues.", price: 'Free', href: '/tools/http-headers', screenshot: 'http-headers', icon: '📡' },
    ],
  },
  {
    id: 'business',
    label: 'Business',
    accent: 'rgb(251,191,36)',
    accentBg: 'rgba(251,191,36,0.07)',
    accentBorder: 'rgba(251,191,36,0.18)',
    description: 'Finance, legal docs, and marketing tools for teams of one.',
    icon: '',
    tools: [
      { name: 'Invoice Generator', tagline: 'Create a professional invoice and download it as PDF — no signup, no software.', price: 'Free', href: '/tools/invoice-generator', screenshot: 'invoice-generator', icon: '🧾' },
      { name: 'URL Shortener', tagline: 'Shorten any URL and track how many times it gets clicked — no account.', price: 'Free', href: '/tools/url-shortener', screenshot: 'url-shortener', icon: '🔗' },
      { name: 'Meeting Cost Calculator', tagline: 'Your 10-person meeting costs $400/hour. Watch the number tick up live.', price: 'Free', href: '/tools/meeting-cost', screenshot: 'meeting-cost', icon: '💰' },
      { name: 'Uptime SLA Calculator', tagline: "Turn '99.9% uptime' into actual hours of downtime and revenue lost.", price: 'Free', href: '/tools/uptime-calculator', screenshot: 'uptime-calculator', icon: '⏱️' },
      { name: 'Email Signature Generator', tagline: 'Build a professional email signature that works in Gmail, Outlook, and Apple Mail.', price: 'Free', href: '/tools/email-signature', screenshot: 'email-signature', icon: '✍️' },
      { name: 'Color Palette Generator', tagline: 'Generate color palettes with WCAG contrast scores — copy Tailwind or HEX instantly.', price: 'Free', href: '/tools/color-palette', screenshot: 'color-palette', icon: '🎨' },
      { name: 'GDPR / Privacy Policy Generator', tagline: 'Generate a GDPR-compliant privacy policy for your SaaS in under 2 minutes.', price: 'Free', href: '/tools/gdpr-generator', screenshot: 'gdpr-generator', icon: '⚖️' },
      { name: 'Business Name Availability', tagline: 'Check if your business name is taken — domains and social handles, live results.', price: 'Free', href: '/tools/business-name', screenshot: 'business-name', icon: '🏢' },
      { name: 'SaaS Metrics Calculator', tagline: 'Calculate MRR, LTV, churn, and CAC — graded against industry benchmarks.', price: 'Free', href: '/tools/saas-metrics', screenshot: 'saas-metrics', icon: '📈' },
      { name: 'Break-Even Calculator', tagline: 'Know exactly how many sales you need before you start making money.', price: 'Free', href: '/tools/break-even', screenshot: 'break-even', icon: '➗' },
      { name: 'ROI Calculator', tagline: 'Calculate ROI, payback period, and net profit for any investment.', price: 'Free', href: '/tools/roi-calculator', screenshot: 'roi-calculator', icon: '💹' },
      { name: 'Cash Flow Forecaster', tagline: 'Project your runway and see exactly which month you run out of cash.', price: 'Free', href: '/tools/cashflow', screenshot: 'cashflow', icon: '💸' },
      { name: 'NDA Generator', tagline: 'Stop writing NDAs from scratch at 11pm. Done in 60 seconds, ready to send.', price: 'Pro', href: '/tools/nda-generator', screenshot: 'nda-generator', badge: 'Popular', icon: '🤝' },
      { name: 'Terms of Service Generator', tagline: 'Generate a complete Terms of Service for your SaaS — plain English, legally structured.', price: 'Pro', href: '/tools/tos-generator', screenshot: 'tos-generator', icon: '📋' },
      { name: 'Refund Policy Generator', tagline: 'Write a refund policy that protects your business and actually satisfies customers.', price: 'Pro', href: '/tools/refund-policy', screenshot: 'refund-policy', icon: '↩️' },
      { name: 'Ad Copy Grader', tagline: 'Score your ad copy before spending money on it. Get a better version in seconds.', price: 'Free', href: '/tools/ad-grader', screenshot: 'ad-grader', icon: '📢' },
      { name: 'Email Subject Line Tester', tagline: 'Know if your email subject line will get opened or ignored — before you send.', price: 'Free', href: '/tools/subject-line', screenshot: 'subject-line', icon: '✉️' },
      { name: 'Job Description Writer', tagline: 'Write a clear, bias-reduced job description for any role in under 60 seconds.', price: 'Pro', href: '/tools/job-description', screenshot: 'job-description', icon: '👔' },
      { name: 'Proposal & Quote Generator', tagline: 'Turn a client brief into a polished proposal in 90 seconds. Win more work.', price: 'Pro', href: '/tools/proposal-generator', screenshot: 'proposal-generator', badge: 'Popular', icon: '💼' },
      { name: 'SaaS Spend Optimizer', tagline: "Upload your bank statement. Find the subscriptions you forgot you're paying for.", price: 'Pro', href: '/tools/saas-spend', screenshot: 'saas-spend', icon: '💳' },
      { name: 'Invoice Fraud Detector', tagline: 'Before you pay that invoice — check it for fraud. 25 red flags detected instantly.', price: 'Pro', href: '/tools/invoice-fraud', screenshot: 'invoice-fraud', badge: 'Popular', icon: '🚨' },
      { name: 'Agency Client Report Generator', tagline: "Your client wants a report by Monday. Here's one in 30 seconds.", price: 'Pro', href: '/tools/agency-report', screenshot: 'agency-report', badge: 'Popular', icon: '📑' },
      { name: 'OG Tag Previewer', tagline: 'See exactly how your page looks when shared on Twitter, LinkedIn, and iMessage.', price: 'Free', href: '/tools/og-previewer', screenshot: 'og-previewer', icon: '🖼️' },
      { name: 'Webhook Tester', tagline: 'Get an instant webhook endpoint and inspect live payloads in real-time.', price: 'Free', href: '/tools/webhook-tester', screenshot: 'webhook-tester', icon: '🪝' },
    ],
  },
]

interface ToolsClientProps {
  categories: Category[]
}

export default function ToolsClient({ categories }: ToolsClientProps) {
  const [search, setSearch] = useState('')

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories
    const q = search.toLowerCase()
    return categories.map(cat => ({
      ...cat,
      tools: cat.tools.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q)
      ),
    })).filter(cat => cat.tools.length > 0)
  }, [search, categories])

  const filteredCount = filteredCategories.reduce((s, c) => s + c.tools.length, 0)

  return (
    <>
      {/* Hero + Search */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] mb-4" style={{ color: 'rgba(255,255,255,0.18)' }}>
          Queldrex Tool Suite
        </p>
        <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-3" style={{ color: '#FAFAFA', letterSpacing: '-0.02em' }}>
          51 tools. Find yours.
        </h1>
        <p className="text-base max-w-lg mb-8" style={{ color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>
          Every tool is free to try — no account, no card. Premium tools start at $15, pay once, use forever.
        </p>

        <div className="relative max-w-xl mb-4">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'rgba(255,255,255,0.25)' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search 51 tools — try 'NDA', 'DNS', 'invoice'…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm outline-none placeholder:text-white/20"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#fff', backdropFilter: 'blur(8px)' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>
        {search && (
          <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {filteredCount} tool{filteredCount !== 1 ? 's' : ''} found for &quot;{search}&quot;
          </p>
        )}
      </section>

      {/* Featured tools — hidden while searching */}
      {!search && (
        <section className="max-w-7xl mx-auto px-6 pb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Popular paid tools
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {FEATURED_TOOLS.map(tool => (
              <Link
                key={tool.name}
                href={tool.href}
                className="group rounded-2xl border overflow-hidden transition-all hover:scale-[1.02] hover:border-white/[0.16]"
                style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}
              >
                <div className="relative overflow-hidden" style={{ height: 120 }}>
                  <Image
                    src={`/tool-previews/${tool.screenshot}.png`}
                    alt={tool.name}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 20vw"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 20%, rgba(13,17,23,0.95) 100%)' }} />
                  <div className="absolute bottom-2 left-3">
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-black" style={{ background: 'linear-gradient(135deg,#a78bfa,#7c3aed)' }}>
                      ${tool.price} one-time
                    </span>
                  </div>
                </div>
                <div className="p-3.5">
                  <h3 className="text-xs font-black text-white group-hover:text-purple-400 transition-colors leading-snug mb-1">
                    {tool.name}
                  </h3>
                  <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {tool.tagline}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Sticky category nav — hidden while searching */}
      {!search && (
        <div
          className="sticky top-16 z-30 mb-8"
          style={{ background: 'rgba(9,9,11,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none">
            {categories.map(cat => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="text-[11px] font-bold px-3.5 py-1.5 rounded-full flex-shrink-0 transition-all hover:scale-105"
                style={{ color: cat.accent, background: cat.accentBg, border: `1px solid ${cat.accentBorder}` }}
              >
                {cat.label} · {cat.tools.length}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Category sections */}
      <div className="max-w-7xl mx-auto px-6">
        {filteredCategories.map(cat => (
          <section key={cat.id} id={cat.id} className="pb-16">
            {!search && (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: cat.accent }}>
                    {cat.label}
                  </span>
                  <div className="h-px flex-1" style={{ background: cat.accentBorder }} />
                  <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>{cat.tools.length} tools</span>
                </div>
                <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.28)' }}>{cat.description}</p>
              </>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
              {cat.tools.map(tool => (
                <Link
                  key={tool.name}
                  href={tool.href}
                  className="group flex items-start gap-3 p-3.5 rounded-xl border transition-all hover:border-white/[0.14] hover:bg-white/[0.02]"
                  style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-base"
                    style={{ background: cat.accentBg, border: `1px solid ${cat.accentBorder}` }}
                  >
                    {tool.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px] font-bold text-white group-hover:text-purple-400 transition-colors leading-snug">
                        {tool.name}
                      </span>
                      {tool.badge === 'Popular' && (
                        <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full flex-shrink-0 text-black" style={{ background: 'linear-gradient(135deg,#a78bfa,#7c3aed)' }}>
                          Popular
                        </span>
                      )}
                      {tool.badge === 'Flagship' && (
                        <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full flex-shrink-0 text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
                          Flagship
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed line-clamp-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {tool.tagline}
                    </p>
                  </div>
                  <svg className="w-3.5 h-3.5 flex-shrink-0 mt-1 transition-colors text-white/15 group-hover:text-white/45" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="rounded-2xl border p-10 text-center" style={{ background: 'rgba(124,58,237,0.05)', borderColor: 'rgba(124,58,237,0.15)' }}>
          <h2 className="text-2xl font-black mb-2" style={{ color: '#FAFAFA' }}>Want everything?</h2>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
            $149 one-time unlocks all paid tools forever. Or go Pro for $79/mo and every future tool auto-included.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <BundleButton
              className="px-7 py-3.5 rounded-xl text-sm font-black text-white transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', boxShadow: '0 0 24px rgba(124,58,237,0.3)' }}
            >
              All tools — $149 one-time
            </BundleButton>
            <GoProButton
              returnTo="/tools"
              className="px-7 py-3.5 rounded-xl text-sm font-black transition-all border"
              style={{ color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.12)', background: 'transparent' }}
            >
              Go Pro · $79/mo
            </GoProButton>
          </div>
        </div>
      </section>
    </>
  )
}
