import type { Metadata } from 'next'
import './globals.css'
import CookieBanner from '@/components/CookieBanner'

export const metadata: Metadata = {
  title: 'Queldrex — AI Visibility, Security & Developer Tools',
  description: 'Queldrex builds precision software tools for businesses and agencies. AI Visibility Scanner, monthly monitoring, security tools, custom development. Colorado LLC.',
  keywords: 'AI visibility, ChatGPT SEO, Perplexity SEO, AI search optimization, security tools, code scanner, API schema drift, database migration, queldrex, Colorado software',
  openGraph: {
    title: 'Queldrex — AI Visibility, Security & Developer Tools',
    description: 'AI Visibility Scanner, monthly monitoring, security tools, and custom development for businesses and agencies. Queldrex LLC, Colorado.',
    type: 'website',
    url: 'https://queldrex.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Queldrex — AI Visibility, Security & Developer Tools',
    description: 'AI Visibility Scanner, monthly monitoring, security tools, and custom development. Queldrex LLC, Colorado.',
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
      description: 'Queldrex LLC is a Colorado software company building AI visibility tools, security tools, developer utilities, and custom software for businesses and agencies.',
      email: 'hello@queldrex.com',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Castle Rock',
        addressRegion: 'CO',
        addressCountry: 'US',
      },
      sameAs: ['https://x.com/queldrex'],
      knowsAbout: ['AI visibility', 'AI search optimization', 'software security', 'custom software development'],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://queldrex.com/#website',
      url: 'https://queldrex.com',
      name: 'Queldrex',
      publisher: { '@id': 'https://queldrex.com/#organization' },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'AI Visibility Scanner',
      url: 'https://queldrex.com/scanner',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '149', priceCurrency: 'USD' },
      description: 'Scans 14 signals to determine how visible your business is to AI search engines like ChatGPT and Perplexity.',
      provider: { '@id': 'https://queldrex.com/#organization' },
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
      <body className="min-h-full flex flex-col bg-[#070b14] text-white">
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
