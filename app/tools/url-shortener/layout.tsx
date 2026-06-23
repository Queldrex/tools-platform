import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'URL Shortener â€” Queldrex',
  description: 'Shorten any URL to a queldrex.com short link. Supports custom codes and tracks click counts. Free, no account required.',
  alternates: { canonical: 'https://queldrex.com/tools/url-shortener' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
