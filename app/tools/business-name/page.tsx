'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface DomainResult { domain: string; available: boolean | null }
interface SocialResult { platform: string; handle: string; url: string; available: boolean | null }
interface Result {
  name: string; slug: string
  domains: DomainResult[]; socials: SocialResult[]
  recommendations: string[]; availableCount: number
}

function AvailBadge({ available }: { available: boolean | null }) {
  if (available === true) return <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}>Available</span>
  if (available === false) return <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>Taken</span>
  return <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>Unknown</span>
}

export default function BusinessNamePage() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const check = async () => {
    if (!name.trim()) return
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    try {
      const res = await fetch('/api/tools/business-name', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (data.paywall || res.status === 402) { setPaywall(true); return }
      if (!res.ok) throw new Error(data.error || 'Check failed')
      setResult(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Check failed') }
    finally { setLoading(false) }
  }

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 1500)
  }

  const availableDomains = result?.domains.filter(d => d.available === true) ?? []

  const loadExample = async () => {
    setName('Queldrex')
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    try {
      const res = await fetch('/api/tools/business-name', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Queldrex' }) })
      const data = await res.json()
      if (data.paywall || res.status === 402) { setPaywall(true); return }
      if (!res.ok) throw new Error(data.error || 'Check failed')
      setResult(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Check failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/tools" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#4ade80', borderColor: 'rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.08)' }}>Free</span>
          <span className="text-sm font-bold text-white/30">5 free checks/day · Unlimited with $79/month</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">Business Name <span style={{ color: '#4ade80' }}>Availability</span></h1>
        <p className="text-white/55 text-base mb-6 max-w-xl">Check domain availability and social handle availability for your business name — instantly, across all the extensions that matter.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">How it works</p>
            <p className="text-sm text-white/60 leading-relaxed">Checks domain availability for .com, .io, .co, and .ai TLDs using real DNS lookups — not a WHOIS scraper. If a domain resolves (has A or NS records), it&apos;s taken. Then checks Twitter/X, GitHub, and LinkedIn handle availability via their public APIs. Results in under 10 seconds, no account required.</p>
          </div>
          <div className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">What you get</p>
            <ul className="space-y-2">
              {['Domain availability for .com, .io, .co, and .ai', 'Twitter/X, GitHub, and LinkedIn handle availability', 'Color-coded: green = available, red = taken', 'Direct copy link for available domains', 'Real DNS check — not a cached database'].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/55"><span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border p-6 mb-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex gap-3">
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && check()}
              placeholder="e.g. Queldrex, Blue Ridge Coffee, Nova Labs..."
              className="flex-1 text-white text-base placeholder-white/20 outline-none px-4 py-3 rounded-xl"
              style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <button onClick={check} disabled={loading || !name.trim()}
              className="px-6 py-3 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.02] disabled:opacity-50 whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg,#4ade80,#16a34a)', boxShadow: '0 0 20px rgba(74,222,128,0.3)' }}>
              {loading ? 'Checking…' : 'Check Name'}
            </button>
          </div>
          <div className="mt-3">
            <button onClick={loadExample} disabled={loading} className="px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>Try Example: "Queldrex" →</button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>}

        {paywall && !loading && (
          <div className="rounded-2xl border p-8 text-center mb-6" style={{ background: 'rgba(74,222,128,0.05)', borderColor: 'rgba(74,222,128,0.2)' }}>
            <h3 className="text-xl font-black text-white mb-2">Unlimited checks with Pro</h3>
            <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">Pro unlocks unlimited name checks, all premium tools, and monthly AI visibility monitoring — $79/month.</p>
            <Link href="/monitor" className="inline-flex px-6 py-3 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Start Pro — $79/month</Link>
          </div>
        )}

        {result && (
          <div className="space-y-5">
            {result.recommendations.length > 0 && (
              <div className="rounded-xl border p-4 space-y-1.5" style={{ background: 'rgba(74,222,128,0.05)', borderColor: 'rgba(74,222,128,0.2)' }}>
                {result.recommendations.map((r, i) => (
                  <p key={i} className="text-sm text-white/70 flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {r}
                  </p>
                ))}
              </div>
            )}

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white/35 mb-3">
                Domain Availability — {availableDomains.length} of {result.domains.length} available
              </p>
              <div className="space-y-2">
                {result.domains.map(d => (
                  <div key={d.domain} className="rounded-xl border px-4 py-3 flex items-center justify-between" style={{ background: '#0d1117', borderColor: d.available === true ? 'rgba(74,222,128,0.2)' : d.available === false ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.06)' }}>
                    <span className="font-mono text-sm font-bold" style={{ color: d.available === true ? '#4ade80' : d.available === false ? '#f87171' : 'rgba(255,255,255,0.4)' }}>{d.domain}</span>
                    <div className="flex items-center gap-3">
                      <AvailBadge available={d.available} />
                      {d.available === true && (
                        <button onClick={() => copy(d.domain)} className="text-xs font-bold text-white/40 hover:text-white/70 transition-colors">
                          {copied === d.domain ? 'Copied!' : 'Copy'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white/35 mb-3">Social Handles</p>
              <div className="grid grid-cols-1 gap-2">
                {result.socials.map(s => (
                  <div key={s.platform} className="rounded-xl border px-4 py-3 flex items-center justify-between" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div>
                      <span className="text-sm font-bold text-white">{s.platform}</span>
                      <span className="text-xs text-white/35 ml-2">{s.handle}</span>
                    </div>
                    <AvailBadge available={s.available} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
