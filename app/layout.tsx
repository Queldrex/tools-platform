import type { Metadata } from 'next'
import './globals.css'
import CookieBanner from '@/components/CookieBanner'

export const metadata: Metadata = {
  title: {
    default: 'Queldrex — Free Developer & Business Tools',
    template: '%s | Queldrex',
  },
  description: '48 tools for developers and small teams. Security scanning, DNS health, legal documents, business analytics, and more. No account required.',
  keywords: ['developer tools', 'dns health checker', 'ssl checker', 'cve scanner', 'nda generator', 'free online tools', 'security tools', 'business tools'],
  authors: [{ name: 'Queldrex LLC' }],
  creator: 'Queldrex LLC',
  metadataBase: new URL('https://queldrex.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://queldrex.com',
    siteName: 'Queldrex',
    title: 'Queldrex — Free Developer & Business Tools',
    description: '48 free tools for developers and small teams. No account required.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Queldrex — Professional Tools for Developers' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Queldrex — Free Developer & Business Tools',
    description: '48 free tools for developers and small teams. No account required.',
    site: '@queldrex',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: {
    types: { 'application/rss+xml': 'https://queldrex.com/rss.xml' },
  },
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
      offers: { '@type': 'Offer', price: '399', priceCurrency: 'USD' },
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
