'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

type Algorithm = 'SHA-256' | 'SHA-512' | 'SHA-1' | 'SHA-384'

async function hashText(text: string, algo: Algorithm): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest(algo, data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

const ALGOS: { id: Algorithm; label: string; bits: number; uses: string }[] = [
  { id: 'SHA-256', label: 'SHA-256', bits: 256, uses: 'Most common — file integrity, API signatures, TLS' },
  { id: 'SHA-512', label: 'SHA-512', bits: 512, uses: 'Stronger — password hashing, high-security signing' },
  { id: 'SHA-384', label: 'SHA-384', bits: 384, uses: 'NIST approved — TLS certificates, government use' },
  { id: 'SHA-1', label: 'SHA-1', bits: 160, uses: 'Legacy only — deprecated, do not use for security' },
]

export default function HashGeneratorPage() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'text' | 'file'>('text')
  const [hashes, setHashes] = useState<Record<Algorithm, string>>({} as Record<Algorithm, string>)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState('')

  useEffect(() => {
    if (!input) { setHashes({} as Record<Algorithm, string>); return }
    setLoading(true)
    Promise.all(ALGOS.map(a => hashText(input, a.id).then(h => [a.id, h] as [Algorithm, string])))
      .then(results => {
        setHashes(Object.fromEntries(results) as Record<Algorithm, string>)
        setLoading(false)
      })
  }, [input])

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    const buffer = await file.arrayBuffer()
    const results = await Promise.all(
      ALGOS.map(async a => {
        const hash = await crypto.subtle.digest(a.id, buffer)
        const hex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
        return [a.id, hex] as [Algorithm, string]
      })
    )
    setInput(`[File: ${file.name} — ${(file.size / 1024).toFixed(1)} KB]`)
    setHashes(Object.fromEntries(results) as Record<Algorithm, string>)
    setLoading(false)
  }

  function copy(algo: Algorithm, val: string) {
    navigator.clipboard.writeText(val)
    setCopied(algo)
    setTimeout(() => setCopied(''), 2000)
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
            Free Tool · Security
          </div>
          <h1 className="text-3xl font-black text-white mb-1">Hash Generator</h1>
          <p className="text-white/40 text-sm">Generate SHA-256, SHA-512, SHA-384, and SHA-1 hashes from text or files. Runs entirely in your browser — nothing is uploaded or transmitted.</p>
        </div>

        <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {(['text', 'file'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setInput(''); setHashes({} as Record<Algorithm, string>) }}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all capitalize"
              style={{
                background: mode === m ? '#0d1117' : 'transparent',
                color: mode === m ? 'white' : 'rgba(255,255,255,0.35)',
                border: mode === m ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
              }}>
              {m === 'text' ? 'Hash Text' : 'Hash File'}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border overflow-hidden mb-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          {mode === 'text' ? (
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter text to hash..."
              style={{
                background: 'transparent',
                border: 'none',
                padding: '16px',
                color: 'rgba(255,255,255,0.75)',
                fontSize: 13,
                outline: 'none',
                width: '100%',
                minHeight: 120,
                resize: 'vertical',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
                lineHeight: 1.65,
              }}
              spellCheck={false}
            />
          ) : (
            <label className="flex flex-col items-center justify-center p-12 cursor-pointer hover:bg-white/2 transition-colors">
              <svg className="w-10 h-10 text-white/20 mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"/></svg>
              <p className="text-sm text-white/40 mb-1">Click to select a file</p>
              <p className="text-xs text-white/20">Any file type supported · Processed locally, never uploaded</p>
              <input type="file" onChange={handleFile} className="hidden" />
            </label>
          )}
        </div>

        <div className="space-y-3">
          {ALGOS.map(algo => (
            <div key={algo.id} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white uppercase tracking-wider">{algo.label}</span>
                  <span className="text-[10px] text-white/25">{algo.bits} bits</span>
                  {algo.id === 'SHA-1' && (
                    <span className="text-[10px] font-bold text-amber-400 border border-amber-400/30 px-1.5 py-0.5 rounded">Deprecated</span>
                  )}
                </div>
                <button onClick={() => copy(algo.id, hashes[algo.id] ?? '')} disabled={!hashes[algo.id]}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all disabled:opacity-30"
                  style={{
                    background: copied === algo.id ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.06)',
                    color: copied === algo.id ? '#4ade80' : 'rgba(255,255,255,0.35)',
                    border: `1px solid ${copied === algo.id ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.08)'}`,
                  }}>
                  {copied === algo.id ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <code className="block text-xs font-mono text-white/55 break-all leading-relaxed min-h-[1.5rem]">
                {loading && input ? '...' : (hashes[algo.id] ?? <span className="text-white/20">hash will appear here</span>)}
              </code>
              <p className="text-[11px] text-white/25 mt-1">{algo.uses}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-white/15 mt-6 text-center">
          Uses the Web Crypto API (<code className="text-white/25">crypto.subtle.digest</code>). All hashing is done in your browser.
        </p>

        <div className="mt-14 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-xl font-black text-white mb-1">How It Works</h2>
          <p className="text-white/35 text-sm mb-8">Uses the browser&apos;s native Web Crypto API — cryptographically correct, nothing sent to a server.</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { n: '01', title: 'Text or file mode', body: 'Type any text, or switch to File mode and upload any file. The file is read as ArrayBuffer for accurate binary hashing.' },
              { n: '02', title: 'Web Crypto hashes', body: 'TextEncoder converts input to bytes. crypto.subtle.digest() computes SHA-256, SHA-512, SHA-384, and SHA-1 in parallel.' },
              { n: '03', title: 'Copy hex output', body: 'Each hash is displayed as lowercase hex. Click to copy any individual hash. Use SHA-256 or SHA-512 for modern applications.' },
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
