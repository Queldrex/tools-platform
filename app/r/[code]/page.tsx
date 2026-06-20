import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getReferralCode } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ code: string }> }

export default async function ReferralPage({ params }: Props) {
  const { code } = await params
  const upper = code.toUpperCase()

  const ref = await getReferralCode(upper)

  if (!ref) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#070b14' }}>
        <div className="text-center max-w-sm">
          <p className="text-white/30 text-sm mb-4">This referral link is invalid or expired.</p>
          <Link href="/" className="text-sm font-bold" style={{ color: '#06d6ff' }}>Go to queldrex.com →</Link>
        </div>
      </div>
    )
  }

  // Set referral cookie server-side
  const cookieStore = await cookies()
  cookieStore.set('referral_code', upper, { maxAge: 60 * 60 * 24 * 30, path: '/', httpOnly: false })

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#070b14' }}>
      <div className="max-w-lg w-full text-center">

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase mb-8" style={{ borderColor: 'rgba(6,212,255,0.25)', background: 'rgba(6,212,255,0.08)', color: '#06d6ff' }}>
          You were invited
        </div>

        <h1 className="text-3xl font-black text-white mb-4 leading-tight">
          Find Out If ChatGPT<br />Can Recommend Your Business
        </h1>

        <p className="text-white/55 text-base leading-relaxed mb-10">
          A friend is sharing a tool that checks how visible your business is to AI search engines like ChatGPT, Perplexity, and Google AI. Free scan — no account needed.
        </p>

        <ul className="text-left space-y-3 mb-10 max-w-sm mx-auto">
          {[
            '14 signals checked in under 60 seconds',
            'See exactly why AI ignores your business',
            'Get a full fix plan for $149 — or just see the score free',
          ].map(item => (
            <li key={item} className="flex items-start gap-3 text-sm text-white/65">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="#06d6ff" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {item}
            </li>
          ))}
        </ul>

        <Link
          href="/scanner"
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-black text-black"
          style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 32px rgba(6,212,255,0.35)' }}
        >
          Scan My Site Free
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>

        <p className="text-white/25 text-xs mt-6">No account · No credit card · 60-second scan</p>
        <p className="text-white/15 text-xs mt-2">queldrex.com · Castle Rock, Colorado</p>
      </div>
    </div>
  )
}
