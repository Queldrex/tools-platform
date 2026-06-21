import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import GoProButton from '@/components/GoProButton'
import ScrollReveal from '@/components/ScrollReveal'
import HomeDemo from './HomeDemo'
import ScanCounter from './ScanCounter'
import ToolCards from './ToolCards'

const CATEGORIES = [
  { name: 'Security', accent: '#f87171', count: 12, tools: ['CVE Scanner', 'SSL Inspector', 'Contract Scanner', 'Breach Lookup'], href: '/tools#security' },
  { name: 'Developer', accent: '#06b6d4', count: 10, tools: ['DNS Health', 'Email Deliverability', 'JSON Formatter', 'JWT Decoder'], href: '/tools#developer' },
  { name: 'Business', accent: '#4ade80', count: 21, tools: ['NDA Generator', 'SaaS Metrics', 'Break-Even', 'Cash Flow'], href: '/tools#business' },
  { name: 'AI Visibility', accent: '#a78bfa', count: 4, tools: ['Schema Validator', 'Schema Generator', 'robots.txt', 'Vibe Security'], href: '/tools#ai-visibility' },
]

const REVENUE_STREAMS = [
  { icon: '🛠', title: 'Use it.', body: 'Free tools work right now — no account, no card. Pro removes all limits for $79/mo.', price: 'Free to $79/mo', cta: 'Browse Tools', href: '/tools', accent: '#7c3aed' },
  { icon: '📄', title: 'Get a template.', body: 'PDF checklists and playbooks you own forever. One-time purchase, nothing to cancel.', price: '$9 to $49', cta: 'Browse Templates', href: '/downloads', accent: '#06b6d4' },
  { icon: '🔧', title: 'Have us do it.', body: 'We set it up in your business. Security scanning, schema markup, email deliverability — done.', price: 'From $299', cta: 'Get a Quote', href: '/apply', accent: '#4ade80' },
]

const PRICING = [
  { name: 'Free', price: '$0', period: '', sub: 'No account. No credit card. Just use it.', features: ['All free tools included', 'No account required', '3 to 10 uses per day per tool', 'Instant results'], cta: 'Open the toolkit', href: '/tools', highlight: false },
  { name: 'Individual Tool', price: 'From $9', period: ' one-time', sub: 'Buy just the tool you need. Keep it forever.', features: ['One tool of your choice', 'Unlimited daily use', 'One-time purchase', 'No subscription'], cta: 'Browse tools', href: '/tools', highlight: false },
  { name: 'Pro', price: '$79', period: '/mo', sub: 'Every tool. Every update. One price.', features: ['All 47 tools, no limits', 'New tools added regularly', 'Every category included', 'Cancel anytime'], cta: 'Go Pro', href: '/pricing', highlight: true },
]

