import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cashflow Forecast Calculator — Queldrex',
  description: 'Project your 12-month cashflow with a simple calculator. Enter starting cash, monthly revenue, and costs to see your runway and burn rate.',
  openGraph: { title: 'Cashflow Forecast Calculator — Queldrex', description: 'Project 12-month cashflow, runway, and burn rate in seconds.' },
  alternates: { canonical: 'https://queldrex.com/tools/cashflow' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
