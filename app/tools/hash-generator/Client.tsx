'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

type Algorithm = 'SHA-256' | 'SHA-512' | 'SHA-1' | 'SHA-384'
type Mode = 'text' | 'file' | 'hmac'
type Encoding = 'hex' | 'HEX' | 'base64' | 'base64url'

const ALGOS: { id: Algorithm; label: string; bits: number; uses: string; status: 'secure' | 'deprecated'; badge: string | null; warning: string | null }[] = [
  { id: 'SHA-256', label: 'SHA-256', bits: 256, uses: 'File integrity, API signatures, webhook verification, TLS', status: 'secure', badge: null, warning: null },
  { id: 'SHA-512', label: 'SHA-512', bits: 512, uses: 'High-security signing, password hashing (bcrypt uses SHA-512 internally)', status: 'secure', badge: 'Recommended', warning: null },
  { id: 'SHA-384', label: 'SHA-384', bits: 384, uses: 'NIST-approved — TLS certificates, government/compliance use', status: 'secure', badge: null, warning: null },
  { id: 'SHA-1', label: 'SHA-1', bits: 160, uses: 'Legacy compatibility only — collision attacks demonstrated since 2005', status: 'deprecated', badge: 'Deprecated by NIST', warning: 'SHA-1 is cryptographically broken. Do not use for any new security-sensitive application.' },
]

const HMAC_ALGOS: { id: 'SHA-256' | 'SHA-512'; label: string }[] = [
  { id: 'SHA-256', label: 'HMAC-SHA256' },
  { id: 'SHA-512', label: 'HMAC-SHA512' },
]

async function hashText(text: string, algo: Algorithm): Promise<string> {
  const data = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest(algo, data)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function hmacHash(message: string, secret: string, algo: 'SHA-256' | 'SHA-512'): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: algo }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function toBase64(hexStr: string): string {
  const bytes = (hexStr.match(/.{2}/g) ?? []).map(h => parseInt(h, 16))
  return btoa(String.fromCharCode(...bytes))
}

