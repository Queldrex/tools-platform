import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Schema Markup Generator â€” Queldrex',
  description: 'Generate JSON-LD schema markup for any page type â€” LocalBusiness, Article, FAQ, Product, and more. Copy the ready-to-paste script tag for your site head.',
  alternates: { canonical: 'https://queldrex.com/tools/schema-generator' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
