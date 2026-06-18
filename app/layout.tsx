import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Queldrex — Software Tools for the AI-First Web',
  description: 'Queldrex builds precision software tools that help businesses become visible to AI systems like ChatGPT, Perplexity, and Google AI. One-time payment. No subscriptions.',
  keywords: 'AI visibility, llms.txt, AI search optimization, ChatGPT SEO, Perplexity SEO, AI readiness, structured data, JSON-LD, queldrex',
  openGraph: {
    title: 'Queldrex — Software Tools for the AI-First Web',
    description: 'Precision software tools that help businesses become visible to AI search. One-time payment, instant delivery.',
    type: 'website',
    url: 'https://queldrex.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Queldrex — Software Tools for the AI-First Web',
    description: 'Precision software tools that help businesses become visible to AI search.',
    site: '@queldrex',
  },
  robots: { index: true, follow: true },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://queldrex.com/#organization',
      name: 'Queldrex LLC',
      url: 'https://queldrex.com',
      description: 'Queldrex LLC builds precision software tools for businesses operating in the AI-first web.',
      email: 'hello@queldrex.com',
      sameAs: ['https://x.com/queldrex'],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://queldrex.com/#website',
      url: 'https://queldrex.com',
      name: 'Queldrex',
      publisher: { '@id': 'https://queldrex.com/#organization' },
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#070b14] text-white">{children}</body>
    </html>
  )
}
