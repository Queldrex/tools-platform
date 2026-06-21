import { Metadata } from 'next'
import SSLInspectorPage from './Client'

export const metadata: Metadata = {
  title: 'Free SSL Certificate Inspector — Check TLS Config & Expiry',
  description: 'Inspect SSL/TLS certificates with a real TLS handshake. Check expiry date, issuer, cipher suite, protocol version, security headers, and SANs for any domain.',
  openGraph: {
    title: 'Free SSL Certificate Inspector — Check TLS Config & Expiry',
    description: 'Real TLS handshake — check certificate expiry, cipher strength, protocol version, and security headers for any domain.',
    images: [{ url: '/tool-previews/ssl-inspector.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free SSL/TLS Inspector',
    description: 'Check SSL certificate details, expiry, TLS version, and security headers instantly.',
  },
}

export default SSLInspectorPage
