import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Schema Markup Generator — Queldrex',
  description: 'Generate JSON-LD schema markup for any page type — LocalBusiness, Article, FAQ, Product, and more. Copy the ready-to-paste script tag for your site head.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
