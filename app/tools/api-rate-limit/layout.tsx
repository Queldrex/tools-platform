import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'API Rate Limit Calculator — Queldrex',
  description: 'Calculate API rate limits, throttle windows, and request budgets for any API. Enter your limits and get a breakdown of per-second, per-minute, and per-hour capacity.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
