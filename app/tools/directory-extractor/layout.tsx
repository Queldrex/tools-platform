import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Directory Contact Extractor — Queldrex',
  description: 'Extract contact information, emails, and business details from any directory or listing page. Free web scraping tool for prospecting.',
  openGraph: { title: 'Directory Contact Extractor — Queldrex', description: 'Extract emails and contact info from any directory page.' },
  alternates: { canonical: 'https://queldrex.com/tools/directory-extractor' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
