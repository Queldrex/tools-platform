import Link from 'next/link'

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-2">
          <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
            <div className="w-3.5 h-3.5 bg-slate-900 rounded-sm" />
          </div>
          <span className="font-bold tracking-tight">Queldrex</span>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Payment cancelled</h1>
          <p className="text-slate-500 mb-6">
            No charge was made. Your scan results are still available — head back to unlock your report whenever you&apos;re ready.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors w-full justify-center"
          >
            Back to Scanner
          </Link>
        </div>
      </main>
    </div>
  )
}
