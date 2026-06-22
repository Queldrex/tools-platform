import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Uptime SLA Calculator — Queldrex',
  description: 'Calculate allowable downtime for any SLA uptime percentage — 99.9%, 99.99%, and custom targets. Get downtime in seconds, minutes, and hours per month and year.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
