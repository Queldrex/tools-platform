import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import GoProButton from '@/components/GoProButton'
import BundleButton from '@/components/BundleButton'

export const metadata = {
  title: 'Pricing — Queldrex',
  description: '51 tools. Free to start, no account required. Buy individual tools once or go Pro at $79/mo for everything unlimited.',
  alternates: { canonical: 'https://queldrex.com/pricing' },
  openGraph: {
    title: 'Pricing — Queldrex',
    description: '51 tools. Free to start. Buy one tool or get everything with Pro.',
    url: 'https://queldrex.com/pricing',
    siteName: 'Queldrex',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Pricing — Queldrex',
    description: '51 tools. Free to start. Buy one tool or get everything with Pro.',
  },
}

const FAQ = [
  {
    q: 'What does "buy once" mean for a tool?',
    a: 'One payment unlocks lifetime access to that tool on queldrex.com — no subscription, no renewal. Your access never expires.',
  },
  {
    q: 'Can I cancel Pro anytime?',
    a: 'Yes. Cancel directly from your Stripe billing portal. No forms, no calls, no waiting. You get a full refund within 7 days if you change your mind.',
  },
  {
    q: 'What does the AI Visibility Monitor do?',
    a: 'Every month we re-run the full 14-signal scan on your domain and email you the results. If your score drops 5+ points, you get an alert so you can fix it before AI assistants stop recommending you.',
  },
  {
    q: 'Do individual tool purchases include Pro features?',
    a: 'No. A per-tool purchase unlocks unlimited use of that one tool. Pro ($79/mo) gives you every tool unlimited plus the AI monitor and every future tool we ship.',
  },
  {
    q: 'Is the $399 scanner a subscription?',
    a: 'No. One payment. You get the full 14-signal scan, llms.txt, LocalBusiness JSON-LD schema, HTML report, and deployment guide — emailed in minutes.',
  },
  {
    q: 'How does the free tier work?',
    a: 'Open any tool and use it — no account, no card. Most tools give you 1–10 free uses per day tracked by IP. When you hit the limit, buy just that tool one-time or go Pro for everything.',
  },
  {
    q: 'How fast is delivery after paying for the scanner?',
    a: 'The llms.txt, JSON-LD schema, HTML report, and deployment guide are emailed within minutes of payment.',
  },
]

