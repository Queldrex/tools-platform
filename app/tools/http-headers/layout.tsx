import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HTTP Headers Inspector — Queldrex',
  description: 'Inspect the HTTP response headers of any URL. Check security headers, cache-control, content-type, redirects, and server configuration.',
  openGraph: { title: 'HTTP Headers Inspector — Queldrex', description: 'Inspect HTTP response headers, security settings, and cache rules for any URL.', images: [{ url: '/tool-previews/ssl-inspector.png', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: 'HTTP Headers Inspector — Queldrex', description: 'Inspect HTTP response headers, security settings, and cache rules for any URL.', images: ['/tool-previews/ssl-inspector.png'] },
  alternates: { canonical: 'https://queldrex.com/tools/http-headers' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
