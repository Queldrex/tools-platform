import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vibe Security Scanner — Queldrex',
  description: 'Security audit tool for AI-generated code. Detects hardcoded secrets, injection vulnerabilities, insecure patterns, and OWASP Top 10 risks.',
  openGraph: { title: 'Vibe Security Scanner — Queldrex', description: 'Security audit for AI-generated code — secrets, injections, OWASP Top 10.' },
  alternates: { canonical: 'https://queldrex.com/tools/vibe-security' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
