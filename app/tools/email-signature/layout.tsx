import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Email Signature Generator â€” Queldrex',
  description: 'Create a professional HTML email signature in seconds. Enter your name, title, company, and contact details â€” copy the ready-to-paste HTML.',
  alternates: { canonical: 'https://queldrex.com/tools/email-signature' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
