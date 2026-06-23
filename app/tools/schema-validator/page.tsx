'use client'
import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface SchemaResult { '@type': string; valid: boolean; errors: string[]; warnings: string[]; properties: string[] }
interface UrlResult {
  url: string
  aiVisibilityScore: number
  schemasFound: number
  typesFound: string[]
  missingHighValueTypes: string[]
  recommendations: string[]
  schemas: SchemaResult[]
  hasMicrodata: boolean
  checkedAt: string
}

interface ParsedBlock {
  type: string
  raw: Record<string, unknown>
  errors: Array<{ msg: string; fix: string }>
  warnings: Array<{ msg: string; fix: string }>
  properties: string[]
}

interface PasteResult {
  grade: string
  gradeLabel: string
  blocks: ParsedBlock[]
  conflicts: string[]
  eatSignals: Array<{ label: string; present: boolean }>
}

const HIGH_IMPACT_TYPES = new Set(['Organization','Article','LocalBusiness','NewsArticle','Product'])
const MED_IMPACT_TYPES = new Set(['Recipe','JobPosting','Event','VideoObject','Course','SoftwareApplication','PodcastEpisode'])
const DEPRECATED_TYPES = new Set(['FAQPage','HowTo'])

function citationImpact(type: string): { label: string; color: string } {
  if (HIGH_IMPACT_TYPES.has(type)) return { label: 'High AI Citation Impact', color: '#4ade80' }
  if (MED_IMPACT_TYPES.has(type)) return { label: 'Medium AI Citation Impact', color: '#facc15' }
  if (DEPRECATED_TYPES.has(type)) return { label: 'Low — Rich Results Removed', color: '#94a3b8' }
  return { label: 'Low AI Citation Impact', color: '#94a3b8' }
}

function get(obj: unknown, path: string): unknown {
  const parts = path.split('.')
  let cur: unknown = obj
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[p]
  }
  return cur
}

