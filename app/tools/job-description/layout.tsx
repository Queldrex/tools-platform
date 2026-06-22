import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Job Description Generator — Queldrex',
  description: 'Generate clear, professional job descriptions with AI. Input the role, responsibilities, and requirements — get a ready-to-post listing.',
  openGraph: { title: 'Job Description Generator — Queldrex', description: 'Generate professional job descriptions with AI in seconds.' },
  alternates: { canonical: 'https://queldrex.com/tools/job-description' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
