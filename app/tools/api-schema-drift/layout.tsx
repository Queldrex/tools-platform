import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'API Schema Drift Detector — Queldrex',
  description: 'Compare two OpenAPI specs and instantly surface breaking changes, added endpoints, and removed fields. Catch drift before it breaks clients.',
  openGraph: { title: 'API Schema Drift Detector — Queldrex', description: 'Compare OpenAPI specs and surface breaking changes instantly.' },
  alternates: { canonical: 'https://queldrex.com/tools/api-schema-drift' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
