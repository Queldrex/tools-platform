'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function MonitorSuccessPage() {
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
        <h1 className="text-3xl font-black text-white mb-3">You&apos;re now being monitored.</h1>
        <p className="text-white/50 text-base leading-relaxed mb-2 max-w-sm mx-auto">
          Your first scan runs within 24 hours. You&apos;ll get an email when it&apos;s complete.
        </p>
        <p className="text-white/35 text-sm mb-8 max-w-sm mx-auto">
          To access your dashboard, go to <strong className="text-white/55">/monitor</strong> and enter your email — we&apos;ll send you a secure login link.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/monitor"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-black"
            style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
            View Dashboard →
          </Link>
          <Link href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white/55 border border-white/12 hover:text-white transition-colors">
            Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
