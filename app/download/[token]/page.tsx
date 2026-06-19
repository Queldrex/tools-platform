import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getScanByToken } from '@/lib/store/redis'
import QueldrexLogo from '@/components/Logo'

export const dynamic = 'force-dynamic'

export const metadata = {
  robots: 'noindex, nofollow',
  title: 'Your AI Visibility Report — Queldrex',
}

const FILES = [
  {
    key: 'llms.txt',
    label: 'llms.txt',
    fixes: 'llms.txt signal (+25 pts)',
    desc: 'Upload to your website root. Tells ChatGPT, Claude, and Perplexity exactly what your business does.',
    steps: ['Upload to your website root (same folder as your homepage)', 'Verify it\'s live by visiting your-domain.com/llms.txt in your browser'],
    color: '#06b6d4',
  },
  {
    key: 'robots.txt',
    label: 'robots.txt',
    fixes: 'Crawler Access signal (+5 pts)',
    desc: 'Permits all AI bots to read your site. Upload to your website root.',
    steps: ['Upload to your website root', 'Verify at your-domain.com/robots.txt'],
    color: '#8b5cf6',
  },
  {
    key: 'sitemap.xml',
    label: 'sitemap.xml',
    fixes: 'Sitemap signal (+10 pts)',
    desc: 'Helps AI crawlers discover all your pages. Add your other pages then upload to root.',
    steps: ['Open the file and add your other page URLs following the pattern inside', 'Upload to your website root', 'Verify at your-domain.com/sitemap.xml'],
    color: '#10b981',
  },
  {
    key: 'schema-install.html',
    label: 'schema-install.html',
    fixes: 'JSON-LD (+15 pts) + LocalBusiness (+20 pts)',
    desc: 'Open this file, copy the <script> block, and paste it into your site\'s <head> on every page.',
    steps: ['Open the file in a text editor', 'Copy everything inside (the <script type="application/ld+json"> block)', 'Paste it into the <head> section of every page — or use Yoast/Rank Math in WordPress, theme.liquid in Shopify'],
    color: '#f59e0b',
  },
  {
    key: 'og-and-canonical.html',
    label: 'og-and-canonical.html',
    fixes: 'AI Metadata (+10 pts) + Canonical URL (+5 pts)',
    desc: 'Open this file, copy all the <meta> and <link> tags, paste into your site\'s <head>.',
    steps: ['Open the file in a text editor', 'Copy all the <meta> and <link rel="canonical"> tags', 'Paste into the <head> of every page — same location as the schema above'],
    color: '#ef4444',
  },
]

export default async function DownloadPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const scan = await getScanByToken(token)

  if (!scan) notFound()

  const scoreColor = scan.score >= 70 ? '#16a34a' : scan.score >= 40 ? '#d97706' : '#dc2626'
  const baseUrl = `/api/download/${token}`

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      {/* Header */}
      <header className="border-b border-white/5" style={{ background: '#070b14' }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/"><QueldrexLogo size="sm" /></Link>
          <span className="text-xs text-white/30">Private — do not share this link</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 pb-24">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/25 bg-green-500/8 text-green-400 text-xs font-bold tracking-widest uppercase mb-6">
            Order Complete
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            {scan.businessInfo.name || scan.businessInfo.domain}
          </h1>
          <p className="text-white/45 text-sm mb-6">AI Visibility Report — ready to install</p>

          {/* Score */}
          <div className="inline-flex flex-col items-center px-10 py-5 rounded-2xl border border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Current Score</span>
            <span className="text-5xl font-black" style={{ color: scoreColor }}>{scan.score}<span className="text-2xl text-white/30">/100</span></span>
          </div>
        </div>

        {/* Download All */}
        <a
          href={baseUrl}
          className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-black text-black text-base mb-3 transition-all hover:scale-[1.01]"
          style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 32px rgba(6,182,212,0.25)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Everything (ZIP — all 8 files)
        </a>
        <p className="text-center text-xs text-white/25 mb-10">Or download files individually below</p>

        {/* Individual files */}
        <div className="space-y-4 mb-10">
          {FILES.map((f) => (
            <div
              key={f.key}
              className="rounded-2xl border p-5"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <code className="text-sm font-bold" style={{ color: f.color }}>{f.label}</code>
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">fixes {f.fixes}</span>
                  </div>
                  <p className="text-white/55 text-xs leading-relaxed mb-3">{f.desc}</p>
                  <ol className="space-y-0.5">
                    {f.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-white/35">
                        <span className="font-bold text-white/20 flex-shrink-0 mt-0.5">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
                <a
                  href={`${baseUrl}?file=${f.key}`}
                  className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-black transition-all hover:scale-[1.03]"
                  style={{ background: f.color }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Report + Recs */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <a
            href={`${baseUrl}?file=report.html`}
            className="flex items-center gap-3 p-4 rounded-xl border border-white/8 hover:border-white/15 transition-colors"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            <svg className="w-8 h-8 text-white/20 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <div>
              <div className="text-sm font-bold text-white/70">report.html</div>
              <div className="text-xs text-white/35">Full score breakdown — open in browser</div>
            </div>
          </a>
          <a
            href={`${baseUrl}?file=recommendations.md`}
            className="flex items-center gap-3 p-4 rounded-xl border border-white/8 hover:border-white/15 transition-colors"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            <svg className="w-8 h-8 text-white/20 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
            <div>
              <div className="text-sm font-bold text-white/70">recommendations.md</div>
              <div className="text-xs text-white/35">Prioritized fix checklist</div>
            </div>
          </a>
        </div>

        {/* Re-scan prompt */}
        <div
          className="rounded-2xl border p-6 text-center"
          style={{ background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.15)' }}
        >
          <p className="text-white/60 text-sm mb-4">
            After installing, rescan your site to verify your new score. DNS and crawl caches typically update within 24–48 hours.
          </p>
          <Link
            href="/scanner"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}
          >
            Rescan My Site →
          </Link>
        </div>

        <p className="text-center text-xs text-white/20 mt-8">
          This link is private and expires in 7 days. Questions?{' '}
          <a href="mailto:hello@queldrex.com" className="text-white/35 hover:text-white transition-colors">hello@queldrex.com</a>
        </p>
      </main>
    </div>
  )
}
