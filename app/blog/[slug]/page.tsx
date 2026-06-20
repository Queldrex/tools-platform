import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getAllPosts, getPost } from '@/lib/blog/posts'

export async function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return {
    title: `${post.title} — Queldrex`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
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

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-16">

          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-10">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12"/>
            </svg>
            Blog
          </Link>

          <div className="flex items-center gap-3 mb-5">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[post.category] ?? 'bg-white/10 text-white/60'}`}>
              {post.category}
            </span>
            <span className="text-xs text-white/30">{post.readTime} min read</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">
            {post.title}
          </h1>

          <p className="text-sm text-white/35 mb-6">{formatDate(post.date)}</p>

          <p className="text-lg text-white/65 leading-relaxed mb-8 border-l-2 border-[#06d6ff]/40 pl-5">
            {post.description}
          </p>

          <hr className="border-white/8 mb-10" />

          <style>{`
            .prose-content h2 { font-size: 1.25rem; font-weight: 700; color: #fff; margin-top: 2rem; margin-bottom: 0.75rem; }
            .prose-content h3 { font-size: 1rem; font-weight: 700; color: #fff; margin-top: 1.5rem; margin-bottom: 0.5rem; }
            .prose-content p { color: rgba(255,255,255,0.65); line-height: 1.75; margin-bottom: 1rem; }
            .prose-content ul, .prose-content ol { color: rgba(255,255,255,0.65); padding-left: 1.25rem; margin-bottom: 1rem; }
            .prose-content li { line-height: 1.75; margin-bottom: 0.25rem; }
            .prose-content strong { color: #fff; font-weight: 600; }
            .prose-content a { color: #06d6ff; text-decoration: none; }
            .prose-content a:hover { color: #38bdf8; }
            .prose-content code { font-family: monospace; font-size: 0.85em; color: #06d6ff; background: rgba(6,214,255,0.08); padding: 0.1em 0.4em; border-radius: 4px; }
          `}</style>

          <div
            className="prose-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-16 rounded-2xl p-8 text-center" style={{ background: '#0d1117', border: '1px solid rgba(6,214,255,0.2)' }}>
            <p className="text-white/50 text-sm uppercase tracking-widest font-bold mb-3">Free Tool</p>
            <h2 className="text-2xl font-black text-white mb-3">
              Ready to check your AI Visibility Score?
            </h2>
            <p className="text-white/55 text-sm mb-6 max-w-sm mx-auto">
              See exactly how ChatGPT and Perplexity see your business. Takes 60 seconds, free to run.
            </p>
            <Link
              href="/scanner"
              className="inline-flex items-center gap-2 text-sm font-black text-black px-6 py-3 rounded-xl transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 24px rgba(6,182,212,0.3)' }}
            >
              Scan Your Site Free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
