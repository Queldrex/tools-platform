'use client'
import { useState, useCallback } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PaywallCard from '@/components/PaywallCard'

interface HeaderRow {
  name: string
  value: string
  purpose: string
  grade: 'good' | 'warn' | 'info'
  good?: string
  bad?: string
}

interface Result {
  url: string
  status: number
  statusText: string
  headers: HeaderRow[]
  missingSecurityHeaders: HeaderRow[]
  securityScore: number
  securityMax: number
  securityGrade: string
  remaining: number
}

const GRADE_COLOR = { good: '#4ade80', warn: '#facc15', info: '#A1A1AA' }
const GRADE_BG = { good: 'rgba(74,222,128,0.1)', warn: 'rgba(250,204,21,0.1)', info: 'rgba(161,161,170,0.08)' }
const GRADE_BORDER = { good: 'rgba(74,222,128,0.2)', warn: 'rgba(250,204,21,0.2)', info: 'rgba(255,255,255,0.06)' }
const LETTER_COLOR: Record<string, string> = { A: '#4ade80', B: '#86efac', C: '#facc15', D: '#fb923c', F: '#f87171' }

export default function HttpHeadersPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)
  const [copiedHeader, setCopiedHeader] = useState<string | null>(null)

  const copySnippet = useCallback((name: string, value: string) => {
    navigator.clipboard.writeText(value)
    setCopiedHeader(name)
    setTimeout(() => setCopiedHeader(null), 2000)
  }, [])

  const check = async (urlArg?: string) => {
    const u = (urlArg ?? url).trim()
    if (!u) return
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    try {
      const res = await fetch('/api/tools/http-headers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: u }),
      })
      const data = await res.json()
      if (data.paywall || res.status === 402) { setPaywall(true); return }
      if (!res.ok) throw new Error(data.error || 'Failed to fetch URL')
      setResult(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to fetch URL') }
    finally { setLoading(false) }
  }

  const loadExample = () => {
    const ex = 'https://github.com'
    setUrl(ex)
    check(ex)
  }

  return (
    <div className="min-h-screen" style={{ background: '#09090B' }}>
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/tools" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>All Tools
        </Link>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#34d399', borderColor: 'rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.08)' }}>Free</span>
          <span className="text-sm font-bold text-white/30">10 checks/day · Unlimited with $79/mo Pro</span>
        </div>

        <h1 className="text-4xl font-black text-white mb-3">HTTP Header <span style={{ color: '#34d399' }}>Inspector</span></h1>
        <p className="text-white/55 text-base mb-4 max-w-2xl">Fetch any URL and inspect every response header with plain-English explanations. Get a security score and see exactly which headers are missing.</p>
        <div className="flex gap-3 flex-wrap mb-8">
          <Link href="/pricing" className="inline-flex items-center gap-1 text-sm font-black px-4 py-2 rounded-xl text-black" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>Get this tool — $29 →</Link>
          <Link href="/pricing" className="inline-flex items-center gap-1 text-sm font-black px-4 py-2 rounded-xl border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>All 51 tools — from $99 →</Link>
        </div>

        <div className="rounded-2xl border p-6 mb-6" style={{ background: '#111318', borderColor: 'rgba(255,255,255,0.08)' }}>
          <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">URL to inspect</label>
          <div className="flex gap-3">
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && check()}
              placeholder="https://yourwebsite.com"
              className="flex-1 text-sm text-white placeholder-white/20 outline-none"
              style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 16px' }}
            />
            <button
              onClick={() => check()}
              disabled={loading || !url.trim()}
              className="px-5 py-3 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.02] disabled:opacity-50 whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg,#34d399,#059669)', boxShadow: '0 0 16px rgba(52,211,153,0.25)' }}
            >
              {loading ? 'Fetching…' : 'Inspect'}
            </button>
          </div>
          <div className="flex justify-end mt-3">
            <button onClick={loadExample} disabled={loading} className="px-4 py-2 rounded-xl text-sm font-bold border transition-colors hover:bg-white/5 disabled:opacity-40" style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>
              Try Example → github.com
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>}
        {paywall && !loading && <PaywallCard toolId="http-headers" toolName="HTTP Header Inspector" oneTimePrice={0} freeLimit={10} accent="#34d399" />}

        {result && (
          <div className="space-y-6">
            {/* Score bar */}
            <div className="rounded-xl border p-5 flex items-center gap-6" style={{ background: '#111318', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="text-center flex-shrink-0">
                <div className="text-5xl font-black" style={{ color: LETTER_COLOR[result.securityGrade] ?? '#A1A1AA' }}>{result.securityGrade}</div>
                <div className="text-xs font-black uppercase tracking-widest mt-1" style={{ color: '#A1A1AA' }}>Security</div>
              </div>
              <div className="flex-1 border-l pl-6" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="text-sm font-black text-white mb-2">{result.securityScore} of {result.securityMax} security headers present</div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${(result.securityScore / result.securityMax) * 100}%`, background: LETTER_COLOR[result.securityGrade] }} />
                </div>
                <div className="text-xs mt-2" style={{ color: '#A1A1AA' }}>{result.url} · HTTP {result.status} {result.statusText}</div>
              </div>
            </div>

            {/* Missing security headers */}
            {result.missingSecurityHeaders.length > 0 && (
              <div>
                <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#facc15' }}>Missing Security Headers ({result.missingSecurityHeaders.length})</p>
                <div className="space-y-2">
                  {result.missingSecurityHeaders.map((h, i) => (
                    <div key={i} className="rounded-xl border px-4 py-3" style={{ background: 'rgba(250,204,21,0.04)', borderColor: 'rgba(250,204,21,0.15)' }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-white">{h.name}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(250,204,21,0.15)', color: '#facc15' }}>MISSING</span>
                      </div>
                      <p className="text-xs mb-1" style={{ color: '#A1A1AA' }}>{h.purpose}</p>
                      {h.good && (
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs flex-1" style={{ color: '#4ade80' }}>Recommended: {h.good}</p>
                          <button
                            onClick={() => copySnippet(h.name, `${h.name}: ${h.good}`)}
                            className="text-[10px] font-bold px-2 py-1 rounded flex-shrink-0"
                            style={{ background: 'rgba(99,102,241,0.08)', color: copiedHeader === h.name ? '#4ade80' : '#818cf8' }}
                          >
                            {copiedHeader === h.name ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All headers */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white/35 mb-3">All Response Headers ({result.headers.length})</p>
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                {result.headers.map((h, i) => (
                  <div key={i} className="px-4 py-3 border-b last:border-0" style={{ background: i % 2 === 0 ? '#111318' : '#0a0f1a', borderColor: 'rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono font-bold text-white">{h.name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded font-bold uppercase" style={{ background: GRADE_BG[h.grade], color: GRADE_COLOR[h.grade], border: `1px solid ${GRADE_BORDER[h.grade]}` }}>
                        {h.grade}
                      </span>
                    </div>
                    <p className="text-xs font-mono mb-1 break-all" style={{ color: '#A1A1AA' }}>{h.value}</p>
                    <p className="text-xs" style={{ color: 'rgba(161,161,170,0.7)' }}>{h.purpose}</p>
                    {h.bad && <p className="text-xs mt-0.5" style={{ color: '#f87171' }}>Caution: {h.bad}</p>}
                    {h.good && h.grade === 'good' && <p className="text-xs mt-0.5" style={{ color: '#4ade80' }}>Good: {h.good}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 mb-8">
          <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Who This Is For</p>
          <ul className="space-y-2 text-sm text-white/55">
            <li>• Security engineers auditing response headers before a penetration test</li>
            <li>• Developers adding HSTS, CSP, and X-Frame-Options to a new web app</li>
            <li>• DevOps teams checking header configuration after a CDN or proxy change</li>
            <li>• Agencies running security audits on client sites for compliance reports</li>
          </ul>
        </div>

        <section className="mt-16 pt-8 border-t max-w-2xl" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-lg font-black text-white mb-4">Understanding HTTP security headers</h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#A1A1AA' }}>HTTP response headers are instructions your server sends to browsers alongside every response. Security headers tell browsers how to handle your content: whether to allow iframing (X-Frame-Options), whether to sniff MIME types (X-Content-Type-Options), how long to remember to use HTTPS (Strict-Transport-Security), and what scripts are allowed to run (Content-Security-Policy). Browsers enforce these instructions automatically — no JavaScript needed.</p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#A1A1AA' }}>The most important header missing from most sites is Content-Security-Policy. A well-configured CSP prevents cross-site scripting (XSS) attacks by defining exactly which script sources, image sources, and connection endpoints are allowed. A strict CSP with no &apos;unsafe-inline&apos; means even if an attacker injects a script tag, the browser will refuse to run it. CSP alone eliminates the most common class of web vulnerabilities.</p>
          <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>Permissions-Policy (formerly Feature-Policy) is the most overlooked header. It controls whether embedded iframes and third-party scripts can access the camera, microphone, geolocation, payment APIs, and more. Even if your code doesn&apos;t use these features, third-party ad or analytics scripts embedded on your page might — and without Permissions-Policy, they can do so silently. Set it to deny all unused features: camera=(), microphone=(), geolocation=().</p>
        </section>
        <div className="mt-14 rounded-2xl border p-6 text-center" style={{ background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.15)' }}>
          <p className="text-white font-black mb-1">Add HTTP header analysis to your platform</p>
          <p className="text-white/40 text-sm mb-4">Security grade A–F, missing header detection with fix snippets, full header table. One-time license.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>Get this tool — $29 →</Link>
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>All 51 tools — from $99 →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
