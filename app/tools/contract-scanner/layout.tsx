import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Contract Risk Scanner — Queldrex',
  description: 'Paste any contract and get an instant AI risk analysis. Flags red-flag clauses, IP assignments, non-competes, and one-sided terms. Not legal advice.',
  openGraph: { title: 'AI Contract Risk Scanner — Queldrex', description: 'Instant AI analysis of contract clauses, red flags, and risk score.' },
  alternates: { canonical: 'https://queldrex.com/tools/contract-scanner' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
