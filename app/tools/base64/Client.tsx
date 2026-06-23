'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

type AppMode = 'text' | 'file' | 'batch'
type TextSubMode = 'encode' | 'decode'
type Variant = 'standard' | 'urlsafe'

function toUrlSafe(b64: string): string {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function fromUrlSafe(b64url: string): string {
  let s = b64url.replace(/-/g, '+').replace(/_/g, '/')
  while (s.length % 4 !== 0) s += '='
  return s
}

function detectFormat(input: string): 'standard' | 'urlsafe' | 'datauri' | 'text' | 'unknown' {
  const trimmed = input.trim()
  if (trimmed.startsWith('data:')) return 'datauri'
  if (/^[A-Za-z0-9+/]+=*$/.test(trimmed) && trimmed.length % 4 === 0) return 'standard'
  if (/^[A-Za-z0-9\-_]+$/.test(trimmed)) return 'urlsafe'
  if (/[^A-Za-z0-9+/=\-_\s]/.test(trimmed)) return 'text'
  return 'unknown'
}

function wrapAt76(b64: string): string {
  return b64.match(/.{1,76}/g)?.join('\n') ?? b64
}

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function processBatch(text: string, action: 'encode' | 'decode', urlSafe: boolean): string {
  return text.split('\n').map(line => {
    if (!line.trim()) return ''
    try {
      if (action === 'encode') {
        const b64 = btoa(unescape(encodeURIComponent(line)))
        return urlSafe ? toUrlSafe(b64) : b64
      } else {
        const safe = urlSafe ? fromUrlSafe(line.trim()) : line.trim()
        return decodeURIComponent(escape(atob(safe)))
      }
    } catch { return `[ERROR: ${line}]` }
  }).join('\n')
}

interface FileResult {
  dataUri: string
  raw: string
  mimeType: string
  fileName: string
  size: string
}

export default function Base64Page() {
  const [appMode, setAppMode] = useState<AppMode>('text')
  const [textSubMode, setTextSubMode] = useState<TextSubMode>('encode')
  const [variant, setVariant] = useState<Variant>('standard')
  const [wrapLines, setWrapLines] = useState(false)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')
  const [detectedFormat, setDetectedFormat] = useState<string>('')
  const [fileResult, setFileResult] = useState<FileResult | null>(null)
  const [previewUri, setPreviewUri] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [batchInput, setBatchInput] = useState('')
  const [batchOutput, setBatchOutput] = useState('')
  const [batchSubMode, setBatchSubMode] = useState<'encode' | 'decode'>('encode')

  function processText(val: string, subMode: TextSubMode, v: Variant, wrap: boolean) {
    setInput(val)
    setError('')
    setDetectedFormat('')
    if (!val.trim()) { setOutput(''); return }

    if (subMode === 'decode') {
      const fmt = detectFormat(val)
      let toProcess = val.trim().replace(/\s/g, '')
      if (fmt === 'datauri') {
        const match = val.match(/base64,(.+)$/)
        toProcess = match ? match[1] : toProcess
        setDetectedFormat('data URI — stripping prefix')
      } else if (fmt === 'standard') {
        setDetectedFormat('Standard Base64')
      } else if (fmt === 'urlsafe') {
        setDetectedFormat('URL-safe Base64')
        toProcess = fromUrlSafe(toProcess)
      }

      try {
        if (v === 'urlsafe' && fmt !== 'urlsafe' && fmt !== 'datauri') {
          toProcess = fromUrlSafe(toProcess)
        }
        setOutput(decodeURIComponent(escape(atob(toProcess))))
      } catch {
        setError('Invalid Base64 string — could not decode')
        setOutput('')
      }
    } else {
      try {
        let b64 = btoa(unescape(encodeURIComponent(val)))
        if (v === 'urlsafe') b64 = toUrlSafe(b64)
        if (wrap) b64 = wrapAt76(b64)
        setOutput(b64)
      } catch {
        setError('Could not encode this text')
        setOutput('')
      }
    }
  }

  function switchSubMode() {
    const next = textSubMode === 'encode' ? 'decode' : 'encode'
    setTextSubMode(next)
    setInput(output)
    processText(output, next, variant, wrapLines)
  }

  function handleBatchInput(val: string) {
    setBatchInput(val)
    if (!val.trim()) { setBatchOutput(''); return }
    setBatchOutput(processBatch(val, batchSubMode, variant === 'urlsafe'))
  }

  function handleBatchSubMode(action: 'encode' | 'decode') {
    setBatchSubMode(action)
    if (batchInput.trim()) setBatchOutput(processBatch(batchInput, action, variant === 'urlsafe'))
  }

  async function processFile(file: File) {
    const raw = await fileToBase64(file)
    const mimeType = file.type || 'application/octet-stream'
    const dataUri = `data:${mimeType};base64,${raw}`
    setFileResult({ dataUri, raw, mimeType, fileName: file.name, size: humanSize(file.size) })
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  function handlePreviewUri(val: string) {
    setPreviewUri(val)
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  function downloadBatch() {
    const blob = new Blob([batchOutput], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'base64-batch.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  const batchLineCount = batchOutput ? batchOutput.split('\n').filter(l => l.trim()).length : 0

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

  const APP_TABS: { id: AppMode; label: string }[] = [
    { id: 'text', label: 'Text' },
    { id: 'file', label: 'File / Image' },
    { id: 'batch', label: 'Batch' },
  ]

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
          <h1 className="text-3xl font-black text-white mb-2">Base64 Encoder / Decoder</h1>
          <p className="text-white/40 text-sm mb-3">Encode and decode Base64 with URL-safe variant, image preview, file conversion, and batch mode. All client-side. License from $15, or get all 51 tools from $99.</p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/pricing" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors">Get this tool — $15 →</Link>
            <Link href="/pricing" className="text-xs font-bold text-white/40 hover:text-white/60 transition-colors">All 51 tools — from $99 →</Link>
          </div>
        </div>

        <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {APP_TABS.map(tab => (
            <button key={tab.id} onClick={() => setAppMode(tab.id)}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
              style={{
                background: appMode === tab.id ? '#0d1117' : 'transparent',
                color: appMode === tab.id ? 'white' : 'rgba(255,255,255,0.35)',
                border: appMode === tab.id ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {(appMode === 'text' || appMode === 'batch') && (
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {(['standard', 'urlsafe'] as Variant[]).map(v => (
                <button key={v} onClick={() => {
                  setVariant(v)
                  if (appMode === 'text') processText(input, textSubMode, v, wrapLines)
                  else if (batchInput.trim()) setBatchOutput(processBatch(batchInput, batchSubMode, v === 'urlsafe'))
                }}
                  className="px-3 py-1.5 rounded-md text-xs font-bold transition-all"
                  style={{
                    background: variant === v ? '#0d1117' : 'transparent',
                    color: variant === v ? 'white' : 'rgba(255,255,255,0.35)',
                    border: variant === v ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                  }}>
                  {v === 'standard' ? 'Standard' : 'URL-safe'}
                </button>
              ))}
            </div>
            {appMode === 'text' && textSubMode === 'encode' && (
              <label className="flex items-center gap-2 text-xs text-white/40 cursor-pointer">
                <input type="checkbox" checked={wrapLines} onChange={e => { setWrapLines(e.target.checked); processText(input, textSubMode, variant, e.target.checked) }}
                  className="rounded" style={{ accentColor: '#06d6ff' }} />
                Wrap at 76 chars (RFC 2045)
              </label>
            )}
          </div>
        )}

        {appMode === 'text' && (
          <>
            <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {(['encode', 'decode'] as TextSubMode[]).map(m => (
                <button key={m} onClick={() => { setTextSubMode(m); processText(input, m, variant, wrapLines) }}
                  className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                  style={{
                    background: textSubMode === m ? '#0d1117' : 'transparent',
                    color: textSubMode === m ? 'white' : 'rgba(255,255,255,0.35)',
                    border: textSubMode === m ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                  }}>
                  {m === 'encode' ? 'Text → Base64' : 'Base64 → Text'}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border overflow-hidden mb-4" style={{ background: '#0a0e1a', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="px-4 py-2.5 border-b border-white/6 flex items-center justify-between">
                <span className="text-xs font-bold text-white/25 uppercase tracking-widest">
                  {textSubMode === 'encode' ? 'Plain Text Input' : 'Base64 Input'}
                </span>
                <div className="flex items-center gap-3">
                  {detectedFormat && <span className="text-[10px] text-white/30 italic">Detected: {detectedFormat}</span>}
                  {input && <span className="text-xs text-white/20">{input.length} chars</span>}
                </div>
              </div>
              <textarea value={input} onChange={e => processText(e.target.value, textSubMode, variant, wrapLines)}
                placeholder={textSubMode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 string to decode...'}
                style={textareaStyle} spellCheck={false} />
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl border text-sm text-red-400"
                style={{ background: 'rgba(248,113,113,0.07)', borderColor: 'rgba(248,113,113,0.2)' }}>
                {error}
              </div>
            )}

            <div className="flex justify-center mb-4">
              <button onClick={switchSubMode} disabled={!output}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-30"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
                Swap — use output as input
              </button>
            </div>

            <div className="rounded-2xl border overflow-hidden" style={{ background: '#0a0e1a', borderColor: output ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.08)' }}>
              <div className="px-4 py-2.5 border-b border-white/6 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white/25 uppercase tracking-widest">
                    {textSubMode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
                  </span>
                  {output && (
                    <span className="ml-3 text-xs text-white/20">
                      {output.length} chars
                      {textSubMode === 'encode' && input && <> · expected {Math.ceil(input.length * 4 / 3)}</>}
                      {textSubMode === 'decode' && input && <> · {Math.round((output.length / input.replace(/\s/g,'').length) * 100)}% of Base64 size</>}
                    </span>
                  )}
                </div>
                <button onClick={() => copyText(output, 'output')} disabled={!output}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-30"
                  style={{
                    background: copied === 'output' ? 'rgba(74,222,128,0.12)' : 'rgba(6,182,212,0.1)',
                    color: copied === 'output' ? '#4ade80' : '#06d6ff',
                    border: `1px solid ${copied === 'output' ? 'rgba(74,222,128,0.25)' : 'rgba(6,182,212,0.25)'}`,
                  }}>
                  {copied === 'output' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <textarea value={output} readOnly
                placeholder="Output will appear here..."
                style={{ ...textareaStyle, color: output ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.2)' }}
                spellCheck={false} />
            </div>
          </>
        )}

        {appMode === 'file' && (
          <div className="space-y-4">
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className="rounded-2xl border-2 border-dashed transition-colors"
              style={{ borderColor: isDragging ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.12)', background: isDragging ? 'rgba(6,182,212,0.05)' : '#0a0e1a' }}>
              <label className="flex flex-col items-center justify-center p-12 cursor-pointer">
                <svg className="w-10 h-10 text-white/20 mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"/></svg>
                <p className="text-sm text-white/40 mb-1">Click or drag any file here</p>
                <p className="text-xs text-white/20">Images, PDFs, any file type · Processed locally, never uploaded</p>
                <input type="file" onChange={handleFileInput} className="hidden" />
              </label>
            </div>

            {fileResult && (
              <div className="rounded-2xl border p-5 space-y-4" style={{ background: '#0d1117', borderColor: 'rgba(6,182,212,0.2)' }}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-sm font-bold text-white">{fileResult.fileName}</p>
                    <p className="text-xs text-white/35">{fileResult.mimeType} · {fileResult.size}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => copyText(fileResult.dataUri, 'datauri')}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                      style={{ background: copied === 'datauri' ? 'rgba(74,222,128,0.12)' : 'rgba(6,182,212,0.1)', color: copied === 'datauri' ? '#4ade80' : '#06d6ff', border: `1px solid ${copied === 'datauri' ? 'rgba(74,222,128,0.25)' : 'rgba(6,182,212,0.25)'}` }}>
                      {copied === 'datauri' ? 'Copied!' : 'Copy data URI'}
                    </button>
                    <button onClick={() => copyText(fileResult.raw, 'rawb64')}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                      style={{ background: copied === 'rawb64' ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.06)', color: copied === 'rawb64' ? '#4ade80' : 'rgba(255,255,255,0.4)', border: `1px solid ${copied === 'rawb64' ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.1)'}` }}>
                      {copied === 'rawb64' ? 'Copied!' : 'Copy raw Base64'}
                    </button>
                  </div>
                </div>
                <div className="rounded-xl border p-3 overflow-auto max-h-28" style={{ background: '#0a0e1a', borderColor: 'rgba(255,255,255,0.06)' }}>
                  <code className="text-xs font-mono text-white/50 break-all">{fileResult.dataUri.slice(0, 200)}{fileResult.dataUri.length > 200 ? '...' : ''}</code>
                </div>
                {fileResult.mimeType.startsWith('image/') && (
                  <div>
                    <p className="text-xs font-bold text-white/25 uppercase tracking-widest mb-2">Image Preview</p>
                    <img src={fileResult.dataUri} alt={fileResult.fileName} className="max-h-72 rounded-xl border object-contain" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                  </div>
                )}
              </div>
            )}

            <div className="rounded-2xl border overflow-hidden" style={{ background: '#0a0e1a', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="px-4 py-2.5 border-b border-white/6">
                <span className="text-xs font-bold text-white/25 uppercase tracking-widest">Paste data URI to preview image</span>
              </div>
              <textarea value={previewUri} onChange={e => handlePreviewUri(e.target.value)}
                placeholder="data:image/png;base64,..."
                style={{ ...textareaStyle, minHeight: 80 }} spellCheck={false} />
            </div>
            {previewUri.startsWith('data:image/') && (
              <img src={previewUri} alt="Preview" className="max-h-72 rounded-xl border object-contain" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            )}
          </div>
        )}

        {appMode === 'batch' && (
          <div className="space-y-4">
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {(['encode', 'decode'] as const).map(m => (
                <button key={m} onClick={() => handleBatchSubMode(m)}
                  className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                  style={{
                    background: batchSubMode === m ? '#0d1117' : 'transparent',
                    color: batchSubMode === m ? 'white' : 'rgba(255,255,255,0.35)',
                    border: batchSubMode === m ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                  }}>
                  {m === 'encode' ? 'Encode lines' : 'Decode lines'}
                </button>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border overflow-hidden" style={{ background: '#0a0e1a', borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="px-4 py-2.5 border-b border-white/6">
                  <span className="text-xs font-bold text-white/25 uppercase tracking-widest">Input — one item per line</span>
                </div>
                <textarea value={batchInput} onChange={e => handleBatchInput(e.target.value)}
                  placeholder={'line 1\nline 2\nline 3'}
                  style={textareaStyle} spellCheck={false} />
              </div>
              <div className="rounded-2xl border overflow-hidden" style={{ background: '#0a0e1a', borderColor: batchOutput ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.08)' }}>
                <div className="px-4 py-2.5 border-b border-white/6 flex items-center justify-between">
                  <span className="text-xs font-bold text-white/25 uppercase tracking-widest">Output</span>
                  <div className="flex items-center gap-2">
                    {batchLineCount > 0 && <span className="text-xs text-white/20">{batchLineCount} lines</span>}
                    <button onClick={() => copyText(batchOutput, 'batch')} disabled={!batchOutput}
                      className="text-xs font-bold px-2.5 py-1 rounded-lg transition-all disabled:opacity-30"
                      style={{ background: copied === 'batch' ? 'rgba(74,222,128,0.12)' : 'rgba(6,182,212,0.1)', color: copied === 'batch' ? '#4ade80' : '#06d6ff', border: `1px solid ${copied === 'batch' ? 'rgba(74,222,128,0.25)' : 'rgba(6,182,212,0.25)'}` }}>
                      {copied === 'batch' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <textarea value={batchOutput} readOnly
                  placeholder="Encoded/decoded lines will appear here..."
                  style={{ ...textareaStyle, color: batchOutput ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.2)' }}
                  spellCheck={false} />
              </div>
            </div>
            {batchOutput && (
              <div className="flex justify-end">
                <button onClick={downloadBatch}
                  className="text-xs font-bold px-4 py-2 rounded-lg transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Download .txt
                </button>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-white/15 mt-6 text-center">
          Full UTF-8 support. Runs entirely in your browser — nothing is sent to any server.
        </p>

        <div className="mt-14 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-xl font-black text-white mb-1">Who This Is For</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            {[
              { title: 'Frontend developers', body: 'Embed images as data URIs in CSS/HTML without external hosting.' },
              { title: 'Backend developers', body: 'Encode file payloads and binary data for API requests and JSON bodies.' },
              { title: 'DevOps engineers', body: 'Encode config values and secrets for environment variables and CI pipelines.' },
              { title: 'QA engineers', body: 'Decode Base64 tokens, cookies, and payloads during API testing and debugging.' },
            ].map(c => (
              <div key={c.title} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-sm font-black text-white mb-1">{c.title}</div>
                <div className="text-xs text-white/45 leading-relaxed">{c.body}</div>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-black text-white mb-1">How It Works</h2>
          <p className="text-white/35 text-sm mb-8">Client-side encoding and decoding with full UTF-8 and emoji support.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { n: '01', title: 'Choose mode', body: 'Text for live encode/decode, File/Image to convert files and preview images, or Batch for line-by-line processing.' },
              { n: '02', title: 'Standard or URL-safe', body: 'Toggle between standard Base64 (+/=) and URL-safe variant (-_, no padding) used in JWTs and OAuth.' },
              { n: '03', title: 'Copy or download', body: 'Results appear instantly. Copy to clipboard, download batch results as .txt, or copy file data URIs.' },
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
