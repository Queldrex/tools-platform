'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

type Status = 'idle' | 'valid' | 'error'
type AppMode = 'format' | 'diff' | 'ts' | 'csv'

const toBase64Url = (str: string) => btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
const fromBase64Url = (str: string) => { try { return decodeURIComponent(escape(atob(str.replace(/-/g, '+').replace(/_/g, '/')))); } catch { return null } }

interface DiffEntry {
  path: string
  type: 'added' | 'removed' | 'changed'
  oldValue?: unknown
  newValue?: unknown
}

interface JsonStats {
  totalKeys: number
  maxDepth: number
  stringCount: number
  numberCount: number
  booleanCount: number
  nullCount: number
  arrayCount: number
  objectCount: number
  largestArrayLength: number
}

function autoFix(raw: string): string {
  let fixed = raw.trim()
  fixed = fixed.replace(/\/\/[^\n]*/g, '')
  fixed = fixed.replace(/\/\*[\s\S]*?\*\//g, '')
  fixed = fixed.replace(/'([^']*)'(\s*:)/g, '"$1"$2')
  fixed = fixed.replace(/:\s*'([^']*)'/g, ': "$1"')
  fixed = fixed.replace(/,(\s*[}\]])/g, '$1')
  fixed = fixed.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
  return fixed
}

function computeStats(obj: unknown, depth = 0): JsonStats {
  const stats: JsonStats = { totalKeys: 0, maxDepth: depth, stringCount: 0, numberCount: 0, booleanCount: 0, nullCount: 0, arrayCount: 0, objectCount: 0, largestArrayLength: 0 }
  if (obj === null) { stats.nullCount = 1; return stats }
  if (typeof obj === 'string') { stats.stringCount = 1; return stats }
  if (typeof obj === 'number') { stats.numberCount = 1; return stats }
  if (typeof obj === 'boolean') { stats.booleanCount = 1; return stats }
  if (Array.isArray(obj)) {
    stats.arrayCount = 1
    stats.largestArrayLength = obj.length
    for (const item of obj) {
      const child = computeStats(item, depth + 1)
      stats.totalKeys += child.totalKeys
      stats.maxDepth = Math.max(stats.maxDepth, child.maxDepth)
      stats.stringCount += child.stringCount
      stats.numberCount += child.numberCount
      stats.booleanCount += child.booleanCount
      stats.nullCount += child.nullCount
      stats.arrayCount += child.arrayCount
      stats.objectCount += child.objectCount
      stats.largestArrayLength = Math.max(stats.largestArrayLength, child.largestArrayLength)
    }
    return stats
  }
  if (typeof obj === 'object') {
    stats.objectCount = 1
    const entries = Object.entries(obj as Record<string, unknown>)
    stats.totalKeys = entries.length
    for (const [, val] of entries) {
      const child = computeStats(val, depth + 1)
      stats.totalKeys += child.totalKeys
      stats.maxDepth = Math.max(stats.maxDepth, child.maxDepth)
      stats.stringCount += child.stringCount
      stats.numberCount += child.numberCount
      stats.booleanCount += child.booleanCount
      stats.nullCount += child.nullCount
      stats.arrayCount += child.arrayCount
      stats.objectCount += child.objectCount
      stats.largestArrayLength = Math.max(stats.largestArrayLength, child.largestArrayLength)
    }
    return stats
  }
  return stats
}

function deepDiff(a: unknown, b: unknown, path = ''): DiffEntry[] {
  const results: DiffEntry[] = []
  if (typeof a !== typeof b || (Array.isArray(a) !== Array.isArray(b))) {
    results.push({ path: path || '(root)', type: 'changed', oldValue: a, newValue: b })
    return results
  }
  if (a === null || b === null) {
    if (a !== b) results.push({ path: path || '(root)', type: 'changed', oldValue: a, newValue: b })
    return results
  }
  if (typeof a === 'object' && !Array.isArray(a)) {
    const aObj = a as Record<string, unknown>
    const bObj = b as Record<string, unknown>
    const allKeys = new Set([...Object.keys(aObj), ...Object.keys(bObj)])
    for (const key of allKeys) {
      const newPath = path ? `${path}.${key}` : key
      if (!(key in aObj)) results.push({ path: newPath, type: 'added', newValue: bObj[key] })
      else if (!(key in bObj)) results.push({ path: newPath, type: 'removed', oldValue: aObj[key] })
      else results.push(...deepDiff(aObj[key], bObj[key], newPath))
    }
  } else if (Array.isArray(a) && Array.isArray(b)) {
    const maxLen = Math.max(a.length, b.length)
    for (let i = 0; i < maxLen; i++) {
      const newPath = `${path}[${i}]`
      if (i >= a.length) results.push({ path: newPath, type: 'added', newValue: b[i] })
      else if (i >= b.length) results.push({ path: newPath, type: 'removed', oldValue: a[i] })
      else results.push(...deepDiff(a[i], b[i], newPath))
    }
  } else {
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      results.push({ path: path || '(root)', type: 'changed', oldValue: a, newValue: b })
    }
  }
  return results
}

