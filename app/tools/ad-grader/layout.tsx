import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ad Copy Grader — Queldrex',
  description: 'Grade your ad copy for clarity, emotional impact, and conversion potential across Meta, Google, and LinkedIn. Free AI-powered analysis.',
  openGraph: { title: 'Ad Copy Grader — Queldrex', description: 'Grade your ad copy for clarity, emotional impact, and conversion potential. Free AI-powered analysis.' },
  alternates: { canonical: 'https://queldrex.com/tools/ad-grader' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
