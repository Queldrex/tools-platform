import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Visibility Scanner — Is Your Business Invisible to AI?',
  description:
    'Find out if ChatGPT, Perplexity, and Google AI can find your business. Get an instant score and a ready-to-use fix package for $149.',
  openGraph: {
    title: 'AI Visibility Scanner by Queldrex',
    description: 'Scan your website and find out if AI can find your business. Instant report, $149.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-white text-slate-900">{children}</body>
    </html>
  )
}
