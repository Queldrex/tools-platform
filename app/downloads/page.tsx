import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { DOWNLOAD_PRODUCTS } from '@/lib/download-products'
import BuyButton from './BuyButton'

const CATEGORY_LABELS: Record<string, string> = {
  security: 'Security',
  business: 'Business',
  developer: 'Developer',
  legal: 'Legal',
}

const FILE_FORMAT_LABELS: Record<string, string> = {
  txt: 'Plain Text',
  csv: 'CSV Spreadsheet',
}

export const metadata = {
  title: 'Downloads — Queldrex',
  description: 'Checklists, templates, and playbooks. Buy once, use forever.',
}

export default function DownloadsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#09090B' }}>
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-20">
        <Link
          href="/"
          className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-12"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Home
        </Link>

        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6" style={{ borderColor: 'rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.08)' }}>
            <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#a78bfa' }}>Downloads</span>
          </div>
          <h1 className="text-5xl font-black text-white mb-4">Checklists and templates</h1>
          <p className="text-lg text-white/50 max-w-2xl">
            Practical resources built from real security audits, finance reviews, and developer workflows.
            Buy once. No subscription required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {DOWNLOAD_PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="rounded-2xl flex flex-col overflow-hidden"
              style={{
                background: '#111318',
                border: '1px solid rgba(255,255,255,0.07)',
                borderTop: `3px solid ${product.accent}`,
              }}
            >
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ background: `${product.accent}18`, color: product.accent }}
                  >
                    {CATEGORY_LABELS[product.category]}
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white">${product.price}</span>
                    <p className="text-[10px] text-white/30 mt-0.5">{FILE_FORMAT_LABELS[product.fileExt] ?? product.fileExt.toUpperCase()}</p>
                  </div>
                </div>

                <h2 className="text-lg font-black text-white mb-2">{product.name}</h2>
                <p className="text-sm text-white/50 mb-5 leading-relaxed">{product.tagline}</p>

                <ul className="space-y-2 mb-6 flex-1">
                  {product.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-white/50">
                      <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: product.accent }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="space-y-2">
                  <BuyButton productId={product.id} price={product.price} accent={product.accent} />
                  <p className="text-center text-[10px] text-white/25">One-time purchase. Instant download.</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border p-8 text-center" style={{ background: '#111318', borderColor: 'rgba(124,58,237,0.2)' }}>
          <h2 className="text-2xl font-black text-white mb-3">Need everything?</h2>
          <p className="text-white/50 mb-6 max-w-xl mx-auto">
            The Pro plan gives you unlimited access to all 51 tools. Combined with these downloads,
            it covers your full security, legal, and business workflow.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)' }}
          >
            View Pro Plan
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
