import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

async function getScan(scanId: string) {
  try {
    const { getScan: fetchScan } = await import('@/lib/store/redis')
    return await fetchScan(scanId)
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ scanId: string }> }): Promise<Metadata> {
  const { scanId } = await params
  const scan = await getScan(scanId)
  if (!scan) return { title: 'Score Not Found — Queldrex' }
  return {
    title: `${scan.businessInfo.domain} scored ${scan.score}/100 for AI visibility — Queldrex`,
    description: `See how ${scan.businessInfo.domain} ranks for ChatGPT, Claude, and Perplexity visibility. Get your own free AI visibility scan at queldrex.com.`,
    openGraph: {
      title: `${scan.businessInfo.domain}: ${scan.score}/100 AI Visibility Score`,
      description: `${Object.values(scan.checks).filter(Boolean).length} of 8 AI signals passing. Get your free scan at queldrex.com/scanner`,
    },
  }
}

export default async function SharePage({ params }: { params: Promise<{ scanId: string }> }) {
  const { scanId } = await params
  const scan = await getScan(scanId)

  if (!scan) notFound()

  const passing = Object.values(scan.checks).filter(Boolean).length
  const scoreColor = scan.score >= 70 ? '#22c55e' : scan.score >= 40 ? '#f59e0b' : '#ef4444'
  const scoreLabel = scan.score >= 70 ? 'GOOD' : scan.score >= 40 ? 'NEEDS WORK' : 'CRITICAL'

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center px-4 py-16" style={{ background: '#070b14' }}>
      {/* Score card */}
      <div className="w-full max-w-sm rounded-2xl border border-white/8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/6" style={{ background: 'linear-gradient(135deg,rgba(6,182,212,0.07) 0%,transparent 100%)' }}>
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-400/70 mb-1">Queldrex AI Visibility Score</p>
          <p className="text-lg font-black text-white truncate">{scan.businessInfo.domain}</p>
        </div>

        {/* Score */}
        <div className="px-6 py-8 text-center">
          <div className="text-7xl font-black mb-1" style={{ color: scoreColor }}>{scan.score}</div>
          <div className="text-white/30 text-lg font-bold mb-3">/ 100</div>
          <div className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider" style={{ background: `${scoreColor}20`, color: scoreColor, border: `1px solid ${scoreColor}40` }}>
            {scoreLabel}
          </div>
        </div>

        {/* Signal summary */}
        <div className="px-6 pb-5">
          <div className="grid grid-cols-4 gap-2 mb-5">
            {(Object.entries(scan.checks) as [string, boolean][]).map(([key, pass]) => (
              <div key={key} className="rounded-lg p-2 text-center" style={{ background: pass ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${pass ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.07)'}` }}>
                <div className={`text-base ${pass ? 'text-green-400' : 'text-red-400/60'}`}>{pass ? '✓' : '✗'}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/40 text-center">{passing} of 8 AI signals passing</p>
        </div>

        {/* CTA */}
        <div className="px-6 pb-6">
          <Link
            href="/scanner"
            className="block w-full text-center py-3 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}
          >
            Get Your Free Scan →
          </Link>
          <p className="text-center text-white/25 text-xs mt-3">Free · No account needed · Results in 30 seconds</p>
        </div>
      </div>

      <p className="mt-6 text-white/20 text-xs">
        Scanned {new Date(scan.createdAt).toLocaleDateString()} · <Link href="/" className="hover:text-white/40 transition-colors">queldrex.com</Link>
      </p>
    </div>
  )
}
