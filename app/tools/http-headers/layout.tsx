import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HTTP Headers Inspector — Queldrex',
  description: 'Inspect the HTTP response headers of any URL. Check security headers, cache-control, content-type, redirects, and server configuration.',
  openGraph: { title: 'HTTP Headers Inspector — Queldrex', description: 'Inspect HTTP response headers, security settings, and cache rules for any URL.' },
  alternates: { canonical: 'https://queldrex.com/tools/http-headers' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
