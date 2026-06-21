'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

function RestoreAccessContent() {
  const searchParams = useSearchParams()
  const success = searchParams.get('success') === '1'
  const errorType = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
    } catch {
      // Silently succeed — we never reveal whether an account exists
    } finally {
      setLoading(false)
      setSubmitted(true)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#09090B' }}>
      <Header />
      <main className="max-w-lg mx-auto px-6 py-24">
        <div className="mb-10">
          <Link href="/tools" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            Back to Tools
          </Link>
        </div>

        {success ? (
          <div className="rounded-2xl border p-8 text-center" style={{ background: '#111318', borderColor: 'rgba(74,222,128,0.2)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(74,222,128,0.1)' }}>
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            </div>
            <h1 className="text-2xl font-black text-white mb-2">Access restored</h1>
            <p className="text-sm mb-6" style={{ color: '#A1A1AA' }}>Your purchases have been re-activated on this device.</p>
            <Link href="/tools" className="inline-block px-6 py-3 rounded-xl text-sm font-black text-white" style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)' }}>
              Browse Your Tools
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border p-8" style={{ background: '#111318', borderColor: 'rgba(255,255,255,0.07)' }}>
            <h1 className="text-3xl font-black text-white mb-2">Restore your access</h1>
            <p className="text-sm mb-8" style={{ color: '#A1A1AA' }}>
              Cleared your cookies or switched browsers? Enter the email you used to purchase and we'll send a one-click restore link.
            </p>

            {errorType === 'expired' && !submitted && (
              <div className="rounded-lg border border-orange-900/50 bg-orange-950/30 px-4 py-3 mb-6 text-sm text-orange-400">
                That link has expired. Request a new one below.
              </div>
            )}
            {errorType === 'invalid' && !submitted && (
              <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 mb-6 text-sm text-red-400">
                Invalid link. Request a new one below.
              </div>
            )}

            {submitted ? (
              <div className="rounded-xl border p-6 text-center" style={{ background: '#0d1117', borderColor: 'rgba(124,58,237,0.2)' }}>
                <div className="text-2xl mb-2">📬</div>
                <p className="font-black text-white mb-1">Check your email</p>
                <p className="text-sm" style={{ color: '#A1A1AA' }}>If a purchase was found for that email, a restore link is on its way. It expires in 1 hour.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest mb-2 block" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Purchase email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full text-sm text-white placeholder-white/20 rounded-xl px-4 py-3 outline-none"
                    style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-3 rounded-xl text-sm font-black text-white transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)' }}
                >
                  {loading ? 'Sending…' : 'Send Restore Link'}
                </button>
              </form>
            )}

            <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Need help?{' '}
              <a href="mailto:hello@queldrex.com" className="underline hover:text-white/50 transition-colors">
                Email hello@queldrex.com
              </a>
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default function RestoreAccessPage() {
  return (
    <Suspense fallback={null}>
      <RestoreAccessContent />
    </Suspense>
  )
}
