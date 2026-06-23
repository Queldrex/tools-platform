'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// ─── Constants ─────────────────────────────────────────────────────────────────

const AI_SEARCH_CRAWLERS = [
  { id: 'GPTBot', label: 'GPTBot', desc: 'OpenAI / ChatGPT training' },
  { id: 'ChatGPT-User', label: 'ChatGPT-User', desc: 'ChatGPT browsing plugin' },
  { id: 'OAI-SearchBot', label: 'OAI-SearchBot', desc: 'OpenAI search indexing' },
  { id: 'ClaudeBot', label: 'ClaudeBot', desc: 'Anthropic / Claude' },
  { id: 'Claude-Web', label: 'Claude-Web', desc: 'Claude web search' },
  { id: 'PerplexityBot', label: 'PerplexityBot', desc: 'Perplexity AI' },
  { id: 'PerplexityBot-User', label: 'PerplexityBot-User', desc: 'Perplexity AI user searches' },
  { id: 'Google-Extended', label: 'Google-Extended', desc: 'Google Gemini / AI Overviews' },
  { id: 'Bingbot', label: 'Bingbot', desc: 'Microsoft Bing / Copilot' },
  { id: 'Googlebot', label: 'Googlebot', desc: 'Google Search' },
]

const AI_TRAINING_CRAWLERS = [
  { id: 'CCBot', label: 'CCBot', desc: 'Common Crawl (training data)' },
  { id: 'cohere-ai', label: 'cohere-ai', desc: 'Cohere AI' },
  { id: 'anthropic-ai', label: 'anthropic-ai', desc: 'Anthropic AI training' },
  { id: 'Omgilibot', label: 'Omgilibot', desc: 'Meta / Llama training' },
  { id: 'Meta-ExternalAgent', label: 'Meta-ExternalAgent', desc: 'Meta AI / Llama' },
  { id: 'Applebot-Extended', label: 'Applebot-Extended', desc: 'Apple AI / Siri' },
  { id: 'Amazonbot', label: 'Amazonbot', desc: 'Amazon Alexa AI' },
  { id: 'Bytespider', label: 'Bytespider', desc: 'ByteDance / TikTok AI' },
  { id: 'Diffbot', label: 'Diffbot', desc: 'Diffbot AI training' },
]

const ALL_CRAWLERS = [...AI_SEARCH_CRAWLERS, ...AI_TRAINING_CRAWLERS]

type LlmsSection = { name: string; url: string; description: string }
type ActiveTab = 'robots' | 'llms'

// ─── Presets ───────────────────────────────────────────────────────────────────

const PRESETS: Record<string, { paths: string; blockedCrawlers: string[] }> = {
  'Allow Everything': {
    paths: '',
    blockedCrawlers: [],
  },
  'WordPress': {
    paths: '/wp-admin/\n/wp-includes/\n/wp-login.php\n/?s=\n/feed/\n/trackback/',
    blockedCrawlers: [],
  },
  'Next.js / Vercel': {
    paths: '/_next/\n/api/\n/admin',
    blockedCrawlers: [],
  },
  'Shopify': {
    paths: '/admin/\n/cart\n/checkout\n/orders/\n/account/',
    blockedCrawlers: [],
  },
  'Webflow': {
    paths: '/admin\n/.webflow/',
    blockedCrawlers: [],
  },
  'Block AI Training': {
    paths: '/admin/\n/api/\n/private/',
    blockedCrawlers: AI_TRAINING_CRAWLERS.map(c => c.id),
  },
}

// ─── Parser ────────────────────────────────────────────────────────────────────

function parseRobotsTxt(text: string): {
  disallowPaths: string
  blockedCrawlers: string[]
  sitemaps: string[]
} {
  const lines = text.split('\n').map(l => l.trim())
  const disallowPaths: string[] = []
  const blockedCrawlers: string[] = []
  const sitemaps: string[] = []

  let currentAgents: string[] = []
  let currentDisallows: string[] = []

  function flush() {
    if (currentAgents.includes('*')) {
      disallowPaths.push(...currentDisallows.filter(p => p && p !== '/'))
    } else {
      const hasBlockAll = currentDisallows.includes('/')
      if (hasBlockAll) {
        for (const agent of currentAgents) {
          const found = ALL_CRAWLERS.find(c => c.id.toLowerCase() === agent.toLowerCase())
          if (found) blockedCrawlers.push(found.id)
        }
      }
    }
    currentAgents = []
    currentDisallows = []
  }

  for (const line of lines) {
    if (!line || line.startsWith('#')) continue
    const [key, ...rest] = line.split(':')
    const val = rest.join(':').trim()
    const k = key.trim().toLowerCase()
    if (k === 'user-agent') {
      if (currentAgents.length > 0 && currentDisallows.length > 0) flush()
      else if (currentAgents.length > 0) currentAgents = []
      currentAgents.push(val)
    } else if (k === 'disallow') {
      currentDisallows.push(val)
    } else if (k === 'sitemap') {
      sitemaps.push(val)
    }
  }
  if (currentAgents.length > 0) flush()

  return {
    disallowPaths: disallowPaths.join('\n'),
    blockedCrawlers,
    sitemaps: sitemaps.length > 0 ? sitemaps : [''],
  }
}

