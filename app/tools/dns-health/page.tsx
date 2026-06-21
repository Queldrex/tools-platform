import { Metadata } from 'next'
import DnsHealthPage from './Client'

export const metadata: Metadata = {
  title: 'Free DNS Health Checker — Live DNS Lookup Tool',
  description: 'Check A, AAAA, MX, NS, TXT, SOA, CAA, and DMARC records in real time. Queries Cloudflare and Google DNS simultaneously to verify propagation status instantly.',
  openGraph: {
    title: 'Free DNS Health Checker — Live DNS Lookup Tool',
    description: 'Check DNS records instantly. Queries both Cloudflare and Google DNS to verify propagation status in real time.',
    images: [{ url: '/tool-previews/dns-health.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free DNS Health Checker',
    description: 'Check A, MX, TXT, NS, CAA, and DMARC records with live propagation status.',
  },
}

export default DnsHealthPage
