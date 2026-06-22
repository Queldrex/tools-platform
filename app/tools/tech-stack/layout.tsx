import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tech Stack Detector — Queldrex',
  description: 'Detect the technology stack behind any website. Enter a URL and see the frameworks, CMS, hosting, analytics, and security headers in use.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
