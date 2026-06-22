import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Email Signature Generator — Queldrex',
  description: 'Create a professional HTML email signature in seconds. Enter your name, title, company, and contact details — copy the ready-to-paste HTML.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
