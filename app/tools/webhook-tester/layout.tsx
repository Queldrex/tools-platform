import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Webhook Tester — Queldrex',
  description: 'Generate a live webhook endpoint and inspect incoming POST requests in real time. Test Stripe, GitHub, Shopify, or any webhook integration.',
  openGraph: { title: 'Webhook Tester — Queldrex', description: 'Live webhook endpoint to inspect incoming requests from any service.' },
  alternates: { canonical: 'https://queldrex.com/tools/webhook-tester' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
