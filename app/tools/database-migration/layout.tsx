import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Database Migration Analyzer — Queldrex',
  description: 'Analyze SQL migration scripts for risk, locking issues, rollback complexity, and data loss potential before running them in production.',
  openGraph: { title: 'Database Migration Analyzer — Queldrex', description: 'Analyze SQL migrations for risk and locking issues before production.' },
  alternates: { canonical: 'https://queldrex.com/tools/database-migration' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
