'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

function decodeBase64Url(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=')
  try {
    return decodeURIComponent(escape(atob(padded)))
  } catch {
    return atob(padded)
  }
}

function parseJwt(token: string) {
  const parts = token.trim().split('.')
  if (parts.length !== 3) throw new Error('Not a valid JWT — expected 3 parts separated by dots')

  const header = JSON.parse(decodeBase64Url(parts[0]))
  const payload = JSON.parse(decodeBase64Url(parts[1]))
  const signature = parts[2]

  return { header, payload, signature, raw: { header: parts[0], payload: parts[1], signature: parts[2] } }
}

function TimeDisplay({ ts, label }: { ts: number; label: string }) {
  const date = new Date(ts * 1000)
  const now = Date.now()
  const diff = ts * 1000 - now
  const expired = diff < 0
  const abs = Math.abs(diff)
  const mins = Math.floor(abs / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)

  let relative = ''
  if (days > 0) relative = `${days}d ${hours % 24}h`
  else if (hours > 0) relative = `${hours}h ${mins % 60}m`
  else relative = `${mins}m`

  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-white/5 last:border-0">
      <div>
        <p className="text-xs text-white/40 mb-0.5">{label}</p>
        <p className="text-sm text-white font-mono">{date.toUTCString()}</p>
      </div>
      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full flex-shrink-0 ${expired ? 'text-red-400 bg-red-400/10' : 'text-green-400 bg-green-400/10'}`}>
        {expired ? `expired ${relative} ago` : `in ${relative}`}
      </span>
    </div>
  )
}

export default function JwtDecoderPage() {
  const [token, setToken] = useState('')
  const [result, setResult] = useState<ReturnType<typeof parseJwt> | null>(null)
  const [error, setError] = useState('')
  const [copiedSection, setCopiedSection] = useState('')

  function handle(val: string) {
    setToken(val)
    if (!val.trim()) { setResult(null); setError(''); return }
    try {
      setResult(parseJwt(val))
      setError('')
    } catch (e) {
      setResult(null)
      setError(e instanceof Error ? e.message : 'Invalid JWT')
    }
  }

  function copy(section: string, content: string) {
    navigator.clipboard.writeText(content)
    setCopiedSection(section)
    setTimeout(() => setCopiedSection(''), 2000)
  }

  const Section = ({ title, data, id, color }: { title: string; data: unknown; id: string; color: string }) => (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: `${color}25`, background: `${color}08` }}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: `${color}15` }}>
        <span className="text-xs font-black uppercase tracking-widest" style={{ color }}>{title}</span>
        <button onClick={() => copy(id, JSON.stringify(data, null, 2))}
          className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all"
          style={{ color: copiedSection === id ? '#4ade80' : 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)' }}>
          {copiedSection === id ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 text-xs font-mono text-white/70 overflow-auto whitespace-pre-wrap leading-relaxed">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-10">

        <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/30 hover:text-white/60 transition-colors mb-8">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase mb-3"
            style={{ borderColor: 'rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.08)', color: 'rgb(99,102,241)' }}>
            Free Tool · Developer
          </div>
          <h1 className="text-3xl font-black text-white mb-1">JWT Decoder</h1>
          <p className="text-white/40 text-sm">Decode and inspect JSON Web Tokens instantly. Your token never leaves your browser.</p>
        </div>

        <div className="rounded-2xl border overflow-hidden mb-6" style={{ background: '#0a0e1a', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="px-4 py-2.5 border-b border-white/6">
            <span className="text-xs font-bold text-white/25 uppercase tracking-widest">Paste JWT Token</span>
          </div>
          <textarea
            value={token}
            onChange={e => handle(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '16px',
              color: 'rgba(255,255,255,0.7)',
              fontSize: 12,
              outline: 'none',
              width: '100%',
              minHeight: 100,
              resize: 'vertical',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
              lineHeight: 1.65,
              wordBreak: 'break-all',
            }}
            spellCheck={false}
          />
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl border text-sm text-red-400 flex items-center gap-2"
            style={{ background: 'rgba(248,113,113,0.07)', borderColor: 'rgba(248,113,113,0.2)' }}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.834-1.964-.834-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {(result.payload.exp || result.payload.iat || result.payload.nbf) && (
              <div className="rounded-xl border p-4" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}>
                <p className="text-xs font-bold uppercase tracking-widest text-white/25 mb-3">Token Timing</p>
                {result.payload.iat && <TimeDisplay ts={result.payload.iat} label="Issued at (iat)" />}
                {result.payload.nbf && <TimeDisplay ts={result.payload.nbf} label="Not before (nbf)" />}
                {result.payload.exp && <TimeDisplay ts={result.payload.exp} label="Expires at (exp)" />}
              </div>
            )}

            <Section title="Header" data={result.header} id="header" color="rgb(99,102,241)" />
            <Section title="Payload" data={result.payload} id="payload" color="#06d6ff" />

            <div className="rounded-xl border p-4" style={{ borderColor: 'rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.05)' }}>
              <p className="text-xs font-black uppercase tracking-widest text-amber-400 mb-2">Signature</p>
              <p className="text-xs font-mono text-white/55 break-all leading-relaxed">{result.signature}</p>
              <p className="text-xs text-white/25 mt-2">Signature verification requires the secret key — this tool only decodes, it cannot verify.</p>
            </div>

            <p className="text-xs text-white/20 text-center">
              Algorithm: <span className="text-white/40 font-mono">{result.header.alg}</span>
              {result.header.typ && <> · Type: <span className="text-white/40 font-mono">{result.header.typ}</span></>}
              {result.payload.sub && <> · Subject: <span className="text-white/40 font-mono">{result.payload.sub}</span></>}
            </p>
          </div>
        )}

        {!result && !error && !token && (
          <div className="text-center py-16 text-white/20">
            <svg className="w-10 h-10 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
            <p className="text-sm">Paste a JWT token above to decode it</p>
          </div>
        )}

        <p className="text-xs text-white/15 mt-6 text-center">
          Decoding is done entirely in your browser. Tokens are never sent to any server.
        </p>

        <div className="mt-14 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-xl font-black text-white mb-1">How It Works</h2>
          <p className="text-white/35 text-sm mb-8">JWTs are decoded locally — your token never leaves the browser.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { n: '01', title: 'Paste your JWT', body: 'Paste any JSON Web Token — from a Bearer header, cookie, or auth response. Tokens have 3 dot-separated parts.' },
              { n: '02', title: 'Base64URL decode', body: 'Each segment is Base64URL-decoded and JSON-parsed in your browser using atob() — no server call needed.' },
              { n: '03', title: 'Inspect the claims', body: 'See the algorithm, subject, issued-at, expiry, and all custom claims. Expiry countdown is calculated from exp.' },
            ].map(s => (
              <div key={s.n} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-xs font-black text-white/20 mb-2">{s.n}</div>
                <div className="text-sm font-black text-white mb-1">{s.title}</div>
                <div className="text-xs text-white/45 leading-relaxed">{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
