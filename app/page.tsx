import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import GoProButton from '@/components/GoProButton'
import ScrollReveal from '@/components/ScrollReveal'
import HomeDemo from './HomeDemo'
import ScanCounter from './ScanCounter'
import ToolCards from './ToolCards'

export const metadata: Metadata = {
  alternates: { canonical: 'https://queldrex.com' },
  openGraph: {
    title: 'Queldrex — Free Developer & Business Tools',
    description: '48 tools for developers and small teams. Security, DNS, legal docs, business analytics. No account required.',
    url: 'https://queldrex.com',
    siteName: 'Queldrex',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Queldrex — Free Developer & Business Tools',
    description: '48 tools for developers and small teams. Security, DNS, legal docs, business analytics. No account required.',
  },
}

const PAIN_POINTS = [
  {
    icon: '🔒',
    problem: 'You need a security audit.',
    reality: "A real pentest costs $5,000. You need to know if your package.json is a liability before Tuesday.",
    solution: 'CVE scanner, dependency checker, vibe security scan — run them in 30 seconds.',
    accent: '#f87171',
  },
  {
    icon: '📝',
    problem: 'You need a legal document.',
    reality: "A lawyer charges $400/hr. You need an NDA for a new client call tomorrow morning.",
    solution: 'NDA generator, ToS builder, refund policy — clean output, no attorney required.',
    accent: '#4ade80',
  },
  {
    icon: '🌐',
    problem: 'Your email deliverability is broken.',
    reality: "Your cold outreach is going to spam. You have no idea if it's DMARC, SPF, or MX.",
    solution: 'DNS health checker, email deliverability scanner — know exactly what\'s wrong in 10 seconds.',
    accent: '#06b6d4',
  },
]

