import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tech Stack Detector â€” Queldrex',
  description: 'Detect the technology stack behind any website. Enter a URL and see the frameworks, CMS, hosting, analytics, and security headers in use.',
  alternates: { canonical: 'https://queldrex.com/tools/tech-stack' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