// ─── URL Simulator ─────────────────────────────────────────────────────────────

function simulateUrl(
  testPath: string,
  disallowPaths: string,
  blockedCrawlers: Set<string>
): { crawler: string; desc: string; result: 'Allowed' | 'Blocked'; reason: string }[] {
  const path = testPath.startsWith('/') ? testPath : '/' + testPath
  const disallowList = disallowPaths.split('\n').map(p => p.trim()).filter(Boolean)

  const pathBlocked = disallowList.some(dp => {
    if (dp.endsWith('*')) return path.startsWith(dp.slice(0, -1))
    return path.startsWith(dp)
  })

  return ALL_CRAWLERS.map(c => {
    if (blockedCrawlers.has(c.id)) {
      return { crawler: c.id, desc: c.desc, result: 'Blocked' as const, reason: 'Crawler blocked entirely' }
    }
    if (pathBlocked) {
      return { crawler: c.id, desc: c.desc, result: 'Blocked' as const, reason: 'Blocked by path rule' }
    }
    return { crawler: c.id, desc: c.desc, result: 'Allowed' as const, reason: 'No matching disallow rule' }
  })
}

// ─── Styles ────────────────────────────────────────────────────────────────────

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

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: 'rgba(255,255,255,0.4)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: 6,
}

const sectionStyle: React.CSSProperties = {
  background: '#0d1117',
  borderColor: 'rgba(255,255,255,0.08)',
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function RobotsTxtGeneratorPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('robots')

  // robots.txt state
  const [activePreset, setActivePreset] = useState<string>('')
  const [allowAll, setAllowAll] = useState(true)
  const [disallowPaths, setDisallowPaths] = useState('/admin/\n/api/\n/private/')
  const [blockedCrawlers, setBlockedCrawlers] = useState<Set<string>>(new Set())
  const [sitemaps, setSitemaps] = useState<string[]>([''])
  const [crawlDelay, setCrawlDelay] = useState('')
  const [hostDirective, setHostDirective] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showCrawlers, setShowCrawlers] = useState(false)
  const [copied, setCopied] = useState(false)

  // Import state
  const [showImport, setShowImport] = useState(false)
  const [importMode, setImportMode] = useState<'url' | 'paste'>('url')
  const [importUrl, setImportUrl] = useState('')
  const [importPaste, setImportPaste] = useState('')
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [importing, setImporting] = useState(false)

  // URL simulator state
  const [simPath, setSimPath] = useState('')
  const [simResults, setSimResults] = useState<ReturnType<typeof simulateUrl> | null>(null)

  // llms.txt state
  const [llmsSiteName, setLlmsSiteName] = useState('')
  const [llmsSiteUrl, setLlmsSiteUrl] = useState('')
  const [llmsDescription, setLlmsDescription] = useState('')
  const [llmsLanguage, setLlmsLanguage] = useState('English')
  const [llmsContact, setLlmsContact] = useState('')
  const [llmsUses, setLlmsUses] = useState<Set<string>>(new Set(['Answering user questions', 'Search indexing']))
  const [llmsSections, setLlmsSections] = useState<LlmsSection[]>([
    { name: '', url: '', description: '' },
    { name: '', url: '', description: '' },
    { name: '', url: '', description: '' },
  ])
  const [llmsCopied, setLlmsCopied] = useState(false)

  // ── Crawler helpers ──
  function toggleCrawler(id: string) {
    setBlockedCrawlers(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setActivePreset('')
  }

  function allowGroup(ids: string[]) {
    setBlockedCrawlers(prev => {
      const next = new Set(prev)
      ids.forEach(id => next.delete(id))
      return next
    })
    setActivePreset('')
  }

  function blockGroup(ids: string[]) {
    setBlockedCrawlers(prev => {
      const next = new Set(prev)
      ids.forEach(id => next.add(id))
      return next
    })
    setActivePreset('')
  }

  // ── Presets ──
  function applyPreset(name: string) {
    const p = PRESETS[name]
    if (!p) return
    setActivePreset(name)
    setDisallowPaths(p.paths)
    setBlockedCrawlers(new Set(p.blockedCrawlers))
    if (name === 'Allow Everything') setAllowAll(true)
  }

  // ── Import ──
  async function fetchRobots() {
    setImporting(true)
    setImportStatus(null)
    try {
      const res = await fetch('/api/tools/robots-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl }),
      })
      const data = await res.json()
      if (!res.ok) {
        setImportStatus({ type: 'error', msg: data.error || 'Fetch failed' })
        return
      }
      applyParsed(data.text)
    } catch {
      setImportStatus({ type: 'error', msg: 'Network error' })
    } finally {
      setImporting(false)
    }
  }

  function applyParsed(text: string) {
    const parsed = parseRobotsTxt(text)
    setDisallowPaths(parsed.disallowPaths)
    setBlockedCrawlers(new Set(parsed.blockedCrawlers))
    setSitemaps(parsed.sitemaps.length > 0 ? parsed.sitemaps : [''])
    setActivePreset('')
    setImportStatus({ type: 'success', msg: `Imported — ${parsed.blockedCrawlers.length} crawlers blocked, ${parsed.sitemaps.length} sitemap(s) found` })
  }

  // ── robots.txt builder ──
  function buildRobotsTxt(): string {
    const lines: string[] = []
    const delay = crawlDelay ? parseInt(crawlDelay) : 0

    if (hostDirective.trim()) {
      lines.push(`Host: ${hostDirective.trim()}`)
      lines.push('')
    }

    if (allowAll) {
      lines.push('User-agent: *')
      lines.push('Allow: /')
      disallowPaths.split('\n').filter(p => p.trim()).forEach(p => {
        lines.push(`Disallow: ${p.trim()}`)
      })
      if (delay > 0) lines.push(`Crawl-delay: ${delay}`)
      lines.push('')
    } else {
      lines.push('User-agent: *')
      lines.push('Disallow: /')
      if (delay > 0) lines.push(`Crawl-delay: ${delay}`)
      lines.push('')
    }

    const blocked = showCrawlers ? ALL_CRAWLERS.filter(c => blockedCrawlers.has(c.id)) : []
    blocked.forEach(crawler => {
      lines.push(`User-agent: ${crawler.id}`)
      lines.push('Disallow: /')
      if (delay > 0) lines.push(`Crawl-delay: ${delay}`)
      lines.push('')
    })

    sitemaps.filter(s => s.trim()).forEach(s => {
      const url = s.trim().startsWith('http') ? s.trim() : `https://${s.trim()}`
      lines.push(`Sitemap: ${url}`)
    })

    return lines.join('\n').trimEnd()
  }

  // ── llms.txt builder ──
  function buildLlmsTxt(): string {
    const lines: string[] = []
    lines.push(`# ${llmsSiteName || 'Your Site'}`)
    lines.push('')
    if (llmsDescription) {
      lines.push(`> ${llmsDescription}`)
      lines.push('')
    }
    if (llmsSiteUrl) {
      const url = llmsSiteUrl.startsWith('http') ? llmsSiteUrl : `https://${llmsSiteUrl}`
      lines.push(`${llmsSiteName || 'This site'} is available at ${url}.`)
      lines.push('')
    }
    if (llmsLanguage !== 'English') {
      lines.push(`Primary language: ${llmsLanguage}`)
      lines.push('')
    }
    const validSections = llmsSections.filter(s => s.name || s.url)
    if (validSections.length > 0) {
      lines.push('## Content')
      lines.push('')
      validSections.forEach(s => {
        const urlPart = s.url ? (s.url.startsWith('http') ? s.url : `https://${s.url}`) : ''
        const namePart = urlPart ? `[${s.name || s.url}](${urlPart})` : s.name
        const descPart = s.description ? `: ${s.description}` : ''
        lines.push(`- ${namePart}${descPart}`)
      })
      lines.push('')
    }
    if (llmsUses.size > 0) {
      lines.push('## Usage')
      lines.push('')
      lines.push(`LLMs may use this content for: ${Array.from(llmsUses).join(', ')}.`)
      lines.push('')
    }
    if (llmsContact) {
      lines.push('## Contact')
      lines.push('')
      lines.push(`For AI licensing inquiries: ${llmsContact}`)
      lines.push('')
    }
    return lines.join('\n').trimEnd()
  }

  // ── Validation warnings ──
  function getWarnings(): string[] {
    const warnings: string[] = []
    const paths = disallowPaths.split('\n').map(p => p.trim()).filter(Boolean)
    const seen = new Set<string>()

    paths.forEach(p => {
      if (!p.startsWith('/')) warnings.push(`Path "${p}" is missing a leading slash — it will have no effect`)
      if (p.includes('.css') || p.includes('.js')) warnings.push('Blocking .css or .js files can hurt search rankings and page rendering')
      if (seen.has(p)) warnings.push(`Duplicate path detected: ${p}`)
      seen.add(p)
    })

    const googlebotBlocked = blockedCrawlers.has('Googlebot')
    const bingbotBlocked = blockedCrawlers.has('Bingbot')
    if (googlebotBlocked && bingbotBlocked) warnings.push('Both Googlebot and Bingbot are blocked — your site will not appear in Google or Bing search results')

    return warnings
  }

  const robotsOutput = buildRobotsTxt()
  const llmsOutput = buildLlmsTxt()
  const warnings = getWarnings()

  function copy() {
    navigator.clipboard.writeText(activeTab === 'robots' ? robotsOutput : llmsOutput)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function copyLlms() {
    navigator.clipboard.writeText(llmsOutput)
    setLlmsCopied(true)
    setTimeout(() => setLlmsCopied(false), 2000)
  }

  function download(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
  }

  function runSimulator() {
    if (!simPath.trim()) return
    setSimResults(simulateUrl(simPath, disallowPaths, blockedCrawlers))
  }

  function toggleLlmsUse(use: string) {
    setLlmsUses(prev => {
      const next = new Set(prev)
      if (next.has(use)) next.delete(use)
      else next.add(use)
      return next
    })
  }

  const LLMS_USES = ['Answering user questions', 'Training AI models', 'Search indexing', 'Content summarization']
  const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian', 'Japanese', 'Chinese', 'Korean']

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
          <h1 className="text-3xl font-black text-white mb-2">robots.txt + llms.txt Generator</h1>
          <p className="text-white/45 text-sm leading-relaxed max-w-2xl">
            Generate robots.txt with precise control over 18 AI crawlers — and generate llms.txt to tell AI assistants exactly what your site is about. No competitor combines both.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 mb-8">
          {(['robots', 'llms'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-2 rounded-lg text-xs font-bold transition-all"
              style={{
                background: activeTab === tab ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
                color: activeTab === tab ? '#06d6ff' : 'rgba(255,255,255,0.4)',
                border: `1px solid ${activeTab === tab ? 'rgba(6,182,212,0.35)' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              {tab === 'robots' ? 'robots.txt' : 'llms.txt'}
              {tab === 'llms' && (
                <span className="ml-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
                  NEW
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── robots.txt TAB ── */}
        {activeTab === 'robots' && (
          <div className="grid lg:grid-cols-2 gap-8">

            {/* LEFT COLUMN */}
            <div className="space-y-5">

              {/* Presets */}
              <div className="rounded-2xl border p-5" style={sectionStyle}>
                <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3">Quick Presets</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(PRESETS).map(name => (
                    <button
                      key={name}
                      onClick={() => applyPreset(name)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg border transition-all"
                      style={{
                        background: activePreset === name ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
                        color: activePreset === name ? '#06d6ff' : 'rgba(255,255,255,0.45)',
                        borderColor: activePreset === name ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.08)',
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Import */}
              <div className="rounded-2xl border overflow-hidden" style={sectionStyle}>
                <button
                  onClick={() => setShowImport(v => !v)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30">Import Existing robots.txt</p>
                  <svg className={`w-4 h-4 text-white/30 transition-transform ${showImport ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                </button>
                {showImport && (
                  <div className="px-6 pb-6 space-y-4 border-t border-white/6">
                    <div className="flex gap-2 mt-4">
                      {(['url', 'paste'] as const).map(m => (
                        <button key={m} onClick={() => setImportMode(m)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg border transition-all"
                          style={{
                            background: importMode === m ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.04)',
                            color: importMode === m ? '#06d6ff' : 'rgba(255,255,255,0.4)',
                            borderColor: importMode === m ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.08)',
                          }}>
                          {m === 'url' ? 'Fetch from URL' : 'Paste raw text'}
                        </button>
                      ))}
                    </div>
                    {importMode === 'url' ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={importUrl}
                          onChange={e => setImportUrl(e.target.value)}
                          placeholder="example.com"
                          style={{ ...inputStyle, borderRadius: 8 }}
                          onKeyDown={e => e.key === 'Enter' && fetchRobots()}
                        />
                        <button
                          onClick={fetchRobots}
                          disabled={importing || !importUrl.trim()}
                          className="flex-shrink-0 text-xs font-bold px-4 py-2 rounded-lg transition-all disabled:opacity-40"
                          style={{ background: 'rgba(6,182,212,0.15)', color: '#06d6ff', border: '1px solid rgba(6,182,212,0.3)' }}
                        >
                          {importing ? '...' : 'Fetch'}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <textarea
                          value={importPaste}
                          onChange={e => setImportPaste(e.target.value)}
                          placeholder="Paste your robots.txt content here..."
                          rows={5}
                          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }}
                        />
                        <button
                          onClick={() => applyParsed(importPaste)}
                          disabled={!importPaste.trim()}
                          className="text-xs font-bold px-4 py-2 rounded-lg transition-all disabled:opacity-40"
                          style={{ background: 'rgba(6,182,212,0.15)', color: '#06d6ff', border: '1px solid rgba(6,182,212,0.3)' }}
                        >
                          Parse & Apply
                        </button>
                      </div>
                    )}
                    {importStatus && (
                      <div className="rounded-lg px-3 py-2 text-xs font-medium"
                        style={{
                          background: importStatus.type === 'success' ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
                          color: importStatus.type === 'success' ? '#4ade80' : '#f87171',
                          border: `1px solid ${importStatus.type === 'success' ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
                        }}>
                        {importStatus.msg}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* General access */}
              <div className="rounded-2xl border p-6" style={sectionStyle}>
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
                <div className="rounded-2xl border p-6" style={sectionStyle}>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-1">Disallowed Paths</p>
                  <p className="text-xs text-white/30 mb-3">One path per line. Must start with /. Blocked for all crawlers.</p>
                  <textarea
                    value={disallowPaths}
                    onChange={e => { setDisallowPaths(e.target.value); setActivePreset('') }}
                    rows={5}
                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }}
                  />
                  <p className="text-[10px] text-white/20 mt-2">Wildcards: * matches any string, $ matches end of URL. Example: /private/* blocks all paths under /private/</p>
                </div>
              )}

              {/* Crawler rules — optional, collapsible */}
              <button
                onClick={() => setShowCrawlers(s => !s)}
                className="w-full flex items-center justify-between px-5 py-3 rounded-2xl border transition-all"
                style={{ background: showCrawlers ? 'rgba(6,182,212,0.06)' : 'rgba(255,255,255,0.02)', borderColor: showCrawlers ? 'rgba(6,182,212,0.25)' : 'rgba(255,255,255,0.08)' }}
              >
                <div className="text-left">
                  <p className="text-sm font-bold text-white">Per-crawler rules <span className="text-xs font-normal text-white/40">(optional)</span></p>
                  <p className="text-xs text-white/35 mt-0.5">Allow or block individual AI bots — skip this section if you want the same rules for all crawlers</p>
                </div>
                <svg className={`w-4 h-4 text-white/30 flex-shrink-0 transition-transform ${showCrawlers ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
              </button>

              {showCrawlers && <>
              {/* AI Search Crawlers */}
              <div className="rounded-2xl border p-6" style={sectionStyle}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/30">AI Search &amp; Answers</p>
                    <p className="text-[10px] text-white/20 mt-0.5">Allow these for AI visibility — they cite and recommend your content</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => allowGroup(AI_SEARCH_CRAWLERS.map(c => c.id))} className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors">Allow all</button>
                    <span className="text-white/15">·</span>
                    <button onClick={() => blockGroup(AI_SEARCH_CRAWLERS.map(c => c.id))} className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors">Block all</button>
                  </div>
                </div>
                <div className="space-y-1">
                  {AI_SEARCH_CRAWLERS.map(crawler => (
                    <div key={crawler.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-xs font-bold text-white font-mono">{crawler.id}</p>
                        <p className="text-[11px] text-white/35">{crawler.desc}</p>
                      </div>
                      <button
                        onClick={() => toggleCrawler(crawler.id)}
                        className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all"
                        style={{
                          background: !blockedCrawlers.has(crawler.id) ? 'rgba(6,182,212,0.12)' : 'rgba(248,113,113,0.1)',
                          color: !blockedCrawlers.has(crawler.id) ? '#06d6ff' : '#f87171',
                          borderColor: !blockedCrawlers.has(crawler.id) ? 'rgba(6,182,212,0.3)' : 'rgba(248,113,113,0.3)',
                        }}>
                        {!blockedCrawlers.has(crawler.id) ? 'Allowed' : 'Blocked'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Training Crawlers */}
              <div className="rounded-2xl border p-6" style={sectionStyle}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/30">AI Training Crawlers</p>
                    <p className="text-[10px] text-white/20 mt-0.5">Used to train AI models — block if you don&apos;t want your content used for training data</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => allowGroup(AI_TRAINING_CRAWLERS.map(c => c.id))} className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors">Allow all</button>
                    <span className="text-white/15">·</span>
                    <button onClick={() => blockGroup(AI_TRAINING_CRAWLERS.map(c => c.id))} className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors">Block all</button>
                  </div>
                </div>
                <div className="space-y-1">
                  {AI_TRAINING_CRAWLERS.map(crawler => (
                    <div key={crawler.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-xs font-bold text-white font-mono">{crawler.id}</p>
                        <p className="text-[11px] text-white/35">{crawler.desc}</p>
                      </div>
                      <button
                        onClick={() => toggleCrawler(crawler.id)}
                        className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all"
                        style={{
                          background: !blockedCrawlers.has(crawler.id) ? 'rgba(6,182,212,0.12)' : 'rgba(248,113,113,0.1)',
                          color: !blockedCrawlers.has(crawler.id) ? '#06d6ff' : '#f87171',
                          borderColor: !blockedCrawlers.has(crawler.id) ? 'rgba(6,182,212,0.3)' : 'rgba(248,113,113,0.3)',
                        }}>
                        {!blockedCrawlers.has(crawler.id) ? 'Allowed' : 'Blocked'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              </>}

              {/* Sitemaps */}
              <div className="rounded-2xl border p-6" style={sectionStyle}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30">Sitemap URLs</p>
                  <button
                    onClick={() => setSitemaps(s => [...s, ''])}
                    className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >+ Add Sitemap</button>
                </div>
                <div className="space-y-2">
                  {sitemaps.map((s, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={s}
                        onChange={e => setSitemaps(prev => prev.map((v, idx) => idx === i ? e.target.value : v))}
                        placeholder="example.com/sitemap.xml"
                        style={{ ...inputStyle, borderRadius: 8 }}
                      />
                      {sitemaps.length > 1 && (
                        <button
                          onClick={() => setSitemaps(prev => prev.filter((_, idx) => idx !== i))}
                          className="flex-shrink-0 text-xs text-red-400/60 hover:text-red-400 px-2 transition-colors"
                        >×</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced options */}
              <div className="rounded-2xl border overflow-hidden" style={sectionStyle}>
                <button
                  onClick={() => setShowAdvanced(v => !v)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30">Advanced Options</p>
                  <svg className={`w-4 h-4 text-white/30 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                </button>
                {showAdvanced && (
                  <div className="px-6 pb-6 space-y-4 border-t border-white/6">
                    <div className="mt-4">
                      <label style={labelStyle}>Crawl-delay (seconds)</label>
                      <input type="number" min="0" max="60" value={crawlDelay} onChange={e => setCrawlDelay(e.target.value)} placeholder="0" style={inputStyle} />
                      <p className="text-[10px] text-white/20 mt-1">Slows crawlers down — use only if your server is under load. Most major crawlers ignore this.</p>
                    </div>
                    <div>
                      <label style={labelStyle}>Host Directive (Yandex only)</label>
                      <input type="text" value={hostDirective} onChange={e => setHostDirective(e.target.value)} placeholder="example.com" style={inputStyle} />
                      <p className="text-[10px] text-white/20 mt-1">Tells Yandex which domain is canonical. Not used by Google or Bing.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN — Output */}
            <div className="lg:sticky lg:top-24 h-fit space-y-4">

              {/* Validation warnings */}
              {warnings.length > 0 && (
                <div className="rounded-xl border p-4" style={{ background: 'rgba(251,191,36,0.06)', borderColor: 'rgba(251,191,36,0.2)' }}>
                  <p className="text-xs font-bold text-yellow-400 mb-2 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                    Validation Warnings
                  </p>
                  <ul className="space-y-1">
                    {warnings.map((w, i) => (
                      <li key={i} className="text-xs text-yellow-400/75 flex items-start gap-1.5">
                        <span className="mt-0.5 flex-shrink-0">•</span>{w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Output */}
              <div className="rounded-2xl border overflow-hidden" style={sectionStyle}>
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/6">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30">robots.txt</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => download(robotsOutput, 'robots.txt')}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      Download
                    </button>
                    <button
                      onClick={copy}
                      className="text-xs font-bold px-4 py-1.5 rounded-lg transition-all"
                      style={{
                        background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(6,182,212,0.15)',
                        color: copied ? '#4ade80' : '#06d6ff',
                        border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(6,182,212,0.3)'}`,
                      }}>
                      {copied ? 'Copied!' : 'Copy File'}
                    </button>
                  </div>
                </div>
                <pre className="p-5 text-xs text-white/65 overflow-auto max-h-[400px] leading-relaxed font-mono whitespace-pre">
                  {robotsOutput}
                </pre>
              </div>

              {/* URL Simulator */}
              <div className="rounded-2xl border p-5" style={sectionStyle}>
                <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3">URL Rule Simulator</p>
                <p className="text-[11px] text-white/30 mb-3">Test whether a URL path would be crawled or blocked by the current rules.</p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={simPath}
                    onChange={e => setSimPath(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && runSimulator()}
                    placeholder="/admin/dashboard"
                    style={{ ...inputStyle, fontFamily: 'monospace', borderRadius: 8 }}
                  />
                  <button
                    onClick={runSimulator}
                    disabled={!simPath.trim()}
                    className="flex-shrink-0 text-xs font-bold px-4 py-2 rounded-lg transition-all disabled:opacity-40"
                    style={{ background: 'rgba(6,182,212,0.15)', color: '#06d6ff', border: '1px solid rgba(6,182,212,0.3)' }}
                  >
                    Test
                  </button>
                </div>
                {simResults && (
                  <div className="space-y-1 max-h-48 overflow-auto">
                    {simResults.map(r => (
                      <div key={r.crawler} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                        <div>
                          <span className="text-xs font-mono text-white/70">{r.crawler}</span>
                          <span className="text-[10px] text-white/25 ml-2">{r.desc}</span>
                        </div>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                          style={{
                            background: r.result === 'Allowed' ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
                            color: r.result === 'Allowed' ? '#4ade80' : '#f87171',
                          }}>
                          {r.result}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Deploy help */}
              <div className="rounded-xl border p-4" style={{ background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.12)' }}>
                <p className="text-xs font-bold text-cyan-400 mb-1">How to deploy</p>
                <p className="text-xs text-white/45 leading-relaxed">
                  Save as <code className="text-white/70">robots.txt</code> and upload to your site root so it&apos;s accessible at <code className="text-white/70">yoursite.com/robots.txt</code>. On Next.js, place it in the <code className="text-white/70">public/</code> folder.
                </p>
              </div>

              <div className="rounded-xl border p-4 flex items-center justify-between gap-4" style={{ background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.12)' }}>
                <div>
                  <p className="text-xs font-bold text-white mb-0.5">Check your current robots.txt</p>
                  <p className="text-xs text-white/40">The AI Visibility Scanner audits robots.txt as one of 14 signals.</p>
                </div>
                <Link href="/scanner" className="flex-shrink-0 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors whitespace-nowrap">
                  Free scan →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── llms.txt TAB ── */}
        {activeTab === 'llms' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-5">

              <div className="rounded-xl border p-4" style={{ background: 'rgba(251,191,36,0.04)', borderColor: 'rgba(251,191,36,0.15)' }}>
                <p className="text-xs font-bold text-yellow-400 mb-1">What is llms.txt?</p>
                <p className="text-xs text-white/45 leading-relaxed">
                  An emerging standard (<code className="text-white/60">llmstxt.org</code>) that helps AI assistants understand your site&apos;s content and permissions. Similar to robots.txt but designed for LLMs — no competitor combines both generators in one tool.
                </p>
              </div>

              <div className="rounded-2xl border p-6 space-y-4" style={sectionStyle}>
                <p className="text-xs font-bold uppercase tracking-widest text-white/30">Site Info</p>
                <div>
                  <label style={labelStyle}>Site Name *</label>
                  <input type="text" value={llmsSiteName} onChange={e => setLlmsSiteName(e.target.value)} placeholder="Queldrex" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Site URL</label>
                  <input type="text" value={llmsSiteUrl} onChange={e => setLlmsSiteUrl(e.target.value)} placeholder="queldrex.com" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea value={llmsDescription} onChange={e => setLlmsDescription(e.target.value)} placeholder="Queldrex is a free developer and business tools platform with 51 tools including AI visibility, security, and business utilities." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div>
                  <label style={labelStyle}>Primary Language</label>
                  <select value={llmsLanguage} onChange={e => setLlmsLanguage(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border p-6 space-y-4" style={sectionStyle}>
                <p className="text-xs font-bold uppercase tracking-widest text-white/30">Allowed LLM Uses</p>
                <div className="space-y-2">
                  {LLMS_USES.map(use => (
                    <button
                      key={use}
                      onClick={() => toggleLlmsUse(use)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all"
                      style={{
                        background: llmsUses.has(use) ? 'rgba(6,182,212,0.08)' : 'rgba(255,255,255,0.02)',
                        borderColor: llmsUses.has(use) ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.07)',
                      }}
                    >
                      <div className="w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center"
                        style={{
                          background: llmsUses.has(use) ? 'rgba(6,182,212,0.2)' : 'transparent',
                          borderColor: llmsUses.has(use) ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.2)',
                        }}>
                        {llmsUses.has(use) && (
                          <svg className="w-2.5 h-2.5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                          </svg>
                        )}
                      </div>
                      <span className="text-xs text-white/70">{use}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border p-6 space-y-4" style={sectionStyle}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30">Content Sections</p>
                  <button
                    onClick={() => setLlmsSections(s => [...s, { name: '', url: '', description: '' }])}
                    className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >+ Add Section</button>
                </div>
                {llmsSections.map((section, i) => (
                  <div key={i} className="rounded-xl border p-4 space-y-3" style={{ background: '#070b14', borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest">Section {i + 1}</span>
                      {llmsSections.length > 1 && (
                        <button onClick={() => setLlmsSections(s => s.filter((_, idx) => idx !== i))}
                          className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors">Remove</button>
                      )}
                    </div>
                    <input type="text" value={section.name} onChange={e => setLlmsSections(s => s.map((v, idx) => idx === i ? { ...v, name: e.target.value } : v))} placeholder="Tools" style={{ ...inputStyle, fontSize: 12 }} />
                    <input type="text" value={section.url} onChange={e => setLlmsSections(s => s.map((v, idx) => idx === i ? { ...v, url: e.target.value } : v))} placeholder="queldrex.com/tools" style={{ ...inputStyle, fontSize: 12 }} />
                    <input type="text" value={section.description} onChange={e => setLlmsSections(s => s.map((v, idx) => idx === i ? { ...v, description: e.target.value } : v))} placeholder="51 free developer and business tools" style={{ ...inputStyle, fontSize: 12 }} />
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border p-6" style={sectionStyle}>
                <label style={labelStyle}>Contact for AI Partnerships (optional)</label>
                <input type="email" value={llmsContact} onChange={e => setLlmsContact(e.target.value)} placeholder="hello@example.com" style={inputStyle} />
              </div>
            </div>

            {/* llms.txt output */}
            <div className="lg:sticky lg:top-24 h-fit space-y-4">
              <div className="rounded-2xl border overflow-hidden" style={sectionStyle}>
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/6">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30">llms.txt</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => download(llmsOutput, 'llms.txt')}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      Download
                    </button>
                    <button onClick={copyLlms}
                      className="text-xs font-bold px-4 py-1.5 rounded-lg transition-all"
                      style={{
                        background: llmsCopied ? 'rgba(74,222,128,0.15)' : 'rgba(6,182,212,0.15)',
                        color: llmsCopied ? '#4ade80' : '#06d6ff',
                        border: `1px solid ${llmsCopied ? 'rgba(74,222,128,0.3)' : 'rgba(6,182,212,0.3)'}`,
                      }}>
                      {llmsCopied ? 'Copied!' : 'Copy File'}
                    </button>
                  </div>
                </div>
                <pre className="p-5 text-xs text-white/65 overflow-auto max-h-[500px] leading-relaxed font-mono whitespace-pre-wrap">
                  {llmsOutput}
                </pre>
              </div>

              <div className="rounded-xl border p-4" style={{ background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.12)' }}>
                <p className="text-xs font-bold text-cyan-400 mb-1">How to deploy llms.txt</p>
                <p className="text-xs text-white/45 leading-relaxed">
                  Save as <code className="text-white/70">llms.txt</code> and place it at <code className="text-white/70">yoursite.com/llms.txt</code>. On Next.js, place it in the <code className="text-white/70">public/</code> folder. On Vercel, it&apos;s accessible immediately.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="mt-14 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-xl font-black text-white mb-1">How It Works</h2>
          <p className="text-white/35 text-sm mb-8">Control exactly which AI crawlers can access your site — and tell AI assistants what your site is about.</p>
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { n: '01', title: 'Choose a preset', body: 'Start with WordPress, Shopify, Next.js, or Block AI Training — or import your existing robots.txt from any URL.' },
              { n: '02', title: 'Toggle crawlers', body: 'Allow or block each of 18 AI crawlers individually. AI Search crawlers help visibility; AI Training crawlers use your content for model training.' },
              { n: '03', title: 'Test your rules', body: 'Use the URL simulator to test any path against your current rules before deploying — see exactly which bots can access it.' },
              { n: '04', title: 'Generate + deploy', body: 'Download robots.txt and llms.txt together. Upload both to your site root for complete AI crawler control.' },
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
