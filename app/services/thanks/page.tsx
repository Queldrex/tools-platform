import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Request Received — Queldrex',
  description: 'Your build request has been received. We\'ll respond with a quote within one business day.',
}

export default function ServicesThanksPage() {
  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-xl mx-auto px-6 py-28 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)' }}
        >
          <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-white mb-3">Request received.</h1>
        <p className="text-white/50 text-base leading-relaxed mb-8 max-w-sm mx-auto">
          We read every request personally. You&apos;ll hear from us at your email with a fixed quote and timeline within one business day.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-black"
            style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
            Back to Home
          </Link>
          <Link href="/tools"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white/55 border border-white/12 hover:text-white transition-colors">
            Browse Our Tools →
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
