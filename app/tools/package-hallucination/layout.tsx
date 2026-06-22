import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Package Hallucination Detector — Queldrex',
  description: 'Detect AI-hallucinated npm or PyPI packages in your package.json or requirements.txt. Verify packages exist before running install.',
  openGraph: { title: 'Package Hallucination Detector — Queldrex', description: 'Detect AI-hallucinated npm and PyPI packages before they hit your codebase.' },
  alternates: { canonical: 'https://queldrex.com/tools/package-hallucination' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
