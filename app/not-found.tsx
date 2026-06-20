import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function NotFound() {
  return (
    <div className="min-h-screen text-white" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-32 text-center">
        <p className="text-cyan-500 text-xs font-bold uppercase tracking-widest mb-4">404</p>
        <h1 className="text-5xl font-black text-white mb-4">Page not found</h1>
        <p className="text-white/40 mb-10 text-lg">That URL doesn&apos;t exist. Try scanning your site for AI visibility instead.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/" className="px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm transition-colors">
            Go home
          </Link>
          <Link href="/scanner" className="px-6 py-3 rounded-lg border border-white/10 hover:border-white/25 text-white/60 hover:text-white text-sm transition-colors">
            Run a free scan
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
