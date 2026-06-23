import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Meeting Cost Calculator â€” Queldrex',
  description: 'Calculate the real cost of a meeting in real time. Enter attendee count and average salary â€” watch the dollar amount tick up as your meeting runs.',
  alternates: { canonical: 'https://queldrex.com/tools/meeting-cost' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
