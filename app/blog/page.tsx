import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getAllPosts } from '@/lib/blog/posts'

export const metadata: Metadata = {
  title: 'Blog — Queldrex',
  description: 'Guides, strategies, and deep dives on AI visibility and search optimization for businesses.',
  alternates: { canonical: 'https://queldrex.com/blog' },
  openGraph: {
    title: 'Blog — Queldrex',
    description: 'Guides, strategies, and deep dives on AI visibility and search optimization.',
    type: 'website',
  },
}

const CATEGORY_COLORS: Record<string, string> = {
  'Guide': 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25',
  'How-To': 'bg-green-500/15 text-green-400 border border-green-500/25',
  'Strategy': 'bg-violet-500/15 text-violet-400 border border-violet-500/25',
  'Deep Dive': 'bg-orange-500/15 text-orange-400 border border-orange-500/25',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-6 py-20">

          <div className="mb-14 text-center">
            <div className="inline-block text-xs font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-4"
              style={{ background: 'rgba(6,214,255,0.1)', color: '#06d6ff', border: '1px solid rgba(6,214,255,0.2)' }}>
              Resources
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Queldrex Blog
            </h1>
            <p className="text-white/55 text-lg max-w-xl mx-auto leading-relaxed">
              Guides, strategies, and deep dives on AI visibility and search optimization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col p-6 rounded-2xl border transition-all duration-200 hover:border-white/15 hover:-translate-y-0.5"
                style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[post.category] ?? 'bg-white/10 text-white/60'}`}>
                    {post.category}
                  </span>
                  <span className="text-xs text-white/30">{post.readTime} min read</span>
                </div>

                <h2 className="text-lg font-bold text-white leading-snug mb-3 group-hover:text-[#06d6ff] transition-colors">
                  {post.title}
                </h2>

                <p className="text-sm text-white/55 leading-relaxed flex-1 mb-4">
                  {post.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/6">
                  <span className="text-xs text-white/30">{formatDate(post.date)}</span>
                  <span className="text-xs font-semibold text-[#06d6ff] flex items-center gap-1">
                    Read article
                    <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
