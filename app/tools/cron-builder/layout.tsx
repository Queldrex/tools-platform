import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cron Expression Builder â€” Queldrex',
  description: 'Build and validate cron expressions visually. Select schedule frequency, day/time fields, and get the cron string plus a human-readable description.',
  alternates: { canonical: 'https://queldrex.com/tools/cron-builder' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
