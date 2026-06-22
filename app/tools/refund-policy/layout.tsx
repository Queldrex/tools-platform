import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy Generator — Queldrex',
  description: 'Generate a clear, professional refund policy for your SaaS or e-commerce business. Covers digital products, subscriptions, and physical goods.',
  openGraph: { title: 'Refund Policy Generator — Queldrex', description: 'Generate a professional refund policy for SaaS, subscriptions, or e-commerce.' },
  alternates: { canonical: 'https://queldrex.com/tools/refund-policy' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
