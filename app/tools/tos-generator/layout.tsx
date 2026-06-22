import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service Generator — Queldrex',
  description: 'Generate a comprehensive Terms of Service document for your SaaS or website. AI-powered, covers liability, user rights, and acceptable use. Not legal advice.',
  openGraph: { title: 'Terms of Service Generator — Queldrex', description: 'Generate a comprehensive Terms of Service for SaaS or websites. Not legal advice.' },
  alternates: { canonical: 'https://queldrex.com/tools/tos-generator' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
