'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const SUBJECTS = [
  'General Question',
  'Agency Partnership',
  'Custom Development Quote',
  'Technical Support',
  'Press / Media',
  'Other',
]

const CARDS = [
  {
    label: 'General Questions',
    desc: 'Tools, pricing, how it works',
    action: 'mailto:hello@queldrex.com',
    cta: 'hello@queldrex.com',
    external: true,
  },
  {
    label: 'Agency Partnerships',
    desc: 'Reseller arrangements, bulk pricing, white-label',
    action: 'mailto:hello@queldrex.com?subject=Agency%20Partnership',
    cta: 'Email us about agencies',
    external: true,
  },
  {
    label: 'Custom Development',
    desc: 'Get a quote for a custom build project',
    action: '/services',
    cta: 'See services & pricing →',
    external: false,
  },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: SUBJECTS[0], message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState('')

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required'
    if (!form.message.trim() || form.message.trim().length < 20) e.message = 'Message must be at least 20 characters'
    return e
  }

  const handleBlur = (field: string) => {
    const e = validate()
    if (e[field]) setErrors(prev => ({ ...prev, [field]: e[field] }))
    else setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    setServerError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setServerError(data.error || 'Something went wrong. Try emailing hello@queldrex.com directly.')
      } else {
        setSent(true)
      }
    } catch {
      setServerError('Network error. Try emailing hello@queldrex.com directly.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (field: string) =>
    `w-full rounded-xl px-4 py-3 text-sm text-white bg-transparent border outline-none transition-colors focus:border-cyan-500/60 placeholder:text-white/25 ${
      errors[field] ? 'border-red-500/60' : 'border-white/10 hover:border-white/20'
    }`

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />

      <div className="max-w-3xl mx-auto px-6 pt-20 pb-28">

        {/* Hero */}
        <div className="text-center mb-14">
          <p className="text-xs font-bold tracking-[0.28em] uppercase mb-4" style={{ color: '#06d6ff' }}>Contact</p>
          <h1 className="text-4xl font-black text-white mb-4">Get in Touch</h1>
          <p className="text-white/55 text-base max-w-md mx-auto">
            Questions about our tools, agency partnerships, custom builds, or anything else. We reply within 24 hours.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {CARDS.map(card => (
            <div
              key={card.label}
              className="rounded-2xl border p-5 flex flex-col gap-3"
              style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <div>
                <p className="text-sm font-bold text-white mb-1">{card.label}</p>
                <p className="text-xs text-white/45 leading-relaxed">{card.desc}</p>
              </div>
              {card.external ? (
                <a
                  href={card.action}
                  className="text-xs font-bold mt-auto transition-colors"
                  style={{ color: '#06d6ff' }}
                >
                  {card.cta}
                </a>
              ) : (
                <Link
                  href={card.action}
                  className="text-xs font-bold mt-auto transition-colors"
                  style={{ color: '#06d6ff' }}
                >
                  {card.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="rounded-2xl border p-8" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <h2 className="text-lg font-black text-white mb-6">Send a Message</h2>

          {sent ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(6,214,255,0.1)', border: '1px solid rgba(6,214,255,0.3)' }}>
                <svg className="w-6 h-6" fill="none" stroke="#06d6ff" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white font-bold text-base mb-2">Message sent.</p>
              <p className="text-white/50 text-sm">We&apos;ll reply to {form.email} within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1.5">Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    onBlur={() => handleBlur('name')}
                    placeholder="Your name"
                    className={inputClass('name')}
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  />
                  {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1.5">Email <span className="text-red-400">*</span></label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    onBlur={() => handleBlur('email')}
                    placeholder="you@company.com"
                    className={inputClass('email')}
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  />
                  {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5">Subject</label>
                <select
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white border border-white/10 hover:border-white/20 outline-none transition-colors focus:border-cyan-500/60"
                  style={{ background: 'rgba(13,17,23,0.95)' }}
                >
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5">Message <span className="text-red-400">*</span></label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  onBlur={() => handleBlur('message')}
                  placeholder="Tell us what you need..."
                  rows={5}
                  className={inputClass('message') + ' resize-none'}
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                />
                {errors.message && <p className="text-xs text-red-400 mt-1">{errors.message}</p>}
              </div>

              {serverError && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{serverError}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 24px rgba(6,212,255,0.25)' }}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

      </div>

      <Footer />
    </div>
  )
}
