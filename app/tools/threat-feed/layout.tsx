import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Live Cybersecurity Threat Feed — Queldrex',
  description: 'Real-time cybersecurity threat intelligence feed. Monitor active CVEs, threat actors, and security advisories relevant to your stack.',
  openGraph: { title: 'Live Cybersecurity Threat Feed — Queldrex', description: 'Real-time CVEs, threat actors, and security advisories.' },
  alternates: { canonical: 'https://queldrex.com/tools/threat-feed' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
