'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

type Tab = 'password' | 'domain'

interface CheckResult {
  label: string
  pass: boolean
  detail: string
}

interface DomainResult {
  domain: string
  checks: CheckResult[]
  passed: number
  total: number
}

async function sha1Hex(str: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
}

async function checkPassword(pw: string): Promise<{ count: number } | null> {
  const hash = await sha1Hex(pw)
  const prefix = hash.slice(0, 5)
  const suffix = hash.slice(5)
  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { 'Add-Padding': 'true' },
  })
  if (!res.ok) throw new Error('HIBP API unavailable')
  const text = await res.text()
  const line = text.split('\n').find(l => l.startsWith(suffix))
  if (!line) return { count: 0 }
  const count = parseInt(line.split(':')[1].trim(), 10)
  return { count }
}

export default function BreachLookupPage() {
  const [tab, setTab] = useState<Tab>('password')

  // Password tab state
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [pwResult, setPwResult] = useState<{ count: number } | null>(null)
  const [pwError, setPwError] = useState('')

  // Domain tab state
  const [domain, setDomain] = useState('')
  const [domainLoading, setDomainLoading] = useState(false)
  const [domainResult, setDomainResult] = useState<DomainResult | null>(null)
  const [domainError, setDomainError] = useState('')
  const [hasUsedFreeScan, setHasUsedFreeScan] = useState(false)
  const [showDomainPaywall, setShowDomainPaywall] = useState(false)

  async function handlePasswordCheck(e: React.FormEvent) {
    e.preventDefault()
    if (!password) return
    setPwLoading(true)
    setPwResult(null)
    setPwError('')
    try {
      const result = await checkPassword(password)
      setPwResult(result)
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Check failed')
    } finally {
      setPwLoading(false)
    }
  }

  async function handleDomainScan(e: React.FormEvent) {
    e.preventDefault()
    if (!domain) return
    if (hasUsedFreeScan) {
      setShowDomainPaywall(true)
      return
    }
    setDomainLoading(true)
    setDomainResult(null)
    setDomainError('')
    try {
      const clean = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].trim()
      const res = await fetch('/api/breach-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'domain', query: clean }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || 'Scan failed')
      setDomainResult(data)
      setHasUsedFreeScan(true)
    } catch (err) {
      setDomainError(err instanceof Error ? err.message : 'Scan failed')
    } finally {
      setDomainLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    background: '#0d1117',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: '12px 16px',
    color: 'white',
    fontSize: 14,
    outline: 'none',
    width: '100%',
  }

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-10">

        {/* Back */}
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/30 hover:text-white/60 transition-colors mb-8">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase mb-4"
            style={{ borderColor: 'rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.07)', color: '#f87171' }}>
            Free Tool
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Breach Lookup</h1>
          <p className="text-white/45 text-sm leading-relaxed">
            Check if a password has been exposed in known data breaches, or audit your domain&apos;s email security posture.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {([['password', 'Password Check'], ['domain', 'Domain Security']] as [Tab, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
              style={{
                background: tab === id ? '#0d1117' : 'transparent',
                color: tab === id ? 'white' : 'rgba(255,255,255,0.35)',
                border: tab === id ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* PASSWORD TAB */}
        {tab === 'password' && (
          <div>
            <form onSubmit={handlePasswordCheck} className="space-y-4">
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setPwResult(null); setPwError('') }}
                  placeholder="Enter a password to check…"
                  style={{ ...inputStyle, paddingRight: 44 }}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPw ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  )}
                </button>
              </div>

              <button type="submit" disabled={!password || pwLoading}
                className="w-full py-3 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
                {pwLoading ? 'Checking…' : 'Check Password'}
              </button>
            </form>

            <p className="text-xs text-white/20 mt-3 text-center leading-relaxed">
              Your password is hashed locally using SHA-1. Only the first 5 characters of the hash are sent to the API. Your actual password never leaves your browser.
            </p>

            {pwError && (
              <div className="mt-5 rounded-xl border p-4 text-sm text-red-400" style={{ background: 'rgba(248,113,113,0.07)', borderColor: 'rgba(248,113,113,0.2)' }}>
                {pwError}
              </div>
            )}

            {pwResult && !pwError && (
              <div className="mt-5 rounded-xl border p-6 text-center" style={
                pwResult.count > 0
                  ? { background: 'rgba(248,113,113,0.07)', borderColor: 'rgba(248,113,113,0.25)' }
                  : { background: 'rgba(74,222,128,0.06)', borderColor: 'rgba(74,222,128,0.2)' }
              }>
                {pwResult.count > 0 ? (
                  <>
                    <div className="text-4xl font-black mb-2" style={{ color: '#f87171' }}>COMPROMISED</div>
                    <p className="text-white/70 text-sm mb-1">
                      This password has appeared <span className="font-black text-red-400">{pwResult.count.toLocaleString()}</span> times in known data breaches.
                    </p>
                    <p className="text-white/40 text-xs">Do not use this password anywhere. Change it immediately on any site where it&apos;s in use.</p>
                  </>
                ) : (
                  <>
                    <div className="text-4xl font-black mb-2" style={{ color: '#4ade80' }}>SAFE</div>
                    <p className="text-white/60 text-sm">Not found in any known data breach.</p>
                    <p className="text-white/30 text-xs mt-1">This doesn&apos;t mean the password is strong — only that it hasn&apos;t been publicly exposed.</p>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* DOMAIN TAB */}
        {tab === 'domain' && (
          <div>
            <form onSubmit={handleDomainScan} className="space-y-4">
              <input
                type="text"
                value={domain}
                onChange={e => { setDomain(e.target.value); setDomainResult(null); setDomainError(''); setShowDomainPaywall(false) }}
                placeholder="yourdomain.com"
                style={inputStyle}
                autoComplete="off"
                spellCheck={false}
              />
              <button type="submit" disabled={!domain || domainLoading}
                className="w-full py-3 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
                {domainLoading ? 'Scanning…' : 'Scan Domain'}
              </button>
            </form>

            {/* Paywall after first scan */}
            {showDomainPaywall && (
              <div className="mt-6 rounded-xl border p-6 text-center" style={{ background: 'rgba(6,182,212,0.05)', borderColor: 'rgba(6,182,212,0.25)' }}>
                <div className="flex justify-center mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)' }}>
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-base font-black text-white mb-1">Unlimited domain security scans</h3>
                <p className="text-sm text-white/45 mb-4">
                  Pro subscribers can scan any domain, any time. Check all your clients, all your assets.
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <a href="/monitor"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-black"
                    style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 20px rgba(6,182,212,0.25)' }}>
                    Start Pro — $29/month
                  </a>
                  <a href="/pricing" className="text-sm text-white/40 hover:text-white transition-colors">
                    See all features →
                  </a>
                </div>
              </div>
            )}

            {domainError && (
              <div className="mt-5 rounded-xl border p-4 text-sm text-red-400" style={{ background: 'rgba(248,113,113,0.07)', borderColor: 'rgba(248,113,113,0.2)' }}>
                {domainError}
              </div>
            )}

            {domainResult && (
              <div className="mt-6 space-y-3">
                {/* Score */}
                <div className="rounded-xl border p-5 flex items-center justify-between" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div>
                    <p className="text-xs text-white/35 mb-1 font-mono">{domainResult.domain}</p>
                    <p className="text-white font-black text-lg">Security Score</p>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black" style={{ color: domainResult.passed >= 5 ? '#4ade80' : domainResult.passed >= 3 ? '#facc15' : '#f87171' }}>
                      {domainResult.passed}/{domainResult.total}
                    </span>
                    <p className="text-xs text-white/30">checks passed</p>
                  </div>
                </div>

                {/* Checks */}
                {domainResult.checks.map((c, i) => (
                  <div key={i} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: c.pass ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)' }}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {c.pass ? (
                          <svg className="w-4 h-4" style={{ color: '#4ade80' }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        ) : (
                          <svg className="w-4 h-4" style={{ color: '#f87171' }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white mb-0.5">{c.label}</p>
                        <p className="text-xs text-white/40 leading-relaxed">{c.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
