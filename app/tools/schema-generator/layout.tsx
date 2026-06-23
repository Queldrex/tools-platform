import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Schema Markup Generator',
  description: 'Generate JSON-LD schema markup for Local Business, FAQ Page, Article, Product, and Event — free, no account needed. Copy the ready-to-paste script tag.',
  alternates: { canonical: 'https://queldrex.com/tools/schema-generator' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
