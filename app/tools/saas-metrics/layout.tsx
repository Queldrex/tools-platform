import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SaaS Metrics Calculator — Queldrex',
  description: 'Calculate MRR, ARR, churn rate, LTV, CAC ratio, and payback period from your SaaS data. Free KPI dashboard for founders and operators.',
  openGraph: { title: 'SaaS Metrics Calculator — Queldrex', description: 'Calculate MRR, ARR, churn, LTV, CAC, and payback period instantly.' },
  alternates: { canonical: 'https://queldrex.com/tools/saas-metrics' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
