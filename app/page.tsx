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

const TESTIMONIALS = [
  { quote: "The DNS health checker caught a missing DMARC record that was killing our deliverability. Took 10 seconds.", name: 'Marcus T.', role: 'Backend Engineer' },
  { quote: "I use the NDA generator for every freelance contract. Clean output, no account needed, done in 60 seconds.", name: 'Priya K.', role: 'Freelance Developer' },
  { quote: "Ran the CVE scanner on our package.json before a release and found three critical lodash vulnerabilities we missed.", name: 'Jordan R.', role: 'DevOps Lead' },
]

const PRICING = [
  { name: 'Free', price: '$0', period: '', sub: 'No account. No card. Just open a tool.', features: ['All free tools included', 'No account required', '3–10 uses per day per tool', 'Instant results'], cta: 'Open the toolkit', href: '/tools', highlight: false },
  { name: 'Individual Tool', price: 'From $9', period: ' one-time', sub: 'One tool, unlimited use, yours forever.', features: ['One tool of your choice', 'Unlimited daily use', 'One-time purchase', 'No subscription'], cta: 'Browse tools', href: '/tools', highlight: false },
  { name: 'Pro', price: '$79', period: '/mo', sub: 'Every tool. Every update. One price.', features: ['All 47 tools, no limits', 'New tools added regularly', 'Every category included', 'Cancel anytime'], cta: 'Go Pro', href: '/pricing', highlight: true },
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
          0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
        }
        .hero-glow { animation: glow-drift 9s ease-in-out infinite; }
        .footer-glow { animation: glow-pulse 7s ease-in-out infinite; }
      `}</style>

      <Header />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-24 px-6 text-center" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="hero-glow" style={{
          position: 'absolute', top: '45%', left: '50%',
          width: '900px', height: '600px',
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, rgba(109,40,217,0.04) 50%, transparent 70%)',
          filter: 'blur(64px)', pointerEvents: 'none', zIndex: 0,
        }} />

        <div className="max-w-3xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
          <div
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border mb-10 text-xs font-semibold"
            style={{ color: 'rgba(255,255,255,0.28)', borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', letterSpacing: '0.05em' }}
          >
            47 tools &nbsp;·&nbsp; Free &nbsp;·&nbsp; No account
          </div>

          <h1
            className="font-black mb-6"
            style={{ fontSize: 'clamp(2.8rem, 7vw, 4.75rem)', lineHeight: 1.06, letterSpacing: '-0.03em', color: '#FAFAFA' }}
          >
            Pro tools that work<br />
            <span style={{ background: 'linear-gradient(130deg, #a78bfa 0%, #818cf8 45%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              before you sign&nbsp;up.
            </span>
          </h1>

          <p className="text-xl max-w-md mx-auto mb-10" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.55 }}>
            Security, DNS, legal docs, analytics — open any tool right now.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/tools"
              className="px-8 py-4 rounded-xl text-base font-black text-white transition-all hover:scale-[1.03]"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 36px rgba(124,58,237,0.45)' }}
            >
              Open the toolkit →
            </Link>
            <GoProButton
              returnTo="/tools"
              className="px-8 py-4 rounded-xl text-base font-black transition-all border"
              style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)', background: 'transparent' }}
            >
              Go Pro · $79/mo
            </GoProButton>
          </div>
        </div>
      </section>

      {/* ── Live Demo ────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.16em] mb-5" style={{ color: 'rgba(255,255,255,0.16)' }}>
          Live result · Runs fresh every page load
        </p>
        <HomeDemo />
      </section>

      {/* ── Trust bar ────────────────────────────────────────────────────── */}
      <div className="border-t border-b px-6 py-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.18)' }}>
          <ScanCounter />
          <span className="hidden sm:inline" style={{ color: 'rgba(255,255,255,0.06)' }}>·</span>
          <span>Free forever · No card · No expiry</span>
          <span className="hidden sm:inline" style={{ color: 'rgba(255,255,255,0.06)' }}>·</span>
          <span>Payments by Stripe</span>
        </div>
      </div>

      {/* ── Featured Tools ───────────────────────────────────────────────── */}
      <section className="py-28 px-6" style={{ background: '#0c0e14' }}>
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-4" style={{ color: 'rgba(255,255,255,0.18)' }}>Free to use</p>
              <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: '#FAFAFA', letterSpacing: '-0.02em' }}>Start with any tool, right now</h2>
              <p className="text-lg" style={{ color: 'rgba(255,255,255,0.4)' }}>No account. No trial. Just results.</p>
            </div>
          </ScrollReveal>
          <ToolCards />
          <div className="text-center mt-10">
            <Link href="/tools" className="text-sm font-bold transition-colors hover:text-white/60" style={{ color: 'rgba(255,255,255,0.3)' }}>
              View all 47 tools →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-4" style={{ color: 'rgba(255,255,255,0.18)' }}>Four categories</p>
              <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: '#FAFAFA', letterSpacing: '-0.02em' }}>Everything in one subscription</h2>
              <p className="text-lg" style={{ color: 'rgba(255,255,255,0.4)' }}>Pro unlocks unlimited access to all 47 tools across every category.</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, i) => (
              <ScrollReveal key={cat.name} delay={i * 60}>
                <Link href={cat.href}
                  className="rounded-2xl border p-6 block transition-all duration-200 hover:-translate-y-1"
                  style={{ background: '#0c0e14', borderColor: 'rgba(255,255,255,0.07)', borderTop: `2px solid ${cat.accent}` }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
                >
                  <p className="text-sm font-black mb-0.5" style={{ color: cat.accent }}>{cat.name}</p>
                  <p className="text-[11px] font-bold mb-4" style={{ color: 'rgba(255,255,255,0.22)' }}>{cat.count} tools</p>
                  <ul className="space-y-1.5">
                    {cat.tools.map(t => (
                      <li key={t} className="text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>{t}</li>
                    ))}
                  </ul>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="py-28 px-6" style={{ background: '#0c0e14' }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-4" style={{ color: 'rgba(255,255,255,0.18)' }}>Real results</p>
              <h2 className="text-3xl md:text-4xl font-black" style={{ color: '#FAFAFA', letterSpacing: '-0.02em' }}>What developers are catching</h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <ScrollReveal key={i} delay={i * 70}>
                <div className="rounded-2xl border p-7 flex flex-col gap-5 h-full" style={{ background: '#09090B', borderColor: 'rgba(255,255,255,0.07)' }}>
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'rgba(124,58,237,0.4)' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                  </svg>
                  <p className="text-sm leading-relaxed flex-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{t.quote}</p>
                  <div>
                    <p className="text-xs font-black" style={{ color: '#FAFAFA' }}>{t.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.22)' }}>{t.role}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-4" style={{ color: 'rgba(255,255,255,0.18)' }}>Pricing</p>
              <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: '#FAFAFA', letterSpacing: '-0.02em' }}>Start free. Pay only when you need more.</h2>
              <p className="text-lg" style={{ color: 'rgba(255,255,255,0.4)' }}>Most developers never hit the free limits.</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRICING.map((tier, i) => (
              <ScrollReveal key={tier.name} delay={i * 70}>
                <div className="rounded-2xl border p-7 flex flex-col h-full"
                  style={tier.highlight
                    ? { background: '#0c0e14', borderColor: 'rgba(124,58,237,0.38)', boxShadow: '0 0 48px rgba(124,58,237,0.07)' }
                    : { background: '#0c0e14', borderColor: 'rgba(255,255,255,0.07)' }}>
                  <p className="text-[11px] font-black uppercase tracking-widest mb-4" style={{ color: tier.highlight ? '#a78bfa' : 'rgba(255,255,255,0.28)' }}>{tier.name}</p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-black" style={{ color: '#FAFAFA' }}>{tier.price}</span>
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.22)' }}>{tier.period}</span>
                  </div>
                  <p className="text-xs mb-6 mt-1" style={{ color: 'rgba(255,255,255,0.38)' }}>{tier.sub}</p>
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {tier.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.48)' }}>
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
                      ? { background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', boxShadow: '0 0 20px rgba(124,58,237,0.28)' }
                      : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {tier.cta}
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Need more? <Link href="/pricing" className="underline hover:text-white/40 transition-colors">See full pricing</Link> or <Link href="/agency" className="underline hover:text-white/40 transition-colors">view Agency plan</Link>.
          </p>
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────────────────────── */}
      <section className="py-28 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
        <div className="footer-glow" style={{
          position: 'absolute', bottom: 0, left: '50%',
          width: '600px', height: '400px',
          background: 'radial-gradient(ellipse at bottom, rgba(124,58,237,0.09) 0%, transparent 70%)',
          filter: 'blur(56px)', pointerEvents: 'none',
        }} />
        <ScrollReveal>
          <div className="max-w-xl mx-auto text-center" style={{ position: 'relative', zIndex: 1 }}>
            <h2 className="font-black mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.1, letterSpacing: '-0.025em', color: '#FAFAFA' }}>
              Open any tool.<br />
              <span style={{ background: 'linear-gradient(130deg, #a78bfa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>No account needed.</span>
            </h2>
            <p className="text-base mb-9" style={{ color: 'rgba(255,255,255,0.38)' }}>
              Free to start. Upgrade to Pro when you need more.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/tools"
                className="px-8 py-4 rounded-xl text-base font-black text-white transition-all hover:scale-[1.03]"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 32px rgba(124,58,237,0.38)' }}
              >
                Open the toolkit →
              </Link>
              <GoProButton
                returnTo="/tools"
                className="px-8 py-4 rounded-xl text-base font-black transition-all border"
                style={{ color: 'rgba(255,255,255,0.45)', borderColor: 'rgba(255,255,255,0.1)', background: 'transparent' }}
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
            description: '47 professional tools for developers and small teams — security scanning, DNS health, legal documents, and business analytics. Free to use, no account required.',
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
