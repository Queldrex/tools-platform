import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'robots.txt + llms.txt Generator',
  description: 'Generate robots.txt with control over 18 AI crawlers and llms.txt to tell AI assistants what your site is about. Free, no account needed.',
  alternates: { canonical: 'https://queldrex.com/tools/robots-generator' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
