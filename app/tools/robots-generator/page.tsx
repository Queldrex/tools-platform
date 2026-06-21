'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const AI_CRAWLERS = [
  { id: 'GPTBot', label: 'GPTBot', desc: 'OpenAI / ChatGPT' },
  { id: 'ChatGPT-User', label: 'ChatGPT-User', desc: 'ChatGPT browsing plugin' },
  { id: 'ClaudeBot', label: 'ClaudeBot', desc: 'Anthropic / Claude' },
  { id: 'Claude-Web', label: 'Claude-Web', desc: 'Claude web search' },
  { id: 'PerplexityBot', label: 'PerplexityBot', desc: 'Perplexity AI' },
  { id: 'Google-Extended', label: 'Google-Extended', desc: 'Google Gemini / AI Overviews' },
  { id: 'Googlebot', label: 'Googlebot', desc: 'Google Search' },
  { id: 'Bingbot', label: 'Bingbot', desc: 'Microsoft Bing / Copilot' },
  { id: 'CCBot', label: 'CCBot', desc: 'Common Crawl (training data)' },
  { id: 'cohere-ai', label: 'cohere-ai', desc: 'Cohere AI' },
  { id: 'anthropic-ai', label: 'anthropic-ai', desc: 'Anthropic AI training' },
  { id: 'Omgilibot', label: 'Omgilibot', desc: 'Meta / Llama training' },
]

const STANDARD_CRAWLERS = [
  { id: 'Googlebot', label: 'Googlebot', desc: 'Google Search' },
  { id: 'Bingbot', label: 'Bingbot', desc: 'Bing Search' },
  { id: 'Slurp', label: 'Slurp', desc: 'Yahoo Search' },
  { id: 'DuckDuckBot', label: 'DuckDuckBot', desc: 'DuckDuckGo' },
]

