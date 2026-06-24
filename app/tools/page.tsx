import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import GoProButton from '@/components/GoProButton'
import RequestToolForm from '@/components/RequestToolForm'

export const metadata = {
  title: 'All Tools | Queldrex',
  description: 'Security scanning, DNS health, legal documents, and business analytics. 51 professional tools, free to start, no account required.',
  alternates: { canonical: 'https://queldrex.com/tools' },
  openGraph: {
    title: '51 Free Developer & Business Tools | Queldrex',
    description: 'Security scanning, DNS health, legal documents, and business analytics. Free to start, no account required.',
    url: 'https://queldrex.com/tools',
    siteName: 'Queldrex',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: '51 Free Developer & Business Tools | Queldrex',
    description: 'Security scanning, DNS health, legal documents, and business analytics. Free to start, no account required.',
  },
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
    description: 'Get found by AI chatbots and citation engines — not just Google.',
    icon: '',
    tools: [
      { name: 'AI Visibility Scanner', tagline: 'Find out why AI chatbots aren\'t recommending your business — and get the exact fixes.', price: '$399 one-time', href: '/scanner', badge: 'Flagship', screenshot: 'scanner' },
      { name: 'Structured Data Validator', tagline: 'Know if your schema markup is actually helping AI find your business.', price: 'Pro', href: '/tools/schema-validator', screenshot: 'schema-validator', badge: 'New' },
      { name: 'Schema Markup Generator', tagline: 'Generate the schema markup Google and AI crawlers need to understand your site.', price: 'Free', href: '/tools/schema-generator', screenshot: 'schema-generator' },
      { name: 'robots.txt Generator', tagline: 'Control what AI bots can see on your site — one click, done.', price: 'Free', href: '/tools/robots-generator', screenshot: 'robots-generator' },
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
      { name: 'Vibe Coding Security Shield', tagline: 'Your AI wrote that code. We check if it\'s safe to ship.', price: 'Pro', href: '/tools/vibe-security', screenshot: 'vibe-security' },
      { name: 'API Schema Drift Scanner', tagline: 'Catch breaking API changes before your users do.', price: 'Pro', href: '/tools/api-schema-drift', screenshot: 'api-schema-drift' },
      { name: 'Database Migration Safety Checker', tagline: 'Know if your migration will lock the table before you run it on production.', price: 'Pro', href: '/tools/database-migration', screenshot: 'database-migration' },
      { name: 'Contract Risk Scanner', tagline: 'Paste any contract. AI flags the clauses that could cost you money before you sign.', price: 'Pro', href: '/tools/contract-scanner', screenshot: 'contract-scanner', badge: 'New' },
      { name: 'Hallucinated Package Detector', tagline: 'Before you install: check if that AI-suggested package is real or a hallucination.', price: 'Pro', href: '/tools/package-hallucination', screenshot: 'package-hallucination', badge: 'New' },
      { name: 'SSL/TLS Inspector', tagline: 'Know your SSL grade, cert expiry, and security headers in one scan.', price: 'Free', href: '/tools/ssl-inspector', screenshot: 'ssl-inspector', badge: 'New' },
      { name: 'Dependency CVE Scanner', tagline: 'Paste your package.json. Know which dependencies are actively exploited.', price: 'Pro', href: '/tools/dep-scanner', screenshot: 'dep-scanner', badge: 'New' },
      { name: 'AI Prompt Injection Detector', tagline: 'Check if your AI prompt can be hijacked before it goes live.', price: 'Free', href: '/tools/prompt-injection', screenshot: 'prompt-injection', badge: 'New' },
      { name: 'Breach Lookup', tagline: 'Check if your password or email appeared in a data breach.', price: 'Free', href: '/tools/breach-lookup', screenshot: 'breach-lookup' },
      { name: 'Threat Intelligence Feed', tagline: 'Live feed of active malware domains and botnet IPs — updated hourly.', price: 'Free', href: '/tools/threat-feed', screenshot: 'threat-feed' },
      { name: 'Password Generator', tagline: 'Generate cryptographically secure passwords — in your browser, never sent anywhere.', price: 'Free', href: '/tools/password-generator', screenshot: 'password-generator' },
      { name: 'Hash Generator', tagline: 'Hash any text or file — SHA-256, SHA-512, SHA-384, SHA-1 instantly.', price: 'Free', href: '/tools/hash-generator', screenshot: 'hash-generator' },
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
      { name: 'JSON Formatter', tagline: 'Paste broken JSON. Get clean JSON — with the exact error if it\'s invalid.', price: 'Free', href: '/tools/json-formatter', screenshot: 'json-formatter' },
      { name: 'JWT Decoder', tagline: 'Paste a JWT. See everything inside it — header, payload, expiry, all claims.', price: 'Free', href: '/tools/jwt-decoder', screenshot: 'jwt-decoder' },
      { name: 'Base64 Encoder / Decoder', tagline: 'Encode or decode Base64 instantly — URL-safe variant, file support included.', price: 'Free', href: '/tools/base64', screenshot: 'base64' },
      { name: 'Cron Expression Builder', tagline: 'Build cron schedules visually. Paste any expression to see when it next fires.', price: 'Free', href: '/tools/cron-builder', screenshot: 'cron-builder' },
      { name: 'Tech Stack Detector', tagline: 'Detect the exact tech stack any site runs — framework, CDN, analytics.', price: 'Free', href: '/tools/tech-stack', screenshot: 'tech-stack' },
      { name: 'API Rate Limit Calculator', tagline: 'Calculate exactly when your API calls will hit rate limits before you hit them.', price: 'Free', href: '/tools/api-rate-limit', screenshot: 'api-rate-limit' },
      { name: 'Directory Extractor', tagline: 'Map any site\'s full URL structure from its sitemap in seconds.', price: 'Free', href: '/tools/directory-extractor', screenshot: 'directory-extractor' },
      { name: 'DNS Health Checker', tagline: 'Find out why your email is bouncing or your site is unreachable — DNS explained.', price: 'Free', href: '/tools/dns-health', screenshot: 'dns-health', badge: 'New' },
      { name: 'Email Deliverability Suite', tagline: 'Find out why your emails land in spam — SPF, DKIM, DMARC checked instantly.', price: 'Free', href: '/tools/email-deliverability', screenshot: 'email-deliverability', badge: 'New' },
      { name: 'Privacy Policy Analyzer', tagline: 'Before signing up — know what a company\'s privacy policy actually does with your data.', price: 'Pro', href: '/tools/privacy-analyzer', screenshot: 'privacy-analyzer', badge: 'New' },
      { name: 'HTTP Header Inspector', tagline: 'Audit any site\'s security headers — find missing CSP, HSTS, and CORS issues.', price: 'Free', href: '/tools/http-headers', screenshot: 'http-headers', badge: 'New' },
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
      { name: 'Invoice Generator', tagline: 'Create a professional invoice and download it as PDF — no signup, no software.', price: 'Free', href: '/tools/invoice-generator', screenshot: 'invoice-generator' },
      { name: 'URL Shortener', tagline: 'Shorten any URL and track how many times it gets clicked — no account.', price: 'Free', href: '/tools/url-shortener', screenshot: 'url-shortener' },
      { name: 'Meeting Cost Calculator', tagline: 'Your 10-person meeting costs $400/hour. Watch the number tick up live.', price: 'Free', href: '/tools/meeting-cost', screenshot: 'meeting-cost' },
      { name: 'Uptime SLA Calculator', tagline: 'Turn \'99.9% uptime\' into actual hours of downtime and revenue lost.', price: 'Free', href: '/tools/uptime-calculator', screenshot: 'uptime-calculator' },
      { name: 'Email Signature Generator', tagline: 'Build a professional email signature that works in Gmail, Outlook, and Apple Mail.', price: 'Free', href: '/tools/email-signature', screenshot: 'email-signature' },
      { name: 'Color Palette Generator', tagline: 'Generate color palettes with WCAG contrast scores — copy Tailwind or HEX instantly.', price: 'Free', href: '/tools/color-palette', screenshot: 'color-palette' },
      { name: 'GDPR / Privacy Policy Generator', tagline: 'Generate a GDPR-compliant privacy policy for your SaaS in under 2 minutes.', price: 'Free', href: '/tools/gdpr-generator', screenshot: 'gdpr-generator' },
      { name: 'Business Name Availability', tagline: 'Check if your business name is taken — domains and social handles, live results.', price: 'Free', href: '/tools/business-name', screenshot: 'business-name', badge: 'New' },
      { name: 'SaaS Metrics Calculator', tagline: 'Calculate MRR, LTV, churn, and CAC — graded against industry benchmarks.', price: 'Free', href: '/tools/saas-metrics', screenshot: 'saas-metrics', badge: 'New' },
      { name: 'Break-Even Calculator', tagline: 'Know exactly how many sales you need before you start making money.', price: 'Free', href: '/tools/break-even', screenshot: 'break-even', badge: 'New' },
      { name: 'ROI Calculator', tagline: 'Calculate ROI, payback period, and net profit for any investment.', price: 'Free', href: '/tools/roi-calculator', screenshot: 'roi-calculator', badge: 'New' },
      { name: 'Cash Flow Forecaster', tagline: 'Project your runway and see exactly which month you run out of cash.', price: 'Free', href: '/tools/cashflow', screenshot: 'cashflow', badge: 'New' },
      { name: 'NDA Generator', tagline: 'Stop writing NDAs from scratch at 11pm. Done in 60 seconds, ready to send.', price: 'Pro', href: '/tools/nda-generator', screenshot: 'nda-generator', badge: 'New' },
      { name: 'Terms of Service Generator', tagline: 'Generate a complete Terms of Service for your SaaS — plain English, legally structured.', price: 'Pro', href: '/tools/tos-generator', screenshot: 'tos-generator', badge: 'New' },
      { name: 'Refund Policy Generator', tagline: 'Write a refund policy that protects your business and actually satisfies customers.', price: 'Pro', href: '/tools/refund-policy', screenshot: 'refund-policy', badge: 'New' },
      { name: 'Ad Copy Grader', tagline: 'Score your ad copy before spending money on it. Get a better version in seconds.', price: 'Free', href: '/tools/ad-grader', screenshot: 'ad-grader', badge: 'New' },
      { name: 'Email Subject Line Tester', tagline: 'Know if your email subject line will get opened or ignored — before you send.', price: 'Free', href: '/tools/subject-line', screenshot: 'subject-line', badge: 'New' },
      { name: 'Job Description Writer', tagline: 'Write a clear, bias-reduced job description for any role in under 60 seconds.', price: 'Pro', href: '/tools/job-description', screenshot: 'job-description', badge: 'New' },
      { name: 'Proposal & Quote Generator', tagline: 'Turn a client brief into a polished proposal in 90 seconds. Win more work.', price: 'Pro', href: '/tools/proposal-generator', screenshot: 'proposal-generator', badge: 'New' },
      { name: 'SaaS Spend Optimizer', tagline: 'Upload your bank statement. Find the subscriptions you forgot you\'re paying for.', price: 'Pro', href: '/tools/saas-spend', screenshot: 'saas-spend', badge: 'New' },
      { name: 'Invoice Fraud Detector', tagline: 'Before you pay that invoice — check it for fraud. 25 red flags detected instantly.', price: 'Pro', href: '/tools/invoice-fraud', screenshot: 'invoice-fraud', badge: 'New' },
      { name: 'Agency Client Report Generator', tagline: 'Your client wants a report by Monday. Here\'s one in 30 seconds.', price: 'Pro', href: '/tools/agency-report', screenshot: 'agency-report', badge: 'New' },
      { name: 'OG Tag Previewer', tagline: 'See exactly how your page looks when shared on Twitter, LinkedIn, and iMessage.', price: 'Free', href: '/tools/og-previewer', screenshot: 'og-previewer', badge: 'New' },
      { name: 'Webhook Tester', tagline: 'Get an instant webhook endpoint and inspect live payloads in real-time.', price: 'Free', href: '/tools/webhook-tester', screenshot: 'webhook-tester', badge: 'New' },
    ],
  },
]

