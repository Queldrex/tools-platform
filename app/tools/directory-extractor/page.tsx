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

interface UrlEntry {
  url: string
  priority?: number
  changefreq?: string
  lastmod?: string
}

interface ExtractResult {
  domain: string
  totalUrls: number
  urlData: UrlEntry[]
  urls: string[]
  tree: PathNode | null
  sitemapUrl: string
  topPrefixes: { prefix: string; count: number }[]
  depthDist: Record<number, number>
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
  const [filter, setFilter] = useState('')

  const extract = async () => {
    if (!url.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    setFilter('')
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
  const copyAll = () => {
    if (!result) return
    navigator.clipboard.writeText(result.urls.join('\n'))
  }

  const filteredUrls = result?.urlData.filter(e =>
    !filter || e.url.toLowerCase().includes(filter.toLowerCase())
  ) ?? []

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/tools" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: 'rgb(236,72,153)', borderColor: 'rgba(236,72,153,0.3)', background: 'rgba(236,72,153,0.08)' }}>Live · Free · No Account Required</span>
        </div>

        <h1 className="text-4xl font-black text-white mb-3">Directory <span style={{ color: 'rgb(236,72,153)' }}>Extractor</span></h1>
        <p className="text-white/55 text-base mb-4 max-w-2xl">Enter any domain. We fetch its sitemap and return a full structured directory tree of every public page — with priority, changefreq, and lastmod metadata — exportable as JSON or CSV. Test free here — license from $29, or get all 51 tools from $99.</p>
        <div className="flex gap-3 mb-8 flex-wrap">
          <Link href="/pricing" className="px-4 py-2 rounded-xl text-sm font-black text-white" style={{ background: 'linear-gradient(135deg,#ec4899,#be185d)' }}>Get this tool — $29 →</Link>
          <Link href="/pricing" className="px-4 py-2 rounded-xl text-sm font-black border text-white/60" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>All 51 tools — from $99 →</Link>
        </div>

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
            <div className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-0">
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
                  <button onClick={copyAll} className="px-4 py-2 rounded-lg text-xs font-bold text-white border border-white/15 hover:border-white/30 transition-colors">Copy All</button>
                  <button onClick={downloadJson} className="px-4 py-2 rounded-lg text-xs font-bold text-white border border-white/15 hover:border-white/30 transition-colors">↓ JSON</button>
                  <button onClick={downloadCsv} className="px-4 py-2 rounded-lg text-xs font-bold text-white border border-white/15 hover:border-white/30 transition-colors">↓ CSV</button>
                </div>
              </div>
              {result.topPrefixes.length > 0 && (
                <div className="border-t pt-3 mt-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <p className="text-[10px] text-white/25 uppercase tracking-widest mb-2">Top path prefixes</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.topPrefixes.map(p => (
                      <span key={p.prefix} className="text-[11px] font-mono px-2 py-0.5 rounded"
                        style={{ background: 'rgba(236,72,153,0.1)', color: 'rgb(236,72,153)', border: '1px solid rgba(236,72,153,0.2)' }}>
                        /{p.prefix} ({p.count})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filter */}
            <input
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Filter URLs…"
              className="w-full px-3 py-2 rounded-lg text-sm text-white/70 outline-none font-mono"
              style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)' }}
            />

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
                <div className="space-y-px">
                  {filteredUrls.map(entry => (
                    <div key={entry.url} className="flex items-center gap-3 py-0.5 hover:bg-white/[0.02] rounded px-1">
                      <span className="text-xs font-mono text-white/55 flex-1 truncate">{entry.url}</span>
                      {entry.priority !== undefined && (
                        <span className="text-[10px] text-white/30 flex-shrink-0">{entry.priority.toFixed(1)}</span>
                      )}
                      {entry.changefreq && (
                        <span className="text-[10px] text-white/25 flex-shrink-0">{entry.changefreq}</span>
                      )}
                      {entry.lastmod && (
                        <span className="text-[10px] text-white/20 flex-shrink-0">{entry.lastmod}</span>
                      )}
                    </div>
                  ))}
                  {filter && filteredUrls.length === 0 && (
                    <p className="text-xs text-white/30 py-4 text-center">No URLs match &ldquo;{filter}&rdquo;</p>
                  )}
                  {filter && filteredUrls.length > 0 && (
                    <p className="text-xs text-white/25 pt-2">{filteredUrls.length} of {result.totalUrls} URLs match</p>
                  )}
                  {!filter && result.totalUrls > 2000 && (
                    <div className="text-xs text-white/30 pt-2">Showing first 2,000 of {result.totalUrls.toLocaleString()} URLs</div>
                  )}
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

        {/* Who This Is For */}
        <div className="mt-10 rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-3">Who This Is For</p>
          <ul className="space-y-1.5">
            {[
              'SEO teams auditing a site\'s URL structure and content hierarchy',
              'Developers building redirect maps before a site migration',
              'Content strategists mapping competitor site structures',
              'DevOps teams validating sitemap completeness for large e-commerce sites',
            ].map(item => (
              <li key={item} className="text-xs text-white/50 flex items-start gap-2">
                <span style={{ color: 'rgb(236,72,153)' }} className="mt-0.5 flex-shrink-0">→</span>{item}
              </li>
            ))}
          </ul>
        </div>

        {/* How It Works */}
        <div className="mt-14 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-xl font-black text-white mb-1">How It Works</h2>
          <p className="text-white/35 text-sm mb-8">Maps a site&apos;s public structure via its sitemap.xml — useful for SEO audits, content mapping, and crawl planning.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { n: '01', title: 'Enter a URL', body: 'Enter any domain. The tool fetches /sitemap.xml and /sitemap_index.xml, then recursively resolves any nested sitemaps.' },
              { n: '02', title: 'Parse & normalize', body: 'All <loc> entries are extracted with priority, changefreq, and lastmod metadata. Deduplicated and sorted alphabetically.' },
              { n: '03', title: 'Filter & export', body: 'Search URLs by keyword, switch between tree and list view, then download as CSV or JSON for redirect mapping or crawl jobs.' },
            ].map(s => (
              <div key={s.n} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-xs font-black text-white/20 mb-2">{s.n}</div>
                <div className="text-sm font-black text-white mb-1">{s.title}</div>
                <div className="text-xs text-white/45 leading-relaxed">{s.body}</div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-4">Example — queldrex.com</p>
            <div className="space-y-1.5">
              {['https://queldrex.com/', 'https://queldrex.com/tools', 'https://queldrex.com/scanner', 'https://queldrex.com/about', 'https://queldrex.com/pricing', 'https://queldrex.com/blog'].map(u => (
                <div key={u} className="flex items-center gap-2">
                  <svg className="w-3 h-3 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  <code className="text-xs font-mono text-white/60">{u}</code>
                </div>
              ))}
              <p className="text-xs text-white/30 mt-2">→ Exported as CSV with one click</p>
            </div>
          </div>
        </div>

        {/* License CTA */}
        <div className="mt-14 rounded-2xl border p-6 text-center" style={{ background: 'rgba(236,72,153,0.04)', borderColor: 'rgba(236,72,153,0.15)' }}>
          <p className="text-white font-black mb-1">Add sitemap extraction to your platform</p>
          <p className="text-white/40 text-sm mb-4">Full source — tree view, CSV export, priority/changefreq parsing. One-time license.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black text-white" style={{ background: 'linear-gradient(135deg,#ec4899,#be185d)' }}>Get this tool — $29 →</Link>
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>All 51 tools — from $99 →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
