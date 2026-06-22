import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SaaS Spend Analyzer — Queldrex',
  description: 'Paste your bank or card transactions and get a breakdown of all SaaS subscriptions, monthly totals, and cost-per-tool analysis.',
  openGraph: { title: 'SaaS Spend Analyzer — Queldrex', description: 'Paste your transactions and discover every SaaS subscription you\'re paying for.' },
  alternates: { canonical: 'https://queldrex.com/tools/saas-spend' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