function validateBlock(raw: Record<string, unknown>): { errors: Array<{ msg: string; fix: string }>; warnings: Array<{ msg: string; fix: string }> } {
  const errors: Array<{ msg: string; fix: string }> = []
  const warnings: Array<{ msg: string; fix: string }> = []
  const type = raw['@type'] as string

  const req = (field: string, fix: string) => {
    if (!get(raw, field)) errors.push({ msg: `Missing required: ${field}`, fix })
  }
  const rec = (field: string, fix: string) => {
    if (!get(raw, field)) warnings.push({ msg: `Recommended: ${field} missing`, fix })
  }

  if (['Article','NewsArticle'].includes(type)) {
    req('headline', 'Add: "headline": "Your Article Title"')
    req('image', 'Add: "image": "https://yoursite.com/image.jpg"')
    req('datePublished', `Add: "datePublished": "${new Date().toISOString().split('T')[0]}"`)
    req('author', 'Add: "author": { "@type": "Person", "name": "Your Name" }')
    req('publisher', 'Add: "publisher": { "@type": "Organization", "name": "Your Site", "logo": { "@type": "ImageObject", "url": "https://yoursite.com/logo.png" } }')
    rec('dateModified', `Add: "dateModified": "${new Date().toISOString().split('T')[0]}"`)
    rec('description', 'Add: "description": "A brief summary of the article"')
  } else if (type === 'LocalBusiness') {
    req('name', 'Add: "name": "Your Business Name"')
    req('url', 'Add: "url": "https://yourbusiness.com"')
    rec('description', 'Add: "description": "What your business does"')
    rec('aggregateRating', 'Add: "aggregateRating": { "@type": "AggregateRating", "ratingValue": 4.8, "reviewCount": 120 }')
    rec('sameAs', 'Add: "sameAs": ["https://facebook.com/yourbiz", "https://linkedin.com/company/yourbiz"]')
  } else if (type === 'Product') {
    req('name', 'Add: "name": "Product Name"')
    req('offers', 'Add: "offers": { "@type": "Offer", "price": "29.99", "priceCurrency": "USD" }')
    rec('image', 'Add: "image": "https://yoursite.com/product.jpg"')
    rec('description', 'Add: "description": "Product description"')
    rec('aggregateRating', 'Add: "aggregateRating": { "@type": "AggregateRating", "ratingValue": 4.5, "reviewCount": 80 }')
  } else if (type === 'Event') {
    req('name', 'Add: "name": "Event Name"')
    req('startDate', `Add: "startDate": "${new Date().toISOString().split('T')[0]}"`)
    req('location', 'Add: "location": { "@type": "Place", "name": "Venue Name", "address": { "@type": "PostalAddress", "streetAddress": "123 Main St" } }')
    rec('description', 'Add: "description": "Event description"')
  } else if (type === 'Recipe') {
    req('name', 'Add: "name": "Recipe Name"')
    req('image', 'Add: "image": "https://yoursite.com/recipe.jpg"')
    req('recipeIngredient', 'Add: "recipeIngredient": ["1 cup flour", "2 eggs"]')
    req('recipeInstructions', 'Add: "recipeInstructions": [{ "@type": "HowToStep", "text": "Step instructions" }]')
    rec('aggregateRating', 'Add: "aggregateRating": { "@type": "AggregateRating", "ratingValue": 4.7, "reviewCount": 50 }')
  } else if (type === 'JobPosting') {
    req('title', 'Add: "title": "Job Title"')
    req('description', 'Add: "description": "Full job description"')
    req('datePosted', `Add: "datePosted": "${new Date().toISOString().split('T')[0]}"`)
    req('hiringOrganization', 'Add: "hiringOrganization": { "@type": "Organization", "name": "Company Name" }')
    req('jobLocation', 'Add: "jobLocation": { "@type": "Place", "address": { "@type": "PostalAddress", "addressLocality": "City", "addressRegion": "State", "addressCountry": "US" } }')
  } else if (type === 'FAQPage') {
    req('mainEntity', 'Add: "mainEntity": [{ "@type": "Question", "name": "Q?", "acceptedAnswer": { "@type": "Answer", "text": "A." } }]')
    warnings.push({ msg: 'Google removed FAQPage rich results in May 2026', fix: 'Schema still helps AI citations (ChatGPT, Perplexity) but no longer generates rich snippets in Google Search.' })
  } else if (type === 'HowTo') {
    req('name', 'Add: "name": "How to Do Something"')
    req('step', 'Add: "step": [{ "@type": "HowToStep", "name": "Step 1", "text": "Do this" }]')
    warnings.push({ msg: 'Google removed HowTo rich results in May 2026', fix: 'Schema still helps AI citations but no longer generates rich snippets in Google Search.' })
  } else if (type === 'VideoObject') {
    req('name', 'Add: "name": "Video Title"')
    req('description', 'Add: "description": "Video description"')
    req('thumbnailUrl', 'Add: "thumbnailUrl": "https://yoursite.com/thumb.jpg"')
    req('uploadDate', `Add: "uploadDate": "${new Date().toISOString().split('T')[0]}"`)
  } else if (type === 'BreadcrumbList') {
    req('itemListElement', 'Add: "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://yoursite.com" }]')
    const items = raw['itemListElement']
    if (Array.isArray(items)) {
      const positions = items.map((it: unknown) => typeof it === 'object' && it !== null ? (it as Record<string,unknown>)['position'] : null).filter(p => typeof p === 'number') as number[]
      const sorted = [...positions].sort((a,b) => a-b)
      for (let i = 0; i < sorted.length; i++) {
        if (sorted[i] !== i + 1) { errors.push({ msg: `BreadcrumbList positions skip numbers (found ${sorted.join(',')})`, fix: 'Position values must be sequential: 1, 2, 3...' }); break }
      }
    }
  } else if (type === 'Organization') {
    req('name', 'Add: "name": "Organization Name"')
    rec('description', 'Add: "description": "What the organization does"')
    rec('sameAs', 'Add: "sameAs": ["https://linkedin.com/company/yourorg"]')
  } else if (type === 'WebSite') {
    req('name', 'Add: "name": "Site Name"')
    req('url', 'Add: "url": "https://yoursite.com"')
  } else if (type === 'SoftwareApplication') {
    req('name', 'Add: "name": "App Name"')
    req('applicationCategory', 'Add: "applicationCategory": "BusinessApplication"')
    req('offers', 'Add: "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }')
  } else if (type === 'Course') {
    req('name', 'Add: "name": "Course Name"')
    req('description', 'Add: "description": "Course description"')
    req('provider', 'Add: "provider": { "@type": "Organization", "name": "Provider Name" }')
  } else if (type === 'PodcastEpisode') {
    req('name', 'Add: "name": "Episode Title"')
    req('partOfSeries', 'Add: "partOfSeries": { "@type": "PodcastSeries", "name": "Show Name" }')
  }

  if (!get(raw, 'description') && !['BreadcrumbList','WebSite','FAQPage','BreadcrumbList'].includes(type) && errors.every(e => !e.msg.includes('description')) && warnings.every(w => !w.msg.includes('description'))) {
    rec('description', 'Add: "description": "A brief description of this content"')
  }

  return { errors, warnings }
}

