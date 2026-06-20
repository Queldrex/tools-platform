'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const CATEGORIES = [
  'Security & Code Auditing',
  'AI & Machine Learning',
  'Database & Data Management',
  'APIs & Integrations',
  'Data Extraction & Scraping',
  'SEO & Visibility',
  'Developer Productivity',
  'Business Intelligence',
  'Other',
]

export default function RequestToolPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    toolName: '',
    description: '',
    useCase: '',
    category: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.toolName || !form.description) return
    setStatus('submitting')
    setErrorMsg('')
    try {
      const res = await fetch('/api/tool-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to submit')
      setStatus('success')
    } catch {
      setStatus('error')
      setErrorMsg('Something went wrong. Email us directly at hello@queldrex.com')
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />

      <main className="max-w-2xl mx-auto px-6 py-16">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/30 hover:text-white/60 transition-colors mb-10"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          All Tools
        </Link>

        {status === 'success' ? (
          <div className="text-center py-16">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)' }}
            >
              <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-white mb-3">Request received.</h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto mb-8">
              We read every request. If this gets prioritized, you&apos;ll hear from us at <strong className="text-white/70">{form.email}</strong>.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-black"
                style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}
              >
                Back to Tools
              </Link>
              <Link
                href="/scanner"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white/60 border border-white/12 hover:text-white transition-colors"
              >
                Try Tool 1 Free →
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-10">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase mb-5"
                style={{ borderColor: 'rgba(6,182,212,0.2)', background: 'rgba(6,182,212,0.06)', color: '#06d6ff' }}
              >
                Tool Requests
              </div>
              <h1 className="text-3xl font-black text-white mb-3">Request a tool.</h1>
              <p className="text-white/50 text-sm leading-relaxed">
                Have a specific problem that needs solving? Describe it. We build based on demand — if enough people need it, we build it next.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/45 uppercase tracking-wider mb-2">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    required
                    placeholder="John Smith"
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-colors"
                    style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', }}
                    onFocus={e => (e.target.style.borderColor = 'rgba(6,182,212,0.5)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/45 uppercase tracking-wider mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    required
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-colors"
                    style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={e => (e.target.style.borderColor = 'rgba(6,182,212,0.5)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/45 uppercase tracking-wider mb-2">
                  Tool Name / Idea <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.toolName}
                  onChange={e => set('toolName', e.target.value)}
                  required
                  placeholder="e.g. Broken Link Auditor, Resume Parser, Invoice Generator..."
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none"
                  style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(6,182,212,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/45 uppercase tracking-wider mb-2">
                  What should it do? <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  required
                  rows={4}
                  placeholder="Describe the problem it solves and what output you'd expect..."
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none resize-none"
                  style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(6,182,212,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/45 uppercase tracking-wider mb-2">
                  Your Use Case
                </label>
                <textarea
                  value={form.useCase}
                  onChange={e => set('useCase', e.target.value)}
                  rows={2}
                  placeholder="Who would use this and when? (optional but helps us prioritize)"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none resize-none"
                  style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(6,182,212,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/45 uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                  style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <option value="">Select a category (optional)</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {status === 'error' && (
                <p className="text-sm text-red-400 bg-red-900/20 border border-red-900/30 rounded-xl px-4 py-3">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'submitting' || !form.name || !form.email || !form.toolName || !form.description}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 24px rgba(6,182,212,0.25)' }}
              >
                {status === 'submitting' ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Request
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>

              <p className="text-xs text-white/25 text-center">
                We read every request. No spam — your email is only used to follow up on your request.
              </p>
            </form>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