const TESTIMONIALS = [
  { quote: "The DNS health checker caught a missing DMARC record that was killing our deliverability. Took 10 seconds.", name: 'Marcus T.', role: 'Backend Engineer' },
  { quote: "I use the NDA generator for every freelance contract. Clean output, no account needed, done in 60 seconds.", name: 'Priya K.', role: 'Freelance Developer' },
  { quote: "Ran the CVE scanner on our package.json before a release and found three critical lodash vulnerabilities we missed.", name: 'Jordan R.', role: 'DevOps Lead' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: '#09090B' }}>
      <style>{`
        @keyframes glow-drift {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          33% { transform: translate(-48%, -52%) scale(1.08); }
          66% { transform: translate(-52%, -48%) scale(1.05); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.7; transform: translateX(-50%) scale(1); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.12); }
        }
        @keyframes count-up-fade {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-glow { animation: glow-drift 9s ease-in-out infinite; }
        .footer-glow { animation: glow-pulse 7s ease-in-out infinite; }
        .count-reveal { animation: count-up-fade 0.4s ease forwards; }
      `}</style>

      <Header />

      {/* Hero */}
      <section className="pt-32 pb-28 px-6 text-center" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="hero-glow" style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          width: '800px',
          height: '600px',
          background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.13) 0%, rgba(109,40,217,0.05) 45%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        <div className="max-w-3xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-10 text-xs font-bold tracking-widest"
            style={{ color: 'rgba(255,255,255,0.3)', borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', letterSpacing: '0.08em' }}
          >
            No signup &nbsp;·&nbsp; No card &nbsp;·&nbsp; Use it right now
          </div>

          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-black mb-7"
            style={{ color: '#FAFAFA', lineHeight: '1.06', letterSpacing: '-0.025em' }}
          >
            Pro tools that work<br />
            <span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 40%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              before you sign up.
            </span>
          </h1>

          <p className="text-lg md:text-xl max-w-lg mx-auto mb-10" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.65' }}>
            Security, DNS, legal documents, business analytics.<br className="hidden sm:block" />
            47 tools. Open one and start — nothing required.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/tools"
              className="px-8 py-4 rounded-xl text-base font-black text-white transition-all hover:scale-[1.02] hover:shadow-2xl"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 32px rgba(124,58,237,0.4)' }}
            >
              Open the toolkit →
            </Link>
            <GoProButton
              returnTo="/tools"
              className="px-8 py-4 rounded-xl text-base font-black transition-all hover:bg-white/8 border"
              style={{ color: 'rgba(255,255,255,0.55)', borderColor: 'rgba(255,255,255,0.12)', background: 'transparent' }}
            >
              Go Pro · $79/mo
            </GoProButton>
          </div>
        </div>
      </section>

      {/* Live Demo */}
      <section className="max-w-4xl mx-auto px-6 pb-10">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.18em] mb-5" style={{ color: 'rgba(255,255,255,0.18)' }}>
          Live result · Runs fresh every page load
        </p>
        <HomeDemo />
      </section>

      {/* Trust bar */}
      <div className="border-t border-b px-6 py-5 mt-6" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div
          className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-bold uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          <ScanCounter />
          <span className="hidden sm:inline" style={{ color: 'rgba(255,255,255,0.07)' }}>·</span>
          <span>Free forever. No card. No expiry.</span>
          <span className="hidden sm:inline" style={{ color: 'rgba(255,255,255,0.07)' }}>·</span>
          <span>Cancel Pro anytime</span>
          <span className="hidden sm:inline" style={{ color: 'rgba(255,255,255,0.07)' }}>·</span>
          <span>Payments secured by Stripe</span>
        </div>
      </div>

      {/* Three ways */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}>How it works</p>
              <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: '#FAFAFA', letterSpacing: '-0.02em' }}>Use it. Buy it. Have us build it.</h2>
              <p className="text-lg" style={{ color: 'rgba(255,255,255,0.45)' }}>Three ways to get value from Queldrex today.</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {REVENUE_STREAMS.map((stream, i) => (
              <ScrollReveal key={stream.title} delay={i * 80}>
                <div className="rounded-2xl border p-7 flex flex-col h-full"
                  style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)', borderTop: `2px solid ${stream.accent}` }}>
                  <div className="text-3xl mb-4">{stream.icon}</div>
                  <p className="text-base font-black mb-2" style={{ color: '#FAFAFA' }}>{stream.title}</p>
                  <p className="text-sm leading-relaxed mb-5 flex-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{stream.body}</p>
                  <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: stream.accent }}>{stream.price}</p>
                  <Link href={stream.href}
                    className="text-sm font-black text-center py-2.5 rounded-lg border transition-all hover:bg-white/5"
                    style={{ color: stream.accent, borderColor: `${stream.accent}33` }}>
                    {stream.cta} →
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="py-28 px-6" style={{ background: '#0F1117' }}>
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}>Free to use</p>
              <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: '#FAFAFA', letterSpacing: '-0.02em' }}>Start with any tool, right now</h2>
              <p className="text-lg" style={{ color: 'rgba(255,255,255,0.45)' }}>No account. No trial period. Just results.</p>
            </div>
          </ScrollReveal>
          <ToolCards />
          <div className="text-center mt-10">
            <Link href="/tools" className="text-sm font-black transition-colors hover:text-white/70" style={{ color: 'rgba(255,255,255,0.35)' }}>
              View all 47 tools →
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}>Four categories</p>
              <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: '#FAFAFA', letterSpacing: '-0.02em' }}>Everything in one subscription</h2>
              <p className="text-lg" style={{ color: 'rgba(255,255,255,0.45)' }}>Pro gives you unlimited access to every tool in every category.</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {CATEGORIES.map((cat, i) => (
              <ScrollReveal key={cat.name} delay={i * 70}>
                <Link href={cat.href}
                  className="rounded-2xl border p-6 transition-all hover:border-white/15 hover:-translate-y-0.5 block"
                  style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)', borderTop: `2px solid ${cat.accent}` }}>
                  <p className="text-base font-black mb-0.5" style={{ color: cat.accent }}>{cat.name}</p>
                  <p className="text-xs font-bold mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>{cat.count} tools</p>
                  <ul className="space-y-1.5">
                    {cat.tools.map((t) => (
                      <li key={t} className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{t}</li>
                    ))}
                  </ul>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-28 px-6" style={{ background: '#0F1117' }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}>Real results</p>
              <h2 className="text-3xl md:text-4xl font-black" style={{ color: '#FAFAFA', letterSpacing: '-0.02em' }}>What developers are finding</h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="rounded-2xl border p-7 flex flex-col gap-5 h-full" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'rgba(124,58,237,0.45)' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                  </svg>
                  <p className="text-sm leading-relaxed flex-1" style={{ color: 'rgba(255,255,255,0.55)' }}>{t.quote}</p>
                  <div>
                    <p className="text-xs font-black" style={{ color: '#FAFAFA' }}>{t.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{t.role}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}>Pricing</p>
              <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: '#FAFAFA', letterSpacing: '-0.02em' }}>Start free. Upgrade when you need more.</h2>
              <p className="text-lg" style={{ color: 'rgba(255,255,255,0.45)' }}>Most teams never pay. Pro is there when free is not enough.</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PRICING.map((tier, i) => (
              <ScrollReveal key={tier.name} delay={i * 80}>
                <div className="rounded-2xl border p-7 flex flex-col h-full"
                  style={tier.highlight
                    ? { background: '#0d1117', borderColor: 'rgba(124,58,237,0.4)', boxShadow: '0 0 48px rgba(124,58,237,0.08)' }
                    : { background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                  <div className="mb-6">
                    <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: tier.highlight ? '#a78bfa' : 'rgba(255,255,255,0.3)' }}>{tier.name}</p>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-4xl font-black" style={{ color: '#FAFAFA' }}>{tier.price}</span>
                      <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.25)' }}>{tier.period}</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{tier.sub}</p>
                  </div>
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: tier.highlight ? '#a78bfa' : '#4ade80' }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={tier.href}
                    className="w-full text-center py-3 rounded-xl text-sm font-black transition-all hover:scale-[1.02]"
                    style={tier.highlight
                      ? { background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }
                      : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.09)' }}>
                    {tier.cta}
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Request a Tool */}
      <section className="py-16 px-6" style={{ background: '#0F1117' }}>
        <ScrollReveal>
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border p-8 flex flex-col md:flex-row items-center justify-between gap-6"
              style={{ background: 'rgba(124,58,237,0.05)', borderColor: 'rgba(124,58,237,0.18)' }}>
              <div>
                <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#a78bfa' }}>Missing something?</p>
                <h3 className="text-xl font-black mb-1" style={{ color: '#FAFAFA' }}>Request a tool</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>Don&apos;t see what you need? Tell us. We ship new tools every week based on requests.</p>
              </div>
              <Link
                href="/request-tool"
                className="flex-shrink-0 px-6 py-3 rounded-xl text-sm font-black transition-all hover:scale-[1.02] whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', boxShadow: '0 0 20px rgba(124,58,237,0.28)' }}
              >
                Make a request →
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer CTA */}
      <section className="py-28 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
        <div className="footer-glow" style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          width: '600px',
          height: '360px',
          background: 'radial-gradient(ellipse at bottom, rgba(124,58,237,0.1) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }} />
        <ScrollReveal>
          <div className="max-w-2xl mx-auto text-center" style={{ position: 'relative', zIndex: 1 }}>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] mb-6" style={{ color: 'rgba(255,255,255,0.2)' }}>Ready?</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: '#FAFAFA', letterSpacing: '-0.02em', lineHeight: '1.08' }}>
              Open any tool.<br />
              <span style={{ background: 'linear-gradient(135deg, #a78bfa, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>No account needed.</span>
            </h2>
            <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.4)' }}>Start free. Upgrade to Pro when you need more.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/tools"
                className="px-8 py-4 rounded-xl text-base font-black text-white transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 32px rgba(124,58,237,0.35)' }}
              >
                Open the toolkit →
              </Link>
              <GoProButton
                returnTo="/tools"
                className="px-8 py-4 rounded-xl text-base font-black transition-all hover:bg-white/8 border"
                style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.12)', background: 'transparent' }}
              >
                Go Pro · $79/mo
              </GoProButton>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Queldrex',
            url: 'https://queldrex.com',
            description: '47 professional tools for developers and small teams — security, DNS, legal documents, and business analytics. Free to use, no account required.',
            potentialAction: {
              '@type': 'SearchAction',
              target: { '@type': 'EntryPoint', urlTemplate: 'https://queldrex.com/tools?q={search_term_string}' },
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
      <Footer />
    </div>
  )
}
