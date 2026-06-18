'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const BOOKING_URL = process.env.NEXT_PUBLIC_CAL_URL || 'https://calendar.app.google/Lh45gFyesMmAbN7H7'

function BookContent() {
  const params = useSearchParams()
  const token = params.get('token')

  if (!token) {
    return (
      <div className="min-h-screen text-white" style={{ background: '#070b14' }}>
        <Header />
        <main className="max-w-lg mx-auto px-6 py-32 text-center">
          <p className="text-white/40">Invalid booking link. Please contact <a href="mailto:hello@queldrex.com" className="text-cyan-400">hello@queldrex.com</a>.</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-16">

        {/* Success header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" style={{ background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.3)' }}>
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white mb-3">Payment confirmed.</h1>
          <p className="text-white/60 text-base max-w-md mx-auto leading-relaxed">
            Book your implementation slot below, then submit your hosting details using the link in your email.
          </p>
        </div>

        {/* Steps */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {[
            { n: '1', title: 'Book a slot', body: 'Pick a time below. A Google Meet link is generated automatically.' },
            { n: '2', title: 'Submit credentials', body: 'Use the secure link in your confirmation email to send us your hosting access.' },
            { n: '3', title: 'We implement', body: 'On your booked day we install everything and email you the before/after score.' },
          ].map(({ n, title, body }) => (
            <div key={n} className="rounded-xl border border-white/8 p-5" style={{ background: '#111827' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-black mb-3" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>{n}</div>
              <p className="text-sm font-bold text-white mb-1">{title}</p>
              <p className="text-xs text-white/50 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        {/* Token reminder */}
        <div className="flex items-start gap-3 rounded-xl border border-cyan-500/20 p-4 mb-8" style={{ background: 'rgba(6,182,212,0.05)' }}>
          <svg className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-xs text-cyan-300/80 leading-relaxed">
            When booking, you&apos;ll be asked for your <strong>Implementation Token</strong>. It&apos;s in your confirmation email — copy and paste it into that field.
            <br />
            <span className="text-cyan-400/60 font-mono text-xs mt-1 block break-all">Your token: {token}</span>
          </p>
        </div>

        {/* Google Calendar embed */}
        <div className="rounded-2xl overflow-hidden border border-white/10" style={{ background: '#111827' }}>
          <iframe
            src={BOOKING_URL}
            width="100%"
            height="650"
            frameBorder="0"
            style={{ display: 'block' }}
            title="Book your implementation slot"
          />
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Questions? <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a>
          {' · '}
          <Link href="/terms" className="hover:text-white/50 transition-colors">Terms</Link>
        </p>

      </main>
      <Footer />
    </div>
  )
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen text-white flex items-center justify-center" style={{ background: '#070b14' }}>
        <p className="text-white/30">Loading...</p>
      </div>
    }>
      <BookContent />
    </Suspense>
  )
}
