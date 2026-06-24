import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PricingTiers from './PricingTiers'

export const metadata = {
  title: 'Pricing — Queldrex',
  description: '51 tools. Free to start, no account required. Pro is $79/month for unlimited access. Agency at $99/month for up to 25 client scans.',
  alternates: { canonical: 'https://queldrex.com/pricing' },
  openGraph: {
    title: 'Pricing — Queldrex',
    description: '51 tools. Free to start, no account required. Pro is $79/month for unlimited access.',
    url: 'https://queldrex.com/pricing',
    siteName: 'Queldrex',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Pricing — Queldrex',
    description: '51 tools. Free to start, no account required. Pro is $79/month for unlimited access.',
  },
}

const FAQ = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel directly from your Stripe billing portal. No forms, no calls, no waiting.',
  },
  {
    q: 'What does the AI Visibility Monitor do?',
    a: 'Every month we re-run the full 14-signal scan on your domain and email you the results. If your score drops 5+ points, you get an alert so you can fix it before AI assistants stop recommending you.',
  },
  {
    q: 'Do the tools cost extra on Pro?',
    a: 'No. Every tool on queldrex.com is included in Pro. One subscription, everything unlimited.',
  },
  {
    q: 'What counts as a client scan on Agency?',
    a: 'One full 14-signal AI visibility scan for one domain. Your counter resets to 25 each month. Need more? Email hello@queldrex.com.',
  },
  {
    q: 'Is the $399 scanner a subscription?',
    a: 'No. One payment. You get the full 14-signal scan, llms.txt, LocalBusiness JSON-LD schema, HTML report, and deployment instructions. The AI Monitor ($79/mo, included in Pro) is the recurring option if you want monthly rescans.',
  },
  {
    q: 'How does the free tier work?',
    a: 'Every Pro tool gives you a free daily allowance with no account required. When you hit the daily limit, subscribe to Pro for unlimited access or buy just that tool.',
  },
  {
    q: 'How fast is delivery after paying for the scanner?',
    a: 'The llms.txt, JSON-LD schema, HTML report, and deployment guide are emailed within minutes of payment.',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#09090B' }}>
      <Header />

      <section className="max-w-7xl mx-auto px-6 pt-20 pb-8 text-center">
        <p className="text-xs font-bold tracking-[0.25em] uppercase mb-4" style={{ color: '#6d28d9' }}>Queldrex Pricing</p>
        <h1 className="text-4xl lg:text-6xl font-black mb-4" style={{ color: '#FAFAFA' }}>51 tools. Pay for what you use.</h1>
        <p className="text-lg max-w-lg mx-auto" style={{ color: '#A1A1AA' }}>
          Every tool has a free tier. No account required to start. Upgrade when you need more.
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

      {/* TIERS */}
      <PricingTiers />

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

      {/* Individual Tool Pricing */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
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
