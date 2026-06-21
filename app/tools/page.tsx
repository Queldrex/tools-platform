﻿import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import GoProButton from '@/components/GoProButton'

export const metadata = {
  title: 'All Tools â€" Queldrex',
  description: 'Precision tools for AI visibility, security auditing, developer workflows, and business operations. Real data, real value. Free to start.',
}

interface Tool {
  name: string
  tagline: string
  price: string
  href: string
  badge?: string
  screenshot: string
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

const CATEGORIES: Category[] = [
  {
    id: 'ai-visibility',
    label: 'AI Visibility',
    accent: '#06d6ff',
    accentBg: 'rgba(6,214,255,0.07)',
    accentBorder: 'rgba(6,214,255,0.18)',
    description: 'Help AI systems find and cite your content. Track your score monthly.',
    icon: '',
    tools: [
      { name: 'AI Visibility Scanner', tagline: 'Scan 14 signals â€" find out if AI can discover your business', price: '$399 one-time', href: '/scanner', badge: 'Flagship', screenshot: 'scanner' },
      { name: 'Structured Data Validator', tagline: 'Crawl any URL and validate JSON-LD schema â€" see your AI visibility score instantly', price: 'Pro', href: '/tools/schema-validator', screenshot: 'schema-validator', badge: 'New' },
      { name: 'Schema Markup Generator', tagline: 'Generate JSON-LD schema markup for any business type', price: 'Free', href: '/tools/schema-generator', screenshot: 'schema-generator' },
      { name: 'robots.txt Generator', tagline: 'Control which AI crawlers can and can\'t access your site', price: 'Free', href: '/tools/robots-generator', screenshot: 'robots-generator' },
    ],
  },
  {
    id: 'security',
    label: 'Security',
    accent: '#f87171',
    accentBg: 'rgba(248,113,113,0.07)',
    accentBorder: 'rgba(248,113,113,0.18)',
    description: 'Find vulnerabilities before attackers do.',
    icon: '',
    tools: [
      { name: 'Vibe Coding Security Shield', tagline: 'Scan AI-generated code for OWASP vulnerabilities before they ship', price: 'Pro', href: '/tools/vibe-security', screenshot: 'vibe-security' },
      { name: 'API Schema Drift Scanner', tagline: 'Detect breaking changes between two OpenAPI specifications', price: 'Pro', href: '/tools/api-schema-drift', screenshot: 'api-schema-drift' },
      { name: 'Database Migration Safety Checker', tagline: 'Catch dangerous SQL migration patterns before running them', price: 'Pro', href: '/tools/database-migration', screenshot: 'database-migration' },
      { name: 'Contract Risk Scanner', tagline: 'AI finds one-sided IP grabs, bad non-competes, and liability traps', price: 'Pro', href: '/tools/contract-scanner', screenshot: 'contract-scanner', badge: 'New' },
      { name: 'Hallucinated Package Detector', tagline: 'Verify every npm or PyPI package AI suggested actually exists', price: 'Pro', href: '/tools/package-hallucination', screenshot: 'package-hallucination', badge: 'New' },
      { name: 'SSL/TLS Inspector', tagline: 'Full TLS handshake analysis â€" cert expiry, cipher grade, protocol version, security headers', price: 'Free', href: '/tools/ssl-inspector', screenshot: 'ssl-inspector', badge: 'New' },
      { name: 'Dependency CVE Scanner', tagline: 'Paste package.json or requirements.txt â€" get live CVEs from Google\'s OSV database instantly', price: 'Pro', href: '/tools/dep-scanner', screenshot: 'dep-scanner', badge: 'New' },
      { name: 'AI Prompt Injection Detector', tagline: 'Scan any AI prompt for injection attacks, jailbreaks, and prompt extraction attempts', price: 'Free', href: '/tools/prompt-injection', screenshot: 'prompt-injection', badge: 'New' },
      { name: 'Breach Lookup', tagline: 'Password breach check + domain security header audit', price: 'Free', href: '/tools/breach-lookup', screenshot: 'breach-lookup' },
      { name: 'Threat Intelligence Feed', tagline: 'Live malware URLs and botnet IPs from URLhaus + Feodo Tracker', price: 'Free', href: '/tools/threat-feed', screenshot: 'threat-feed' },
      { name: 'Password Generator', tagline: 'Cryptographically secure passwords via Web Crypto API', price: 'Free', href: '/tools/password-generator', screenshot: 'password-generator' },
      { name: 'Hash Generator', tagline: 'SHA-256, SHA-512, SHA-384, SHA-1 from text or any file', price: 'Free', href: '/tools/hash-generator', screenshot: 'hash-generator' },
    ],
  },
  {
    id: 'developer',
    label: 'Developer',
    accent: 'rgb(99,102,241)',
    accentBg: 'rgba(99,102,241,0.07)',
    accentBorder: 'rgba(99,102,241,0.18)',
    description: 'DNS, JWT, JSON, cron  -  utilities you reach for every week.',
    icon: '<//>',
    tools: [
      { name: 'JSON Formatter', tagline: 'Format and validate JSON with clear error messages', price: 'Free', href: '/tools/json-formatter', screenshot: 'json-formatter' },
      { name: 'JWT Decoder', tagline: 'Decode tokens â€" see header, payload, expiry, and all claims', price: 'Free', href: '/tools/jwt-decoder', screenshot: 'jwt-decoder' },
      { name: 'Base64 Encoder / Decoder', tagline: 'Encode or decode Base64 with full UTF-8 and emoji support', price: 'Free', href: '/tools/base64', screenshot: 'base64' },
      { name: 'Cron Expression Builder', tagline: 'Build cron schedules visually â€" or decode any expression', price: 'Free', href: '/tools/cron-builder', screenshot: 'cron-builder' },
      { name: 'Tech Stack Detector', tagline: 'Detect the framework, CMS, CDN, and analytics any site uses', price: 'Free', href: '/tools/tech-stack', screenshot: 'tech-stack' },
      { name: 'API Rate Limit Calculator', tagline: 'Know exactly when your API usage will hit limits', price: 'Free', href: '/tools/api-rate-limit', screenshot: 'api-rate-limit' },
      { name: 'Directory Extractor', tagline: 'Map any site\'s full URL structure from its sitemap', price: 'Free', href: '/tools/directory-extractor', screenshot: 'directory-extractor' },
      { name: 'DNS Health Checker', tagline: 'Live DNS lookup across Cloudflare + Google resolvers â€" A, MX, TXT, NS, CAA, propagation status', price: 'Free', href: '/tools/dns-health', screenshot: 'dns-health', badge: 'New' },
      { name: 'Email Deliverability Suite', tagline: 'SPF, DKIM, DMARC, MX validation + blacklist check â€" know if your email will reach inboxes', price: 'Free', href: '/tools/email-deliverability', screenshot: 'email-deliverability', badge: 'New' },
      { name: 'Privacy Policy Analyzer', tagline: 'Paste any privacy policy URL â€" get instant GDPR/CCPA compliance score and red flags', price: 'Pro', href: '/tools/privacy-analyzer', screenshot: 'privacy-analyzer', badge: 'New' },
    ],
  },
  {
    id: 'business',
    label: 'Business',
    accent: 'rgb(251,191,36)',
    accentBg: 'rgba(251,191,36,0.07)',
    accentBorder: 'rgba(251,191,36,0.18)',
    description: 'Finance, documents, and marketing tools for small teams.',
    icon: '',
    tools: [
      { name: 'Invoice Generator', tagline: 'Create professional invoices and save as PDF â€" no account needed', price: 'Free', href: '/tools/invoice-generator', screenshot: 'invoice-generator' },
      { name: 'URL Shortener', tagline: 'Shorten any URL to queldrex.com/s/ and track click counts', price: 'Free', href: '/tools/url-shortener', screenshot: 'url-shortener' },
      { name: 'Meeting Cost Calculator', tagline: 'See the real dollar cost of any meeting in real-time', price: 'Free', href: '/tools/meeting-cost', screenshot: 'meeting-cost' },
      { name: 'Uptime SLA Calculator', tagline: 'Translate uptime % to actual downtime hours and revenue impact', price: 'Free', href: '/tools/uptime-calculator', screenshot: 'uptime-calculator' },
      { name: 'Email Signature Generator', tagline: 'Build HTML email signatures for Gmail, Outlook, and Apple Mail', price: 'Free', href: '/tools/email-signature', screenshot: 'email-signature' },
      { name: 'Color Palette Generator', tagline: 'Generate complementary, analogous, and triadic color palettes', price: 'Free', href: '/tools/color-palette', screenshot: 'color-palette' },
      { name: 'GDPR / Privacy Policy Generator', tagline: 'Generate privacy policies, cookie banners, and DPAs', price: 'Free', href: '/tools/gdpr-generator', screenshot: 'gdpr-generator' },
      { name: 'Business Name Availability', tagline: 'Check domains (.com .io .co .ai) + Twitter, GitHub, LinkedIn handles â€" live results in seconds', price: 'Free', href: '/tools/business-name', screenshot: 'business-name', badge: 'New' },
      { name: 'SaaS Metrics Calculator', tagline: 'MRR, ARR, LTV, Churn, Quick Ratio, CAC Payback â€" all graded with industry benchmarks', price: 'Free', href: '/tools/saas-metrics', screenshot: 'saas-metrics', badge: 'New' },
      { name: 'Break-Even Calculator', tagline: 'Enter costs and price â€" know exactly how many units you need to sell to turn a profit', price: 'Free', href: '/tools/break-even', screenshot: 'break-even', badge: 'New' },
      { name: 'ROI Calculator', tagline: 'Calculate return on investment, payback period, and net profit across any time horizon', price: 'Free', href: '/tools/roi-calculator', screenshot: 'roi-calculator', badge: 'New' },
      { name: 'Cash Flow Forecaster', tagline: '12-month cash flow projection with burn rate, runway, and profitability month by month', price: 'Free', href: '/tools/cashflow', screenshot: 'cashflow', badge: 'New' },
      { name: 'NDA Generator', tagline: 'Generate mutual or one-way NDAs instantly â€" choose jurisdiction, term, and scope', price: 'Pro', href: '/tools/nda-generator', screenshot: 'nda-generator', badge: 'New' },
      { name: 'Terms of Service Generator', tagline: 'Generate a complete ToS for your SaaS or website â€" plain English, legally structured', price: 'Pro', href: '/tools/tos-generator', screenshot: 'tos-generator', badge: 'New' },
      { name: 'Refund Policy Generator', tagline: 'Create a clear refund policy that protects your business and satisfies customers', price: 'Pro', href: '/tools/refund-policy', screenshot: 'refund-policy', badge: 'New' },
      { name: 'Ad Copy Grader', tagline: 'Score your ad headline and copy â€" get clarity, hook strength, CTA, and A/B test variants', price: 'Free', href: '/tools/ad-grader', screenshot: 'ad-grader', badge: 'New' },
      { name: 'Email Subject Line Tester', tagline: 'Score any email subject line for open-rate potential, spam risk, and readability', price: 'Free', href: '/tools/subject-line', screenshot: 'subject-line', badge: 'New' },
      { name: 'Job Description Writer', tagline: 'Generate clear, bias-reduced job descriptions for any role â€" AI-assisted, instantly', price: 'Pro', href: '/tools/job-description', screenshot: 'job-description', badge: 'New' },
      { name: 'Proposal & Quote Generator', tagline: 'Generate a professional proposal for any project â€" scope, deliverables, timeline, pricing', price: 'Pro', href: '/tools/proposal-generator', screenshot: 'proposal-generator', badge: 'New' },
      { name: 'SaaS Spend Optimizer', tagline: 'Paste bank statement CSV to find all SaaS subscriptions and consolidation opportunities', price: 'Pro', href: '/tools/saas-spend', screenshot: 'saas-spend', badge: 'New' },
      { name: 'Invoice Fraud Detector', tagline: 'Scan any invoice for BEC fraud, round-number manipulation, and fake vendor patterns', price: 'Pro', href: '/tools/invoice-fraud', screenshot: 'invoice-fraud', badge: 'New' },
      { name: 'Agency Client Report Generator', tagline: 'Turn your metrics and wins into a polished monthly client report â€" AI-written in seconds', price: 'Pro', href: '/tools/agency-report', screenshot: 'agency-report', badge: 'New' },
    ],
  },
]


const PRICE_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  'Free': { color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' },
  'Pro': { color: 'rgb(251,191,36)', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)' },
  '$399 one-time': { color: '#06d6ff', bg: 'rgba(6,214,255,0.1)', border: 'rgba(6,214,255,0.2)' },
}

export default function ToolsPage() {
  const totalTools = CATEGORIES.reduce((sum, c) => sum + c.tools.length, 0)

  return (
    <div className="min-h-screen" style={{ background: '#09090B' }}>
      <Header />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-14 pb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase mb-5"
          style={{ borderColor: 'rgba(6,182,212,0.25)', background: 'rgba(6,182,212,0.08)', color: '#06d6ff' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Queldrex Tool Suite
        </div>
        <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-3" style={{ color: '#FAFAFA' }}>
          48 tools. Pick one.
        </h1>
        <p className="text-base max-w-2xl mb-8" style={{ color: '#A1A1AA' }}>
          Free tools need no account. Pro unlocks everything for $79/mo. SSL inspection, CVE scanning, NDA generators, cash flow forecasting  -  all real output, all live.
        </p>

        {/* Pricing summary bar */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl border" style={{ background: 'rgba(52,211,153,0.06)', borderColor: 'rgba(52,211,153,0.2)' }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold text-emerald-400">Free tier</span>
            <span className="text-xs text-white/40">on every tool · no account needed</span>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl border" style={{ background: 'rgba(109,40,217,0.06)', borderColor: 'rgba(109,40,217,0.2)' }}>
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-xs font-bold text-purple-400">Individual tools</span>
            <span className="text-xs text-white/40">from $9/month · pay for one</span>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl border" style={{ background: 'rgba(109,40,217,0.1)', borderColor: 'rgba(124,58,237,0.3)' }}>
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-xs font-bold text-purple-400">Pro  -  $79/mo</span>
            <span className="text-xs text-white/40">all {totalTools} tools unlimited</span>
          </div>
        </div>

        {/* Category nav pills */}
        <div className="flex flex-wrap gap-2 mb-2">
          {CATEGORIES.map(cat => (
            <a key={cat.id} href={`#${cat.id}`}
              className="text-xs font-bold px-4 py-1.5 rounded-full transition-all hover:scale-105"
              style={{ color: cat.accent, background: cat.accentBg, border: `1px solid ${cat.accentBorder}` }}>
              {cat.label} · {cat.tools.length}
            </a>
          ))}
          <a href="/tools/audit"
            className="text-xs font-bold px-4 py-1.5 rounded-full transition-all hover:scale-105 ml-2"
            style={{ color: '#34d399', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
            View Audit Report →
          </a>
        </div>
      </section>

      {/* Category sections */}
      {CATEGORIES.map(cat => (
        <section key={cat.id} id={cat.id} className="max-w-7xl mx-auto px-6 pb-14">
          {/* Section header */}
          <div className="flex items-center gap-4 mb-3">
            <div className="h-px flex-1" style={{ background: `${cat.accent}22` }} />
            <div className="flex items-center gap-2.5">
              <span className="text-base">{cat.icon}</span>
              <span className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: cat.accent }}>
                {cat.label}
              </span>
              <span className="text-[10px] font-bold text-white/20">{cat.tools.length} tools</span>
            </div>
            <div className="h-px flex-1" style={{ background: `${cat.accent}22` }} />
          </div>
          <p className="text-xs text-white/35 mb-6 text-center">{cat.description}</p>

          {/* Tool grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cat.tools.map(tool => {
              const priceStyle = PRICE_STYLES[tool.price] || PRICE_STYLES['Pro']
              return (
                <Link key={tool.name} href={tool.href}
                  className="group rounded-2xl border overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl cursor-pointer"
                  style={{ background: '#111318', borderColor: 'rgba(255,255,255,0.07)' }}>

                  {/* Screenshot preview */}
                  <div className="relative overflow-hidden" style={{ height: 160 }}>
                    <Image
                      src={`/tool-previews/${tool.screenshot}.png`}
                      alt={`${tool.name} screenshot`}
                      fill
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 transition-opacity duration-300"
                      style={{ background: 'linear-gradient(to bottom, rgba(13,17,23,0) 40%, rgba(13,17,23,0.95) 100%)' }} />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                      {tool.badge && (
                        <span className="text-[9px] font-black uppercase tracking-wider text-black px-2 py-0.5 rounded-full shadow-lg"
                          style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
                          {tool.badge}
                        </span>
                      )}
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-lg backdrop-blur-sm"
                        style={{ color: priceStyle.color, background: `rgba(13,17,23,0.8)`, border: `1px solid ${priceStyle.border}` }}>
                        {tool.price}
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors leading-snug">
                        {tool.name}
                      </h3>
                      <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-white/20 group-hover:text-white/60 transition-colors"
                        fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed mt-1">
                      {tool.tagline}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Pro upsell for security/AI sections */}
          {(cat.id === 'ai-visibility' || cat.id === 'security') && (
            <div className="mt-4 rounded-xl border p-4 flex items-center justify-between gap-4"
              style={{ background: `${cat.accentBg}`, borderColor: cat.accentBorder }}>
              <p className="text-xs text-white/50">
                Pro tools are unlimited at <span className="font-bold text-white/70">$79/month</span> â€" includes all tools + monthly AI visibility monitoring.
              </p>
              <GoProButton
                returnTo="/tools"
                className="text-xs font-bold flex-shrink-0 transition-colors hover:opacity-80 bg-transparent border-none p-0 cursor-pointer"
                style={{ color: cat.accent }}>
                Go Pro →
              </GoProButton>
            </div>
          )}
        </section>
      ))}

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="rounded-2xl border p-10 text-center"
          style={{ background: 'linear-gradient(135deg,rgba(6,214,255,0.05),rgba(8,145,178,0.03))', borderColor: 'rgba(6,214,255,0.15)' }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-3">Ready to get started?</p>
          <h2 className="text-3xl font-black text-white mb-3">Try any tool free. Upgrade when you need more.</h2>
          <p className="text-sm mb-8 max-w-lg mx-auto" style={{ color: '#A1A1AA' }}>
            Every tool has a free daily tier. No account, no email, no credit card. When you hit the limit, buy just that tool or get everything with Pro.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/tools#security"
              className="px-7 py-3.5 rounded-xl text-sm font-black text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 24px rgba(109,40,217,0.35)' }}>
              Browse Free Tools
            </Link>
            <GoProButton
              returnTo="/tools"
              className="px-7 py-3.5 rounded-xl text-sm font-black text-white transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
              Go Pro — $79/month
            </GoProButton>
            <Link href="/scanner"
              className="px-7 py-3.5 rounded-xl text-sm font-semibold border hover:border-white/20 hover:text-white transition-colors"
              style={{ color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.1)' }}>
              AI Visibility Scan  -  $399
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
