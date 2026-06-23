import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Uptime SLA Calculator â€” Queldrex',
  description: 'Calculate allowable downtime for any SLA uptime percentage â€” 99.9%, 99.99%, and custom targets. Get downtime in seconds, minutes, and hours per month and year.',
  alternates: { canonical: 'https://queldrex.com/tools/uptime-calculator' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
