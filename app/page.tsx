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
  { name: 'Business', accent: '#4ade80', count: 22, tools: ['NDA Generator', 'SaaS Metrics', 'Break-Even', 'Cash Flow'], href: '/tools#business' },
  { name: 'AI Visibility', accent: '#a78bfa', count: 4, tools: ['Schema Validator', 'Schema Generator', 'robots.txt', 'Vibe Security'], href: '/tools#ai-visibility' },
]

const REVENUE_STREAMS = [
  { icon: '🛠', title: 'Use it.', body: 'Free tools work right now — no account, no card. Pro removes all limits for $79/mo.', price: 'Free to $79/mo', cta: 'Browse Tools', href: '/tools', accent: '#7c3aed' },
  { icon: '📄', title: 'Get a template.', body: 'PDF checklists and playbooks you own forever. One-time purchase, nothing to cancel.', price: '$9 to $49', cta: 'Browse Templates', href: '/downloads', accent: '#06b6d4' },
  { icon: '🔧', title: 'Have us do it.', body: 'We set it up in your business. Security scanning, schema markup, email deliverability — done.', price: 'From $299', cta: 'Get a Quote', href: '/apply', accent: '#4ade80' },
]

const PRICING = [
  { name: 'Free', price: '$0', period: '/mo', sub: 'No account. No credit card. Just use it.', features: ['All free tools included', 'No account required', '3 to 10 uses per day per tool', 'Instant results'], cta: 'Browse Free Tools', href: '/tools', highlight: false },
  { name: 'Individual Tool', price: 'From $9', period: '/mo', sub: 'Pay once per tool. Cancel any month.', features: ['One tool of your choice', 'Unlimited daily use', 'Monthly billing', 'Cancel anytime'], cta: 'Browse Tools', href: '/tools', highlight: false },
  { name: 'Pro', price: '$79', period: '/mo', sub: 'Every tool. Every update. One price.', features: ['All 48 tools, no limits', 'New tools added regularly', 'Every category included', 'Cancel anytime'], cta: 'Go Pro', href: '/pricing', highlight: true },
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
      <section className="pt-28 pb-24 px-6 text-center" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="hero-glow" style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          width: '720px',
          height: '520px',
          background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.14) 0%, rgba(109,40,217,0.06) 40%, transparent 70%)',
          filter: 'blur(52px)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        <div className="max-w-4xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8 text-xs font-black uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.35)', borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}
          >
            48 tools · Free to start
          </div>

          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-black mb-6"
            style={{ color: '#FAFAFA', lineHeight: '1.05', letterSpacing: '-0.02em' }}
          >
            <span style={{ background: 'linear-gradient(135deg, #a78bfa, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>48 tools</span>
            {' '}for developers<br />and small teams.
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: '#A1A1AA' }}>
            Security scanning, legal documents, business analytics, and developer utilities. Built for people who ship.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/tools"
              className="px-8 py-4 rounded-xl text-base font-black text-white transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 30px rgba(124,58,237,0.35)' }}
            >
              Browse Free Tools →
            </Link>
            <GoProButton
              returnTo="/tools"
              className="px-8 py-4 rounded-xl text-base font-black transition-all hover:bg-white/10 border"
              style={{ color: 'rgba(255,255,255,0.65)', borderColor: 'rgba(255,255,255,0.15)', background: 'transparent' }}
            >
              Go Pro · $79/mo
            </GoProButton>
          </div>
        </div>
      </section>

      {/* Live Demo */}
      <section className="max-w-4xl mx-auto px-6 pb-10">
        <p className="text-center text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Live result · Updated every page load
        </p>
        <HomeDemo />
      </section>

      {/* Trust bar */}
      <div className="border-t border-b px-6 py-5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div
          className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-bold uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.22)' }}
        >
          <ScanCounter />
          <span className="hidden sm:inline" style={{ color: 'rgba(255,255,255,0.08)' }}>·</span>
          <span>Free forever. No card. No expiry.</span>
          <span className="hidden sm:inline" style={{ color: 'rgba(255,255,255,0.08)' }}>·</span>
          <span>Cancel anytime</span>
          <span className="hidden sm:inline" style={{ color: 'rgba(255,255,255,0.08)' }}>·</span>
          <span>Stripe-secured payments</span>
        </div>
      </div>

      {/* Three ways */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: '#FAFAFA' }}>Use it. Download it. Have us do it.</h2>
              <p className="text-lg" style={{ color: '#A1A1AA' }}>Three ways to work with Queldrex.</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {REVENUE_STREAMS.map((stream, i) => (
              <ScrollReveal key={stream.title} delay={i * 80}>
                <div className="rounded-2xl border p-7 flex flex-col h-full"
                  style={{ background: '#111318', borderColor: 'rgba(255,255,255,0.07)', borderTop: `2px solid ${stream.accent}` }}>
                  <div className="text-3xl mb-4">{stream.icon}</div>
                  <p className="text-base font-black mb-2" style={{ color: '#FAFAFA' }}>{stream.title}</p>
                  <p className="text-sm leading-relaxed mb-5 flex-1" style={{ color: '#A1A1AA' }}>{stream.body}</p>
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
      <section className="py-24 px-6" style={{ background: '#0F1117' }}>
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: '#FAFAFA' }}>Start with any free tool</h2>
              <p className="text-lg" style={{ color: '#A1A1AA' }}>Upgrade to Pro when you need more. No lock-in.</p>
            </div>
          </ScrollReveal>
          <ToolCards />
          <div className="text-center">
            <Link href="/tools" className="text-sm font-black transition-colors hover:text-white/80" style={{ color: 'rgba(255,255,255,0.4)' }}>
              View all 48 tools →
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: '#FAFAFA' }}>Four categories. One subscription.</h2>
              <p className="text-lg" style={{ color: '#A1A1AA' }}>Pro gives you unlimited access to every tool in every category.</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {CATEGORIES.map((cat, i) => (
              <ScrollReveal key={cat.name} delay={i * 70}>
                <Link href={cat.href}
                  className="rounded-2xl border p-6 transition-all hover:border-white/15 hover:-translate-y-0.5 block"
                  style={{ background: '#111318', borderColor: 'rgba(255,255,255,0.07)', borderTop: `2px solid ${cat.accent}` }}>
                  <p className="text-base font-black mb-0.5" style={{ color: cat.accent }}>{cat.name}</p>
                  <p className="text-xs font-bold mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>{cat.count} tools</p>
                  <ul className="space-y-1.5">
                    {cat.tools.map((t) => (
                      <li key={t} className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{t}</li>
                    ))}
                  </ul>
                </Link>
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
              style={{ background: 'rgba(124,58,237,0.06)', borderColor: 'rgba(124,58,237,0.2)' }}>
              <div>
                <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#a78bfa' }}>Missing a tool?</p>
                <h3 className="text-xl font-black mb-1" style={{ color: '#FAFAFA' }}>Request a Tool</h3>
                <p className="text-sm" style={{ color: '#A1A1AA' }}>Don&apos;t see what you need? Tell us what to build. We ship new tools every week based on requests.</p>
              </div>
              <Link
                href="/request-tool"
                className="flex-shrink-0 px-6 py-3 rounded-xl text-sm font-black transition-all hover:scale-[1.02] whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}
              >
                Request a Tool →
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6" style={{ background: '#0F1117' }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: '#FAFAFA' }}>Simple pricing</h2>
              <p className="text-lg" style={{ color: '#A1A1AA' }}>Most teams never pay. Pro is for when free is not enough.</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PRICING.map((tier, i) => (
              <ScrollReveal key={tier.name} delay={i * 80}>
                <div className="rounded-2xl border p-7 flex flex-col h-full"
                  style={tier.highlight
                    ? { background: '#111318', borderColor: 'rgba(124,58,237,0.45)', boxShadow: '0 0 40px rgba(124,58,237,0.1)' }
                    : { background: '#111318', borderColor: 'rgba(255,255,255,0.07)' }}>
                  <div className="mb-6">
                    <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: tier.highlight ? '#a78bfa' : 'rgba(255,255,255,0.35)' }}>{tier.name}</p>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-4xl font-black" style={{ color: '#FAFAFA' }}>{tier.price}</span>
                      <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>{tier.period}</span>
                    </div>
                    <p className="text-xs" style={{ color: '#A1A1AA' }}>{tier.sub}</p>
                  </div>
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm" style={{ color: '#A1A1AA' }}>
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
                      : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {tier.cta}
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <p className="text-center text-xs font-black uppercase tracking-widest mb-12" style={{ color: 'rgba(255,255,255,0.2)' }}>
              What developers say
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="rounded-2xl border p-6 flex flex-col gap-4 h-full" style={{ background: '#111318', borderColor: 'rgba(255,255,255,0.07)' }}>
                  <svg className="w-6 h-6 flex-shrink-0" style={{ color: 'rgba(124,58,237,0.5)' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                  </svg>
                  <p className="text-sm leading-relaxed flex-1" style={{ color: '#A1A1AA' }}>{t.quote}</p>
                  <div>
                    <p className="text-xs font-black" style={{ color: '#FAFAFA' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{t.role}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        <div className="footer-glow" style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          width: '500px',
          height: '300px',
          background: 'radial-gradient(ellipse at bottom, rgba(124,58,237,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }} />
        <ScrollReveal>
          <div className="max-w-2xl mx-auto text-center" style={{ position: 'relative', zIndex: 1 }}>
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: '#FAFAFA' }}>Pick a tool. Use it today.</h2>
            <p className="text-lg mb-8" style={{ color: '#A1A1AA' }}>Free tools need no account. Pro unlocks everything.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <GoProButton
                returnTo="/tools"
                className="px-8 py-4 rounded-xl text-base font-black text-white transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 30px rgba(124,58,237,0.3)' }}
              >
                Go Pro · $79/mo
              </GoProButton>
              <Link href="/tools" className="text-sm font-black transition-colors hover:text-white/80" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Browse Free Tools →
              </Link>
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
            description: '48 free tools for developers and small teams.',
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
