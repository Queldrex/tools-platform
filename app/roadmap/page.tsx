import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Product Roadmap — Queldrex',
  description: 'See what Queldrex has shipped, what\'s in progress, and what\'s coming next. Real tools, real timelines.',
}

const SHIPPED = [
  { name: 'AI Visibility Scanner', desc: '14-signal analysis, PDF report, email delivery — $149 one-time' },
  { name: 'AI Visibility Monitor', desc: '$29/month, monthly automated rescans, score drop alerts' },
  { name: 'Agency Plan', desc: '$99/month — 25 client scans, white-label PDF reports, bulk dashboard, magic-link auth' },
  { name: 'AI Citation Tracker', desc: 'Directly asks ChatGPT if it knows your business — shows competitors, improvement steps' },
  { name: 'Shareable Scan Results', desc: 'One-click Twitter/LinkedIn score cards with dynamic OG images for every scan' },
  { name: 'Threat Intelligence Feed', desc: 'Real-time URLhaus + Feodo Tracker data, Redis-cached, category filtered' },
  { name: 'Breach Lookup', desc: 'HIBP password check (k-anonymity) + 7-point domain security scan' },
  { name: 'Vibe Coding Security Shield', desc: 'AI-generated code vulnerability scanner — 14 OWASP security pattern checks' },
  { name: 'API Schema Drift Scanner', desc: 'OpenAPI spec comparison — breaking vs additive change detection' },
  { name: 'Database Migration Safety Checker', desc: 'SQL migration risk analysis — catches DROP, DELETE, and lock issues' },
  { name: 'Directory Extractor', desc: 'Sitemap-based site structure mapping with tree view and JSON/CSV export' },
  { name: 'Admin Triage System', desc: 'Ticket management, DFY client pipeline, security monitoring, TOTP 2FA' },
  { name: 'Custom Build Services', desc: 'Project intake, quote system, Redis-backed pipeline management' },
  { name: 'AppSumo Landing Page', desc: 'Lifetime deal page at /appsumo — ready for listing submission' },
  { name: 'ProductHunt Launch Page', desc: 'Conversion-optimized launch page at /producthunt — ready for launch day' },
  { name: 'Blog (5 SEO Articles)', desc: 'AI visibility content hub — what-is, how-to, strategy, ChatGPT deep dive' },
  { name: 'Portfolio & Case Studies', desc: '6 real case studies of shipped software at /portfolio' },
  { name: 'Referral Program', desc: 'Referral codes, /r/[code] landing pages, Redis-tracked conversion attribution' },
  { name: 'Contact Page', desc: 'Validated contact form with admin notification and auto-reply' },
  { name: 'llms.txt + AI Crawler Permissions', desc: 'Site now practices what it sells — llms.txt live, all AI crawlers explicitly allowed' },
]

const IN_PROGRESS = [
  { name: 'Competitor AI Visibility Gap', desc: 'Side-by-side comparison of your AI visibility vs named competitors on all 14 signals' },
  { name: 'Bulk Agency Scanner', desc: 'Scan all 25 agency clients in one run with scheduled monthly execution and auto-delivery' },
  { name: 'AppSumo Listing', desc: 'Application submitted — waiting on AppSumo approval for AI Visibility Scanner lifetime deal' },
]

const PLANNED = [
  { name: 'Local Business AI Pack', desc: 'One-click generate schema, llms.txt, and citation strategy for any local business category' },
  { name: 'SEO ↔ AI Signal Correlation Report', desc: 'Show which SEO changes affect AI visibility scores — close the loop between classic SEO and AI search' },
  { name: 'WordPress Plugin', desc: 'Embed the AI Visibility Scanner directly in client WordPress dashboards' },
  { name: 'API Access', desc: 'Programmatic access to the scanner and tools for agencies and developers' },
  { name: 'Colorado Government / Enterprise Edition', desc: 'Compliance-focused AI visibility auditing for government agencies and large organizations' },
]

export default function RoadmapPage() {
  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />

      <section className="max-w-3xl mx-auto px-6 pt-16 pb-10">
        <p className="text-xs font-bold tracking-[0.28em] uppercase text-cyan-500 mb-4">Product Roadmap</p>
        <h1 className="text-4xl font-black text-white mb-4">What we&rsquo;ve built. What&rsquo;s next.</h1>
        <p className="text-white/50 text-base leading-relaxed">
          A live view of Queldrex product development. Updated continuously.
        </p>
      </section>

      {/* SHIPPED */}
      <section className="max-w-3xl mx-auto px-6 pb-12">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" style={{ boxShadow: '0 0 8px rgba(74,222,128,0.6)' }} />
          <p className="text-sm font-black text-green-400 uppercase tracking-wider">Shipped</p>
          <span className="text-xs text-white/25">{SHIPPED.length} items</span>
        </div>
        <div className="space-y-2">
          {SHIPPED.map((item) => (
            <div
              key={item.name}
              className="rounded-xl border px-5 py-4 flex items-start gap-4"
              style={{ background: 'rgba(74,222,128,0.04)', borderColor: 'rgba(74,222,128,0.12)' }}
            >
              <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="text-sm font-bold text-white mb-0.5">{item.name}</p>
                <p className="text-xs text-white/45 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* IN PROGRESS */}
      <section className="border-t border-white/5 py-12" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#06d6ff', boxShadow: '0 0 8px rgba(6,182,212,0.7)' }} />
            <p className="text-sm font-black uppercase tracking-wider" style={{ color: '#06d6ff' }}>In Progress</p>
            <span className="text-xs text-white/25">{IN_PROGRESS.length} items</span>
          </div>
          <div className="space-y-2">
            {IN_PROGRESS.map((item) => (
              <div
                key={item.name}
                className="rounded-xl border px-5 py-4 flex items-start gap-4"
                style={{ background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.15)' }}
              >
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#06d6ff' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-white mb-0.5">{item.name}</p>
                  <p className="text-xs text-white/45 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANNED */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-2.5 h-2.5 rounded-full border-2 border-white/25" />
          <p className="text-sm font-black text-white/50 uppercase tracking-wider">Planned</p>
          <span className="text-xs text-white/25">{PLANNED.length} items</span>
        </div>
        <div className="space-y-2">
          {PLANNED.map((item) => (
            <div
              key={item.name}
              className="rounded-xl border px-5 py-4 flex items-start gap-4"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <svg className="w-4 h-4 text-white/20 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-bold text-white/70 mb-0.5">{item.name}</p>
                <p className="text-xs text-white/35 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="border-t border-white/5 py-14" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-3xl mx-auto px-6">
          <div
            className="rounded-2xl border p-8"
            style={{ background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.15)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Our Philosophy</span>
            </div>
            <p className="text-white/65 text-sm leading-relaxed">
              We build real tools that do real things. No mockups, no simulated data, no vaporware. Every item in Shipped works today. Every item in In Progress has code written. Every item in Planned exists because customers asked for it.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
