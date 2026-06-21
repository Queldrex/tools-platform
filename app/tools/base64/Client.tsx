'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Base64Page() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  function process(val: string, m: 'encode' | 'decode') {
    setInput(val)
    setError('')
    if (!val.trim()) { setOutput(''); return }
    try {
      if (m === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(val))))
      } else {
        setOutput(decodeURIComponent(escape(atob(val.trim().replace(/\s/g, '')))))
      }
    } catch {
      setError(m === 'decode' ? 'Invalid Base64 string — could not decode' : 'Could not encode this text')
      setOutput('')
    }
  }

  function switchMode() {
    const next = mode === 'encode' ? 'decode' : 'encode'
    setMode(next)
    setInput(output)
    process(output, next)
  }

  function copy() {
    if (!output) return
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const textareaStyle: React.CSSProperties = {
    background: '#0a0e1a',
    border: 'none',
    padding: '16px',
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    outline: 'none',
    width: '100%',
    minHeight: 180,
    resize: 'vertical',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
    lineHeight: 1.65,
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
            Free Tool · Developer
          </div>
          <h1 className="text-3xl font-black text-white mb-1">Base64 Encoder / Decoder</h1>
          <p className="text-white/40 text-sm">Encode text to Base64 or decode Base64 back to text. Supports UTF-8. Runs entirely in your browser.</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {(['encode', 'decode'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); process(input, m) }}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all capitalize"
              style={{
                background: mode === m ? '#0d1117' : 'transparent',
                color: mode === m ? 'white' : 'rgba(255,255,255,0.35)',
                border: mode === m ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
              }}>
              {m === 'encode' ? 'Text → Base64' : 'Base64 → Text'}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="rounded-2xl border overflow-hidden mb-4" style={{ background: '#0a0e1a', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="px-4 py-2.5 border-b border-white/6 flex items-center justify-between">
            <span className="text-xs font-bold text-white/25 uppercase tracking-widest">
              {mode === 'encode' ? 'Plain Text Input' : 'Base64 Input'}
            </span>
            {input && <span className="text-xs text-white/20">{input.length} chars</span>}
          </div>
          <textarea value={input} onChange={e => process(e.target.value, mode)}
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 string to decode...'}
            style={textareaStyle} spellCheck={false} />
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl border text-sm text-red-400"
            style={{ background: 'rgba(248,113,113,0.07)', borderColor: 'rgba(248,113,113,0.2)' }}>
            {error}
          </div>
        )}

        {/* Switch button */}
        <div className="flex justify-center mb-4">
          <button onClick={switchMode} disabled={!output}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
            Swap — use output as input
          </button>
        </div>

        {/* Output */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: '#0a0e1a', borderColor: output ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.08)' }}>
          <div className="px-4 py-2.5 border-b border-white/6 flex items-center justify-between">
            <span className="text-xs font-bold text-white/25 uppercase tracking-widest">
              {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
              {output && <span className="ml-2 font-normal normal-case tracking-normal text-white/20">{output.length} chars</span>}
            </span>
            <button onClick={copy} disabled={!output}
              className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-30"
              style={{
                background: copied ? 'rgba(74,222,128,0.12)' : 'rgba(6,182,212,0.1)',
                color: copied ? '#4ade80' : '#06d6ff',
                border: `1px solid ${copied ? 'rgba(74,222,128,0.25)' : 'rgba(6,182,212,0.25)'}`,
              }}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <textarea value={output} readOnly
            placeholder="Output will appear here..."
            style={{ ...textareaStyle, color: output ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.2)' }}
            spellCheck={false} />
        </div>

        <p className="text-xs text-white/15 mt-4 text-center">
          Full UTF-8 support. Runs entirely in your browser — nothing is sent to any server.
        </p>

        {/* How It Works */}
        <div className="mt-14 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-xl font-black text-white mb-1">How It Works</h2>
          <p className="text-white/35 text-sm mb-8">Client-side encoding and decoding with full UTF-8 and emoji support.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { n: '01', title: 'Choose mode', body: 'Toggle between Encode (text → Base64) and Decode (Base64 → text). The Swap button flips output back to input.' },
              { n: '02', title: 'Type or paste', body: 'Enter any text — including Unicode, emoji, and non-ASCII. UTF-8 safe using encodeURIComponent + btoa trick.' },
              { n: '03', title: 'Copy the result', body: 'Result appears instantly as you type. One-click copy to clipboard. Works with file content, tokens, and config values.' },
            ].map(s => (
              <div key={s.n} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-xs font-black text-white/20 mb-2">{s.n}</div>
                <div className="text-sm font-black text-white mb-1">{s.title}</div>
                <div className="text-xs text-white/45 leading-relaxed">{s.body}</div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-4">Example</p>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-bold text-white/40 mb-2">Encode input</p>
                <pre className="text-xs font-mono text-white/55 bg-black/30 rounded-lg p-3">{`Hello, World! 🌍`}</pre>
              </div>
              <div>
                <p className="text-xs font-bold text-white/40 mb-2">Base64 output</p>
                <pre className="text-xs font-mono text-green-400/70 bg-black/30 rounded-lg p-3 break-all">{`SGVsbG8sIFdvcmxkISDwn4yN`}</pre>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
