'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const SAMPLE_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

const CLAIM_DOCS: Record<string, string> = {
  iss: 'Issuer — who created and signed this token',
  sub: 'Subject — the user or entity this token represents',
  aud: 'Audience — intended recipient(s) of this token',
  exp: 'Expiry — Unix timestamp when token becomes invalid',
  nbf: 'Not Before — token invalid until this Unix timestamp',
  iat: 'Issued At — Unix timestamp when token was created',
  jti: 'JWT ID — unique identifier to prevent token replay attacks',
  name: 'Display name of the token subject',
  email: 'Email address of the token subject',
  role: 'Authorization role assigned to the subject',
  scope: 'OAuth scopes granted to this token',
}

interface AuditItem {
  level: 'critical' | 'warning' | 'info'
  title: string
  detail: string
}

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

function auditToken(header: Record<string, unknown>, payload: Record<string, unknown>): AuditItem[] {
  const items: AuditItem[] = []
  const now = Math.floor(Date.now() / 1000)

  if (header.alg === 'none' || header.alg === 'None' || header.alg === 'NONE') {
    items.push({ level: 'critical', title: 'alg:none Attack Vector', detail: 'This token uses no algorithm — the signature is completely unverified. Any server accepting this is vulnerable to signature bypass.' })
  }
  if (!payload.exp) {
    items.push({ level: 'warning', title: 'No Expiry Claim (exp)', detail: 'This token never expires. If compromised, it cannot be invalidated without a blocklist.' })
  }
  if (payload.exp && typeof payload.exp === 'number' && payload.exp < now) {
    const minsAgo = Math.floor((now - (payload.exp as number)) / 60)
    items.push({ level: 'critical', title: 'Token Expired', detail: `This token expired ${minsAgo < 60 ? minsAgo + ' minutes' : Math.floor(minsAgo / 60) + ' hours'} ago. Do not use.` })
  }
  if (payload.nbf && typeof payload.nbf === 'number' && (payload.nbf as number) > now) {
    items.push({ level: 'warning', title: 'Token Not Yet Valid (nbf)', detail: 'The nbf claim is in the future — this token is not valid yet.' })
  }
  if (payload.iat && typeof payload.iat === 'number' && (payload.iat as number) > now + 300) {
    items.push({ level: 'warning', title: 'Issued In The Future (iat)', detail: 'The iat claim is more than 5 minutes in the future. Possible clock skew or token manipulation.' })
  }
  if (header.alg === 'HS256') {
    items.push({ level: 'info', title: 'Symmetric Algorithm (HS256)', detail: 'HS256 uses a shared secret. Ensure your server rejects RS256 public keys used as HS256 secrets (algorithm confusion attack).' })
  }
  if (header.alg === 'RS256') {
    items.push({ level: 'info', title: 'Asymmetric Algorithm (RS256)', detail: 'RS256 is preferred for distributed systems. The public key can be shared; only the private key creates valid tokens.' })
  }
  return items
}

