import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'About Queldrex — Built in Castle Rock, CO',
  description: 'Queldrex LLC builds developer and business tools. 48 tools live. Castle Rock, Colorado.',
}

const WHAT_WE_BUILD = [
  {
    title: 'Tool Suite',
    desc: '48 tools for developers and businesses. Security scanning, legal documents, business analytics, developer utilities. Free to start.',
    color: 'rgba(109,40,217,0.07)',
    border: 'rgba(109,40,217,0.2)',
    accent: '#7c3aed',
  },
  {
    title: 'AI Visibility',
    desc: 'We built the tools to find out if AI can discover your business, monitor your score monthly, and fix what is broken.',
    color: 'rgba(6,182,212,0.07)',
    border: 'rgba(6,182,212,0.2)',
    accent: '#06d6ff',
  },
  {
    title: 'Custom Builds',
    desc: 'Custom tools, automations, and web apps built for businesses and agencies. Fixed price. You own the code.',
    color: 'rgba(16,185,129,0.07)',
    border: 'rgba(16,185,129,0.2)',
    accent: 'rgb(16,185,129)',
  },
  {
    title: 'Agency Program',
    desc: 'White-label reports and reseller pricing for agencies managing multiple clients. One dashboard, your branding.',
    color: 'rgba(245,158,11,0.07)',
    border: 'rgba(245,158,11,0.2)',
    accent: 'rgb(245,158,11)',
  },
]

const FACTS = [
  { label: 'Castle Rock, CO', sub: 'Colorado LLC' },
  { label: 'Founded 2026', sub: 'Moving fast' },
  { label: '48 Tools Live', sub: 'All working, all real' },
  { label: 'Real Data Only', sub: 'No simulated results, ever' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: '#09090B' }}>
      <Header />

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <p className="text-xs font-bold tracking-[0.28em] uppercase text-purple-400 mb-4">About Queldrex</p>
        <h1 className="text-4xl lg:text-5xl font-black leading-[1.08] mb-6 max-w-3xl" style={{ color: '#FAFAFA' }}>
          We build tools for people who build things.
        </h1>
        <p className="text-lg leading-relaxed max-w-2xl" style={{ color: '#A1A1AA' }}>
          Queldrex LLC is a software company in Castle Rock, Colorado. We ship developer tools, business utilities, and AI visibility software. Everything is real — no fake demos, no simulated outputs.
        </p>
      </section>

      {/* THE PROBLEM */}
      <section className="border-t border-white/5 py-16" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-bold tracking-[0.28em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Why we built this</p>
          <p className="text-lg leading-relaxed max-w-3xl" style={{ color: '#A1A1AA' }}>
            When someone asks ChatGPT "what's the best plumber in Denver?" the businesses that show up are the ones AI can find and trust. Most businesses have no idea if they're in that group. We built the tools to find out, monitor it, and fix it.
          </p>
          <p className="text-base leading-relaxed max-w-3xl mt-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
            And while we were building, we added everything else a developer or small business owner reaches for on a Tuesday: CVE scanners, NDA generators, cash flow forecasters, invoice fraud detectors. 48 tools, all live, all producing real output.
          </p>
        </div>
      </section>

      {/* WHAT WE BUILD */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-xs font-bold tracking-[0.28em] uppercase mb-8" style={{ color: 'rgba(255,255,255,0.3)' }}>What we build</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {WHAT_WE_BUILD.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border p-6 flex flex-col gap-3"
              style={{ background: item.color, borderColor: item.border }}
            >
              <div className="w-8 h-0.5 rounded-full" style={{ background: item.accent }} />
              <h3 className="text-base font-black" style={{ color: '#FAFAFA' }}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMPANY FACTS */}
      <section className="border-t border-white/5 py-14" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {FACTS.map((f) => (
              <div
                key={f.label}
                className="rounded-xl border p-5 text-center"
                style={{ background: '#111318', borderColor: 'rgba(255,255,255,0.07)' }}
              >
                <p className="text-base font-black mb-1" style={{ color: '#FAFAFA' }}>{f.label}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{f.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR + AGENCIES */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-xs font-bold tracking-[0.28em] uppercase mb-8" style={{ color: 'rgba(255,255,255,0.3)' }}>Who uses it</p>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: 'Developers', desc: 'Security scanning, DNS tools, JWT decoders, CVE detection. Tools you reach for every week.' },
            { label: 'Freelancers', desc: 'NDA generators, proposal builders, invoice tools. Professional documents without an attorney.' },
            { label: 'Small teams', desc: 'Cash flow forecasting, SaaS metrics, ad copy grading, email deliverability. All in one subscription.' },
          ].map(item => (
            <div key={item.label} className="rounded-xl border p-5" style={{ background: '#111318', borderColor: 'rgba(255,255,255,0.07)' }}>
              <p className="text-sm font-black mb-2" style={{ color: '#FAFAFA' }}>{item.label}</p>
              <p className="text-xs leading-relaxed" style={{ color: '#A1A1AA' }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border p-8" style={{ background: 'rgba(6,182,212,0.05)', borderColor: 'rgba(6,182,212,0.2)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Agencies</span>
          </div>
          <p className="text-sm leading-relaxed mb-5" style={{ color: '#A1A1AA' }}>
            We offer reseller pricing and white-label reports for agencies managing multiple clients. If you run AI visibility or digital marketing for 5+ clients, email us.
          </p>
          <a
            href="mailto:hello@queldrex.com?subject=Agency Partnership"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-black"
            style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}
          >
            Start a conversation
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 py-16">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-black text-xl mb-1" style={{ color: '#FAFAFA' }}>Try a tool right now.</p>
            <p className="text-sm" style={{ color: '#A1A1AA' }}>No account. No credit card. Just the tool.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/tools" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 20px rgba(109,40,217,0.3)' }}>
              Browse 48 tools
            </Link>
            <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border hover:border-white/25 transition-colors"
              style={{ color: 'rgba(255,255,255,0.55)', borderColor: 'rgba(255,255,255,0.1)' }}>
              See pricing →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
