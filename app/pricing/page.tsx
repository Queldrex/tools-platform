import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Pricing — Queldrex',
  description: 'Simple, honest pricing. Free scan, Pro monitoring at $29/month, Agency plan at $99/month.',
}

const FREE_FEATURES = [
  'One AI Visibility Scan (see your score)',
  'Threat Feed preview (10 entries)',
  'Breach Lookup: unlimited password checks',
  'Breach Lookup: 1 free domain scan',
]

const PRO_FEATURES = [
  'Everything in Free',
  'AI Visibility Monitor — monthly rescan',
  'Email alerts when your score drops',
  'Full Threat Intelligence Feed (unlimited)',
  'Unlimited domain security scans',
  'All future tools — included automatically',
  'Cancel anytime from Stripe portal',
]

const AGENCY_FEATURES = [
  'Everything in Pro',
  '25 client scans/month',
  'White-label PDF reports — your branding',
  'Bulk client dashboard — all scores in one view',
  'Monthly auto-reports emailed to each client',
  'Priority email support',
]

const FAQ = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Instant cancellation directly from your Stripe billing portal. No forms, no calls, no waiting.',
  },
  {
    q: 'What does the AI Visibility Monitor actually do?',
    a: 'Every month we re-run the full 14-signal scan on your domain and email you the results. If your score drops 5+ points since the last scan, you get an immediate alert so you can fix it before AI assistants stop recommending you.',
  },
  {
    q: 'Do the tools cost extra on Pro?',
    a: 'No. Every tool on queldrex.com is included in Pro — Threat Feed, Breach Lookup, and every tool we launch in the future. One subscription, everything unlocked.',
  },
  {
    q: 'What counts as a client scan on Agency?',
    a: 'Running the full 14-signal AI visibility scan for one domain. Each month your counter resets to 25. Need more than 25? Email hello@queldrex.com for a custom plan.',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />

      <section className="max-w-7xl mx-auto px-6 pt-16 pb-8 text-center">
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase mb-6"
          style={{ borderColor: 'rgba(6,182,212,0.25)', background: 'rgba(6,182,212,0.08)', color: '#06d6ff' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          Queldrex · Pricing
        </div>
        <h1 className="text-4xl lg:text-5xl font-black text-white mb-4">Simple, honest pricing.</h1>
        <p className="text-white/50 text-lg max-w-lg mx-auto">
          Start free. Upgrade when you need monitoring and unlimited tools. No tricks.
        </p>
      </section>

      {/* TIERS */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-5 items-start">

          {/* FREE */}
          <div className="rounded-2xl border p-7 flex flex-col gap-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Free</div>
              <div className="text-4xl font-black text-white">$0</div>
              <div className="text-xs text-white/30 mt-1">No credit card needed</div>
            </div>
            <ul className="space-y-3 flex-1">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white/55">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-white/25" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/scanner"
              className="block text-center py-3 rounded-xl text-sm font-bold transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
              Start Free Scan
            </Link>
          </div>

          {/* PRO — highlighted */}
          <div
            className="rounded-2xl border p-7 flex flex-col gap-5 relative"
            style={{
              background: 'linear-gradient(160deg, rgba(6,182,212,0.08) 0%, rgba(8,145,178,0.04) 100%)',
              borderColor: 'rgba(6,182,212,0.4)',
              boxShadow: '0 0 48px rgba(6,182,212,0.1)',
            }}
          >
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider text-black"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}
            >
              Most Popular
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">Pro</div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-black text-white">$29</span>
                <span className="text-white/40 text-sm mb-1.5">/month</span>
              </div>
              <div className="text-xs text-white/30 mt-1">Cancel anytime</div>
            </div>
            <ul className="space-y-3 flex-1">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/monitor"
              className="block text-center py-3.5 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 24px rgba(6,182,212,0.3)' }}>
              Start Monitoring
            </Link>
          </div>

          {/* AGENCY */}
          <div className="rounded-2xl border p-7 flex flex-col gap-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Agency</div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-black text-white">$99</span>
                <span className="text-white/40 text-sm mb-1.5">/month</span>
              </div>
              <div className="text-xs text-white/30 mt-1">Cancel anytime</div>
            </div>
            <ul className="space-y-3 flex-1">
              {AGENCY_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white/65">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-white/35" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/agency"
              className="block text-center py-3 rounded-xl text-sm font-bold transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.14)' }}>
              Start Agency Plan
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <h2 className="text-xl font-black text-white mb-6 text-center">Frequently asked</h2>
        <div className="space-y-3">
          {FAQ.map(({ q, a }) => (
            <div key={q} className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
              <h3 className="text-sm font-bold text-white mb-2">{q}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-white/40 text-sm mb-2">Still have questions?</p>
          <a href="mailto:hello@queldrex.com" className="text-cyan-400 text-sm font-bold hover:text-cyan-300 transition-colors">
            hello@queldrex.com →
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}
