import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getDownloadProduct } from '@/lib/download-products'
import { getRedis } from '@/lib/store/redis'
import BuyButton from '../BuyButton'

export async function generateMetadata({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params
  const product = getDownloadProduct(productId)
  if (!product) return { title: 'Not Found' }
  return {
    title: `${product.name} — Queldrex Downloads`,
    description: product.description,
  }
}

export default async function DownloadProductPage({ params, searchParams }: {
  params: Promise<{ productId: string }>
  searchParams: Promise<{ purchased?: string }>
}) {
  const { productId } = await params
  const { purchased } = await searchParams
  const product = getDownloadProduct(productId)
  if (!product) notFound()

  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(`queldrex_download_${productId}`)?.value ?? ''

  let hasAccess = false
  let downloadToken = ''
  if (cookieToken) {
    const stored = await getRedis().get<string>(`download_product:${cookieToken}`)
    if (stored === productId) {
      hasAccess = true
      downloadToken = cookieToken
    }
  }

  const CATEGORY_LABELS: Record<string, string> = {
    security: 'Security',
    business: 'Business',
    developer: 'Developer',
    legal: 'Legal',
  }

  return (
    <div className="min-h-screen" style={{ background: '#09090B' }}>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-20">
        <Link
          href="/downloads"
          className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-12"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          All Downloads
        </Link>

        {purchased && hasAccess && (
          <div className="rounded-xl border border-green-900/50 bg-green-950/20 px-5 py-4 mb-8 flex items-center gap-3">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm text-green-300 font-bold">Purchase complete. Your download is ready below.</p>
          </div>
        )}

        <div className="mb-8">
          <span
            className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full inline-block mb-4"
            style={{ background: `${product.accent}18`, color: product.accent }}
          >
            {CATEGORY_LABELS[product.category]}
          </span>
          <h1 className="text-4xl font-black text-white mb-3">{product.name}</h1>
          <p className="text-lg text-white/50 leading-relaxed">{product.description}</p>
        </div>

        <div className="rounded-2xl border p-6 mb-8" style={{ background: '#111318', borderColor: 'rgba(255,255,255,0.07)', borderTop: `3px solid ${product.accent}` }}>
          <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-4">What is included</p>
          <ul className="space-y-3">
            {product.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: product.accent }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {hasAccess ? (
          <div className="rounded-2xl border p-6 text-center" style={{ background: 'rgba(74,222,128,0.05)', borderColor: 'rgba(74,222,128,0.2)' }}>
            <svg className="w-10 h-10 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-black text-white mb-2">Ready to download</h2>
            <p className="text-sm text-white/45 mb-6">Your purchase is saved in this browser for 1 year. Bookmark this page to re-download anytime.</p>
            <a
              href={`/api/download/product/${downloadToken}`}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black text-black transition-all hover:opacity-90"
              style={{ background: product.accent }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download {product.name}
            </a>
          </div>
        ) : (
          <div className="rounded-2xl border p-6" style={{ background: '#111318', borderColor: 'rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-3xl font-black text-white">${product.price}</p>
                <p className="text-sm text-white/40">One-time purchase. Instant download.</p>
              </div>
              <div className="text-right text-xs text-white/30 space-y-1">
                <p>Stripe-secured checkout</p>
                <p>No subscription</p>
                <p>Re-download anytime</p>
              </div>
            </div>
            <BuyButton productId={product.id} price={product.price} accent={product.accent} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