export default function RobotsTxtGeneratorPage() {
  const [sitemap, setSitemap] = useState('')
  const [allowAll, setAllowAll] = useState(true)
  const [allowedCrawlers, setAllowedCrawlers] = useState<Set<string>>(
    new Set(AI_CRAWLERS.map(c => c.id))
  )
  const [disallowPaths, setDisallowPaths] = useState('/admin/\n/api/\n/private/')
  const [copied, setCopied] = useState(false)

  function toggleCrawler(id: string) {
    setAllowedCrawlers(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function buildRobotsTxt() {
    const lines: string[] = []

    if (allowAll) {
      lines.push('User-agent: *')
      lines.push('Allow: /')
      disallowPaths.split('\n').filter(p => p.trim()).forEach(p => {
        lines.push(`Disallow: ${p.trim()}`)
      })
      lines.push('')
    } else {
      lines.push('User-agent: *')
      lines.push('Disallow: /')
      lines.push('')
    }

    const denied = AI_CRAWLERS.filter(c => !allowedCrawlers.has(c.id))
    denied.forEach(crawler => {
      lines.push(`User-agent: ${crawler.id}`)
      lines.push('Disallow: /')
      lines.push('')
    })

    if (sitemap.trim()) {
      const sitemapUrl = sitemap.trim().startsWith('http') ? sitemap.trim() : `https://${sitemap.trim()}`
      lines.push(`Sitemap: ${sitemapUrl}`)
    }

    return lines.join('\n')
  }

  const output = buildRobotsTxt()

  function copy() {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inputStyle: React.CSSProperties = {
    background: '#0d1117',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: '10px 14px',
    color: 'white',
    fontSize: 13,
    outline: 'none',
    width: '100%',
  }

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-10">

        <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/30 hover:text-white/60 transition-colors mb-8">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase mb-4"
            style={{ borderColor: 'rgba(6,182,212,0.25)', background: 'rgba(6,182,212,0.08)', color: '#06d6ff' }}>
            Free Tool · AI Visibility
          </div>
          <h1 className="text-3xl font-black text-white mb-2">robots.txt Generator</h1>
          <p className="text-white/45 text-sm leading-relaxed max-w-2xl">
            Generate a robots.txt file with precise control over which AI crawlers can access your site. By default, all major AI crawlers are allowed — which is what you want for maximum AI visibility.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* CONTROLS */}
          <div className="space-y-5">
            <div className="rounded-2xl border p-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">General Access</p>
              <div className="space-y-3">
                <button onClick={() => setAllowAll(true)}
                  className="w-full text-left p-4 rounded-xl border transition-all"
                  style={{
                    background: allowAll ? 'rgba(6,182,212,0.08)' : 'rgba(255,255,255,0.02)',
                    borderColor: allowAll ? 'rgba(6,182,212,0.35)' : 'rgba(255,255,255,0.08)',
                  }}>
                  <p className="text-sm font-bold text-white mb-0.5">Allow all crawlers</p>
                  <p className="text-xs text-white/40">Recommended — all bots can access your site (with exceptions below)</p>
                </button>
                <button onClick={() => setAllowAll(false)}
                  className="w-full text-left p-4 rounded-xl border transition-all"
                  style={{
                    background: !allowAll ? 'rgba(248,113,113,0.08)' : 'rgba(255,255,255,0.02)',
                    borderColor: !allowAll ? 'rgba(248,113,113,0.35)' : 'rgba(255,255,255,0.08)',
                  }}>
                  <p className="text-sm font-bold text-white mb-0.5">Block all crawlers by default</p>
                  <p className="text-xs text-white/40">Blocks all bots unless explicitly allowed below</p>
                </button>
              </div>
            </div>

            {allowAll && (
              <div className="rounded-2xl border p-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
                <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Disallowed Paths</p>
                <p className="text-xs text-white/35 mb-3">One path per line. These paths are blocked from all crawlers.</p>
                <textarea value={disallowPaths} onChange={e => setDisallowPaths(e.target.value)} rows={4}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }} />
              </div>
            )}

            <div className="rounded-2xl border p-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-white/30">AI Crawlers</p>
                <div className="flex gap-2">
                  <button onClick={() => setAllowedCrawlers(new Set(AI_CRAWLERS.map(c => c.id)))}
                    className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors">Allow all</button>
                  <span className="text-white/15">·</span>
                  <button onClick={() => setAllowedCrawlers(new Set())}
                    className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors">Block all</button>
                </div>
              </div>
              <div className="space-y-2">
                {AI_CRAWLERS.map(crawler => (
                  <div key={crawler.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-xs font-bold text-white font-mono">{crawler.id}</p>
                      <p className="text-[11px] text-white/35">{crawler.desc}</p>
                    </div>
                    <button onClick={() => toggleCrawler(crawler.id)}
                      className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all"
                      style={{
                        background: allowedCrawlers.has(crawler.id) ? 'rgba(6,182,212,0.12)' : 'rgba(248,113,113,0.1)',
                        color: allowedCrawlers.has(crawler.id) ? '#06d6ff' : '#f87171',
                        borderColor: allowedCrawlers.has(crawler.id) ? 'rgba(6,182,212,0.3)' : 'rgba(248,113,113,0.3)',
                      }}>
                      {allowedCrawlers.has(crawler.id) ? 'Allowed' : 'Blocked'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border p-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3">Sitemap URL</p>
              <input type="text" value={sitemap} onChange={e => setSitemap(e.target.value)}
                placeholder="example.com/sitemap.xml" style={inputStyle} />
            </div>
          </div>

          {/* OUTPUT */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-2xl border overflow-hidden" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/6">
                <p className="text-xs font-bold uppercase tracking-widest text-white/30">robots.txt</p>
                <button onClick={copy}
                  className="text-xs font-bold px-4 py-1.5 rounded-lg transition-all"
                  style={{
                    background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(6,182,212,0.15)',
                    color: copied ? '#4ade80' : '#06d6ff',
                    border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(6,182,212,0.3)'}`,
                  }}>
                  {copied ? 'Copied!' : 'Copy File'}
                </button>
              </div>
              <pre className="p-5 text-xs text-white/65 overflow-auto max-h-[500px] leading-relaxed font-mono whitespace-pre">
                {output}
              </pre>
            </div>

            <div className="mt-4 rounded-xl border p-4" style={{ background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.12)' }}>
              <p className="text-xs font-bold text-cyan-400 mb-1">How to deploy</p>
              <p className="text-xs text-white/45 leading-relaxed">
                Save this as <code className="text-white/70">robots.txt</code> and upload it to the root of your website so it&apos;s accessible at <code className="text-white/70">yoursite.com/robots.txt</code>.
              </p>
            </div>

            <div className="mt-3 rounded-xl border p-4 flex items-center justify-between gap-4" style={{ background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.12)' }}>
              <div>
                <p className="text-xs font-bold text-white mb-0.5">Check your current robots.txt</p>
                <p className="text-xs text-white/40">The AI Visibility Scanner audits your robots.txt as one of 14 signals.</p>
              </div>
              <Link href="/scanner" className="flex-shrink-0 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors whitespace-nowrap">
                Free scan →
              </Link>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-14 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-xl font-black text-white mb-1">How It Works</h2>
          <p className="text-white/35 text-sm mb-8">Control exactly which AI crawlers and search bots can access your site — with point-and-click simplicity.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { n: '01', title: 'Toggle crawlers', body: 'Check or uncheck each AI crawler (GPTBot, ClaudeBot, Bingbot, etc.) and search crawler. Allow or block each one independently.' },
              { n: '02', title: 'Add a sitemap', body: 'Enter your sitemap URL (e.g. yoursite.com/sitemap.xml). This tells all crawlers where to find your content efficiently.' },
              { n: '03', title: 'Download & upload', body: 'Copy or download the generated robots.txt file and upload it to your site root at yoursite.com/robots.txt.' },
            ].map(s => (
              <div key={s.n} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-xs font-black text-white/20 mb-2">{s.n}</div>
                <div className="text-sm font-black text-white mb-1">{s.title}</div>
                <div className="text-xs text-white/45 leading-relaxed">{s.body}</div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-4">Example output — block AI training bots, allow search engines</p>
            <pre className="text-xs font-mono text-green-400/70 leading-relaxed">{`# Block AI training crawlers
User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: CCBot
Disallow: /

# Allow search engine indexing
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

Sitemap: https://yoursite.com/sitemap.xml`}</pre>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