async function verifyHs256(rawHeader: string, rawPayload: string, signature: string, secret: string): Promise<boolean | null> {
  try {
    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const data = enc.encode(`${rawHeader}.${rawPayload}`)
    const sig = await crypto.subtle.sign('HMAC', key, data)
    const computed = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
    const base64 = signature.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=')
    const sigBytes = Array.from(atob(padded), c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
    return computed === sigBytes
  } catch { return null }
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
  const [verifySecret, setVerifySecret] = useState('')
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null)
  const [showVerify, setShowVerify] = useState(false)

  function handle(val: string) {
    setToken(val)
    setVerifySecret('')
    setVerifyResult(null)
    if (!val.trim()) { setResult(null); setError(''); return }
    try {
      setResult(parseJwt(val))
      setError('')
    } catch (e) {
      setResult(null)
      setError(e instanceof Error ? e.message : 'Invalid JWT')
    }
  }

  useEffect(() => {
    if (!verifySecret || !result) { setVerifyResult(null); return }
    const alg = result.header.alg as string
    if (!alg?.startsWith('HS')) { setVerifyResult(null); return }
    verifyHs256(result.raw.header, result.raw.payload, result.raw.signature, verifySecret)
      .then(r => setVerifyResult(r))
  }, [verifySecret, result])

  function copy(section: string, content: string) {
    navigator.clipboard.writeText(content)
    setCopiedSection(section)
    setTimeout(() => setCopiedSection(''), 2000)
  }

  const auditItems = result ? auditToken(result.header as Record<string, unknown>, result.payload as Record<string, unknown>) : []

  const auditColors = {
    critical: { border: 'rgba(248,113,113,0.3)', bg: 'rgba(248,113,113,0.07)', text: '#f87171' },
    warning: { border: 'rgba(245,158,11,0.3)', bg: 'rgba(245,158,11,0.07)', text: '#f59e0b' },
    info: { border: 'rgba(99,102,241,0.3)', bg: 'rgba(99,102,241,0.07)', text: 'rgb(99,102,241)' },
  }

  const iat = result?.payload.iat as number | undefined
  const exp = result?.payload.exp as number | undefined
  const now = Math.floor(Date.now() / 1000)
  const showTimeline = !!(iat && exp)
  let nowPct = 50
  let isExpired = false
  if (showTimeline && iat && exp) {
    const range = exp - iat
    nowPct = Math.min(100, Math.max(0, ((now - iat) / range) * 100))
    isExpired = now > exp
  }

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
            Free Tool · No API Key · Browser Only
          </div>
          <h1 className="text-3xl font-black text-white mb-2">JWT Decoder</h1>
          <p className="text-white/40 text-sm mb-3">Decode and security-audit any JWT instantly. Flags expired tokens, algorithm vulnerabilities, and missing claims — all client-side. License from $15, or get all 51 tools from $99.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/pricing" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">Get this tool — $15 →</Link>
            <Link href="/pricing" className="text-xs font-bold text-white/40 hover:text-white/60 transition-colors">All 51 tools — from $99 →</Link>
          </div>
        </div>

        <div className="rounded-2xl border overflow-hidden mb-6" style={{ background: '#0a0e1a', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="px-4 py-2.5 border-b border-white/6 flex items-center justify-between">
            <span className="text-xs font-bold text-white/25 uppercase tracking-widest">Paste JWT Token</span>
            <button onClick={() => handle(SAMPLE_JWT)}
              className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all"
              style={{ color: 'rgba(99,102,241,0.8)', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              Load Sample →
            </button>
          </div>
          <textarea
            value={token}
            onChange={e => handle(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            style={{
              background: 'transparent', border: 'none', padding: '16px',
              color: 'rgba(255,255,255,0.7)', fontSize: 12, outline: 'none',
              width: '100%', minHeight: 100, resize: 'vertical',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
              lineHeight: 1.65, wordBreak: 'break-all',
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

            {/* Security Audit */}
            {auditItems.length === 0 ? (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-green-400"
                style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                No security issues detected
              </div>
            ) : (
              <div className="space-y-2">
                {auditItems.map((item, i) => {
                  const c = auditColors[item.level]
                  return (
                    <div key={i} className="rounded-xl border px-4 py-3" style={{ borderColor: c.border, background: c.bg }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black uppercase tracking-wider" style={{ color: c.text }}>
                          {item.level === 'critical' ? '⚠ ' : item.level === 'warning' ? '▲ ' : 'ℹ '}{item.title}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed">{item.detail}</p>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Timeline */}
            {showTimeline && iat && exp && (
              <div className="rounded-xl border p-4" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}>
                <p className="text-xs font-bold uppercase tracking-widest text-white/25 mb-4">Token Timeline</p>
                <div className="relative h-2 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="absolute inset-y-0 left-0 rounded-full transition-all"
                    style={{ width: `${Math.min(nowPct, 100)}%`, background: isExpired ? '#f87171' : '#4ade80' }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white/60 bg-slate-900" style={{ left: '0%', transform: 'translateX(-50%) translateY(-50%)' }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white bg-slate-900 z-10" style={{ left: `${nowPct}%`, transform: 'translateX(-50%) translateY(-50%)' }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white/60 bg-slate-900" style={{ left: '100%', transform: 'translateX(-50%) translateY(-50%)' }} />
                </div>
                <div className="relative flex justify-between text-[10px] text-white/30 mt-1">
                  <span>Issued</span>
                  <span className="absolute" style={{ left: `${nowPct}%`, transform: 'translateX(-50%)' }}>Now</span>
                  <span>Expires</span>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5">
                  {iat && <TimeDisplay ts={iat} label="Issued at (iat)" />}
                  {result.payload.nbf && <TimeDisplay ts={result.payload.nbf as number} label="Not before (nbf)" />}
                  {exp && <TimeDisplay ts={exp} label="Expires at (exp)" />}
                </div>
              </div>
            )}

            {/* Header */}
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.08)' }}>
              <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: 'rgba(99,102,241,0.15)' }}>
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgb(99,102,241)' }}>Header</span>
                <button onClick={() => copy('header', JSON.stringify(result.header, null, 2))}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all"
                  style={{ color: copiedSection === 'header' ? '#4ade80' : 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)' }}>
                  {copiedSection === 'header' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-white/70 overflow-auto whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(result.header, null, 2)}
              </pre>
            </div>

            {/* Payload with claim explainer */}
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(6,214,255,0.25)', background: 'rgba(6,214,255,0.05)' }}>
              <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: 'rgba(6,214,255,0.15)' }}>
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#06d6ff' }}>Payload</span>
                <button onClick={() => copy('payload', JSON.stringify(result.payload, null, 2))}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all"
                  style={{ color: copiedSection === 'payload' ? '#4ade80' : 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)' }}>
                  {copiedSection === 'payload' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="p-4 space-y-3">
                {Object.entries(result.payload as Record<string, unknown>).map(([key, val]) => (
                  <div key={key} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-xs font-black text-white/80">{key}</span>
                      <span className="text-xs font-mono text-cyan-300/80 break-all">{JSON.stringify(val)}</span>
                    </div>
                    {CLAIM_DOCS[key] && (
                      <p className="text-[10px] text-white/30 italic mt-0.5">{CLAIM_DOCS[key]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Signature + HS256 verify */}
            <div className="rounded-xl border p-4" style={{ borderColor: 'rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.05)' }}>
              <p className="text-xs font-black uppercase tracking-widest text-amber-400 mb-2">Signature</p>
              <p className="text-xs font-mono text-white/55 break-all leading-relaxed mb-3">{result.signature}</p>

              {(result.header.alg as string)?.startsWith('HS') ? (
                <div>
                  <button onClick={() => setShowVerify(v => !v)}
                    className="text-[10px] font-bold text-amber-400/70 hover:text-amber-400 transition-colors mb-2">
                    {showVerify ? '▾' : '▸'} Verify Signature (HS256)
                  </button>
                  {showVerify && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={verifySecret}
                        onChange={e => setVerifySecret(e.target.value)}
                        placeholder="Enter your HMAC secret..."
                        className="w-full text-xs font-mono rounded-lg px-3 py-2 outline-none"
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
                      />
                      {verifySecret && verifyResult !== null && (
                        <div className="mt-2 space-y-1">
                          <p className={`text-xs font-bold ${verifyResult ? 'text-green-400' : 'text-red-400'}`}>
                            {verifyResult ? '✓ Signature valid' : '✗ Invalid signature'}
                          </p>
                          {verifyResult && verifySecret.length < 32 && (
                            <p className="text-[10px] text-amber-400">Weak secret — NIST recommends minimum 256-bit (32-char) secrets for HS256</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-white/25">Signature verification requires the secret key. For RS256, paste your public key to verify.</p>
              )}
            </div>

            <p className="text-xs text-white/20 text-center">
              Algorithm: <span className="text-white/40 font-mono">{result.header.alg}</span>
              {result.header.typ && <> · Type: <span className="text-white/40 font-mono">{result.header.typ}</span></>}
              {result.payload.sub && <> · Subject: <span className="text-white/40 font-mono">{String(result.payload.sub)}</span></>}
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
          <h2 className="text-xl font-black text-white mb-1">Who This Is For</h2>
          <p className="text-white/35 text-sm mb-6">Built for engineers who need more than a raw decode.</p>
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            {[
              { title: 'Backend developers', body: 'Debugging auth issues in development — see exactly what claims your tokens carry.' },
              { title: 'Security engineers', body: 'Auditing JWT implementations for alg:none attacks, weak secrets, and missing claims.' },
              { title: 'DevOps teams', body: 'Verifying token expiry and claims in production logs without sending tokens to third-party tools.' },
              { title: 'API integrators', body: 'Testing OAuth/OIDC token flows — understand what each claim means without reading the RFC.' },
            ].map(s => (
              <div key={s.title} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-sm font-black text-white mb-1">{s.title}</div>
                <div className="text-xs text-white/45 leading-relaxed">{s.body}</div>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-black text-white mb-1">How It Works</h2>
          <p className="text-white/35 text-sm mb-8">JWTs are decoded locally — your token never leaves the browser.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { n: '01', title: 'Paste your JWT', body: 'Paste any JSON Web Token — from a Bearer header, cookie, or auth response. Tokens have 3 dot-separated parts.' },
              { n: '02', title: 'Base64URL decode', body: 'Each segment is Base64URL-decoded and JSON-parsed in your browser using atob() — no server call needed.' },
              { n: '03', title: 'Security audit', body: 'Expired claims, alg:none attacks, missing exp, weak secrets, and algorithm confusion risks are flagged automatically.' },
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
