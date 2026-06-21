'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const BASE_URL = 'https://queldrex.com'

interface ShortLink {
  code: string
  shortUrl: string
  originalUrl: string
  clicks: number
  created: number
}

function UrlShortenerContent() {
  const [url, setUrl] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [result, setResult] = useState<ShortLink | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<ShortLink[]>([])
  const searchParams = useSearchParams()

  useEffect(() => {
    const stored = sessionStorage.getItem('queldrex-short-urls')
    if (stored) {
      try { setHistory(JSON.parse(stored)) } catch {}
    }
    if (searchParams.get('error') === 'not_found') {
      setError('That short URL was not found. It may have expired.')
    }
  }, [searchParams])

  async function shorten() {
    if (!url.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/tools/url-shortener', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), customCode: customCode.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong'); setLoading(false); return }

      const link: ShortLink = { code: data.code, shortUrl: data.shortUrl, originalUrl: url.trim(), clicks: 0, created: Date.now() }
      setResult(link)
      const updated = [link, ...history.filter(h => h.code !== data.code).slice(0, 9)]
      setHistory(updated)
      sessionStorage.setItem('queldrex-short-urls', JSON.stringify(updated))
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  function copyLink(url: string) {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function refreshClicks(code: string) {
    const res = await fetch(`/api/tools/url-shortener?code=${code}`)
    if (!res.ok) return
    const data = await res.json()
    setHistory(h => h.map(link => link.code === code ? { ...link, clicks: data.clicks } : link))
    if (result?.code === code) setResult(r => r ? { ...r, clicks: data.clicks } : r)
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">

      <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/30 hover:text-white/60 transition-colors mb-8">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        All Tools
      </Link>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase mb-3"
          style={{ borderColor: 'rgba(6,182,212,0.25)', background: 'rgba(6,182,212,0.08)', color: '#06d6ff' }}>
          Free Tool · Utility
        </div>
        <h1 className="text-3xl font-black text-white mb-1">URL Shortener</h1>
        <p className="text-white/40 text-sm">Shorten any URL and track click counts. Custom codes supported. Links stay active for 90 days. Up to 10 per day free.</p>
      </div>

      {/* Input */}
      <div className="rounded-2xl border p-5 mb-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="mb-3">
          <label className="block text-xs font-bold text-white/30 uppercase tracking-wider mb-1">URL to shorten</label>
          <input value={url} onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && shorten()}
            placeholder="https://example.com/very/long/url/that/needs/shortening"
            className="w-full bg-transparent border rounded-lg px-3 py-2.5 text-white/70 text-sm outline-none placeholder:text-white/20"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-bold text-white/30 uppercase tracking-wider mb-1">Custom code (optional)</label>
          <div className="flex items-center gap-1">
            <span className="text-xs text-white/25 font-mono">{BASE_URL}/s/</span>
            <input value={customCode} onChange={e => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
              placeholder="my-link"
              maxLength={20}
              className="flex-1 bg-transparent border rounded-lg px-3 py-2 text-white/70 text-sm outline-none placeholder:text-white/20 font-mono"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
          </div>
        </div>
        <button onClick={shorten} disabled={loading || !url.trim()}
          className="w-full py-3.5 rounded-xl text-sm font-black text-black transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: loading ? 'none' : '0 0 24px rgba(6,182,212,0.25)' }}>
          {loading ? 'Creating...' : 'Shorten URL'}
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl border text-sm text-red-400"
          style={{ background: 'rgba(248,113,113,0.07)', borderColor: 'rgba(248,113,113,0.2)' }}>
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-2xl border p-5 mb-6" style={{ background: 'rgba(6,182,212,0.06)', borderColor: 'rgba(6,182,212,0.25)' }}>
          <p className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-3">Your short URL</p>
          <div className="flex items-center gap-3">
            <a href={result.shortUrl} target="_blank" rel="noopener noreferrer"
              className="flex-1 font-mono font-bold text-white hover:text-cyan-300 transition-colors">
              {result.shortUrl}
            </a>
            <button onClick={() => copyLink(result.shortUrl)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0 transition-all"
              style={{ background: copied ? 'rgba(74,222,128,0.12)' : 'rgba(6,182,212,0.15)', color: copied ? '#4ade80' : '#06d6ff', border: `1px solid ${copied ? 'rgba(74,222,128,0.25)' : 'rgba(6,182,212,0.3)'}` }}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-white/30 mt-2 truncate">→ {result.originalUrl}</p>
          <p className="text-xs text-white/20 mt-1">Expires in 90 days · Click "Refresh" on any link to update click counts</p>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-white/25 mb-3">This Session</p>
          <div className="space-y-2">
            {history.map(link => (
              <div key={link.code} className="flex items-center gap-3 rounded-xl border px-4 py-3"
                style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="flex-1 min-w-0">
                  <a href={link.shortUrl} target="_blank" rel="noopener noreferrer"
                    className="block text-sm font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
                    {link.shortUrl.replace('https://', '')}
                  </a>
                  <p className="text-xs text-white/30 truncate mt-0.5">{link.originalUrl}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-white/40 tabular-nums">
                    <span className="font-bold text-white">{link.clicks}</span> clicks
                  </span>
                  <button onClick={() => refreshClicks(link.code)}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg text-white/25 hover:text-white/60 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    ↻
                  </button>
                  <button onClick={() => copyLink(link.shortUrl)}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg text-white/25 hover:text-white/60 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/15 mt-3 text-center">History clears when you close this tab.</p>
        </div>
      )}

      {/* How It Works */}
      <div className="max-w-3xl mx-auto px-6 mt-14 mb-16 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <h2 className="text-xl font-black text-white mb-1">How It Works</h2>
        <p className="text-white/35 text-sm mb-8">Redis-backed short URLs with live click tracking — 90-day TTL, custom codes, and no login required.</p>
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { n: '01', title: 'Enter a long URL', body: 'Paste any URL. Optionally enter a custom code (e.g. "launch" for queldrex.com/s/launch) or let us generate a 6-character random code.' },
            { n: '02', title: 'Stored in Redis', body: 'The short code, original URL, creation time, and click counter are stored in Redis with a 90-day TTL. Rate limited to 10 URLs per IP per day.' },
            { n: '03', title: 'Track clicks', body: 'Every visit to /s/[code] increments the Redis click counter using HINCRBY. Refresh any link in your history to see the live count.' },
          ].map(s => (
            <div key={s.n} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
              <div className="text-xs font-black text-white/20 mb-2">{s.n}</div>
              <div className="text-sm font-black text-white mb-1">{s.title}</div>
              <div className="text-xs text-white/45 leading-relaxed">{s.body}</div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-4">Live test result</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/35 w-20 flex-shrink-0">Input URL</span>
              <code className="text-xs font-mono text-white/60">queldrex.com/tools/json-formatter</code>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/35 w-20 flex-shrink-0">Short URL</span>
              <code className="text-xs font-mono text-cyan-400">queldrex.com/s/TKcv6a</code>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/35 w-20 flex-shrink-0">Redirect</span>
              <span className="text-xs text-green-400">HTTP 302 → original URL</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/35 w-20 flex-shrink-0">Clicks</span>
              <span className="text-xs text-white/60">1 (tracked live in Redis)</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function UrlShortenerPage() {
  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <Suspense fallback={null}>
        <UrlShortenerContent />
      </Suspense>
      <Footer />
    </div>
  )
}
