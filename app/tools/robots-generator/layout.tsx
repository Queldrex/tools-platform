import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'robots.txt Generator â€” Queldrex',
  description: 'Generate a robots.txt file for your website. Configure crawler access rules for search engines and AI crawlers, then copy the finished file.',
  alternates: { canonical: 'https://queldrex.com/tools/robots-generator' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
