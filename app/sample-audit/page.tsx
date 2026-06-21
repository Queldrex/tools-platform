import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Sample AI Visibility Audit — Queldrex',
  description: 'See exactly what a Queldrex AI Visibility Scanner report looks like. Real signals, real recommendations, real results.',
}

const SIGNALS = [
  { name: 'Schema Markup', status: 'pass', note: 'LocalBusiness schema detected' },
  { name: 'Google Business Profile', status: 'pass', note: 'Verified listing found' },
  { name: 'NAP Consistency', status: 'pass', note: 'Name / address / phone consistent across web' },
  { name: 'Review Signals', status: 'pass', note: '4.8 stars · 127 Google reviews' },
  { name: 'Service Area Pages', status: 'pass', note: 'Denver, Lakewood, Aurora covered' },
  { name: 'AI Crawlability', status: 'fail', note: 'robots.txt is blocking AI crawlers' },
  { name: 'Citation Network', status: 'fail', note: 'Listed in only 2 of 15 key directories' },
  { name: 'FAQ Structured Data', status: 'fail', note: 'No FAQ schema found on any page' },
  { name: 'Mention Velocity', status: 'fail', note: 'No citations found in any AI platform' },
  { name: 'Knowledge Panel', status: 'fail', note: 'No Google Knowledge Panel detected' },
  { name: 'Topical Authority', status: 'partial', note: '3 relevant blog posts — needs 10+' },
  { name: 'Content Freshness', status: 'partial', note: 'Site last updated 4 months ago' },
  { name: 'E-E-A-T Signals', status: 'partial', note: 'About page exists — no certifications or credentials shown' },
  { name: 'AI Platform Test', status: 'partial', note: 'Found in Perplexity results — not found in ChatGPT' },
]

const TOP_3 = [
  {
    rank: 1,
    title: 'Fix robots.txt to allow AI crawlers',
    impact: 'Critical',
    color: '#f87171',
    detail: 'Your robots.txt is blocking GPTBot, ClaudeBot, PerplexityBot, and other AI crawlers. This is the single biggest reason AI assistants can\'t find you. Add explicit Allow rules for these bots.',
    fix: 'Add to robots.txt: User-agent: GPTBot / Allow: / — repeat for ClaudeBot, PerplexityBot, GoogleOther.',
  },
  {
    rank: 2,
    title: 'Add FAQ structured data to key pages',
    impact: 'High',
    color: '#fb923c',
    detail: 'FAQ schema is one of the strongest signals for AI recommendation. AI assistants read FAQ structured data to understand what questions your business answers. No FAQ schema = invisible to question-based AI searches.',
    fix: 'Add FAQ JSON-LD schema to your homepage and service pages. The full report includes generated schema ready to copy-paste.',
  },
  {
    rank: 3,
    title: 'Build out your citation network',
    impact: 'High',
    color: '#fbbf24',
    detail: 'You\'re listed in 2 of 15 key directories. AI systems cross-reference directory listings to verify a business is real and trustworthy. Yelp, Angi, HomeAdvisor, BBB, and Houzz are all missing.',
    fix: 'Create verified profiles on: Yelp, Angi, HomeAdvisor, Houzz, BBB, Thumbtack, Nextdoor, and local chamber directories.',
  },
]

function StatusBadge({ status }: { status: string }) {
  if (status === 'pass') return (
    <span className="flex items-center gap-1.5 text-xs font-bold text-green-400">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      Pass
    </span>
  )
  if (status === 'fail') return (
    <span className="flex items-center gap-1.5 text-xs font-bold text-red-400">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
      Fail
    </span>
  )
  return (
    <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      Partial
    </span>
  )
}

const pass = SIGNALS.filter(s => s.status === 'pass').length
const partial = SIGNALS.filter(s => s.status === 'partial').length
const fail = SIGNALS.filter(s => s.status === 'fail').length