function inferTypes(obj: unknown, name = 'Root', depth = 0): string {
  if (obj === null) return 'null'
  if (Array.isArray(obj)) {
    if (obj.length === 0) return 'unknown[]'
    const elementType = inferTypes(obj[0], name + 'Item', depth)
    return elementType.includes('\n') ? `Array<${elementType}>` : `${elementType}[]`
  }
  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>)
    if (entries.length === 0) return 'Record<string, unknown>'
    const nested: string[] = []
    const lines: string[] = [`interface ${name} {`]
    for (const [key, val] of entries) {
      const childName = name + key.charAt(0).toUpperCase() + key.slice(1)
      const t = inferTypes(val, childName, depth + 1)
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`
      if (t.startsWith('interface ')) {
        const nestedName = t.split(' ')[1]
        lines.push(`  ${safeKey}: ${nestedName};`)
        nested.push(t + '\n')
      } else {
        lines.push(`  ${safeKey}: ${t};`)
      }
    }
    lines.push('}')
    return [...nested, lines.join('\n')].join('\n')
  }
  if (typeof obj === 'string') return 'string'
  if (typeof obj === 'number') return 'number'
  if (typeof obj === 'boolean') return 'boolean'
  return 'unknown'
}

function jsonToCsv(arr: Record<string, unknown>[]): string {
  if (!arr.length) return ''
  const headers = [...new Set(arr.flatMap(row => Object.keys(row)))]
  const rows = arr.map(row =>
    headers.map(h => {
      const val = row[h]
      if (val === null || val === undefined) return ''
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val)
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"` : str
    }).join(',')
  )
  return [headers.join(','), ...rows].join('\n')
}

function JsonFormatterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [appMode, setAppMode] = useState<AppMode>('format')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [indent, setIndent] = useState(2)
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [diffA, setDiffA] = useState('')
  const [diffB, setDiffB] = useState('')
  const [tsOutput, setTsOutput] = useState('')
  const [tsCopied, setTsCopied] = useState(false)
  const [csvOutput, setCsvOutput] = useState('')
  const [csvError, setCsvError] = useState('')

  const format = useCallback((raw: string, spaces: number) => {
    if (!raw.trim()) { setOutput(''); setStatus('idle'); setError(''); return }
    try {
      const parsed = JSON.parse(raw)
      setOutput(JSON.stringify(parsed, null, spaces))
      setStatus('valid')
      setError('')
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
      setOutput(JSON.stringify(parsed))
      setStatus('valid')
      setError('')
    } catch { /* already shown */ }
  }

  function tryAutoFix() {
    const fixed = autoFix(input)
    setInput(fixed)
    format(fixed, indent)
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

  function generateTypes() {
    try {
      const parsed = JSON.parse(input)
      let result = inferTypes(parsed, 'Root')
      if (Array.isArray(parsed) && parsed.length > 0) {
        const itemType = inferTypes(parsed[0], 'Item')
        result = itemType + '\n\ntype Items = Item[]'
      }
      setTsOutput(result)
    } catch {
      setTsOutput('// Error: Invalid JSON — fix formatting first')
    }
  }

  function copyTypes() {
    navigator.clipboard.writeText(tsOutput)
    setTsCopied(true)
    setTimeout(() => setTsCopied(false), 2000)
  }

  function convertToCsv() {
    setCsvError('')
    setCsvOutput('')
    try {
      const parsed = JSON.parse(input)
      if (!Array.isArray(parsed) || !parsed.length || typeof parsed[0] !== 'object' || parsed[0] === null) {
        setCsvError('CSV export requires a JSON array of objects (e.g., [{...}, {...}]).')
        return
      }
      setCsvOutput(jsonToCsv(parsed as Record<string, unknown>[]))
    } catch {
      setCsvError('Invalid JSON — fix formatting first.')
    }
  }

  function downloadCsv() {
    const blob = new Blob([csvOutput], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'export.csv'; a.click()
    URL.revokeObjectURL(url)
  }

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

  const parsedForStats = status === 'valid' ? (() => { try { return JSON.parse(input) } catch { return null } })() : null
  const stats = parsedForStats !== null ? computeStats(parsedForStats) : null

  let diffEntries: DiffEntry[] = []
  let diffAError = '', diffBError = ''
  let diffAParsed: unknown = null, diffBParsed: unknown = null
  if (appMode === 'diff') {
    if (diffA.trim()) { try { diffAParsed = JSON.parse(diffA) } catch (e) { diffAError = e instanceof Error ? e.message : 'Invalid JSON' } }
    if (diffB.trim()) { try { diffBParsed = JSON.parse(diffB) } catch (e) { diffBError = e instanceof Error ? e.message : 'Invalid JSON' } }
    if (diffAParsed !== null && diffBParsed !== null && !diffAError && !diffBError) {
      diffEntries = deepDiff(diffAParsed, diffBParsed)
    }
  }

  const textareaStyle: React.CSSProperties = {
    background: '#0a0e1a', border: 'none', borderRadius: 0, padding: '16px',
    color: 'rgba(255,255,255,0.75)', fontSize: 13, outline: 'none', width: '100%',
    height: '100%', minHeight: 420, resize: 'none',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace', lineHeight: 1.65,
  }

  const modeTabs: { id: AppMode; label: string }[] = [
    { id: 'format', label: 'Format' },
    { id: 'diff', label: 'Diff' },
    { id: 'ts', label: 'TypeScript' },
    { id: 'csv', label: 'CSV' },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10">

        <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/30 hover:text-white/60 transition-colors mb-8">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>

        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase mb-3"
              style={{ borderColor: 'rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.08)', color: 'rgb(99,102,241)' }}>
              Free Tool · No API Key · Browser Only
            </div>
            <h1 className="text-3xl font-black text-white mb-2">JSON Formatter</h1>
            <p className="text-white/40 text-sm mb-3">Format, validate, diff, and convert JSON — plus generate TypeScript interfaces from any JSON structure. All client-side. License from $15, or get all 51 tools from $149.</p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/pricing" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">Get this tool — $15 →</Link>
              <Link href="/pricing" className="text-xs font-bold text-white/40 hover:text-white/60 transition-colors">All 51 tools — from $149 →</Link>
            </div>
          </div>
          {appMode === 'format' && (
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
          )}
        </div>

        <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {modeTabs.map(tab => (
            <button key={tab.id} onClick={() => setAppMode(tab.id)}
              className="px-5 py-2 rounded-lg text-sm font-bold transition-all"
              style={{
                background: appMode === tab.id ? '#0d1117' : 'transparent',
                color: appMode === tab.id ? 'white' : 'rgba(255,255,255,0.35)',
                border: appMode === tab.id ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {appMode === 'format' && (
          <>
            {status === 'error' && (
              <div className="mb-4 px-4 py-3 rounded-xl border text-sm text-red-400 flex items-center gap-3"
                style={{ background: 'rgba(248,113,113,0.07)', borderColor: 'rgba(248,113,113,0.2)' }}>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.834-1.964-.834-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                <span className="flex-1">{error}</span>
                <button onClick={tryAutoFix}
                  className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: 'rgba(251,146,60,0.12)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.25)' }}>
                  Try auto-fix →
                </button>
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
                <textarea value={input} onChange={e => handleInput(e.target.value)}
                  placeholder={'Paste your JSON here...\n\n{"name":"example","value":42}'}
                  style={{ ...textareaStyle, color: status === 'error' ? '#f87171' : 'rgba(255,255,255,0.75)' }}
                  spellCheck={false} />
              </div>
              <div className="rounded-2xl border overflow-hidden" style={{ background: '#0a0e1a', borderColor: status === 'valid' ? 'rgba(74,222,128,0.2)' : status === 'error' ? 'rgba(248,113,113,0.2)' : 'rgba(255,255,255,0.08)' }}>
                <div className="px-4 py-2.5 border-b border-white/6 flex items-center gap-2">
                  <span className="text-xs font-bold text-white/25 uppercase tracking-widest">Formatted Output</span>
                  {output && <span className="text-xs text-white/20">{output.split('\n').length} lines</span>}
                </div>
                <textarea value={output} readOnly placeholder="Formatted JSON will appear here..."
                  style={{ ...textareaStyle, color: status === 'valid' ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.25)' }}
                  spellCheck={false} />
              </div>
            </div>
            {stats && (
              <div className="mt-4">
                <button onClick={() => setShowStats(s => !s)}
                  className="text-xs font-bold px-4 py-2 rounded-lg transition-all mb-3"
                  style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {showStats ? '▲ Hide JSON Stats' : '▼ JSON Stats'}
                </button>
                {showStats && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 rounded-2xl border p-4" style={{ background: '#0a0e1a', borderColor: 'rgba(255,255,255,0.07)' }}>
                    {[
                      { label: 'Total Keys', value: stats.totalKeys },
                      { label: 'Max Depth', value: stats.maxDepth },
                      { label: 'Strings', value: stats.stringCount },
                      { label: 'Numbers', value: stats.numberCount },
                      { label: 'Booleans', value: stats.booleanCount },
                      { label: 'Nulls', value: stats.nullCount },
                      { label: 'Arrays', value: stats.arrayCount },
                      { label: 'Objects', value: stats.objectCount },
                      { label: 'Largest Array', value: stats.largestArrayLength },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl border p-3 text-center" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.06)' }}>
                        <div className="text-xl font-black text-white tabular-nums">{s.value}</div>
                        <div className="text-[10px] text-white/30 mt-1 font-bold uppercase tracking-widest">{s.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <p className="text-xs text-white/20 mt-4 text-center">Your data never leaves your browser. JSON is processed entirely client-side.</p>
          </>
        )}

        {appMode === 'diff' && (
          <div>
            <div className="grid lg:grid-cols-2 gap-4 mb-4">
              {[
                { label: 'Version A', value: diffA, setter: setDiffA, err: diffAError },
                { label: 'Version B', value: diffB, setter: setDiffB, err: diffBError },
              ].map(panel => (
                <div key={panel.label} className="rounded-2xl border overflow-hidden" style={{ background: '#0a0e1a', borderColor: panel.err ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.08)' }}>
                  <div className="px-4 py-2.5 border-b border-white/6 flex items-center gap-2">
                    <span className="text-xs font-bold text-white/25 uppercase tracking-widest">{panel.label}</span>
                    {panel.err && <span className="text-xs text-red-400">{panel.err}</span>}
                  </div>
                  <textarea value={panel.value} onChange={e => panel.setter(e.target.value)}
                    placeholder={`Paste JSON for ${panel.label}...`}
                    style={{ ...textareaStyle, minHeight: 320 }} spellCheck={false} />
                </div>
              ))}
            </div>
            {diffAParsed !== null && diffBParsed !== null && !diffAError && !diffBError && (
              <div className="rounded-2xl border p-4" style={{ background: '#0a0e1a', borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Diff Results — {diffEntries.length} change{diffEntries.length !== 1 ? 's' : ''}</div>
                {diffEntries.length === 0 ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm font-bold px-4 py-3 rounded-xl" style={{ background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.2)' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    Identical — no differences found
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {diffEntries.map((entry, i) => {
                      const colors = { added: { bg: 'rgba(74,222,128,0.07)', border: 'rgba(74,222,128,0.2)', text: '#4ade80', prefix: '+' }, removed: { bg: 'rgba(248,113,113,0.07)', border: 'rgba(248,113,113,0.2)', text: '#f87171', prefix: '-' }, changed: { bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.2)', text: '#fbbf24', prefix: '~' } }
                      const c = colors[entry.type]
                      return (
                        <div key={i} className="rounded-xl border px-4 py-2.5 font-mono text-xs" style={{ background: c.bg, borderColor: c.border }}>
                          <span style={{ color: c.text }} className="font-black">{c.prefix} </span>
                          <span className="text-white/60">{entry.path}: </span>
                          {entry.type === 'changed' && <span className="text-red-400">{JSON.stringify(entry.oldValue)}</span>}
                          {entry.type === 'changed' && <span className="text-white/30"> → </span>}
                          {entry.type !== 'removed' && <span style={{ color: c.text }}>{JSON.stringify(entry.newValue ?? entry.oldValue)}</span>}
                          {entry.type === 'removed' && <span className="text-red-400">{JSON.stringify(entry.oldValue)}</span>}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {appMode === 'ts' && (
          <div>
            <div className="rounded-2xl border overflow-hidden mb-4" style={{ background: '#0a0e1a', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="px-4 py-2.5 border-b border-white/6">
                <span className="text-xs font-bold text-white/25 uppercase tracking-widest">JSON Input</span>
              </div>
              <textarea value={input} onChange={e => handleInput(e.target.value)}
                placeholder={'Paste your JSON here...\n\n{"user":{"name":"Alice","age":30}}'}
                style={{ ...textareaStyle, minHeight: 240 }} spellCheck={false} />
            </div>
            <button onClick={generateTypes} disabled={!input.trim()}
              className="px-6 py-3 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.02] disabled:opacity-30 mb-4"
              style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
              Generate TypeScript Interfaces
            </button>
            {tsOutput && (
              <div className="rounded-2xl border overflow-hidden" style={{ background: '#0a0e1a', borderColor: 'rgba(99,102,241,0.25)' }}>
                <div className="px-4 py-2.5 border-b border-white/6 flex items-center justify-between">
                  <span className="text-xs font-bold text-white/25 uppercase tracking-widest">TypeScript Output</span>
                  <button onClick={copyTypes}
                    className="text-xs font-bold px-3 py-1 rounded-lg transition-all"
                    style={{ background: tsCopied ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.06)', color: tsCopied ? '#4ade80' : 'rgba(255,255,255,0.5)', border: `1px solid ${tsCopied ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.08)'}` }}>
                    {tsCopied ? 'Copied!' : 'Copy Types'}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-indigo-300 overflow-auto" style={{ minHeight: 200, lineHeight: 1.7 }}>{tsOutput}</pre>
                <div className="px-4 py-3 border-t border-white/5 text-xs text-white/25" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  TypeScript interfaces inferred from JSON structure. Optional fields (present in some array items but not others) are not detected — mark those manually with <code className="text-white/40">?</code>.
                </div>
              </div>
            )}
          </div>
        )}

        {appMode === 'csv' && (
          <div>
            <div className="rounded-2xl border overflow-hidden mb-4" style={{ background: '#0a0e1a', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="px-4 py-2.5 border-b border-white/6">
                <span className="text-xs font-bold text-white/25 uppercase tracking-widest">JSON Array Input</span>
              </div>
              <textarea value={input} onChange={e => handleInput(e.target.value)}
                placeholder={'Paste a JSON array of objects...\n\n[{"name":"Alice","age":30},{"name":"Bob","age":25}]'}
                style={{ ...textareaStyle, minHeight: 240 }} spellCheck={false} />
            </div>
            <button onClick={convertToCsv} disabled={!input.trim()}
              className="px-6 py-3 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.02] disabled:opacity-30 mb-4"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}>
              Convert to CSV
            </button>
            {csvError && (
              <div className="mb-4 px-4 py-3 rounded-xl border text-sm text-red-400" style={{ background: 'rgba(248,113,113,0.07)', borderColor: 'rgba(248,113,113,0.2)' }}>
                {csvError}
              </div>
            )}
            {csvOutput && (
              <div className="rounded-2xl border overflow-hidden" style={{ background: '#0a0e1a', borderColor: 'rgba(16,185,129,0.25)' }}>
                <div className="px-4 py-2.5 border-b border-white/6 flex items-center justify-between">
                  <span className="text-xs font-bold text-white/25 uppercase tracking-widest">CSV Preview</span>
                  <button onClick={downloadCsv}
                    className="text-xs font-bold px-3 py-1 rounded-lg transition-all"
                    style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
                    Download CSV
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-green-300 overflow-auto max-h-64">{csvOutput.split('\n').slice(0, 6).join('\n')}{csvOutput.split('\n').length > 6 ? `\n... (${csvOutput.split('\n').length - 6} more rows)` : ''}</pre>
                <div className="px-4 py-3 border-t border-white/5 text-xs text-white/25">
                  Nested objects are JSON-stringified in cells. Flatten your data first for cleaner output.
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-14 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-xl font-black text-white mb-6">Who This Is For</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { title: 'Frontend Developers', body: 'Format API responses and generate TypeScript interfaces without leaving the browser.' },
              { title: 'Backend Engineers', body: 'Diff JSON configs between environments to spot unintended changes before deploying.' },
              { title: 'Data Analysts', body: 'Convert JSON array exports to CSV for spreadsheets with one click.' },
              { title: 'QA Engineers', body: 'Compare API response bodies before and after a release to find regressions.' },
            ].map(c => (
              <div key={c.title} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-sm font-black text-white mb-1">{c.title}</div>
                <div className="text-xs text-white/40 leading-relaxed">{c.body}</div>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-black text-white mb-1">How It Works</h2>
          <p className="text-white/35 text-sm mb-8">100% client-side — no data ever leaves your browser.</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { n: '01', title: 'Paste your JSON', body: 'Drop in raw, minified, or broken JSON from any source — API response, config file, or clipboard.' },
              { n: '02', title: 'Choose your mode', body: 'Format & validate, diff two versions, generate TypeScript interfaces, or export to CSV.' },
              { n: '03', title: 'Copy or download', body: 'One-click copy to clipboard, download CSV, or share a link that pre-loads this exact JSON.' },
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