function calcEeat(blocks: ParsedBlock[]): Array<{ label: string; present: boolean }> {
  const allRaw = blocks.map(b => b.raw)
  const check = (path: string) => allRaw.some(r => get(r, path) != null)
  return [
    { label: 'Author with URL (author.url)', present: check('author.url') },
    { label: 'Author with sameAs (author.sameAs)', present: check('author.sameAs') },
    { label: 'Publisher with logo (publisher.logo)', present: check('publisher.logo') },
    { label: 'Organization foundingDate', present: check('foundingDate') },
    { label: 'Organization numberOfEmployees', present: check('numberOfEmployees') },
    { label: 'dateModified present', present: check('dateModified') },
  ]
}

function calcGrade(blocks: ParsedBlock[], conflicts: string[]): { grade: string; gradeLabel: string } {
  const totalErrors = blocks.reduce((s, b) => s + b.errors.length, 0) + conflicts.length
  const totalWarnings = blocks.reduce((s, b) => s + b.warnings.filter(w => !w.msg.includes('removed')).length, 0)
  const hasHighImpact = blocks.some(b => HIGH_IMPACT_TYPES.has(b.type))
  const hasAuthorPub = blocks.some(b => get(b.raw, 'author') || get(b.raw, 'publisher'))
  const totalRec = blocks.reduce((s, b) => s + b.warnings.filter(w => !w.msg.includes('removed')).length + (b.warnings.length > 0 ? 1 : 0), 0)
  const filledRatio = totalRec === 0 ? 1 : Math.max(0, 1 - totalWarnings / Math.max(totalRec, 1))

  if (totalErrors >= 3) return { grade: 'F', gradeLabel: 'Critical issues — rich results blocked' }
  if (totalErrors >= 1) return { grade: 'D', gradeLabel: 'Errors present — fix required for rich results' }
  if (totalErrors === 0 && filledRatio >= 0.8 && hasHighImpact && hasAuthorPub) return { grade: 'A', gradeLabel: 'Excellent — strong AI citation and rich result signals' }
  if (totalErrors === 0 && filledRatio >= 0.6 && hasHighImpact) return { grade: 'B', gradeLabel: 'Good — eligible for rich results, some signals missing' }
  return { grade: 'C', gradeLabel: 'Valid but missing recommended fields — improve for better AI visibility' }
}