export default function SampleAuditPage() {
  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />

      {/* HEADER */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold tracking-wider uppercase mb-6" style={{ borderColor: 'rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.07)', color: '#fbbf24' }}>
          Sample Report · Queldrex AI Visibility Scanner
        </div>
        <h1 className="text-3xl lg:text-4xl font-black text-white mb-2">Sunrise Plumbing — Denver, CO</h1>
        <p className="text-white/40 text-sm mb-8">This is an example report showing what you receive after scanning your business.</p>

        {/* SCORE */}
        <div className="rounded-2xl border p-8 flex flex-col sm:flex-row items-center gap-8" style={{ background: '#0d1117', borderColor: 'rgba(251,191,36,0.25)', boxShadow: '0 0 40px rgba(251,191,36,0.05)' }}>
          <div className="text-center flex-shrink-0">
            <div className="text-8xl font-black leading-none mb-1" style={{ color: '#fbbf24' }}>61</div>
            <div className="text-white/35 text-sm">/100</div>
          </div>
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#fbbf24', borderColor: 'rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.08)' }}>
              Moderate AI Visibility
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              AI assistants can partially find this business but miss it in most queries. 5 critical signals are failing, preventing full AI search coverage.
            </p>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-xl font-black text-green-400">{pass}</div>
                <div className="text-xs text-white/30">Passing</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-black text-amber-400">{partial}</div>
                <div className="text-xs text-white/30">Partial</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-black text-red-400">{fail}</div>
                <div className="text-xs text-white/30">Failing</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 14 SIGNALS */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <p className="text-xs font-bold tracking-[0.28em] uppercase text-white/30 mb-5">14 Signal Checks</p>
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          {SIGNALS.map((signal, i) => (
            <div
              key={signal.name}
              className="flex items-center justify-between gap-4 px-5 py-4"
              style={{
                background: i % 2 === 0 ? '#0d1117' : 'rgba(255,255,255,0.01)',
                borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
            >
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-white">{signal.name}</span>
              </div>
              <div className="text-xs text-white/35 hidden sm:block flex-1 text-center">{signal.note}</div>
              <div className="flex-shrink-0 w-20 flex justify-end">
                <StatusBadge status={signal.status} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TOP 3 IMPROVEMENTS */}
      <section className="border-t border-white/5 py-14" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs font-bold tracking-[0.28em] uppercase text-white/30 mb-2">Top 3 Improvements</p>
          <p className="text-white/45 text-sm mb-8">Fix these first. They have the highest impact on AI visibility.</p>
          <div className="space-y-4">
            {TOP_3.map((item) => (
              <div key={item.rank} className="rounded-2xl border p-6" style={{ background: '#0d1117', borderColor: `${item.color}22` }}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: `${item.color}18`, color: item.color }}>
                    {item.rank}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-black text-white">{item.title}</h3>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: `${item.color}18`, color: item.color }}>
                        {item.impact}
                      </span>
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed mb-3">{item.detail}</p>
                    <div className="rounded-lg px-3 py-2.5 text-xs text-white/40 leading-relaxed" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span className="font-bold text-white/60">Fix: </span>{item.fix}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT HAPPENS NEXT */}
      <section className="max-w-4xl mx-auto px-6 py-14">
        <p className="text-xs font-bold tracking-[0.28em] uppercase text-white/30 mb-6">What the Full Report Includes</p>
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {[
            { title: 'Generated llms.txt file', desc: 'Ready to deploy. Tells AI crawlers exactly how to index your business.' },
            { title: 'LocalBusiness JSON-LD schema', desc: 'Paste into your site. Immediate structured data for all AI platforms.' },
            { title: 'Fix instructions for every signal', desc: 'Step-by-step guides for all 14 signals, not just the top 3.' },
            { title: 'Full HTML report', desc: 'Professional report you can share with clients, partners, or your team.' },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border p-5 flex gap-3" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
              <svg className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="text-sm font-bold text-white mb-1">{item.title}</p>
                <p className="text-xs text-white/45 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: 'linear-gradient(135deg,rgba(6,182,212,0.07),rgba(6,182,212,0.02))', border: '1px solid rgba(6,182,212,0.2)' }}
        >
          <p className="text-white font-black text-xl mb-2">Scan your business. Free.</p>
          <p className="text-white/50 text-sm mb-6">
            See your real score in 30 seconds. Full fix package with generated files delivered to your email — $399 one-time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/scanner"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-black text-black"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 24px rgba(6,182,212,0.3)' }}
            >
              Scan Your Business Free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/pricing" className="text-sm text-white/40 hover:text-white transition-colors">
              See pricing →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
