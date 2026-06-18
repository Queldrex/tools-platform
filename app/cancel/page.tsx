import Link from 'next/link'
import QueldrexLogo from '@/components/Logo'

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col">
      <header className="border-b border-white/5" style={{ background: '#070b14' }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center">
          <Link href="/"><QueldrexLogo size="sm" /></Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-white/30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Payment cancelled</h1>
          <p className="text-white/40 text-sm mb-7">
            No charge was made. Your scan results are still available — head back to unlock your report whenever you&apos;re ready.
          </p>
          <Link
            href="/scanner"
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-3.5 rounded-xl transition-colors w-full justify-center"
          >
            Back to Scanner
          </Link>
        </div>
      </main>
    </div>
  )
}
