import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Contact | Queldrex',
  description: 'Get in touch with Queldrex. Questions, partnerships, or just say hello.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-20">
        <Link
          href="/"
          className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-12"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Queldrex
        </Link>

        <p className="text-cyan-500 text-xs font-bold tracking-[0.28em] uppercase mb-3">Contact</p>
        <h1 className="text-3xl font-black text-white mb-3">Get in touch.</h1>
        <p className="text-white/55 text-base leading-relaxed mb-12">
          Questions about a tool, delivery issues, partnership ideas, or anything else — we read and respond to every email.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          <a
            href="mailto:hello@queldrex.com"
            className="rounded-2xl border p-6 flex flex-col gap-3 hover:border-white/20 transition-colors group"
            style={{ background: 'rgba(6,182,212,0.06)', borderColor: 'rgba(6,182,212,0.16)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.2)' }}>
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white mb-1">Email us</h2>
              <p className="text-xs text-white/50 leading-relaxed mb-3">General questions, support, and partnerships. We typically reply within 24 hours.</p>
              <span className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors">hello@queldrex.com →</span>
            </div>
          </a>

          <a
            href="https://x.com/queldrex"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border p-6 flex flex-col gap-3 hover:border-white/20 transition-colors group"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <svg className="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.631 5.903-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white mb-1">Follow on X</h2>
              <p className="text-xs text-white/50 leading-relaxed mb-3">Tool launches, updates, and behind-the-scenes on new builds.</p>
              <span className="text-xs font-bold text-white/40 group-hover:text-white/60 transition-colors">@queldrex →</span>
            </div>
          </a>
        </div>

        <div
          className="rounded-2xl border p-8"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}
        >
          <h2 className="text-lg font-black text-white mb-5">Common questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'I have a delivery issue with my purchase.',
                a: 'Email hello@queldrex.com with your order email and domain. We resolve all delivery issues or issue a full refund within 24 hours — no questions asked.',
              },
              {
                q: 'When will [tool] launch?',
                a: 'We build when ready and fully tested. Email hello@queldrex.com with the specific tool name and we will notify you on launch day.',
              },
              {
                q: 'I want to partner with Queldrex.',
                a: 'Email hello@queldrex.com with the subject line "Partnership" and what you have in mind. We read everything.',
              },
            ].map(({ q, a }) => (
              <div key={q}>
                <h3 className="text-sm font-bold text-white mb-1.5">{q}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-white/35 text-sm mb-4">Have feedback about a tool or the site?</p>
          <Link
            href="/feedback"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white/60 border border-white/12 hover:text-white hover:border-white/25 transition-all"
          >
            Submit feedback →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
