import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Visibility Scanner — See If AI Can Find Your Business | Queldrex',
  description: 'Find out if ChatGPT, Perplexity, and Google AI can discover and recommend your business. 14-signal scan, HTML report, LocalBusiness schema. $399 one-time.',
  alternates: { canonical: 'https://queldrex.com/scanner' },
  openGraph: {
    title: 'AI Visibility Scanner — Can AI Find Your Business?',
    description: 'Find out if ChatGPT, Perplexity, and Google AI can discover your business. 14-signal scan with HTML report and fixes. $399 one-time.',
    url: 'https://queldrex.com/scanner',
    siteName: 'Queldrex',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Visibility Scanner — Can AI Find Your Business?',
    description: 'Find out if ChatGPT, Perplexity, and Google AI can discover your business. 14-signal scan with HTML report and fixes. $399 one-time.',
  },
}

export default function ScannerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
