import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Business Name Generator — Queldrex',
  description: 'Generate creative, memorable business name ideas with AI. Get domain-friendly name suggestions for your startup, agency, or SaaS product.',
  openGraph: { title: 'Business Name Generator — Queldrex', description: 'Generate creative, domain-friendly business name ideas with AI.' },
  alternates: { canonical: 'https://queldrex.com/tools/business-name' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
