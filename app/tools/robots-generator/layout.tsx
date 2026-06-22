import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'robots.txt Generator — Queldrex',
  description: 'Generate a robots.txt file for your website. Configure crawler access rules for search engines and AI crawlers, then copy the finished file.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