const PRICE_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  'Free':         { color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.2)'  },
  'Pro':          { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)' },
  '$399 one-time':{ color: '#06d6ff', bg: 'rgba(6,214,255,0.1)',   border: 'rgba(6,214,255,0.2)'   },
}

export default function ToolsPage() {
  const totalTools = CATEGORIES.reduce((sum, c) => sum + c.tools.length, 0)

  return (
    <div className="min-h-screen" style={{ background: '#09090B' }}>
      <Header />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-5" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Queldrex Tool Suite
        </p>
        <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-3" style={{ color: '#FAFAFA', letterSpacing: '-0.02em' }}>
          {totalTools} professional tools.
        </h1>
        <p className="text-base max-w-xl mb-10" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: '1.65' }}>
          Security scanning, DNS health, legal documents, and business analytics.
          Most are free — no account, no card, no waiting.
        </p>

        {/* Pricing legend */}
        <div className="flex flex-wrap gap-3 mb-10">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border" style={{ background: 'rgba(52,211,153,0.05)', borderColor: 'rgba(52,211,153,0.15)' }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold text-emerald-400">Free</span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>no account needed</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border" style={{ background: 'rgba(167,139,250,0.05)', borderColor: 'rgba(167,139,250,0.15)' }}>
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-xs font-bold text-purple-400">Pro</span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>$79/mo or $15–$49 one-time per tool</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border" style={{ background: 'rgba(6,214,255,0.05)', borderColor: 'rgba(6,214,255,0.15)' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: '#06d6ff' }} />
            <span className="text-xs font-bold" style={{ color: '#06d6ff' }}>$399 one-time</span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>AI Visibility Scan flagship</span>
          </div>
        </div>

        {/* Category nav */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <a key={cat.id} href={`#${cat.id}`}
              className="text-xs font-bold px-4 py-1.5 rounded-full transition-all hover:scale-105"
              style={{ color: cat.accent, background: cat.accentBg, border: `1px solid ${cat.accentBorder}` }}>
              {cat.label} · {cat.tools.length}
            </a>
          ))}
        </div>
      </section>

      {/* Category sections */}
      {CATEGORIES.map(cat => (
        <section key={cat.id} id={cat.id} className="max-w-7xl mx-auto px-6 pb-16">
          <div className="flex items-center gap-4 mb-3">
            <div className="h-px flex-1" style={{ background: `${cat.accent}20` }} />
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: cat.accent }}>
                {cat.label}
              </span>
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>{cat.tools.length} tools</span>
            </div>
            <div className="h-px flex-1" style={{ background: `${cat.accent}20` }} />
          </div>
          <p className="text-xs text-center mb-7" style={{ color: 'rgba(255,255,255,0.3)' }}>{cat.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cat.tools.map(tool => {
              const ps = PRICE_STYLES[tool.price] ?? PRICE_STYLES['Pro']
              return (
                <Link key={tool.name} href={tool.href}
                  className="group rounded-2xl border border-white/[0.07] hover:border-white/[0.14] overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl cursor-pointer"
                  style={{ background: '#0d1117' }}>

                  <div className="relative overflow-hidden" style={{ height: 148 }}>
                    <Image
                      src={`/tool-previews/${tool.screenshot}.png`}
                      alt={`${tool.name} preview`}
                      fill
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,17,23,0) 30%, rgba(13,17,23,0.95) 100%)' }} />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      {tool.badge && (
                        <span className="text-[9px] font-black uppercase tracking-wider text-black px-2 py-0.5 rounded-full"
                          style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
                          {tool.badge}
                        </span>
                      )}
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-sm"
                        style={{ color: ps.color, background: 'rgba(13,17,23,0.8)', border: `1px solid ${ps.border}` }}>
                        {tool.price}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-black text-white group-hover:text-purple-400 transition-colors leading-snug">
                        {tool.name}
                      </h3>
                      <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-white/20 group-hover:text-white/50 transition-colors"
                        fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {tool.tagline}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>

          {(cat.id === 'ai-visibility' || cat.id === 'security') && (
            <div className="mt-5 rounded-xl border p-4 flex items-center justify-between gap-4"
              style={{ background: cat.accentBg, borderColor: cat.accentBorder }}>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Pro tools are unlimited at <span className="font-bold text-white/70">$79/month</span> — includes all tools and monthly AI visibility monitoring.
              </p>
              <GoProButton
                returnTo="/tools"
                className="text-xs font-bold flex-shrink-0 transition-opacity hover:opacity-70 bg-transparent border-none p-0 cursor-pointer"
                style={{ color: cat.accent }}>
                Go Pro →
              </GoProButton>
            </div>
          )}
        </section>
      ))}

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="rounded-2xl border p-10 text-center"
          style={{ background: 'rgba(124,58,237,0.05)', borderColor: 'rgba(124,58,237,0.18)' }}>
          <p className="text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: '#a78bfa' }}>Ready to start?</p>
          <h2 className="text-3xl font-black mb-3" style={{ color: '#FAFAFA', letterSpacing: '-0.02em' }}>Try any tool free. Upgrade when you need more.</h2>
          <p className="text-sm mb-8 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Every tool has a free daily tier. No account, no email, no credit card. When you hit the limit, buy just that tool or get everything with Pro.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/tools"
              className="px-7 py-3.5 rounded-xl text-sm font-black text-white transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 24px rgba(109,40,217,0.35)' }}>
              Browse all tools
            </Link>
            <GoProButton
              returnTo="/tools"
              className="px-7 py-3.5 rounded-xl text-sm font-black transition-all border"
              style={{ color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.12)', background: 'transparent' }}>
              Go Pro · $79/mo
            </GoProButton>
            <Link href="/scanner"
              className="px-7 py-3.5 rounded-xl text-sm font-semibold border transition-colors hover:border-white/20 hover:text-white"
              style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.08)' }}>
              AI Visibility Scan · $399
            </Link>
          </div>
        </div>
      </section>

      {/* Request a tool */}
      <section className="py-20 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: '#a78bfa' }}>Don't see what you need?</p>
          <h2 className="text-3xl font-black mb-3" style={{ color: '#FAFAFA', letterSpacing: '-0.02em' }}>Request a tool.</h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            We build based on what people actually need. If you need a tool that isn't here, tell us. We review every request.
          </p>
        </div>
        <RequestToolForm />
      </section>

      <Footer />
    </div>
  )
}
