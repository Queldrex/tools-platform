import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Invoice Generator â€” Queldrex',
  description: 'Create and print professional invoices instantly. Add line items, client details, and payment terms â€” print or save as PDF directly from your browser.',
  alternates: { canonical: 'https://queldrex.com/tools/invoice-generator' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
