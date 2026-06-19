'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const CATEGORIES = ['Report Issue', 'Request a Tool', 'Bug Report', 'Feature Request', 'General'] as const
type Category = typeof CATEGORIES[number]

export default function FeedbackPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState<Category>('General')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (message.trim().length < 10) {
      setError('Please write at least 10 characters.')
      return
    }
    setStatus('submitting')
    setError('')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, category, message }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        setStatus('error')
      } else {
        setStatus('success')
      }
    } catch {
      setError('Network error. Please try again.')
      setStatus('error')
    }
  }

  const inputBase = 'w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 border border-white/10 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors'
  const inputBg = { background: 'rgba(255,255,255,0.04)' }

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-20">
        <div className="mb-10">
          <Link href="/" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-8">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Queldrex
          </Link>
          <p className="text-cyan-500 text-xs font-bold tracking-[0.28em] uppercase mb-3">Feedback</p>
          <h1 className="text-3xl font-black text-white mb-3">Tell us what you think.</h1>
          <p className="text-white/55 text-base leading-relaxed">
            Bug reports, feature requests, or just general thoughts — we read every submission. If you leave your email we will reply.
          </p>
        </div>

        {status === 'success' ? (
          <div
            className="rounded-2xl border p-10 text-center"
            style={{ background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.2)' }}
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-full mx-auto mb-5" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
              <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-white mb-2">Feedback received.</h2>
            <p className="text-white/55 text-sm mb-8">Thank you — we read every submission and will reply if you left an email address.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/" className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white/70 border border-white/15 hover:text-white hover:border-white/25 transition-all">
                Back to Home
              </Link>
              <Link href="/scanner" className="px-6 py-2.5 rounded-lg text-sm font-black text-black transition-all hover:scale-[1.03]" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
                Scan Your Site
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div
              className="rounded-2xl border p-6 space-y-5"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all"
                      style={
                        category === c
                          ? { background: 'rgba(6,182,212,0.12)', borderColor: 'rgba(6,182,212,0.4)', color: '#06d6ff' }
                          : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }
                      }
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name + Email */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Name <span className="text-white/25 normal-case font-normal">(optional)</span></label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    maxLength={100}
                    className={inputBase}
                    style={inputBg}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Email <span className="text-white/25 normal-case font-normal">(optional)</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    maxLength={200}
                    className={inputBase}
                    style={inputBg}
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Message <span className="text-red-400">*</span></label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you're thinking..."
                  rows={6}
                  maxLength={5000}
                  required
                  className={`${inputBase} resize-none`}
                  style={inputBg}
                />
                <div className="flex items-center justify-between mt-1.5">
                  {error ? (
                    <p className="text-xs text-red-400">{error}</p>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-white/25">{message.length}/5000</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-sm font-black text-black transition-all disabled:opacity-50 hover:scale-[1.01]"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 24px rgba(6,182,212,0.3)' }}
            >
              {status === 'submitting' ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Sending…
                </>
              ) : (
                <>
                  Send Feedback
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            <p className="text-center text-xs text-white/25">
              Or email us directly at{' '}
              <a href="mailto:hello@queldrex.com" className="text-white/40 hover:text-white transition-colors">
                hello@queldrex.com
              </a>
            </p>
          </form>
        )}
      </main>
      <Footer />
    </div>
  )
}
