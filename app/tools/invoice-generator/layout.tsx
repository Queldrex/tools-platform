import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Invoice Generator — Queldrex',
  description: 'Create and print professional invoices instantly. Add line items, client details, and payment terms — print or save as PDF directly from your browser.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