function validatePaste(code: string): PasteResult | { parseError: string } {
  let parsed: unknown
  try { parsed = JSON.parse(code) } catch (e) {
    return { parseError: `Invalid JSON: ${e instanceof Error ? e.message : String(e)}. Check for missing commas, unclosed brackets, or trailing commas.` }
  }
  const rawBlocks: Record<string, unknown>[] = Array.isArray(parsed) ? parsed as Record<string,unknown>[] : [parsed as Record<string,unknown>]
  const blocks: ParsedBlock[] = rawBlocks.map(raw => {
    const type = (raw['@type'] as string) || 'Unknown'
    const { errors, warnings } = validateBlock(raw)
    const properties = Object.keys(raw).filter(k => k !== '@context')
    return { type, raw, errors, warnings, properties }
  })

  const conflicts: string[] = []
  const typeCounts: Record<string, number> = {}
  blocks.forEach(b => { typeCounts[b.type] = (typeCounts[b.type] || 0) + 1 })
  Object.entries(typeCounts).forEach(([t, c]) => {
    if (c > 1) conflicts.push(`Duplicate @type "${t}" found ${c} times — may confuse crawlers`)
  })

  const ids = blocks.map(b => b.raw['@id']).filter(Boolean)
  const idSet = new Set(ids)
  if (ids.length !== idSet.size) conflicts.push('Duplicate @id values detected — each schema block should have a unique @id')

  const eatSignals = calcEeat(blocks)
  const { grade, gradeLabel } = calcGrade(blocks, conflicts)
  return { grade, gradeLabel, blocks, conflicts, eatSignals }
}

function gradeColor(g: string) {
  if (g === 'A') return '#4ade80'
  if (g === 'B') return '#06d6ff'
  if (g === 'C') return '#facc15'
  if (g === 'D') return '#fb923c'
  return '#f87171'
}

function diffJsonBlocks(a: string, b: string): Array<{ key: string; status: 'added' | 'removed' | 'changed' | 'same'; valA?: string; valB?: string }> {
  let objA: Record<string,unknown> = {}
  let objB: Record<string,unknown> = {}
  try { objA = JSON.parse(a) } catch {}
  try { objB = JSON.parse(b) } catch {}
  const keys = new Set([...Object.keys(objA), ...Object.keys(objB)])
  const rows: Array<{ key: string; status: 'added'|'removed'|'changed'|'same'; valA?: string; valB?: string }> = []
  keys.forEach(k => {
    const va = JSON.stringify(objA[k] ?? undefined)
    const vb = JSON.stringify(objB[k] ?? undefined)
    if (!(k in objA)) rows.push({ key: k, status: 'added', valB: vb })
    else if (!(k in objB)) rows.push({ key: k, status: 'removed', valA: va })
    else if (va !== vb) rows.push({ key: k, status: 'changed', valA: va, valB: vb })
    else rows.push({ key: k, status: 'same', valA: va })
  })
  return rows
}

function ScoreRing({ score }: { score: number }) {
  const r = 44; const c = 2 * Math.PI * r
  const color = score >= 70 ? '#4ade80' : score >= 40 ? '#facc15' : '#f87171'
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
      <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={`${(score / 100) * c} ${c}`} strokeDashoffset={c * 0.25} style={{ transition: 'stroke-dasharray 0.6s ease' }}/>
      <text x="60" y="56" textAnchor="middle" fill="white" fontSize="26" fontWeight="900" fontFamily="inherit">{score}</text>
      <text x="60" y="72" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10" fontWeight="700" fontFamily="inherit">/ 100</text>
    </svg>
  )
}

