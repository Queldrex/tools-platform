import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'API Schema Drift Scanner — Coming Soon | Queldrex',
  description: 'Catch breaking API changes before users do. Auto-generate fixes before they ship. Join the waitlist.',
}

export default function ApiSchemaDriftPage() {
  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-20">
        <Link
          href="/"
          className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-12"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Queldrex
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <span
            className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border"
            style={{ color: 'rgba(99,102,241,0.8)', borderColor: 'rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.08)' }}
          >
            In Development
          </span>
          <span className="text-sm font-bold text-white/30">$249 one-time</span>
        </div>

        <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
          API Schema Drift<br />
          <span style={{ color: 'rgb(99,102,241)' }}>Scanner.</span>
        </h1>

        <p className="text-xl text-white/65 leading-relaxed mb-4 max-w-2xl">
          Your API breaks silently. A field gets renamed, a required param gets added, a response format changes — and users start hitting 500 errors before your monitoring even fires.
        </p>
        <p className="text-base text-white/50 leading-relaxed mb-12 max-w-2xl">
          The API Schema Drift Scanner compares your live API responses against your documented schema, identifies every breaking change, and generates the exact fix needed. One scan, one report, one payment.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mb-14">
          {[
            { title: 'Breaking changes', body: 'Renamed fields, removed params, changed types — caught before they ship.' },
            { title: 'Schema comparison', body: 'Live API responses vs. OpenAPI / JSON Schema. Drift identified line by line.' },
            { title: 'Fix package', body: 'Auto-generated fix instructions and updated schema file — ready to deploy.' },
          ].map(({ title, body }) => (
            <div
              key={title}
              className="rounded-xl border p-5"
              style={{ background: 'rgba(99,102,241,0.06)', borderColor: 'rgba(99,102,241,0.16)' }}
            >
              <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
              <p className="text-xs text-white/50 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div
          className="rounded-2xl border p-8 md:p-10"
          style={{ background: 'rgba(99,102,241,0.06)', borderColor: 'rgba(99,102,241,0.18)' }}
        >
          <h2 className="text-2xl font-black text-white mb-3">Get notified when it launches.</h2>
          <p className="text-white/55 text-sm mb-6">
            Send us your email and we will notify you the day this tool goes live. No spam — one email when it ships.
          </p>
          <a
            href="mailto:hello@queldrex.com?subject=Notify%20me%3A%20API%20Schema%20Drift%20Scanner"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.03]"
            style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 28px rgba(6,182,212,0.3)' }}
          >
            Notify me when it launches
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <p className="text-xs text-white/30 mt-4">
            Or try our live tool while you wait:{' '}
            <Link href="/scanner" className="text-cyan-500 hover:text-cyan-400 transition-colors">
              AI Visibility Scanner — free scan
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
