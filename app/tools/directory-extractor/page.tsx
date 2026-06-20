'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface PathNode {
  path: string
  children: Record<string, PathNode>
  isLeaf: boolean
}

interface ExtractResult {
  domain: string
  totalUrls: number
  urls: string[]
  tree: PathNode | null
  sitemapUrl: string
  fetchedAt: string
  error?: string
}

function TreeNode({ name, node, depth = 0 }: { name: string; node: PathNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 2)
  const hasChildren = Object.keys(node.children).length > 0

  return (
    <div style={{ paddingLeft: depth * 16 }}>
      <div
        className="flex items-center gap-1.5 py-0.5 cursor-pointer hover:text-white transition-colors text-sm"
        style={{ color: node.isLeaf ? '#94a3b8' : '#e2e8f0' }}
        onClick={() => hasChildren && setOpen(o => !o)}
      >
        {hasChildren ? (
          <svg className="w-3 h-3 flex-shrink-0 transition-transform" style={{ transform: open ? 'rotate(90deg)' : '' }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
        ) : (
          <span className="w-3 h-3 flex-shrink-0 inline-block" />
        )}
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          {hasChildren
            ? <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/>
            : <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
          }
        </svg>
        <span className="font-mono text-xs">{name || '/'}</span>
      </div>
      {open && hasChildren && Object.entries(node.children).map(([k, v]) => (
        <TreeNode key={k} name={k} node={v} depth={depth + 1} />
      ))}
    </div>
  )
}

export default function DirectoryExtractorPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ExtractResult | null>(null)
  const [error, setError] = useState('')
  const [view, setView] = useState<'tree' | 'list'>('tree')

  const extract = async () => {
    if (!url.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/tools/directory-extractor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Extraction failed')
      setResult(data)
      if (data.error) setError(data.error)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Extraction failed')
    }
    setLoading(false)
  }

  const downloadJson = () => {
    if (!result) return
    const blob = new Blob([JSON.stringify({ domain: result.domain, urls: result.urls, tree: result.tree }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${result.domain}-directory.json`; a.click()
  }
  const downloadCsv = () => {
    if (!result) return
    const csv = 'URL\n' + result.urls.map(u => `"${u}"`).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${result.domain}-urls.csv`; a.click()
  }

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/tools" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: 'rgb(236,72,153)', borderColor: 'rgba(236,72,153,0.3)', background: 'rgba(236,72,153,0.08)' }}>Live · Free</span>
        </div>

        <h1 className="text-4xl font-black text-white mb-3">Directory <span style={{ color: 'rgb(236,72,153)' }}>Extractor</span></h1>
        <p className="text-white/55 text-base mb-8 max-w-2xl">Enter any domain. We fetch its sitemap and return a full structured directory tree of every public page — exportable as JSON or CSV.</p>

        <div className="rounded-2xl border p-6 mb-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex gap-3">
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && extract()}
              placeholder="example.com"
              className="flex-1 px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none font-mono"
              style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <button
              onClick={extract}
              disabled={loading || !url.trim()}
              className="px-6 py-3 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#ec4899,#be185d)', boxShadow: '0 0 20px rgba(236,72,153,0.3)' }}
            >
              {loading ? 'Extracting…' : 'Extract Directory'}
            </button>
          </div>
        </div>

        {error && !result && (
          <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>
        )}

        {result && result.totalUrls > 0 && (
          <div className="space-y-4">
            {/* Stats bar */}
            <div className="rounded-xl border p-4 flex flex-wrap items-center justify-between gap-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-2xl font-black" style={{ color: 'rgb(236,72,153)' }}>{result.totalUrls.toLocaleString()}</div>
                  <div className="text-xs text-white/40">URLs found</div>
                </div>
                <div className="text-xs text-white/30">
                  <div>Domain: <span className="text-white/60 font-mono">{result.domain}</span></div>
                  <div>Sitemap: <span className="text-white/60 font-mono text-[10px]">{result.sitemapUrl}</span></div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={downloadJson} className="px-4 py-2 rounded-lg text-xs font-bold text-white border border-white/15 hover:border-white/30 transition-colors">↓ JSON</button>
                <button onClick={downloadCsv} className="px-4 py-2 rounded-lg text-xs font-bold text-white border border-white/15 hover:border-white/30 transition-colors">↓ CSV</button>
              </div>
            </div>

            {/* View toggle */}
            <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ background: '#0d1117' }}>
              {(['tree', 'list'] as const).map(v => (
                <button key={v} onClick={() => setView(v)} className="px-4 py-1.5 rounded-md text-xs font-bold transition-all" style={{ background: view === v ? '#1e293b' : 'transparent', color: view === v ? '#e2e8f0' : '#475569' }}>{v === 'tree' ? 'Tree View' : 'URL List'}</button>
              ))}
            </div>

            <div className="rounded-xl border p-4 overflow-auto" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)', maxHeight: 500 }}>
              {view === 'tree' && result.tree ? (
                <TreeNode name={result.domain} node={result.tree} depth={0} />
              ) : (
                <div className="space-y-0.5">
                  {result.urls.map(u => (
                    <div key={u} className="text-xs font-mono text-white/55 hover:text-white/80 transition-colors truncate">{u}</div>
                  ))}
                  {result.totalUrls > 2000 && <div className="text-xs text-white/30 pt-2">Showing first 2,000 of {result.totalUrls.toLocaleString()} URLs</div>}
                </div>
              )}
            </div>
          </div>
        )}

        {result && result.totalUrls === 0 && (
          <div className="rounded-xl border p-8 text-center" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="text-white/50 text-sm">No sitemap found for <span className="font-mono text-white/70">{result.domain}</span>. This site may not have a public sitemap.xml.</div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
