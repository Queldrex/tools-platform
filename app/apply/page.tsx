'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const PLATFORMS = [
  'WordPress', 'Shopify', 'Wix', 'Squarespace', 'Webflow',
  'FTP / cPanel (shared hosting)', 'Vercel / Netlify / GitHub Pages',
  'Custom / Other',
]

function ApplyForm() {
  const searchParams = useSearchParams()
  const scanId = searchParams.get('scanId') || ''
  const prefillUrl = searchParams.get('url') || ''
  const prefillScore = searchParams.get('score') || ''

  const [fields, setFields] = useState({
    name: '', email: '', url: prefillUrl, platform: '', message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (prefillUrl) setFields(f => ({ ...f, url: prefillUrl }))
  }, [prefillUrl])

  function set(key: string, value: string) {
    setFields(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fields.platform) { setError('Please select your platform'); return }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/dfy/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, scanId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Email hello@queldrex.com.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen text-white" style={{ background: '#070b14' }}>
        <Header />
        <main className="max-w-lg mx-auto px-6 py-32 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)' }}>
            <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white mb-4">Application received.</h1>
          <p className="text-white/60 leading-relaxed text-lg mb-6">
            We review every application personally. You&apos;ll hear from us within 24 hours to schedule a quick call and go over your site together.
          </p>
          <p className="text-white/35 text-sm">
            Questions in the meantime? <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:underline">hello@queldrex.com</a>
          </p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-xl mx-auto px-6 py-16">

        <div className="mb-10">
          <p className="text-cyan-500 text-xs font-bold tracking-[0.28em] uppercase mb-3">Done-For-You — $499</p>
          <h1 className="text-3xl font-black text-white mb-3">Apply for implementation</h1>
          <p className="text-white/50 text-sm leading-relaxed">
            We review every application and book a quick call to go over your site before we start. No payment until you&apos;re ready.
          </p>
        </div>

        {prefillScore && (
          <div className="rounded-xl border border-white/10 p-4 mb-8 flex items-center gap-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="text-center">
              <div className="text-2xl font-black" style={{ color: parseInt(prefillScore) >= 80 ? '#4ade80' : parseInt(prefillScore) >= 50 ? '#facc15' : '#f87171' }}>
                {prefillScore}
              </div>
              <div className="text-[10px] text-white/35 uppercase tracking-wider font-bold">Score</div>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{prefillUrl}</p>
              <p className="text-xs text-white/40 mt-0.5">Your site&apos;s current AI visibility score</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Your Name *</label>
              <input
                type="text" required placeholder="Jane Smith"
                value={fields.name} onChange={e => set('name', e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Email Address *</label>
              <input
                type="email" required placeholder="jane@yourbiz.com"
                value={fields.email} onChange={e => set('email', e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Website URL *</label>
            <input
              type="text" required placeholder="https://yourbusiness.com"
              value={fields.url} onChange={e => set('url', e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">What platform is your site on? *</label>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map(p => (
                <button
                  key={p} type="button"
                  onClick={() => set('platform', p)}
                  className="text-left rounded-lg border px-3 py-2.5 text-sm transition-all"
                  style={{
                    background: fields.platform === p ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.02)',
                    borderColor: fields.platform === p ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.08)',
                    color: fields.platform === p ? '#67e8f9' : 'rgba(255,255,255,0.6)',
                    fontWeight: fields.platform === p ? 600 : 400,
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Tell us about your business *</label>
            <textarea
              required rows={4} placeholder="What does your business do, who are your customers, and what's your main goal with AI visibility?"
              value={fields.message} onChange={e => set('message', e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-cyan-500/50 resize-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm rounded-lg border border-red-500/20 p-3" style={{ background: 'rgba(239,68,68,0.06)' }}>
              {error}
            </p>
          )}

          <button
            type="submit" disabled={submitting}
            className="w-full py-4 rounded-xl text-sm font-black text-black disabled:opacity-60 transition-all hover:scale-[1.01]"
            style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 24px rgba(6,182,212,0.25)' }}
          >
            {submitting ? 'Submitting…' : 'Submit Application →'}
          </button>

          <p className="text-xs text-white/25 text-center">
            No payment now. We&apos;ll review your application and reach out within 24 hours to schedule a call.
          </p>

        </form>
      </main>
      <Footer />
    </div>
  )
}

export default function ApplyPage() {
  return (
    <Suspense>
      <ApplyForm />
    </Suspense>
  )
}
