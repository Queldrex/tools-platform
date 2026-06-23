'use client'
import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PaywallCard from '@/components/PaywallCard'

interface OGResult {
  url: string
  title: string | null
  description: string | null
  image: string | null
  siteName: string | null
  type: string
  twitterCard: string | null
  twitterTitle: string | null
  twitterDescription: string | null
  twitterImage: string | null
  canonical: string
  themeColor: string | null
  rawTags: { name: string; content: string }[]
  remaining: number
}

function truncate(s: string | null, max: number) {
  if (!s) return ''
  return s.length > max ? s.slice(0, max) + '…' : s
}

function getMissingOgSnippets(result: OGResult): Array<{ tag: string; snippet: string }> {
  const missing: Array<{ tag: string; snippet: string }> = []
  if (!result.title) missing.push({ tag: 'og:title', snippet: '<meta property="og:title" content="Your Page Title" />' })
  if (!result.description) missing.push({ tag: 'og:description', snippet: '<meta property="og:description" content="Your page description (120–160 chars)" />' })
  if (!result.image) missing.push({ tag: 'og:image', snippet: '<meta property="og:image" content="https://yourdomain.com/og-image.png" />' })
  if (!result.siteName) missing.push({ tag: 'og:site_name', snippet: '<meta property="og:site_name" content="Your Site Name" />' })
  if (!result.twitterCard) missing.push({ tag: 'twitter:card', snippet: '<meta name="twitter:card" content="summary_large_image" />' })
  return missing
}

function TwitterCard({ title, description, image, siteName, url }: { title: string | null; description: string | null; image: string | null; siteName: string | null; url: string }) {
  const domain = (() => { try { return new URL(url).hostname } catch { return url } })()
  return (
    <div className="rounded-xl overflow-hidden border" style={{ background: '#000', borderColor: '#2f3336', maxWidth: 504 }}>
      {image && <img src={image} alt="" className="w-full object-cover" style={{ maxHeight: 252 }} onError={e => (e.currentTarget.style.display = 'none')} />}
      <div className="px-3 py-2.5" style={{ background: '#000' }}>
        <p className="text-xs mb-0.5" style={{ color: '#71767b' }}>{domain}</p>
        <p className="text-sm font-bold text-white leading-snug">{truncate(title, 70) || '(no title)'}</p>
        {description && <p className="text-sm mt-0.5 leading-snug" style={{ color: '#71767b' }}>{truncate(description, 125)}</p>}
        {siteName && <p className="text-xs mt-1" style={{ color: '#71767b' }}>{siteName}</p>}
      </div>
    </div>
  )
}

function LinkedInCard({ title, description, image, siteName, url }: { title: string | null; description: string | null; image: string | null; siteName: string | null; url: string }) {
  const domain = (() => { try { return new URL(url).hostname } catch { return url } })()
  return (
    <div className="rounded-lg overflow-hidden border" style={{ background: '#1b1f23', borderColor: '#38434f', maxWidth: 520 }}>
      {image && <img src={image} alt="" className="w-full object-cover" style={{ maxHeight: 272 }} onError={e => (e.currentTarget.style.display = 'none')} />}
      <div className="px-4 py-3" style={{ background: '#1b1f23' }}>
        <p className="text-sm font-semibold text-white leading-snug mb-1">{truncate(title, 70) || '(no title)'}</p>
        {description && <p className="text-xs leading-snug mb-2" style={{ color: '#8b949e' }}>{truncate(description, 120)}</p>}
        <p className="text-xs uppercase tracking-wide" style={{ color: '#8b949e' }}>{siteName || domain}</p>
      </div>
    </div>
  )
}

function FacebookCard({ title, description, image, siteName, url }: { title: string | null; description: string | null; image: string | null; siteName: string | null; url: string }) {
  const domain = (() => { try { return new URL(url).hostname.toUpperCase() } catch { return url.toUpperCase() } })()
  return (
    <div className="rounded-lg overflow-hidden border" style={{ background: '#242526', borderColor: '#3e4042', maxWidth: 504 }}>
      {image && <img src={image} alt="" className="w-full object-cover" style={{ maxHeight: 261 }} onError={e => (e.currentTarget.style.display = 'none')} />}
      <div className="px-3 py-2.5" style={{ background: '#18191a', borderTop: '1px solid #3e4042' }}>
        <p className="text-xs uppercase tracking-wide mb-0.5" style={{ color: '#b0b3b8' }}>{siteName || domain}</p>
        <p className="text-sm font-bold text-white leading-snug">{truncate(title, 80) || '(no title)'}</p>
        {description && <p className="text-xs mt-0.5 leading-snug" style={{ color: '#b0b3b8' }}>{truncate(description, 110)}</p>}
      </div>
    </div>
  )
}

