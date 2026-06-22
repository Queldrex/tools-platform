import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Schema.org Validator — Queldrex',
  description: 'Validate the JSON-LD structured data on any URL. Check for schema errors, missing required fields, and Google Rich Results eligibility.',
  openGraph: { title: 'Schema.org Validator — Queldrex', description: 'Validate JSON-LD structured data and check Google Rich Results eligibility.' },
  alternates: { canonical: 'https://queldrex.com/tools/schema-validator' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
