'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

type Status = 'idle' | 'valid' | 'error'

const toBase64Url = (str: string) => btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
const fromBase64Url = (str: string) => { try { return decodeURIComponent(escape(atob(str.replace(/-/g, '+').replace(/_/g, '/')))); } catch { return null } }

function JsonFormatterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [indent, setIndent] = useState(2)
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const format = useCallback((raw: string, spaces: number) => {
    if (!raw.trim()) { setOutput(''); setStatus('idle'); setError(''); return }
    try {
      const parsed = JSON.parse(raw)
      setOutput(JSON.stringify(parsed, null, spaces))
      setStatus('valid')
      setError('')
      // Update URL with base64url-encoded input if under 2000 chars
      if (raw.length < 2000) {
        router.replace('?data=' + toBase64Url(raw), { scroll: false })
      }
    } catch (e) {
      setStatus('error')
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      setOutput('')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleInput(val: string) {
    setInput(val)
    format(val, indent)
  }

  function handleIndent(n: number) {
    setIndent(n)
    format(input, n)
  }

  function minify() {
    try {
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      setOutput(minified)
      setStatus('valid')
      setError('')
    } catch { /* already shown */ }
  }

  function copy() {
    if (!output) return
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  function clear() {
    setInput('')
    setOutput('')
    setStatus('idle')
    setError('')
    router.replace('?', { scroll: false })
  }

  // Load from URL param on mount
  useEffect(() => {
    const data = searchParams.get('data')
    if (data) {
      const decoded = fromBase64Url(data)
      if (decoded) {
        setInput(decoded)
        format(decoded, indent)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const textareaStyle: React.CSSProperties = {
    background: '#0a0e1a',
    border: 'none',
    borderRadius: 0,
    padding: '16px',
    color: status === 'error' ? '#f87171' : 'rgba(255,255,255,0.75)',
    fontSize: 13,
    outline: 'none',
    width: '100%',
    height: '100%',
    minHeight: 420,
    resize: 'none',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
    lineHeight: 1.65,
  }

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10">

        <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/30 hover:text-white/60 transition-colors mb-8">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>

        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase mb-3"
              style={{ borderColor: 'rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.08)', color: 'rgb(99,102,241)' }}>
              Free Tool · Developer
            </div>
            <h1 className="text-3xl font-black text-white mb-1">JSON Formatter</h1>
            <p className="text-white/40 text-sm">Paste JSON, get it formatted and validated instantly. All processing happens in your browser.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {[2, 4].map(n => (
                <button key={n} onClick={() => handleIndent(n)}
                  className="px-3 py-1.5 rounded-md text-xs font-bold transition-all"
                  style={{
                    background: indent === n ? '#0d1117' : 'transparent',
                    color: indent === n ? 'white' : 'rgba(255,255,255,0.35)',
                    border: indent === n ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                  }}>
                  {n} spaces
                </button>
              ))}
            </div>
            <button onClick={minify} disabled={!input}
              className="text-xs font-bold px-4 py-2 rounded-lg transition-all disabled:opacity-30"
              style={{ background: 'rgba(99,102,241,0.12)', color: 'rgb(99,102,241)', border: '1px solid rgba(99,102,241,0.25)' }}>
              Minify
            </button>
            {status === 'valid' && (
              <button onClick={copyLink}
                className="text-xs font-bold px-4 py-2 rounded-lg transition-all"
                style={{
                  background: linkCopied ? 'rgba(167,139,250,0.12)' : 'rgba(255,255,255,0.04)',
                  color: linkCopied ? '#a78bfa' : 'rgba(255,255,255,0.4)',
                  border: `1px solid ${linkCopied ? 'rgba(167,139,250,0.25)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                {linkCopied ? '✓ Link copied!' : '🔗 Share'}
              </button>
            )}
            <button onClick={copy} disabled={!output}
              className="text-xs font-bold px-4 py-2 rounded-lg transition-all disabled:opacity-30"
              style={{
                background: copied ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.06)',
                color: copied ? '#4ade80' : 'rgba(255,255,255,0.6)',
                border: `1px solid ${copied ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.1)'}`,
              }}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={clear} disabled={!input}
              className="text-xs font-bold px-4 py-2 rounded-lg transition-all disabled:opacity-30"
              style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}>
              Clear
            </button>
          </div>
        </div>

        {status === 'error' && (
          <div className="mb-4 px-4 py-3 rounded-xl border text-sm text-red-400 flex items-center gap-2"
            style={{ background: 'rgba(248,113,113,0.07)', borderColor: 'rgba(248,113,113,0.2)' }}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.834-1.964-.834-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
            {error}
          </div>
        )}

        {status === 'valid' && (
          <div className="mb-4 px-4 py-3 rounded-xl border text-sm text-green-400 flex items-center gap-2"
            style={{ background: 'rgba(74,222,128,0.06)', borderColor: 'rgba(74,222,128,0.2)' }}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            Valid JSON
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border overflow-hidden" style={{ background: '#0a0e1a', borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="px-4 py-2.5 border-b border-white/6 flex items-center gap-2">
              <span className="text-xs font-bold text-white/25 uppercase tracking-widest">Input</span>
              {input && <span className="text-xs text-white/20">{input.length.toLocaleString()} chars</span>}
            </div>
            <textarea
              value={input}
              onChange={e => handleInput(e.target.value)}
              placeholder={'Paste your JSON here...\n\n{"name":"example","value":42}'}
              style={textareaStyle}
              spellCheck={false}
            />
          </div>

          <div className="rounded-2xl border overflow-hidden" style={{ background: '#0a0e1a', borderColor: status === 'valid' ? 'rgba(74,222,128,0.2)' : status === 'error' ? 'rgba(248,113,113,0.2)' : 'rgba(255,255,255,0.08)' }}>
            <div className="px-4 py-2.5 border-b border-white/6 flex items-center gap-2">
              <span className="text-xs font-bold text-white/25 uppercase tracking-widest">Formatted Output</span>
              {output && <span className="text-xs text-white/20">{output.split('\n').length} lines</span>}
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Formatted JSON will appear here..."
              style={{ ...textareaStyle, color: status === 'valid' ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.25)' }}
              spellCheck={false}
            />
          </div>
        </div>

        <p className="text-xs text-white/20 mt-4 text-center">
          Your data never leaves your browser. JSON is processed entirely client-side.
        </p>

        <div className="mt-14 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-xl font-black text-white mb-1">How It Works</h2>
          <p className="text-white/35 text-sm mb-8">100% client-side — no data ever leaves your browser.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { n: '01', title: 'Paste your JSON', body: 'Drop in raw, minified, or broken JSON from any source — API response, config file, or clipboard.' },
              { n: '02', title: 'Validate & format', body: 'JSON.parse() validates the structure. If valid, JSON.stringify(data, null, indent) applies clean indentation.' },
              { n: '03', title: 'Copy or share', body: 'One-click copy formatted JSON to clipboard, or click Share to get a link that pre-loads this exact JSON for anyone you send it to.' },
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

export default function JsonFormatterPage() {
  return <Suspense fallback={null}><JsonFormatterContent /></Suspense>
}