const CheckIcon = ({ color }: { color: string }) => (
  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke={color} strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#09090B' }}>
      <Header />

      <section className="max-w-7xl mx-auto px-6 pt-20 pb-8 text-center">
        <p className="text-xs font-bold tracking-[0.25em] uppercase mb-4" style={{ color: '#6d28d9' }}>Queldrex Pricing</p>
        <h1 className="text-4xl lg:text-6xl font-black mb-4" style={{ color: '#FAFAFA' }}>51 tools. Start free.<br/>Pay once or subscribe.</h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: '#A1A1AA' }}>
          Every tool has a free daily tier — no account needed. Buy a single tool forever or go Pro for unlimited access to everything.
        </p>
      </section>

      {/* ONE-TIME SCANNER */}
      <section className="max-w-5xl mx-auto px-6 pb-6">
        <div className="rounded-2xl border p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
          style={{ background: 'rgba(109,40,217,0.07)', borderColor: 'rgba(109,40,217,0.3)' }}>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-black px-2.5 py-0.5 rounded-full inline-block mb-3"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}>
              Flagship · One-time
            </span>
            <h2 className="text-2xl font-black mb-1" style={{ color: '#FAFAFA' }}>AI Visibility Scanner — $399</h2>
            <p className="text-sm max-w-xl leading-relaxed" style={{ color: '#A1A1AA' }}>
              Not a subscription. One payment. Full 14-signal scan, llms.txt, LocalBusiness JSON-LD schema, HTML report, and deployment guide — emailed in minutes.
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0">
            <Link href="/scanner"
              className="px-7 py-3.5 rounded-xl text-sm font-black text-white whitespace-nowrap transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 20px rgba(109,40,217,0.3)' }}>
              See your score free →
            </Link>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>See your score free, pay only for the fix</span>
          </div>
        </div>
      </section>

      {/* 3-TIER COMPARISON */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-5 items-stretch">

          {/* FREE */}
          <div className="rounded-2xl border p-7 flex flex-col" style={{ background: '#0c0e14', borderColor: 'rgba(255,255,255,0.07)' }}>
            <div className="mb-6">
              <p className="text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: '#4ade80' }}>Free</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-black" style={{ color: '#FAFAFA' }}>$0</span>
              </div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>No card. No account. Open a tool and go.</p>
            </div>
            <ul className="space-y-3 flex-1 mb-7">
              {[
                'All 51 tools, free tier',
                '1–10 uses per tool per day',
                'No account required',
                'Instant results',
              ].map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  <CheckIcon color="#4ade80" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/tools"
              className="block text-center py-3 rounded-xl text-sm font-black transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(74,222,128,0.08)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
              Browse free tools
            </Link>
          </div>

          {/* PER TOOL — highlighted middle */}
          <div className="rounded-2xl border p-7 flex flex-col relative"
            style={{ background: 'rgba(6,214,255,0.04)', borderColor: 'rgba(6,214,255,0.3)', boxShadow: '0 0 40px rgba(6,214,255,0.07)' }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider text-black whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
              Best for occasional use
            </div>
            <div className="mb-6">
              <p className="text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: '#06d6ff' }}>Per Tool</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-black" style={{ color: '#FAFAFA' }}>$15</span>
                <span className="text-lg font-black" style={{ color: 'rgba(255,255,255,0.4)' }}>–$49</span>
              </div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>One-time. Own that tool forever.</p>
            </div>
            <ul className="space-y-3 flex-1 mb-7">
              {[
                'Lifetime access to one tool',
                'No subscription, no renewal',
                'Pay once, use forever',
                'Access on queldrex.com',
                'Restore via email anytime',
              ].map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  <CheckIcon color="#06d6ff" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="#individual-tools"
              className="block text-center py-3 rounded-xl text-sm font-black transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', color: '#000' }}>
              See all tools + prices ↓
            </Link>
          </div>

          {/* PRO */}
          <div className="rounded-2xl border p-7 flex flex-col relative"
            style={{ background: 'linear-gradient(160deg, rgba(109,40,217,0.1) 0%, rgba(109,40,217,0.04) 100%)', borderColor: 'rgba(124,58,237,0.4)', boxShadow: '0 0 48px rgba(109,40,217,0.12)' }}>
            <div className="mb-6">
              <p className="text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: '#a78bfa' }}>Pro</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-black" style={{ color: '#FAFAFA' }}>$79</span>
                <span className="text-sm font-normal" style={{ color: 'rgba(255,255,255,0.4)' }}>/mo</span>
              </div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>or $790/yr — save 17% · every future tool included</p>
            </div>
            <ul className="space-y-3 flex-1 mb-7">
              {[
                'All 51 tools, unlimited',
                'Every new tool, auto-included',
                'AI Visibility Monitor (monthly)',
                'Drop alerts if score falls',
                '7-day full refund guarantee',
                'Cancel anytime from Stripe',
              ].map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  <CheckIcon color="#a78bfa" />
                  {f}
                </li>
              ))}
            </ul>
            <GoProButton
              returnTo="/tools"
              className="block w-full text-center py-3.5 rounded-xl text-sm font-black text-white transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 24px rgba(109,40,217,0.35)' }}>
              Get Pro — $79/mo
            </GoProButton>
            <p className="text-center text-xs mt-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
              or{' '}
              <GoProButton billing="annual" returnTo="/tools" className="underline bg-transparent border-none p-0 cursor-pointer text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                $790/yr — save 17%
              </GoProButton>
            </p>
          </div>
        </div>

        {/* Agency banner */}
        <div className="mt-5 rounded-xl border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ background: '#111318', borderColor: 'rgba(255,255,255,0.07)' }}>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#A1A1AA' }}>Agency</p>
            <p className="text-sm font-black" style={{ color: '#FAFAFA' }}>$199/mo · 25 client AI visibility scans + white-label reports</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Everything in Pro plus bulk client dashboard and auto-reports.</p>
          </div>
          <Link href="/agency"
            className="px-5 py-2.5 rounded-xl text-sm font-black whitespace-nowrap flex-shrink-0 transition-all hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.12)' }}>
            View Agency plan →
          </Link>
        </div>
      </section>

      {/* DONE FOR YOU */}
      <section className="max-w-5xl mx-auto px-6 pb-10">
        <div className="rounded-2xl border p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
          style={{ background: '#111318', borderColor: 'rgba(255,255,255,0.07)' }}>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#A1A1AA' }}>Need it done for you?</p>
            <h3 className="text-lg font-black mb-1" style={{ color: '#FAFAFA' }}>We implement it for your business.</h3>
            <p className="text-sm" style={{ color: '#A1A1AA' }}>
              Security audits, schema markup, email deliverability setup, and more. Fixed price. Starting at $299.
            </p>
          </div>
          <Link href="/apply"
            className="px-6 py-3 rounded-xl text-sm font-black text-white whitespace-nowrap flex-shrink-0 transition-all hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            Get a quote →
          </Link>
        </div>
      </section>

      {/* BUNDLE */}
      <section className="max-w-5xl mx-auto px-6 pb-8">
        <div className="rounded-2xl border p-6 sm:p-8 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,rgba(167,139,250,0.08) 0%,rgba(109,40,217,0.05) 100%)', borderColor: 'rgba(167,139,250,0.3)', boxShadow: '0 0 48px rgba(167,139,250,0.06)' }}>
          <div className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full text-black"
            style={{ background: 'linear-gradient(135deg,#a78bfa,#7c3aed)' }}>
            Best one-time value
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#a78bfa' }}>All Tools Bundle</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-black" style={{ color: '#FAFAFA' }}>$149</span>
                <span className="text-base font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>one-time</span>
              </div>
              <p className="text-sm max-w-lg leading-relaxed" style={{ color: '#A1A1AA' }}>
                Every current paid tool — unlocked forever. Contract scanner, NDA generator, vibe security shield, CVE scanner, agency reports, and all 12 others. Pay once, use all of them on this browser forever.
              </p>
              <ul className="mt-3 space-y-1.5">
                {[
                  'All 17 paid tools, lifetime access',
                  'No subscription — ever',
                  'Use on queldrex.com forever',
                  'Does not include future tools added after purchase',
                  '7-day money-back guarantee',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#a78bfa' }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-shrink-0 w-full sm:w-48">
              <BundleButton
                className="w-full py-4 rounded-xl text-sm font-black text-white transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', boxShadow: '0 0 28px rgba(167,139,250,0.3)' }}
              >
                Get the Bundle — $149
              </BundleButton>
              <p className="text-center text-[11px] mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>Secure checkout · Stripe</p>
            </div>
          </div>
        </div>
      </section>

      {/* Individual Tool Pricing */}
      <section id="individual-tools" className="max-w-5xl mx-auto px-6 pb-16">
        <div className="text-center mb-8">
          <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#A1A1AA' }}>Individual Tools</p>
          <h2 className="text-2xl font-black mb-3" style={{ color: '#FAFAFA' }}>Only need one tool? Pay once. Own it forever.</h2>
          <p className="text-sm max-w-md mx-auto" style={{ color: '#A1A1AA' }}>Every Pro tool is available individually. One-time payment — no subscription, no renewal. Better value than a month of any competitor.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {([
            { name: 'Contract Risk Scanner',         price: 49, href: '/tools/contract-scanner' },
            { name: 'Invoice Fraud Detector',        price: 49, href: '/tools/invoice-fraud' },
            { name: 'Agency Client Reports',         price: 49, href: '/tools/agency-report' },
            { name: 'SaaS Spend Optimizer',          price: 49, href: '/tools/saas-spend' },
            { name: 'Vibe Coding Security Shield',   price: 49, href: '/tools/vibe-security' },
            { name: 'Database Migration Checker',    price: 49, href: '/tools/database-migration' },
            { name: 'API Schema Drift Scanner',      price: 49, href: '/tools/api-schema-drift' },
            { name: 'Hallucinated Package Detector', price: 49, href: '/tools/package-hallucination' },
            { name: 'NDA Generator',                 price: 29, href: '/tools/nda-generator' },
            { name: 'Terms of Service Generator',    price: 29, href: '/tools/tos-generator' },
            { name: 'Refund Policy Generator',       price: 29, href: '/tools/refund-policy' },
            { name: 'Proposal Generator',            price: 29, href: '/tools/proposal-generator' },
            { name: 'Dependency CVE Scanner',        price: 29, href: '/tools/dep-scanner' },
            { name: 'Privacy Policy Analyzer',       price: 29, href: '/tools/privacy-analyzer' },
            { name: 'Ad Copy Grader',                price: 29, href: '/tools/ad-grader' },
            { name: 'Structured Data Validator',     price: 29, href: '/tools/schema-validator' },
            { name: 'Job Description Writer',        price: 15, href: '/tools/job-description' },
          ] as const).map(tool => (
            <a key={tool.name} href={tool.href}
              className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-all hover:scale-[1.02] group"
              style={{ background: '#111318', borderColor: 'rgba(255,255,255,0.07)' }}>
              <span className="text-xs font-bold group-hover:text-white transition-colors truncate" style={{ color: '#A1A1AA' }}>{tool.name}</span>
              <span className="text-sm font-black text-purple-400 flex-shrink-0">${tool.price} one-time</span>
            </a>
          ))}
        </div>
        <p className="text-center text-xs mt-5" style={{ color: 'rgba(255,255,255,0.3)' }}>
          All individual tools included in Pro ($79/mo). Better value if you use 3 or more.
        </p>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <h2 className="text-xl font-black mb-6 text-center" style={{ color: '#FAFAFA' }}>Common questions</h2>
        <div className="space-y-3">
          {FAQ.map(({ q, a }) => (
            <div key={q} className="rounded-xl border p-5" style={{ background: '#111318', borderColor: 'rgba(255,255,255,0.07)' }}>
              <h3 className="text-sm font-bold mb-2" style={{ color: '#FAFAFA' }}>{q}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>{a}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <p className="text-sm mb-2" style={{ color: '#A1A1AA' }}>Still have questions?</p>
          <a href="mailto:hello@queldrex.com" className="text-purple-400 text-sm font-bold hover:text-purple-300 transition-colors">
            hello@queldrex.com →
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}
