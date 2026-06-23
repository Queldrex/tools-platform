import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'API Rate Limit Calculator â€” Queldrex',
  description: 'Calculate API rate limits, throttle windows, and request budgets for any API. Enter your limits and get a breakdown of per-second, per-minute, and per-hour capacity.',
  alternates: { canonical: 'https://queldrex.com/tools/api-rate-limit' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
