import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Meeting Cost Calculator — Queldrex',
  description: 'Calculate the real cost of a meeting in real time. Enter attendee count and average salary — watch the dollar amount tick up as your meeting runs.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
