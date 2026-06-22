import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy Analyzer — Queldrex',
  description: 'Analyze any privacy policy for GDPR and CCPA compliance gaps. Get a compliance score, red flags, and missing clause report. Not legal advice.',
  openGraph: { title: 'Privacy Policy Analyzer — Queldrex', description: 'AI compliance scoring for privacy policies — GDPR, CCPA, red flags.' },
  alternates: { canonical: 'https://queldrex.com/tools/privacy-analyzer' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