function toBase64url(hexStr: string): string {
  return toBase64(hexStr).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function encodeHash(hex: string, enc: Encoding): string {
  if (!hex) return ''
  if (enc === 'hex') return hex
  if (enc === 'HEX') return hex.toUpperCase()
  if (enc === 'base64') return toBase64(hex)
  return toBase64url(hex)
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function HashGeneratorClient() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<Mode>('text')
  const [hashes, setHashes] = useState<Record<Algorithm, string>>({} as Record<Algorithm, string>)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState('')
  const [encoding, setEncoding] = useState<Encoding>('hex')
  const [verifyInput, setVerifyInput] = useState('')
  const [showVerify, setShowVerify] = useState(false)
  const [hmacSecret, setHmacSecret] = useState('')
  const [hmacMessage, setHmacMessage] = useState('')
  const [hmacResults, setHmacResults] = useState<Record<string, string>>({})
  const [hmacLoading, setHmacLoading] = useState(false)
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (mode !== 'text' || !input) { setHashes({} as Record<Algorithm, string>); return }
    setLoading(true)
    Promise.all(ALGOS.map(a => hashText(input, a.id).then(h => [a.id, h] as [Algorithm, string])))
      .then(results => { setHashes(Object.fromEntries(results) as Record<Algorithm, string>); setLoading(false) })
  }, [input, mode])

  useEffect(() => {
    if (!hmacSecret || !hmacMessage) { setHmacResults({}); return }
    setHmacLoading(true)
    Promise.all(HMAC_ALGOS.map(a => hmacHash(hmacMessage, hmacSecret, a.id).then(h => [a.label, h] as [string, string])))
      .then(results => { setHmacResults(Object.fromEntries(results)); setHmacLoading(false) })
  }, [hmacSecret, hmacMessage])

  async function processFile(file: File) {
    setLoading(true)
    setFileInfo(null)
    const buffer = await file.arrayBuffer()
    const results = await Promise.all(
      ALGOS.map(async a => {
        const hash = await crypto.subtle.digest(a.id, buffer)
        const hex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
        return [a.id, hex] as [Algorithm, string]
      })
    )
    setFileInfo({ name: file.name, size: humanSize(file.size) })
    setInput(`[File: ${file.name}]`)
    setHashes(Object.fromEntries(results) as Record<Algorithm, string>)
    setLoading(false)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  function copy(key: string, val: string) {
    navigator.clipboard.writeText(val)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  function copyAllJson() {
    const obj: Record<string, string> = { input: fileInfo ? fileInfo.name : input, encoding }
    ALGOS.forEach(a => { if (hashes[a.id]) obj[a.id] = encodeHash(hashes[a.id], encoding) })
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2))
    setCopied('json')
    setTimeout(() => setCopied(''), 2000)
  }

  const anyHashes = Object.keys(hashes).length > 0

  const verifyMatch = verifyInput.trim().length > 10
    ? ALGOS.find(a => hashes[a.id] && encodeHash(hashes[a.id], encoding).toLowerCase() === verifyInput.trim().toLowerCase())
    : null

  function switchMode(m: Mode) {
    setMode(m)
    setInput('')
    setHashes({} as Record<Algorithm, string>)
    setFileInfo(null)
    setVerifyInput('')
  }

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-10">

        <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/30 hover:text-white/60 transition-colors mb-8">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase mb-3"
            style={{ borderColor: 'rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.08)', color: 'rgb(99,102,241)' }}>
            Free Tool · No API Key · Browser Only
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Hash Generator</h1>
          <p className="text-white/40 text-sm mb-3">Generate SHA-256, SHA-512, and HMAC hashes from text or files. Verify download checksums, sign webhook payloads — all client-side. License this tool from $15, or get all 51 tools from $149.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/pricing" className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(99,102,241,0.15)', color: 'rgb(129,140,248)', border: '1px solid rgba(99,102,241,0.3)' }}>
              Get this tool — $15 →
            </Link>
            <Link href="/pricing" className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
              All 51 tools — from $149 →
            </Link>
          </div>
        </div>

        <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {([['text', 'Hash Text'], ['file', 'Hash File'], ['hmac', 'HMAC']] as const).map(([m, label]) => (
            <button key={m} onClick={() => switchMode(m)}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
              style={{
                background: mode === m ? '#0d1117' : 'transparent',
                color: mode === m ? 'white' : 'rgba(255,255,255,0.35)',
                border: mode === m ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
              }}>
              {label}
            </button>
          ))}
        </div>

        {mode === 'hmac' ? (
          <div className="space-y-4 mb-6">
            <div className="rounded-xl border p-4" style={{ background: 'rgba(6,182,212,0.05)', borderColor: 'rgba(6,182,212,0.2)' }}>
              <p className="text-xs text-cyan-400/80">HMAC is used by Stripe, GitHub, and Shopify to sign webhooks. Paste your payload and secret to verify or generate a signature.</p>
            </div>
            <div className="rounded-2xl border overflow-hidden" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <input
                type="text"
                value={hmacSecret}
                onChange={e => setHmacSecret(e.target.value)}
                placeholder="Webhook secret key"
                style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px', color: 'rgba(255,255,255,0.75)', fontSize: 13, outline: 'none', width: '100%', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace' }}
                spellCheck={false}
              />
              <textarea
                value={hmacMessage}
                onChange={e => setHmacMessage(e.target.value)}
                placeholder="Message or webhook payload..."
                style={{ background: 'transparent', border: 'none', padding: '16px', color: 'rgba(255,255,255,0.75)', fontSize: 13, outline: 'none', width: '100%', minHeight: 100, resize: 'vertical', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace', lineHeight: 1.65 }}
                spellCheck={false}
              />
            </div>
            <div className="space-y-3">
              {HMAC_ALGOS.map(a => (
                <div key={a.label} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-white uppercase tracking-wider">{a.label}</span>
                    <button onClick={() => copy(a.label, hmacResults[a.label] ?? '')} disabled={!hmacResults[a.label]}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all disabled:opacity-30"
                      style={{ background: copied === a.label ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.06)', color: copied === a.label ? '#4ade80' : 'rgba(255,255,255,0.35)', border: `1px solid ${copied === a.label ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.08)'}` }}>
                      {copied === a.label ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <code className="block text-xs font-mono text-white/55 break-all leading-relaxed min-h-[1.5rem]">
                    {hmacLoading && (hmacSecret || hmacMessage) ? '...' : (hmacResults[a.label] ?? <span className="text-white/20">signature will appear here</span>)}
                  </code>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border overflow-hidden mb-6" style={{ background: '#0d1117', borderColor: isDragging ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.08)' }}
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}>
              {mode === 'text' ? (
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Enter text to hash..."
                  style={{ background: 'transparent', border: 'none', padding: '16px', color: 'rgba(255,255,255,0.75)', fontSize: 13, outline: 'none', width: '100%', minHeight: 120, resize: 'vertical', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace', lineHeight: 1.65 }}
                  spellCheck={false}
                />
              ) : (
                <label className="flex flex-col items-center justify-center p-12 cursor-pointer hover:bg-white/2 transition-colors" onClick={() => fileInputRef.current?.click()}>
                  <svg className="w-10 h-10 text-white/20 mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"/></svg>
                  {fileInfo ? (
                    <>
                      <p className="text-sm font-bold text-white/70 mb-1">{fileInfo.name}</p>
                      <p className="text-xs text-white/30">{fileInfo.size} · Processed locally, never uploaded</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-white/40 mb-1">{isDragging ? 'Drop file here' : 'Click or drag a file to hash'}</p>
                      <p className="text-xs text-white/20">Any file type supported · Processed locally, never uploaded</p>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
                </label>
              )}
            </div>

            {loading && <p className="text-xs text-cyan-400/60 text-center mb-4">Hashing...</p>}

            {(anyHashes || mode === 'text') && (
              <div className="rounded-xl border p-3 mb-4 flex items-center gap-2" style={{ background: 'rgba(251,146,60,0.05)', borderColor: 'rgba(251,146,60,0.2)' }}>
                <span className="text-amber-400 text-sm">⚠</span>
                <p className="text-xs text-amber-400/80">Never use bare SHA hashes for storing passwords. Use bcrypt, Argon2, or scrypt instead — these are slow by design.</p>
              </div>
            )}

            {anyHashes && (
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-[10px] text-white/30 uppercase tracking-widest">Encoding:</span>
                {(['hex', 'HEX', 'base64', 'base64url'] as Encoding[]).map(e => (
                  <button key={e} onClick={() => setEncoding(e)}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all"
                    style={{ background: encoding === e ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.05)', color: encoding === e ? '#06d6ff' : 'rgba(255,255,255,0.35)', border: `1px solid ${encoding === e ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                    {e}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {ALGOS.map(algo => (
                <div key={algo.id} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-white uppercase tracking-wider">{algo.label}</span>
                      <span className="text-[10px] text-white/25">{algo.bits} bits</span>
                      {algo.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={algo.status === 'deprecated'
                            ? { color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.08)' }
                            : { color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.08)' }}>
                          {algo.badge}
                        </span>
                      )}
                    </div>
                    <button onClick={() => copy(algo.id, encodeHash(hashes[algo.id] ?? '', encoding))} disabled={!hashes[algo.id]}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all disabled:opacity-30"
                      style={{ background: copied === algo.id ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.06)', color: copied === algo.id ? '#4ade80' : 'rgba(255,255,255,0.35)', border: `1px solid ${copied === algo.id ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.08)'}` }}>
                      {copied === algo.id ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <code className="block text-xs font-mono text-white/55 break-all leading-relaxed min-h-[1.5rem]">
                    {loading && (input || fileInfo) ? '...' : (hashes[algo.id] ? encodeHash(hashes[algo.id], encoding) : <span className="text-white/20">hash will appear here</span>)}
                  </code>
                  <p className="text-[11px] text-white/25 mt-1">{algo.uses}</p>
                  {algo.warning && hashes[algo.id] && (
                    <p className="text-[10px] text-red-400/70 mt-1 italic">{algo.warning}</p>
                  )}
                </div>
              ))}
            </div>

            {anyHashes && (
              <>
                <div className="flex items-center gap-3 mt-4">
                  <button onClick={copyAllJson}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: copied === 'json' ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.06)', color: copied === 'json' ? '#4ade80' : 'rgba(255,255,255,0.4)', border: `1px solid ${copied === 'json' ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.1)'}` }}>
                    {copied === 'json' ? 'Copied!' : 'Copy all as JSON'}
                  </button>
                  <button onClick={() => setShowVerify(v => !v)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {showVerify ? 'Hide verify' : 'Verify a known hash'}
                  </button>
                </div>

                {showVerify && (
                  <div className="mt-3 rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
                    <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">Verify Known Hash</p>
                    <input
                      type="text"
                      value={verifyInput}
                      onChange={e => setVerifyInput(e.target.value)}
                      placeholder="Paste expected hash to compare..."
                      className="w-full text-xs font-mono rounded-lg px-3 py-2 mb-2"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', outline: 'none' }}
                    />
                    {verifyInput.trim().length > 10 && (
                      verifyMatch
                        ? <p className="text-xs font-bold text-green-400">✓ Matches {verifyMatch.label} hash</p>
                        : <p className="text-xs font-bold text-red-400">✗ No match against any computed hash</p>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}

        <p className="text-xs text-white/15 mt-6 text-center">
          Uses the Web Crypto API (<code className="text-white/25">crypto.subtle.digest</code>). All hashing is done in your browser.
        </p>

        <div className="mt-14 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-xl font-black text-white mb-1">Who This Is For</h2>
          <p className="text-white/35 text-sm mb-6">Anyone working with cryptographic hashes, file verification, or webhook signatures.</p>
          <div className="grid sm:grid-cols-2 gap-3 mb-10">
            {[
              { title: 'Webhook developers', body: 'Verify Stripe, GitHub, and Shopify webhook signatures with HMAC-SHA256 without sending secrets to a third-party tool.' },
              { title: 'Security engineers', body: 'Check file integrity after downloads. Compare SHA-256 checksums against publisher-provided values.' },
              { title: 'DevOps teams', body: 'Generate checksums for deployment artifacts and container images. Export as JSON for CI/CD pipelines.' },
              { title: 'Students and practitioners', body: 'Learn applied cryptography hands-on — see why SHA-1 is broken and how HMAC differs from bare hashing.' },
            ].map(c => (
              <div key={c.title} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-sm font-black text-white mb-1">{c.title}</div>
                <div className="text-xs text-white/40 leading-relaxed">{c.body}</div>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-black text-white mb-1">How It Works</h2>
          <p className="text-white/35 text-sm mb-6">Uses the browser&apos;s native Web Crypto API — cryptographically correct, nothing sent to a server.</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { n: '01', title: 'Text, file, or HMAC', body: 'Type text, drag in any file, or switch to HMAC mode to generate webhook signatures with a secret key.' },
              { n: '02', title: 'Web Crypto API', body: 'crypto.subtle.digest() computes SHA-256, SHA-512, SHA-384, and SHA-1 in parallel. HMAC uses crypto.subtle.sign().' },
              { n: '03', title: 'Encode and verify', body: 'Switch output encoding between hex, HEX, Base64, and Base64url. Paste a known hash to verify it matches.' },
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
