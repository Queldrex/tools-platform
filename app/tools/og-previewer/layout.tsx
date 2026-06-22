import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Open Graph Preview Tool — Queldrex',
  description: 'Preview how any URL will appear when shared on Twitter, LinkedIn, and Facebook. Inspect og:title, og:image, og:description, and Twitter card tags.',
  openGraph: { title: 'Open Graph Preview Tool — Queldrex', description: 'Preview social share cards for any URL. Inspect OG and Twitter card tags.' },
  alternates: { canonical: 'https://queldrex.com/tools/og-previewer' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
