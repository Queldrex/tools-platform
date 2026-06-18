import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Database Migration Middleware — Coming Soon | Queldrex',
  description: 'Zero-downtime schema migrations to modern cloud databases. Deploy with confidence. Join the waitlist.',
}

export default function DatabaseMigrationPage() {
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
            style={{ color: 'rgba(16,185,129,0.8)', borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.07)' }}
          >
            In Development
          </span>
          <span className="text-sm font-bold text-white/30">$199 one-time</span>
        </div>

        <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
          Database Migration<br />
          <span style={{ color: 'rgb(16,185,129)' }}>Middleware.</span>
        </h1>

        <p className="text-xl text-white/65 leading-relaxed mb-4 max-w-2xl">
          One botched migration means downtime, corrupted data, and a 2 AM rollback scramble. The average cost of a database outage is $9,000 per minute — and most happen during migrations.
        </p>
        <p className="text-base text-white/50 leading-relaxed mb-12 max-w-2xl">
          Database Migration Middleware generates zero-downtime migration scripts, validates your schema changes against your live data, and produces a rollback plan before a single query runs. One purchase, one clean migration.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mb-14">
          {[
            { title: 'Zero-downtime scripts', body: 'Generated migration scripts that run without locking tables or dropping connections.' },
            { title: 'Pre-migration validation', body: 'Schema changes validated against live data before a single query runs.' },
            { title: 'Rollback plan included', body: 'Every migration ships with a tested rollback script. Deploy knowing you can undo it.' },
          ].map(({ title, body }) => (
            <div
              key={title}
              className="rounded-xl border p-5"
              style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.14)' }}
            >
              <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
              <p className="text-xs text-white/50 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div
          className="rounded-2xl border p-8 md:p-10"
          style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.16)' }}
        >
          <h2 className="text-2xl font-black text-white mb-3">Get notified when it launches.</h2>
          <p className="text-white/55 text-sm mb-6">
            Send us your email and we will notify you the day this tool goes live. No spam — one email when it ships.
          </p>
          <a
            href="mailto:hello@queldrex.com?subject=Notify%20me%3A%20Database%20Migration%20Middleware"
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
