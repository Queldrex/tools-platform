import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agency Report Generator — Queldrex',
  description: 'Generate professional client reports in seconds. Paste your wins, metrics, and next steps — get a polished HTML report ready to send.',
  openGraph: { title: 'Agency Report Generator — Queldrex', description: 'Generate professional client reports in seconds. Free for agencies.' },
  alternates: { canonical: 'https://queldrex.com/tools/agency-report' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
