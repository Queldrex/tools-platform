import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Email Subject Line Grader — Queldrex',
  description: 'Grade your email subject lines for open rate potential. Get scores for clarity, urgency, length, spam risk, and AI-powered improvement suggestions.',
  openGraph: { title: 'Email Subject Line Grader — Queldrex', description: 'Grade email subject lines for open rate potential and spam risk.' },
  alternates: { canonical: 'https://queldrex.com/tools/subject-line' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
