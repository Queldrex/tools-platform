'use client'

import { useState } from 'react'

interface ScanFormProps {
  onScan: (url: string, email: string) => void
  loading: boolean
}

export default function ScanForm({ onScan, loading }: ScanFormProps) {
  const [url, setUrl] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ url?: string; email?: string }>({})

  function validate() {
    const errs: { url?: string; email?: string } = {}
    const trimmedUrl = url.trim()
    const trimmedEmail = email.trim()
    if (!trimmedUrl) {
      errs.url = 'Enter your website URL'
    } else if (!/^(https?:\/\/)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(trimmedUrl)) {
      errs.url = 'Enter a valid website URL (e.g. yourbusiness.com)'
    }
    if (!trimmedEmail) {
      errs.email = 'Enter your email to receive the report'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = 'Enter a valid email address'
    }
    return errs
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    onScan(url.trim(), email.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-slate-700 mb-1.5">
          Your website URL
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <input
            id="url"
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="yourbusiness.com"
            disabled={loading}
            className={`w-full pl-12 pr-4 py-3.5 rounded-xl border text-slate-900 placeholder-slate-400 text-base focus:outline-none focus:ring-2 focus:ring-slate-900 transition ${errors.url ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'} disabled:opacity-60`}
          />
        </div>
        {errors.url && <p className="mt-1.5 text-sm text-red-600">{errors.url}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
          Your email <span className="text-slate-400 font-normal">(report delivered here)</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@yourbusiness.com"
            disabled={loading}
            className={`w-full pl-12 pr-4 py-3.5 rounded-xl border text-slate-900 placeholder-slate-400 text-base focus:outline-none focus:ring-2 focus:ring-slate-900 transition ${errors.email ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'} disabled:opacity-60`}
          />
        </div>
        {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-base py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Scanning your site...
          </>
        ) : (
          <>
            Scan My Site — Free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </>
        )}
      </button>
      <p className="text-xs text-center text-slate-400">Free scan · No credit card required · Results in seconds</p>
    </form>
  )
}