const CATEGORIES = [
  { name: 'Security',      accent: '#f87171', count: 12, desc: 'CVE scanner, SSL inspector, breach lookup, contract scanner, and more', href: '/tools#security' },
  { name: 'Developer',     accent: '#06b6d4', count: 10, desc: 'DNS health, email deliverability, JSON formatter, JWT decoder, and more', href: '/tools#developer' },
  { name: 'Business',      accent: '#4ade80', count: 22, desc: 'NDA generator, SaaS metrics, break-even calculator, cash flow, and more', href: '/tools#business' },
  { name: 'AI Visibility', accent: '#a78bfa', count:  4, desc: 'Schema validator, robots.txt builder, structured data, and more',        href: '/tools#ai-visibility' },
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
          33%       { transform: translate(-48%, -52%) scale(1.08); }
          66%       { transform: translate(-52%, -48%) scale(1.05); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(1); }
          50%       { opacity: 0.9; transform: translateX(-50%) scale(1.1); }
        }
        .hero-glow  { animation: glow-drift  9s ease-in-out infinite; }
        .footer-glow{ animation: glow-pulse  7s ease-in-out infinite; }
      `}</style>

      <Header />

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-24 px-6 text-center" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="hero-glow" style={{
          position: 'absolute', top: '45%', left: '50%',
          width: '900px', height: '700px',
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.11) 0%, rgba(109,40,217,0.04) 50%, transparent 70%)',
          filter: 'blur(72px)', pointerEvents: 'none', zIndex: 0,
        }} />

        <div className="max-w-4xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-10 text-xs font-semibold"
            style={{ color: 'rgba(255,255,255,0.3)', borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', letterSpacing: '0.06em' }}
          >
            Queldrex LLC &nbsp;·&nbsp; Castle Rock, CO &nbsp;·&nbsp; Founded 2024
          </div>

          <h1
            className="font-black mb-6"
            style={{ fontSize: 'clamp(2.6rem, 6.5vw, 5rem)', lineHeight: 1.05, letterSpacing: '-0.03em', color: '#FAFAFA' }}
          >
            We build the tools<br />
            <span style={{ background: 'linear-gradient(130deg, #a78bfa 0%, #818cf8 40%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              your team actually needs.
            </span>
          </h1>

          <p className="text-xl mb-4 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
            Professional security audits, legal documents, DNS health checks, and business analytics — built for developers and small teams who do everything themselves.
          </p>
          <p className="text-base mb-12 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.28)' }}>
            48 tools. Free to use right now. No account, no card, no setup.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/tools"
              className="px-9 py-4 rounded-xl text-base font-black text-white transition-all hover:scale-[1.03]"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 40px rgba(124,58,237,0.5)' }}
            >
              Explore free tools →
            </Link>
            <GoProButton
              returnTo="/tools"
              className="px-9 py-4 rounded-xl text-base font-black transition-all border"
              style={{ color: 'rgba(255,255,255,0.55)', borderColor: 'rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.03)' }}
            >
              Go Pro · $79/mo
            </GoProButton>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ─────────────────────────────────────────────────────────── */}
      <div className="border-t border-b px-6 py-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>
          <ScanCounter />
          <span className="hidden sm:inline" style={{ color: 'rgba(255,255,255,0.06)' }}>·</span>
          <span>Free forever · No card required</span>
          <span className="hidden sm:inline" style={{ color: 'rgba(255,255,255,0.06)' }}>·</span>
          <span>48 tools across 4 categories</span>
          <span className="hidden sm:inline" style={{ color: 'rgba(255,255,255,0.06)' }}>·</span>
          <span>Payments by Stripe</span>
        </div>
      </div>

      {/* ── WHO WE ARE ────────────────────────────────────────────────────────── */}
      <section className="py-28 px-6" style={{ background: '#0c0e14' }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-5" style={{ color: 'rgba(255,255,255,0.2)' }}>Who we are</p>
                <h2 className="font-black mb-6" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', lineHeight: 1.1, letterSpacing: '-0.025em', color: '#FAFAFA' }}>
                  Built by developers.<br />For the team of&nbsp;one.
                </h2>
                <p className="text-lg mb-5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Queldrex LLC is a developer tools company based in Castle Rock, Colorado. We started because we kept paying enterprise prices for tools we used twice a month — or skipping them entirely because they were too expensive or too slow to set up.
                </p>
                <p className="text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  So we built the toolkit we wished existed: professional tools that work the second you open them, with no account, no trial period, and no sales call required.
                </p>
                <div className="mt-8">
                  <Link href="/about" className="text-sm font-black" style={{ color: '#a78bfa' }}>
                    Learn more about us →
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '48',    label: 'Professional tools' },
                  { value: '4',     label: 'Tool categories' },
                  { value: '$0',    label: 'To get started' },
                  { value: '< 30s', label: 'From landing to results' },
                ].map(stat => (
                  <div key={stat.label} className="rounded-2xl border p-6 text-center" style={{ background: '#09090B', borderColor: 'rgba(255,255,255,0.07)' }}>
                    <div className="text-3xl font-black mb-1" style={{ color: '#a78bfa' }}>{stat.value}</div>
                    <div className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── THE PROBLEM WE SOLVE ──────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}>Why Queldrex exists</p>
              <h2 className="font-black mb-4" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', lineHeight: 1.1, letterSpacing: '-0.025em', color: '#FAFAFA' }}>
                {"You're not just a developer."}<br />{"You're everything."}
              </h2>
              <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Security team. Legal department. DevOps. Finance. We build the tools for the person who has to be all of them.
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-4">
            {PAIN_POINTS.map((p, i) => (
              <ScrollReveal key={p.problem} delay={i * 80}>
                <div className="rounded-2xl border p-7 md:p-8" style={{ background: '#0c0e14', borderColor: 'rgba(255,255,255,0.07)', borderLeft: `3px solid ${p.accent}` }}>
                  <div className="grid md:grid-cols-3 gap-6 items-start">
                    <div>
                      <p className="text-2xl mb-3">{p.icon}</p>
                      <p className="text-base font-black mb-2" style={{ color: '#FAFAFA' }}>{p.problem}</p>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>{p.reality}</p>
                    </div>
                    <div className="md:col-span-2 md:border-l pl-0 md:pl-8" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                      <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: p.accent }}>The Queldrex fix</p>
                      <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{p.solution}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE DEMO ─────────────────────────────────────────────────────────── */}
      <section className="py-10 px-6" style={{ background: '#0c0e14' }}>
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>See it work</p>
              <h2 className="text-2xl font-black" style={{ color: '#FAFAFA', letterSpacing: '-0.02em' }}>Live DNS health check — runs fresh every page load</h2>
            </div>
          </ScrollReveal>
          <HomeDemo />
        </div>
      </section>

      {/* ── TOOLS ─────────────────────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}>The toolkit</p>
              <h2 className="font-black mb-3" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', lineHeight: 1.1, letterSpacing: '-0.025em', color: '#FAFAFA' }}>
                48 tools across 4 categories
              </h2>
              <p className="text-lg" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Every tool free to start. Go Pro for unlimited access.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {CATEGORIES.map((cat, i) => (
              <ScrollReveal key={cat.name} delay={i * 60}>
                <Link
                  href={cat.href}
                  className="rounded-2xl border border-white/[0.07] hover:border-white/[0.16] p-6 block transition-all duration-200 hover:-translate-y-1 group"
                  style={{ background: '#0c0e14', borderTop: `2px solid ${cat.accent}` }}
                >
                  <p className="text-sm font-black mb-0.5" style={{ color: cat.accent }}>{cat.name}</p>
                  <p className="text-[11px] font-bold mb-3" style={{ color: 'rgba(255,255,255,0.22)' }}>{cat.count} tools</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>{cat.desc}</p>
                  <p className="text-xs font-bold mt-4" style={{ color: cat.accent }}>Browse →</p>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          <ToolCards />
          <div className="text-center mt-10">
            <Link href="/tools" className="text-sm font-bold transition-colors hover:text-white/60" style={{ color: 'rgba(255,255,255,0.3)' }}>
              View all 48 tools — most are free →
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────────── */}
      <section className="py-28 px-6" style={{ background: '#0c0e14' }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}>Real results</p>
              <h2 className="font-black" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', lineHeight: 1.1, letterSpacing: '-0.025em', color: '#FAFAFA' }}>
                What developers are catching
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <ScrollReveal key={i} delay={i * 70}>
                <div className="rounded-2xl border p-7 flex flex-col gap-5 h-full" style={{ background: '#09090B', borderColor: 'rgba(255,255,255,0.07)' }}>
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'rgba(124,58,237,0.45)' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                  </svg>
                  <p className="text-sm leading-relaxed flex-1" style={{ color: 'rgba(255,255,255,0.52)' }}>{t.quote}</p>
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

      {/* ── PRICING ───────────────────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}>Pricing</p>
              <h2 className="font-black mb-3" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', lineHeight: 1.1, letterSpacing: '-0.025em', color: '#FAFAFA' }}>
                Start free. Upgrade when you need more.
              </h2>
              <p className="text-lg" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Most developers never hit the free limits. Pro is there when they do.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
            <ScrollReveal>
              <div className="rounded-2xl border p-8 flex flex-col h-full" style={{ background: '#0c0e14', borderColor: 'rgba(255,255,255,0.08)' }}>
                <p className="text-[11px] font-black uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Free</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-black" style={{ color: '#FAFAFA' }}>$0</span>
                </div>
                <p className="text-xs mb-7 mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>No account. No card. Open a tool and go.</p>
                <ul className="space-y-2.5 mb-8 flex-1 text-sm" style={{ color: 'rgba(255,255,255,0.48)' }}>
                  {['All 48 tools, free tier', '3–10 uses per tool per day', 'No account required', 'Instant results'].map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#4ade80' }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/tools" className="w-full text-center py-3 rounded-xl text-sm font-black transition-all hover:scale-[1.02]" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.09)' }}>
                  Explore free tools
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={80}>
              <div className="rounded-2xl border p-8 flex flex-col h-full" style={{ background: '#0c0e14', borderColor: 'rgba(124,58,237,0.4)', boxShadow: '0 0 60px rgba(124,58,237,0.1)' }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#a78bfa' }}>Pro</p>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full" style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white' }}>Most Popular</span>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-black" style={{ color: '#FAFAFA' }}>$79</span>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>/mo</span>
                </div>
                <p className="text-xs mb-7 mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Every tool. No limits. Cancel anytime.</p>
                <ul className="space-y-2.5 mb-8 flex-1 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {['All 48 tools, unlimited use', 'New tools added regularly', 'Every category included', '7-day full refund guarantee', 'Cancel from Stripe portal anytime'].map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#a78bfa' }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <GoProButton
                  returnTo="/tools"
                  className="w-full text-center py-3.5 rounded-xl text-sm font-black text-white transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 24px rgba(124,58,237,0.4)' }}
                >
                  Get Pro · $79/mo
                </GoProButton>
                <p className="text-center text-xs mt-3" style={{ color: 'rgba(255,255,255,0.22)' }}>
                  or <Link href="/pricing" className="underline hover:text-white/40 transition-colors">save 17% with annual billing</Link>
                </p>
              </div>
            </ScrollReveal>
          </div>

          <p className="text-center text-xs mt-8" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Need white-label reports and 25 client scans per month?{' '}
            <Link href="/pricing" className="underline hover:text-white/35 transition-colors">View Agency plan →</Link>
          </p>
        </div>
      </section>

      {/* ── FOOTER CTA ────────────────────────────────────────────────────────── */}
      <section className="py-28 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
        <div className="footer-glow" style={{
          position: 'absolute', bottom: 0, left: '50%',
          width: '700px', height: '400px',
          background: 'radial-gradient(ellipse at bottom, rgba(124,58,237,0.09) 0%, transparent 70%)',
          filter: 'blur(56px)', pointerEvents: 'none',
        }} />
        <ScrollReveal>
          <div className="max-w-2xl mx-auto text-center" style={{ position: 'relative', zIndex: 1 }}>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-6" style={{ color: 'rgba(255,255,255,0.2)' }}>Get started</p>
            <h2 className="font-black mb-4" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', lineHeight: 1.08, letterSpacing: '-0.025em', color: '#FAFAFA' }}>
              Open any tool.<br />
              <span style={{ background: 'linear-gradient(130deg, #a78bfa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Results in under 30 seconds.
              </span>
            </h2>
            <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.35)' }}>
              No account. No trial. Just open a tool and go.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/tools"
                className="px-9 py-4 rounded-xl text-base font-black text-white transition-all hover:scale-[1.03]"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 36px rgba(124,58,237,0.42)' }}
              >
                Explore free tools →
              </Link>
              <GoProButton
                returnTo="/tools"
                className="px-9 py-4 rounded-xl text-base font-black transition-all border"
                style={{ color: 'rgba(255,255,255,0.48)', borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)' }}
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
            '@type': 'Organization',
            name: 'Queldrex LLC',
            url: 'https://queldrex.com',
            description: 'Developer tools company based in Castle Rock, Colorado. Professional security, DNS, legal, and business analytics tools for developers and small teams.',
            address: { '@type': 'PostalAddress', addressLocality: 'Castle Rock', addressRegion: 'CO', postalCode: '80104', addressCountry: 'US' },
            sameAs: ['https://x.com/queldrex'],
          }),
        }}
      />
      <Footer />
    </div>
  )
}
