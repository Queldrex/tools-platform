import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GDPR Privacy Policy Generator â€” Queldrex',
  description: 'Generate a GDPR-compliant privacy policy for your website or app. Enter your business details and get a ready-to-publish policy covering data collection, retention, and user rights.',
  alternates: { canonical: 'https://queldrex.com/tools/gdpr-generator' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
