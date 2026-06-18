import Link from 'next/link'

const IMPL_EMAIL = 'mailto:hello@queldrex.com?subject=Done-For-You%20Implementation%20Inquiry&body=Hi%20Queldrex%2C%0A%0AI%27m%20interested%20in%20the%20Done-For-You%20Implementation%20service.%0A%0AMy%20website%3A%20%5Benter%20URL%5D%0AMy%20name%3A%20%5Benter%20name%5D%0A%0APlease%20confirm%20scope%20and%20pricing.'

function Check() {
  return (
    <svg className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
    </svg>
  )
}

function StepNumber({ n }: { n: number }) {
  return (
    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5 text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
      {n}
    </span>
  )
}

const TIERS = [
  {
    id: 'free',
    label: 'Free Audit',
    price: '$0',
    priceSub: 'No account required',
    accent: false,
    features: [
      'AI Visibility Score (0–100)',
      'Missing signal detection',
      'llms.txt check',
      'JSON-LD check',
      'Open Graph & metadata check',
      'Basic recommendations',
    ],
    steps: [
      { title: 'Enter your website URL', body: 'Paste any public website URL into the scanner. No sign-up, no email required for the free scan.' },
      { title: 'We scan 6 AI signals', body: 'Our system checks your site for llms.txt, JSON-LD schema, LocalBusiness markup, Open Graph tags, sitemap.xml, and robots.txt in under 30 seconds.' },
      { title: 'Review your score', body: 'You receive an AI Visibility Score from 0 to 100 and a breakdown of which signals pass and which are missing, with an explanation of what each one does.' },
      { title: 'Decide your next step', body: 'Use the free results to understand your gaps. Upgrade to the Bundle to get the complete fix files, or contact us for professional installation.' },
    ],
    legal: 'The free scan analyzes publicly accessible information on your submitted URL. No data is stored beyond 48 hours. No payment is required. Results are informational and do not constitute a guarantee of AI search outcomes.',
    cta: { label: 'Run Free Scan', href: '/scanner', style: 'outline' as const },
  },
  {
    id: 'bundle',
    label: 'AI Visibility Bundle',
    price: '$149',
    priceSub: 'One-time · instant delivery',
    accent: true,
    badge: 'Most Popular',
    features: [
      'Everything in Free Audit',
      'Complete generated llms.txt file',
      'JSON-LD LocalBusiness schema',
      'Robots.txt recommendations',
      'AI metadata recommendations',
      'Full HTML visibility report',
      'Prioritized fix checklist',
      'Deployment instructions',
    ],
    steps: [
      { title: 'Run the free scan', body: 'Enter your website URL. You will see your AI Visibility Score and a preview of your missing signals before paying anything.' },
      { title: 'Click Unlock and Download', body: 'From the results page, click the unlock button. You will be taken to a secure Stripe checkout page with the $149 one-time price.' },
      { title: 'Complete payment via Stripe', body: 'Payment is processed securely by Stripe. Queldrex does not store your card information. The charge is $149 USD, one time only.' },
      { title: 'Receive your files by email', body: 'Within minutes of payment, your complete fix package is sent to the email address you provided. No waiting, no manual steps on our end.' },
      { title: 'Deploy the files yourself', body: 'Follow the included deployment instructions. The llms.txt uploads to your site root. The JSON-LD schema is a single paste into your site head. Implementable by anyone with basic website access.' },
    ],
    legal: 'This is a one-time digital purchase. All sales are final after delivery. If a technical failure prevents delivery, contact hello@queldrex.com within 7 days for resolution or a full refund. The generated files are yours to use on the scanned website. Results depend on third-party AI systems outside our control.',
    cta: { label: 'Unlock & Download Bundle', href: '/scanner', style: 'primary' as const },
  },
  {
    id: 'implementation',
    label: 'Done-For-You',
    price: '$499',
    pricePrefix: 'Starting at',
    priceSub: 'Custom pricing · one-time',
    accent: false,
    features: [
      'Everything in the Bundle',
      'Professional file installation',
      'Website configuration',
      'Schema deployment & validation',
      'AI crawler accessibility check',
      'Final compliance verification',
      '30-day email support',
    ],
    steps: [
      { title: 'Email us to get started', body: 'Send an email to hello@queldrex.com with your website URL. We will review it and confirm the scope and final price in writing within one business day.' },
      { title: 'Receive a written scope agreement', body: 'Before any work begins, we confirm exactly what will be installed, the timeline, and the price via email. No work starts without your written approval.' },
      { title: 'Complete payment via invoice', body: 'We send you a secure Stripe payment link for the agreed amount. Payment is processed by Stripe. No card data is stored by Queldrex.' },
      { title: 'Provide website access', body: 'Grant us the minimum access needed, typically FTP/SFTP credentials, a CMS admin login, or access to your DNS/hosting panel. We use this only for the agreed implementation work.' },
      { title: 'We install and validate everything', body: 'Queldrex installs your llms.txt, deploys the JSON-LD schema, updates robots.txt, and verifies that all AI crawler signals are functioning correctly on your live site.' },
      { title: 'Receive your final report', body: 'We run a post-implementation scan and deliver a written confirmation showing all signals passing. Your 30-day email support period begins from this date.' },
    ],
    legal: 'Scope, timeline, and price are confirmed in writing before work begins. You represent that you own or are authorized to modify the website. We implement only the agreed scope. We do not retain your access credentials after work is complete. Cancellations before work commences are eligible for a full refund. Post-commencement refunds are not available. 30-day support covers questions about the implemented work only.',
    cta: { label: 'Get Started via Email', href: IMPL_EMAIL, style: 'outline' as const, external: true },
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="border-t border-white/6 py-28" style={{ background: '#070b14' }}>
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">
          <p className="text-cyan-500 text-xs font-bold tracking-[0.3em] uppercase mb-4">Pricing &amp; Services</p>
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-5">
            Three ways to get results
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto leading-relaxed">
            Start free, self-serve for $149, or let us handle everything from start to finish.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5 mb-20 items-stretch">
          {TIERS.map((tier) => (
            <div key={tier.id} className="rounded-2xl p-8 flex flex-col relative" style={{
              background: '#111827',
              border: tier.accent ? '1px solid rgba(6,182,212,0.4)' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: tier.accent ? '0 0 40px rgba(6,182,212,0.1)' : 'none',
            }}>
              {tier.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
                    {tier.badge}
                  </span>
                </div>
              )}
              <div className="mb-7">
                <p className="text-xs font-bold tracking-[0.2em] uppercase mb-2" style={{ color: tier.accent ? '#06d6ff' : 'rgba(255,255,255,0.45)' }}>{tier.label}</p>
                {'pricePrefix' in tier && tier.pricePrefix && (
                  <p className="text-xs font-semibold text-white/45 mb-0.5">{tier.pricePrefix}</p>
                )}
                <div className="flex items-end gap-1.5 mb-1">
                  <span className="text-4xl font-black text-white">{tier.price}</span>
                </div>
                <p className="text-white/45 text-sm">{tier.priceSub}</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm" style={{ color: tier.accent ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.60)' }}>
                    <Check />{f}
                  </li>
                ))}
              </ul>
              {tier.cta.style === 'primary' ? (
                <Link href={tier.cta.href} className="w-full text-center py-3.5 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
                  {tier.cta.label}
                </Link>
              ) : tier.cta.external ? (
                <a href={tier.cta.href} className="w-full text-center py-3 rounded-xl text-sm font-bold text-white border border-white/15 hover:border-cyan-500/40 hover:text-cyan-400 transition-all">
                  {tier.cta.label}
                </a>
              ) : (
                <Link href={tier.cta.href} className="w-full text-center py-3 rounded-xl text-sm font-bold text-white border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all">
                  {tier.cta.label}
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="mb-20">
          <h3 className="text-2xl font-black text-white mb-2">How each option works</h3>
          <p className="text-white/55 text-sm mb-10">Step-by-step process for every tier, so you know exactly what happens after you click.</p>

          <div className="grid lg:grid-cols-3 gap-6">
            {TIERS.map((tier) => (
              <div key={tier.id} className="rounded-2xl border border-white/7 overflow-hidden" style={{ background: '#111827' }}>
                <div className="px-6 py-5 border-b border-white/7" style={{ background: tier.accent ? 'rgba(6,182,212,0.06)' : 'rgba(255,255,255,0.02)' }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: tier.accent ? '#06d6ff' : 'rgba(255,255,255,0.45)' }}>{tier.label}</p>
                  <p className="text-white font-black">{tier.price}</p>
                </div>
                <div className="p-6 space-y-5">
                  {tier.steps.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <StepNumber n={i + 1} />
                      <div>
                        <p className="text-sm font-bold text-white mb-1">{step.title}</p>
                        <p className="text-xs text-white/55 leading-relaxed">{step.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <h3 className="text-lg font-black text-white mb-2">Legal &amp; purchase terms by tier</h3>
          <p className="text-white/55 text-sm mb-8">These disclosures form part of our <Link href="/terms" className="text-cyan-400 hover:text-cyan-300">Terms of Service</Link>. By using any tier of service, you agree to the applicable terms below.</p>

          <div className="grid lg:grid-cols-3 gap-5">
            {TIERS.map((tier) => (
              <div key={tier.id} className="rounded-xl border border-white/7 p-6" style={{ background: 'rgba(255,255,255,0.015)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-cyan-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>
                  <span className="text-xs font-bold text-white/60 uppercase tracking-wider">{tier.label} · {tier.price}</span>
                </div>
                <p className="text-xs text-white/55 leading-relaxed">{tier.legal}</p>
              </div>
            ))}
          </div>

          <p className="text-white/35 text-xs mt-5 leading-relaxed">
            Queldrex LLC does not guarantee specific rankings or outcomes in any AI search system. AI systems including ChatGPT, Perplexity, and Google AI operate independently and their behavior is beyond our control. All prices are in USD. Payments are processed by Stripe, Inc. For the full Terms of Service, visit <Link href="/terms" className="text-cyan-400/70 hover:text-cyan-400">/terms</Link>. For the Privacy Policy, visit <Link href="/privacy" className="text-cyan-400/70 hover:text-cyan-400">/privacy</Link>. Contact: <a href="mailto:hello@queldrex.com" className="text-cyan-400/70 hover:text-cyan-400">hello@queldrex.com</a>.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-16">
          {[
            { title: 'Fast', body: 'Audit results are generated and returned in under 60 seconds. Report packages are delivered by email within minutes of payment.' },
            { title: 'Practical', body: 'Every recommendation is specific and actionable. The files we generate are ready to deploy, not templates or suggestions.' },
            { title: 'Secure', body: 'Payments are processed by Stripe. We do not store card data. Scan results are automatically deleted after 48 hours. Website credentials for the implementation service are deleted upon completion.' },
          ].map(({ title, body }) => (
            <div key={title} className="rounded-2xl border border-white/8 p-7" style={{ background: '#111827' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-5 text-cyan-400" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
                </svg>
              </div>
              <h4 className="text-base font-bold text-white mb-2">{title}</h4>
              <p className="text-white/60 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl p-10 md:p-14 text-center" style={{ background: 'linear-gradient(135deg,rgba(6,182,212,0.07) 0%,rgba(6,182,212,0.02) 100%)', border: '1px solid rgba(6,182,212,0.14)' }}>
          <h3 className="text-3xl font-black text-white mb-3">
            See how visible your business is to AI search
          </h3>
          <p className="text-white/60 text-base mb-10 max-w-lg mx-auto leading-relaxed">
            The free scan takes under 60 seconds. No account, no credit card, no commitment.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/scanner" className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.03]" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 24px rgba(6,182,212,0.3)' }}>
              Run Free Scan
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </Link>
            <a href={IMPL_EMAIL} className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white/65 border border-white/12 hover:border-white/25 hover:text-white transition-all">
              Ask about implementation
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}