const inputStyle: React.CSSProperties = { background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 16px', color: 'white', fontSize: 13, outline: 'none', width: '100%' }

export default function SchemaValidatorPage() {
  const [mode, setMode] = useState<'paste' | 'url'>('paste')

  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [urlResult, setUrlResult] = useState<UrlResult | null>(null)
  const [urlError, setUrlError] = useState('')
  const [paywall, setPaywall] = useState(false)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const [pasteCode, setPasteCode] = useState('')
  const [pasteResult, setPasteResult] = useState<PasteResult | null>(null)
  const [pasteError, setPasteError] = useState('')
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set())
  const [expandedFixes, setExpandedFixes] = useState<Set<string>>(new Set())
  const [showDiff, setShowDiff] = useState(false)
  const [diffA, setDiffA] = useState('')
  const [diffB, setDiffB] = useState('')
  const [diffResult, setDiffResult] = useState<ReturnType<typeof diffJsonBlocks> | null>(null)

  const analyze = async () => {
    if (!url.trim()) return
    setLoading(true); setUrlError(''); setUrlResult(null); setPaywall(false)
    try {
      const res = await fetch('/api/tools/schema-validator', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (data.paywall || res.status === 402) { setPaywall(true); return }
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setUrlResult(data)
    } catch (e) { setUrlError(e instanceof Error ? e.message : 'Analysis failed') }
    finally { setLoading(false) }
  }

  const toggle = (i: number) => setExpanded(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n })
  const toggleBlock = (i: number) => setExpandedBlocks(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n })
  const toggleFix = (k: string) => setExpandedFixes(s => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n })

  const validateCode = () => {
    setPasteError('')
    setPasteResult(null)
    if (!pasteCode.trim()) { setPasteError('Paste your JSON-LD schema above'); return }
    const res = validatePaste(pasteCode)
    if ('parseError' in res) { setPasteError(res.parseError); return }
    setPasteResult(res)
  }

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/tools" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>All Tools
        </Link>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#06d6ff', borderColor: 'rgba(6,214,255,0.3)', background: 'rgba(6,214,255,0.08)' }}>AI Visibility</span>
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#4ade80', borderColor: 'rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.08)' }}>Free — Paste Mode</span>
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#a78bfa', borderColor: 'rgba(167,139,250,0.3)', background: 'rgba(167,139,250,0.08)' }}>Pro — URL Mode</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">Schema.org <span style={{ color: '#06d6ff' }}>AI Visibility Validator</span></h1>
        <p className="text-white/55 text-base mb-2 max-w-xl">Paste any JSON-LD schema and get an instant health grade, AI citation score, E-E-A-T analysis, and fix suggestions. Free to validate here — license this tool from <strong className="text-white">$29</strong> or get all 51 tools from <strong className="text-white">$99</strong>.</p>
        <div className="flex gap-3 mb-8">
          <Link href="/pricing" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Get this tool — $29</Link>
          <Link href="/pricing" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black border" style={{ color: '#06d6ff', borderColor: 'rgba(6,214,255,0.3)', background: 'rgba(6,214,255,0.05)' }}>All 51 tools — from $99</Link>
        </div>

        <div className="flex gap-1 mb-6">
          {(['paste','url'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className="px-5 py-2 rounded-lg text-xs font-black transition-all"
              style={{ background: mode === m ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)', color: mode === m ? '#06d6ff' : 'rgba(255,255,255,0.4)', border: `1px solid ${mode === m ? 'rgba(6,182,212,0.35)' : 'rgba(255,255,255,0.08)'}` }}>
              {m === 'paste' ? 'Paste Code — Free' : 'Analyze URL — Pro'}
            </button>
          ))}
        </div>

        {mode === 'paste' && (
          <div className="space-y-5">
            <div className="rounded-2xl border p-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Paste JSON-LD Schema</label>
              <textarea value={pasteCode} onChange={e => setPasteCode(e.target.value)} rows={12}
                placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "Article",\n  "headline": "My Article"\n}'}
                className="font-mono text-xs text-white/80 placeholder-white/15 resize-y outline-none"
                style={{ ...inputStyle, lineHeight: 1.7 }} />
              <button onClick={validateCode} className="mt-4 w-full py-3 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.01]"
                style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 16px rgba(6,214,255,0.25)' }}>
                Validate Schema
              </button>
            </div>

            {pasteError && (
              <div className="rounded-xl border px-5 py-4" style={{ background: 'rgba(248,113,113,0.06)', borderColor: 'rgba(248,113,113,0.25)' }}>
                <p className="text-sm text-red-400 font-mono">{pasteError}</p>
              </div>
            )}

            {pasteResult && (
              <div className="space-y-4">
                <div className="rounded-2xl border p-6 flex items-center gap-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-2" style={{ borderColor: gradeColor(pasteResult.grade), background: `${gradeColor(pasteResult.grade)}12` }}>
                    <span className="text-4xl font-black" style={{ color: gradeColor(pasteResult.grade) }}>{pasteResult.grade}</span>
                  </div>
                  <div>
                    <p className="text-lg font-black text-white mb-1">Schema Health Grade</p>
                    <p className="text-sm text-white/50">{pasteResult.gradeLabel}</p>
                    <p className="text-xs text-white/30 mt-1">{pasteResult.blocks.length} schema block{pasteResult.blocks.length !== 1 ? 's' : ''} · {pasteResult.blocks.reduce((s,b)=>s+b.errors.length,0)} errors · {pasteResult.blocks.reduce((s,b)=>s+b.warnings.length,0)} warnings</p>
                  </div>
                </div>

                {pasteResult.conflicts.length > 0 && (
                  <div className="rounded-xl border px-5 py-4 space-y-2" style={{ background: 'rgba(251,191,36,0.04)', borderColor: 'rgba(251,191,36,0.2)' }}>
                    <p className="text-xs font-black uppercase tracking-widest text-amber-400 mb-2">Schema Conflicts</p>
                    {pasteResult.conflicts.map((c, i) => (
                      <p key={i} className="text-xs text-amber-300 flex items-start gap-2"><span className="flex-shrink-0">⚠</span>{c}</p>
                    ))}
                  </div>
                )}

                {pasteResult.blocks.map((block, bi) => {
                  const impact = citationImpact(block.type)
                  const isOpen = expandedBlocks.has(bi)
                  return (
                    <div key={bi} className="rounded-xl border overflow-hidden" style={{ borderColor: block.errors.length > 0 ? 'rgba(248,113,113,0.2)' : 'rgba(74,222,128,0.15)' }}>
                      <button onClick={() => toggleBlock(bi)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02]">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs font-black px-2 py-0.5 rounded" style={{ background: block.errors.length > 0 ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)', color: block.errors.length > 0 ? '#f87171' : '#4ade80', border: `1px solid ${block.errors.length > 0 ? 'rgba(248,113,113,0.2)' : 'rgba(74,222,128,0.2)'}` }}>{block.errors.length > 0 ? `${block.errors.length} Error${block.errors.length>1?'s':''}` : 'Valid'}</span>
                          <span className="font-black text-white font-mono text-sm">{block.type}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: impact.color, background: `${impact.color}15`, border: `1px solid ${impact.color}30` }}>{impact.label}</span>
                          {DEPRECATED_TYPES.has(block.type) && <span className="text-[10px] text-amber-400/70">Rich results removed May 2026</span>}
                        </div>
                        <svg className={`w-4 h-4 text-white/30 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                      </button>
                      {isOpen && (
                        <div className="border-t px-5 py-4 space-y-3" style={{ background: '#0a0f1a', borderColor: 'rgba(255,255,255,0.05)' }}>
                          {block.errors.map((e, j) => {
                            const fk = `e-${bi}-${j}`
                            return (
                              <div key={j} className="space-y-1">
                                <div className="text-xs text-red-400 flex items-start gap-2"><span className="flex-shrink-0 mt-0.5">✕</span>{e.msg}</div>
                                <button onClick={() => toggleFix(fk)} className="text-[10px] font-bold text-white/30 hover:text-white/50 ml-4">
                                  {expandedFixes.has(fk) ? '▲ Hide fix' : '▼ How to fix'}
                                </button>
                                {expandedFixes.has(fk) && <p className="ml-4 text-[11px] text-white/50 font-mono bg-white/[0.03] rounded px-3 py-2">{e.fix}</p>}
                              </div>
                            )
                          })}
                          {block.warnings.map((w, j) => {
                            const fk = `w-${bi}-${j}`
                            return (
                              <div key={j} className="space-y-1">
                                <div className="text-xs text-yellow-400 flex items-start gap-2"><span className="flex-shrink-0 mt-0.5">!</span>{w.msg}</div>
                                <button onClick={() => toggleFix(fk)} className="text-[10px] font-bold text-white/30 hover:text-white/50 ml-4">
                                  {expandedFixes.has(fk) ? '▲ Hide fix' : '▼ How to fix'}
                                </button>
                                {expandedFixes.has(fk) && <p className="ml-4 text-[11px] text-white/50 font-mono bg-white/[0.03] rounded px-3 py-2">{w.fix}</p>}
                              </div>
                            )
                          })}
                          {block.errors.length === 0 && block.warnings.length === 0 && (
                            <p className="text-xs text-green-400">All required and recommended fields present.</p>
                          )}
                          <div>
                            <p className="text-xs font-black text-white/30 mb-1.5 uppercase tracking-wider">Properties</p>
                            <div className="flex flex-wrap gap-1.5">{block.properties.map(p => <span key={p} className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>{p}</span>)}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

                <div className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <p className="text-xs font-black uppercase tracking-widest text-white/35 mb-3">E-E-A-T Signals <span className="normal-case font-normal text-white/20">— {pasteResult.eatSignals.filter(s=>s.present).length}/{pasteResult.eatSignals.length} present</span></p>
                  <div className="space-y-2 mb-3">
                    {pasteResult.eatSignals.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span style={{ color: s.present ? '#4ade80' : '#f87171' }}>{s.present ? '✓' : '✗'}</span>
                        <span style={{ color: s.present ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)' }}>{s.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-white/25">E-E-A-T signals improve AI citation likelihood and Google trust scores.</p>
                </div>

                <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  <button onClick={() => setShowDiff(s => !s)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02]" style={{ background: '#0d1117' }}>
                    <p className="text-xs font-black uppercase tracking-widest text-white/40">Compare Two Versions</p>
                    <svg className={`w-4 h-4 text-white/30 transition-transform ${showDiff ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                  </button>
                  {showDiff && (
                    <div className="border-t px-5 py-5 space-y-4" style={{ background: '#0a0f1a', borderColor: 'rgba(255,255,255,0.05)' }}>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-bold text-white/30 mb-2">Version A</p>
                          <textarea value={diffA} onChange={e => setDiffA(e.target.value)} rows={8} placeholder='{"@type":"Article","headline":"Old Title"}' className="font-mono text-xs text-white/70 resize-y outline-none" style={{ ...inputStyle }} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white/30 mb-2">Version B</p>
                          <textarea value={diffB} onChange={e => setDiffB(e.target.value)} rows={8} placeholder='{"@type":"Article","headline":"New Title"}' className="font-mono text-xs text-white/70 resize-y outline-none" style={{ ...inputStyle }} />
                        </div>
                      </div>
                      <button onClick={() => setDiffResult(diffJsonBlocks(diffA, diffB))} className="px-5 py-2 rounded-xl text-xs font-black text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Compare</button>
                      {diffResult && (
                        <div className="space-y-1 mt-2">
                          {diffResult.filter(r => r.status !== 'same').map((r, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs font-mono rounded px-3 py-1.5" style={{ background: r.status === 'added' ? 'rgba(74,222,128,0.08)' : r.status === 'removed' ? 'rgba(248,113,113,0.08)' : 'rgba(251,191,36,0.08)' }}>
                              <span style={{ color: r.status === 'added' ? '#4ade80' : r.status === 'removed' ? '#f87171' : '#facc15', flexShrink: 0 }}>{r.status === 'added' ? '+' : r.status === 'removed' ? '−' : '~'}</span>
                              <span className="text-white/50">{r.key}:</span>
                              {r.status === 'changed' && <><span className="text-red-400 line-through">{r.valA}</span><span className="text-green-400 ml-1">{r.valB}</span></>}
                              {r.status === 'added' && <span className="text-green-400">{r.valB}</span>}
                              {r.status === 'removed' && <span className="text-red-400">{r.valA}</span>}
                            </div>
                          ))}
                          {diffResult.every(r => r.status === 'same') && <p className="text-xs text-white/40">No differences found.</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'url' && (
          <div>
            <div className="rounded-2xl border p-6 mb-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Page URL</label>
              <div className="flex gap-3">
                <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && analyze()}
                  placeholder="https://example.com/your-page" className="flex-1 text-sm text-white placeholder-white/20 outline-none"
                  style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 16px' }} />
                <button onClick={analyze} disabled={loading || !url.trim()}
                  className="px-5 py-3 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.02] disabled:opacity-50 whitespace-nowrap"
                  style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 16px rgba(6,214,255,0.25)' }}>
                  {loading ? 'Fetching…' : 'Analyze'}
                </button>
              </div>
            </div>

            {urlError && <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-6 text-sm text-red-400">{urlError}</div>}
            {paywall && !loading && (
              <div className="rounded-2xl border p-8 text-center mb-6" style={{ background: 'rgba(6,214,255,0.05)', borderColor: 'rgba(6,214,255,0.2)' }}>
                <h3 className="text-xl font-black text-white mb-2">Full AI visibility monitoring with Pro</h3>
                <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">Pro includes monthly AI visibility scans across your entire site, schema recommendations, and competitor benchmarking.</p>
                <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>See Pricing</Link>
              </div>
            )}

            {urlResult && (
              <div className="space-y-4">
                <div className="rounded-2xl border p-6 flex gap-6 items-center" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <ScoreRing score={urlResult.aiVisibilityScore} />
                  <div className="flex-1">
                    <div className="text-lg font-black text-white mb-1">AI Visibility Score</div>
                    <div className="text-xs text-white/40 mb-3">Based on Schema.org structured data extracted from your page</div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>{urlResult.schemasFound} schema{urlResult.schemasFound !== 1 ? 's' : ''} found</span>
                      {urlResult.hasMicrodata && <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>Microdata present</span>}
                      {urlResult.typesFound.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: 'rgba(6,214,255,0.08)', color: '#06d6ff', border: '1px solid rgba(6,214,255,0.2)' }}>{t}</span>)}
                    </div>
                  </div>
                </div>
                {urlResult.recommendations.length > 0 && (
                  <div className="rounded-xl border px-5 py-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="text-xs font-black uppercase tracking-widest text-white/35 mb-3">AI Visibility Recommendations</div>
                    <ul className="space-y-2">{urlResult.recommendations.map((r, i) => <li key={i} className="text-sm text-white/65 flex items-start gap-2"><span style={{ color: '#06d6ff' }} className="flex-shrink-0 mt-0.5">→</span>{r}</li>)}</ul>
                  </div>
                )}
                {urlResult.missingHighValueTypes.length > 0 && (
                  <div className="rounded-xl border px-5 py-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="text-xs font-black uppercase tracking-widest text-white/35 mb-3">High-Value Schema Types You&apos;re Missing</div>
                    <div className="flex flex-wrap gap-2">{urlResult.missingHighValueTypes.map(t => <span key={t} className="text-xs px-3 py-1 rounded-full font-mono" style={{ background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>{t}</span>)}</div>
                  </div>
                )}
                {urlResult.schemas.map((s, i) => (
                  <div key={i} className="rounded-xl border overflow-hidden" style={{ borderColor: s.valid ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)' }}>
                    <button onClick={() => toggle(i)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02]">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black px-2 py-0.5 rounded" style={{ background: s.valid ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', color: s.valid ? '#4ade80' : '#f87171', border: `1px solid ${s.valid ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}` }}>{s.valid ? 'Valid' : 'Issues'}</span>
                        <span className="font-black text-white font-mono text-sm">{s['@type']}</span>
                      </div>
                      <svg className={`w-4 h-4 text-white/30 transition-transform ${expanded.has(i) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                    </button>
                    {expanded.has(i) && (
                      <div className="border-t px-5 py-4 space-y-3" style={{ background: '#0a0f1a', borderColor: 'rgba(255,255,255,0.05)' }}>
                        {s.errors.map((e, j) => <div key={j} className="text-xs text-red-400 flex gap-2"><span>✕</span>{e}</div>)}
                        {s.warnings.map((w, j) => <div key={j} className="text-xs text-yellow-400 flex gap-2"><span>!</span>{w}</div>)}
                        <div><div className="text-xs font-black text-white/30 mb-1.5 uppercase tracking-wider">Properties</div>
                          <div className="flex flex-wrap gap-1.5">{s.properties.map(p => <span key={p} className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>{p}</span>)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div className="rounded-xl border px-5 py-4" style={{ background: 'rgba(6,214,255,0.04)', borderColor: 'rgba(6,214,255,0.15)' }}>
                  <p className="text-xs text-white/50">Want a full AI visibility report across your entire site? <Link href="/pricing" className="font-bold text-cyan-400 hover:underline">Queldrex Pro</Link> monitors all your pages monthly and tracks how often you appear in AI-generated answers.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
