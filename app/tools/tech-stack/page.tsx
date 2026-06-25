'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Detection {
  category: string
  name: string
  confidence: 'high' | 'medium' | 'low'
  evidence: string
}

interface ScanResult {
  url: string
  statusCode: number
  detections: Detection[]
  grouped: Record<string, Detection[]>
  securityHeaders: { https: boolean; hsts: boolean; xframe: boolean; csp: boolean; xcontenttype: boolean; referrerPolicy: boolean }
  responseHeaders: Record<string, string>
  techCount: number
  scannedAt: string
}

const CATEGORY_COLORS: Record<string, string> = {
  Framework: '#06d6ff',
  CMS: '#a78bfa',
  Hosting: '#34d399',
  Analytics: 'rgb(251,191,36)',
  'E-commerce': '#f97316',
  Marketing: '#f87171',
  Language: 'rgb(99,102,241)',
  'UI Library': '#f472b6',
}

const EXAMPLE_SITES = ['vercel.com', 'shopify.com', 'wordpress.org', 'github.com', 'stripe.com']

export default function TechStackPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)
  const [exported, setExported] = useState(false)

  async function scan(target?: string) {
    const scanUrl = target || url.trim()
    if (!scanUrl) return
    if (target) setUrl(target)
    setLoading(true)
    setError('')
    setResult(null)
    setPaywall(false)

    try {
      const res = await fetch('/api/tools/tech-stack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scanUrl }),
      })
      const data = await res.json()
      if (data.paywall || res.status === 402) { setPaywall(true); setLoading(false); return }
      if (!res.ok) { setError(data.error ?? 'Scan failed'); setLoading(false); return }
      setResult(data)
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  function exportJson() {
    if (!result) return
    const json = JSON.stringify({ url: result.url, scannedAt: result.scannedAt, detections: result.detections, securityHeaders: result.securityHeaders }, null, 2)
    navigator.clipboard.writeText(json)
    setExported(true)
    setTimeout(() => setExported(false), 2000)
  }

  const secScore = result ? Object.values(result.securityHeaders).filter(Boolean).length : 0

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-10">

        <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/30 hover:text-white/60 transition-colors mb-8">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase mb-3"
            style={{ borderColor: 'rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.08)', color: 'rgb(99,102,241)' }}>
            Free Tool · No Extension Required · Server-Side Scan
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Tech Stack Detector</h1>
          <p className="text-white/40 text-sm mb-4">Detect frameworks, CMS, hosting, CDN, analytics, and more from any URL's public response headers and source — no browser plugin needed. License from $29, or get all 51 tools from $149.</p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/pricing" className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>Get this tool — $29 →</Link>
            <Link href="/pricing" className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-black border text-white/60" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>All 51 tools — from $149 →</Link>
          </div>
        </div>

        {/* Input */}
        <div className="rounded-2xl border p-5 mb-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex gap-3 mb-4">
            <input value={url} onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && scan()}
              placeholder="example.com or https://example.com"
              className="flex-1 bg-transparent border rounded-xl px-4 py-3 text-white/70 text-sm outline-none placeholder:text-white/20"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            <button onClick={() => scan()} disabled={loading || !url.trim()}
              className="px-6 py-3 rounded-xl text-sm font-black text-black disabled:opacity-50 transition-all"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: loading ? 'none' : '0 0 20px rgba(6,182,212,0.3)' }}>
              {loading ? 'Scanning...' : 'Detect'}
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-white/25">Try:</span>
            {EXAMPLE_SITES.map(s => (
              <button key={s} onClick={() => scan(s)}
                className="text-xs px-2.5 py-1 rounded-lg font-medium transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl border text-sm text-red-400"
            style={{ background: 'rgba(248,113,113,0.07)', borderColor: 'rgba(248,113,113,0.2)' }}>
            {error}
          </div>
        )}

        {paywall && !loading && (
          <div className="rounded-2xl border p-8 text-center mb-6" style={{ background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.2)' }}>
            <h3 className="text-xl font-black text-white mb-2">Unlimited scans with Pro</h3>
            <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">Free tier includes 5 scans/day. Unlock unlimited tech stack detection with a Pro subscription.</p>
            <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>Upgrade to Pro →</Link>
          </div>
        )}

        {loading && (
          <div className="text-center py-16 text-white/30">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm">Fetching and analyzing {url}...</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                <a href={result.url} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-mono text-cyan-400 hover:text-cyan-300 transition-colors truncate">
                  {result.url}
                </a>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-400/10 text-green-400">
                    HTTP {result.statusCode}
                  </span>
                  <span className="text-[10px] text-white/30">
                    {result.detections.length} technologies detected
                  </span>
                  <button onClick={exportJson}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {exported ? 'Copied!' : 'Export JSON'}
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.detections.map(d => (
                  <span key={d.name} className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{
                      background: `${CATEGORY_COLORS[d.category] || '#888'}18`,
                      color: CATEGORY_COLORS[d.category] || '#888',
                      border: `1px solid ${CATEGORY_COLORS[d.category] || '#888'}30`,
                    }}>
                    {d.name}
                  </span>
                ))}
                {result.detections.length === 0 && (
                  <p className="text-sm text-white/35">No known technologies detected. The site may use custom infrastructure or block detection.</p>
                )}
              </div>
            </div>

            {/* By category */}
            {Object.entries(result.grouped).map(([category, detections]) => (
              <div key={category} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <p className="text-xs font-black uppercase tracking-widest mb-3"
                  style={{ color: CATEGORY_COLORS[category] || 'rgba(255,255,255,0.4)' }}>
                  {category}
                </p>
                <div className="space-y-2">
                  {detections.map(d => (
                    <div key={d.name} className="flex items-start gap-3">
                      <span className="text-sm font-bold text-white mt-0.5">{d.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0"
                        style={{ background: d.confidence === 'high' ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.12)', color: d.confidence === 'high' ? '#34d399' : 'rgb(251,191,36)' }}>
                        {d.confidence}
                      </span>
                      <span className="text-xs text-white/30 leading-relaxed">{d.evidence}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Security headers */}
            <div className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-black uppercase tracking-widest text-white/40">Security Headers</p>
                <span className="text-xs font-bold" style={{ color: secScore >= 5 ? '#34d399' : secScore >= 3 ? 'rgb(251,191,36)' : '#f87171' }}>
                  {secScore}/6
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { key: 'https', label: 'HTTPS' },
                  { key: 'hsts', label: 'HSTS' },
                  { key: 'xframe', label: 'X-Frame-Options' },
                  { key: 'csp', label: 'Content-Security-Policy' },
                  { key: 'xcontenttype', label: 'X-Content-Type-Options' },
                  { key: 'referrerPolicy', label: 'Referrer-Policy' },
                ].map(({ key, label }) => {
                  const ok = result.securityHeaders[key as keyof typeof result.securityHeaders]
                  return (
                    <div key={key} className="flex items-center gap-2 py-1">
                      <span className="text-xs" style={{ color: ok ? '#34d399' : '#f87171' }}>{ok ? '✓' : '✗'}</span>
                      <span className="text-xs text-white/50">{label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <p className="text-xs text-white/20 text-center">
              Scanned {new Date(result.scannedAt).toLocaleTimeString()} · Detection is based on publicly visible source code and response headers only.
            </p>
          </div>
        )}

        {/* Who This Is For */}
        <div className="mt-10 rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-3">Who This Is For</p>
          <ul className="space-y-1.5">
            {[
              "Developers evaluating a competitor's tech stack before building",
              'Agency teams auditing client sites for migrations or security reviews',
              'Recruiters and hiring managers researching company tech stacks',
              'Security researchers checking for outdated or exposed frameworks',
            ].map(item => (
              <li key={item} className="text-xs text-white/50 flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5 flex-shrink-0">→</span>{item}
              </li>
            ))}
          </ul>
        </div>

        {/* How It Works */}
        {!result && !loading && (
          <div className="mt-14 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <h2 className="text-xl font-black text-white mb-1">How It Works</h2>
            <p className="text-white/35 text-sm mb-8">Server-side fetch analyzes public HTML source and response headers — no browser plugins, no installation required.</p>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {[
                { n: '01', title: 'Enter any URL', body: 'Enter a domain like shopify.com or click one of the example sites. HTTPS is assumed if no protocol is specified.' },
                { n: '02', title: 'Server fetches + analyzes', body: "55+ technology signatures are checked against the page's HTML source and HTTP response headers. 8 categories: Framework, CMS, Hosting, Analytics, E-commerce, Marketing, UI Library, Language." },
                { n: '03', title: 'See tech + security score', body: 'Each detection shows confidence (high/low) and the exact evidence. Security headers are scored out of 6.' },
              ].map(s => (
                <div key={s.n} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                  <div className="text-xs font-black text-white/20 mb-2">{s.n}</div>
                  <div className="text-sm font-black text-white mb-1">{s.title}</div>
                  <div className="text-xs text-white/45 leading-relaxed">{s.body}</div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-4">Live result — shopify.com (verified)</p>
              <div className="space-y-2 mb-4">
                {[
                  { name: 'Shopify', cat: 'E-commerce', conf: 'high', evidence: 'cdn.shopify.com in page source' },
                  { name: 'Cloudflare', cat: 'Hosting', conf: 'high', evidence: 'cf-ray response header present' },
                  { name: 'Google Analytics', cat: 'Analytics', conf: 'high', evidence: 'googletagmanager.com in page source' },
                ].map(d => (
                  <div key={d.name} className="flex items-start gap-3">
                    <span className="text-sm font-bold text-white w-24 flex-shrink-0">{d.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-green-400 flex-shrink-0" style={{ background: 'rgba(52,211,153,0.1)' }}>{d.conf}</span>
                    <span className="text-xs text-white/35">{d.evidence}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-6 gap-2">
                {[
                  { label: 'HTTPS', ok: true },
                  { label: 'HSTS', ok: true },
                  { label: 'X-Frame', ok: true },
                  { label: 'CSP', ok: true },
                  { label: 'X-Content', ok: true },
                  { label: 'Referrer', ok: true },
                ].map(h => (
                  <div key={h.label} className="text-center">
                    <div style={{ color: '#34d399' }} className="text-sm">✓</div>
                    <div className="text-[10px] text-white/30">{h.label}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-green-400 text-center mt-2 font-bold">Security score: 6/6</p>
            </div>
          </div>
        )}

        {/* License CTA */}
        <div className="mt-14 rounded-2xl border p-6 text-center" style={{ background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.15)' }}>
          <p className="text-white font-black mb-1">Add this scanner to your platform</p>
          <p className="text-white/40 text-sm mb-4">License the full source — tech stack detection, security headers, export. One-time payment.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>Get this tool — $29 →</Link>
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>All 51 tools — from $149 →</Link>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  )
}