export default function OGPreviewerPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<OGResult | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)
  const [showRaw, setShowRaw] = useState(false)

  const check = async (urlArg?: string) => {
    const u = (urlArg ?? url).trim()
    if (!u) return
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    try {
      const res = await fetch('/api/tools/og-previewer', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: u }),
      })
      const data = await res.json()
      if (data.paywall || res.status === 402) { setPaywall(true); return }
      if (!res.ok) throw new Error(data.error || 'Failed to fetch URL')
      setResult(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to fetch URL') }
    finally { setLoading(false) }
  }

  const loadExample = () => {
    const ex = 'https://github.com'
    setUrl(ex)
    check(ex)
  }

  const ogScore = result ? [result.title, result.description, result.image, result.siteName].filter(Boolean).length : 0
  const ogScoreLabel = ogScore === 4 ? 'All tags present' : ogScore >= 2 ? 'Partial — some tags missing' : 'Poor — key tags missing'
  const ogScoreColor = ogScore === 4 ? '#4ade80' : ogScore >= 2 ? '#facc15' : '#f87171'

  return (
    <div className="min-h-screen" style={{ background: '#09090B' }}>
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/tools" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>All Tools
        </Link>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#60a5fa', borderColor: 'rgba(96,165,250,0.3)', background: 'rgba(96,165,250,0.08)' }}>Free Tool · No API Key · 5 checks/day</span>
        </div>

        <h1 className="text-4xl font-black text-white mb-3">OpenGraph <span style={{ color: '#60a5fa' }}>Preview</span></h1>
        <p className="text-white/55 text-base mb-5 max-w-2xl">See exactly how any URL looks when shared on Twitter/X, LinkedIn, and Facebook. Inspect every OG and Twitter Card meta tag your page is sending. License from $15, or get all 51 tools from $99.</p>
        <div className="flex gap-3 flex-wrap mb-8">
          <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#60a5fa,#2563eb)' }}>Get this tool — $15 →</Link>
          <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>All 51 tools — from $99 →</Link>
        </div>

        <div className="rounded-2xl border p-6 mb-6" style={{ background: '#111318', borderColor: 'rgba(255,255,255,0.08)' }}>
          <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">URL to inspect</label>
          <div className="flex gap-3">
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && check()}
              placeholder="https://yourwebsite.com/blog/your-post"
              className="flex-1 text-sm text-white placeholder-white/20 outline-none"
              style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 16px' }}
            />
            <button
              onClick={() => check()}
              disabled={loading || !url.trim()}
              className="px-5 py-3 rounded-xl text-sm font-black text-white transition-all hover:scale-[1.02] disabled:opacity-50 whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', boxShadow: '0 0 16px rgba(37,99,235,0.3)' }}
            >
              {loading ? 'Fetching…' : 'Preview'}
            </button>
          </div>
          <div className="flex justify-end mt-3">
            <button onClick={loadExample} disabled={loading} className="px-4 py-2 rounded-xl text-sm font-bold border transition-colors hover:bg-white/5 disabled:opacity-40" style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>
              Try Example → github.com
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>}
        {paywall && !loading && <PaywallCard toolId="og-previewer" toolName="OG Previewer" monthlyPrice={0} freeLimit={5} accent="#60a5fa" />}

        {result && (
          <div className="space-y-8">
            {/* Score */}
            <div className="rounded-xl border px-5 py-4 flex items-center gap-4" style={{ background: '#111318', borderColor: `${ogScoreColor}33` }}>
              <div className="text-3xl font-black" style={{ color: ogScoreColor }}>{ogScore}/4</div>
              <div>
                <div className="text-sm font-black text-white">{ogScoreLabel}</div>
                <div className="text-xs mt-0.5" style={{ color: '#A1A1AA' }}>OG tags present: {[result.title && 'title', result.description && 'description', result.image && 'image', result.siteName && 'site_name'].filter(Boolean).join(', ') || 'none'}</div>
              </div>
            </div>

            {/* Twitter/X */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white/35 mb-3">Twitter / X Preview</p>
              <TwitterCard title={result.twitterTitle} description={result.twitterDescription} image={result.twitterImage} siteName={result.siteName} url={result.url} />
              {!result.twitterCard && <p className="text-xs mt-2" style={{ color: '#facc15' }}>No twitter:card tag found — add &lt;meta name=&quot;twitter:card&quot; content=&quot;summary_large_image&quot;&gt; for large image previews.</p>}
            </div>

            {/* LinkedIn */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white/35 mb-3">LinkedIn Preview</p>
              <LinkedInCard title={result.title} description={result.description} image={result.image} siteName={result.siteName} url={result.url} />
            </div>

            {/* Facebook */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white/35 mb-3">Facebook Preview</p>
              <FacebookCard title={result.title} description={result.description} image={result.image} siteName={result.siteName} url={result.url} />
            </div>

            {/* Missing tags */}
            {getMissingOgSnippets(result).length > 0 && (
              <div className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(248,113,113,0.2)' }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-red-400/70 mb-3">Missing tags — add these to your &lt;head&gt;</p>
                <div className="space-y-2">
                  {getMissingOgSnippets(result).map(m => (
                    <div key={m.tag} className="flex items-start gap-2">
                      <code className="flex-1 text-[11px] font-mono text-white/40 break-all leading-relaxed">{m.snippet}</code>
                      <button onClick={() => navigator.clipboard.writeText(m.snippet)}
                        className="text-[10px] font-bold px-2 py-1 rounded flex-shrink-0 mt-0.5"
                        style={{ background: 'rgba(248,113,113,0.08)', color: '#f87171' }}>
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw tags */}
            <div>
              <button onClick={() => setShowRaw(v => !v)} className="text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-3" style={{ color: '#A1A1AA' }}>
                <svg className={`w-3.5 h-3.5 transition-transform ${showRaw ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                All meta tags ({result.rawTags.length})
              </button>
              {showRaw && (
                <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: '#0a0f1a' }}>
                        <th className="text-left px-4 py-2.5 font-black uppercase tracking-wider text-white/30 w-48">Name / Property</th>
                        <th className="text-left px-4 py-2.5 font-black uppercase tracking-wider text-white/30">Content</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.rawTags.map((tag, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? '#111318' : '#0a0f1a', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                          <td className="px-4 py-2.5 font-mono text-white/60 break-all">{tag.name}</td>
                          <td className="px-4 py-2.5 font-mono text-white/40 break-all">{tag.content}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        <section className="mt-16 pt-8 border-t max-w-2xl" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-lg font-black text-white mb-4">Who This Is For</h2>
          <ul className="space-y-2 mb-10">
            {[
              'Developers checking how shared links appear on Twitter/X, LinkedIn, and Facebook',
              'Content marketers ensuring og:image is set before a campaign launch',
              'SEO teams auditing social meta tags across landing pages',
              'Founders verifying their homepage card before a Product Hunt launch',
            ].map(item => (
              <li key={item} className="flex items-start gap-2 text-sm" style={{ color: '#A1A1AA' }}>
                <span className="mt-1 flex-shrink-0" style={{ color: '#60a5fa' }}>✓</span>{item}
              </li>
            ))}
          </ul>

          <h2 className="text-lg font-black text-white mb-4">Why OpenGraph tags matter</h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#A1A1AA' }}>When someone shares your URL on social media, the platform fetches your page and reads the og:title, og:description, og:image, and og:site_name meta tags to build the preview card. Without these tags, platforms fall back to guessing — often picking the wrong image or showing a blank card with just the URL. A compelling OG image and title can double the click-through rate on shared links.</p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#A1A1AA' }}>Twitter uses its own set of meta tags (twitter:card, twitter:title, twitter:description, twitter:image) but falls back to OG tags if the Twitter-specific ones are absent. Adding twitter:card with a value of summary_large_image enables the big image format — the one that takes up most of the tweet. Without it, you get a small thumbnail or no image at all.</p>
          <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>OG images should be 1200x630 pixels (1.91:1 ratio) for best compatibility across all platforms. LinkedIn caches previews aggressively — use their Post Inspector tool to force a re-scrape after you update your tags. Facebook similarly caches for 24 hours unless you submit the URL to their Sharing Debugger. This tool fetches live, so it always shows your current tags without cache interference.</p>
        </section>
        <div className="mt-14 rounded-2xl border p-6 text-center" style={{ background: 'rgba(6,214,255,0.04)', borderColor: 'rgba(6,214,255,0.12)' }}>
          <p className="text-white font-black mb-1">Add OG tag previewing to your platform</p>
          <p className="text-white/40 text-sm mb-4">Twitter/LinkedIn/Facebook previews, OG score, missing tag snippets. One-time license.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Get this tool — $15 →</Link>
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>All 51 tools — from $99 →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
