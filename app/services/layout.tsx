import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Custom Software Services | Queldrex',
  description: 'Queldrex builds custom SaaS tools, integrations, and automation for businesses and agencies. Fixed-price packages, fast turnaround, no retainer required.',
  alternates: { canonical: 'https://queldrex.com/services' },
  openGraph: {
    title: 'Custom Software Services | Queldrex',
    description: 'Fixed-price packages for custom SaaS tools, integrations, and automation. No retainer required.',
    url: 'https://queldrex.com/services',
    siteName: 'Queldrex',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Custom Software Services | Queldrex',
    description: 'Fixed-price packages for custom SaaS tools, integrations, and automation. No retainer required.',
  },
}

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
