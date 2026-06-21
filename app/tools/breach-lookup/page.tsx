import { Metadata } from 'next'
import BreachLookupClient from './Client'

export const metadata: Metadata = {
  title: 'Free Breach Lookup Tool — Check if Email or Domain Was Compromised',
  description: 'Check if a password was exposed in a data breach, or audit your domain\'s email security (DMARC, SPF, DKIM). Free, private, no account required.',
  openGraph: {
    title: 'Free Breach Lookup Tool — Check if Email or Domain Was Compromised',
    description: 'Check if a password was exposed in a data breach, or audit your domain\'s email security (DMARC, SPF, DKIM). Free, private, no account required.',
    images: [{ url: '/tool-previews/breach-lookup.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Free Breach Lookup — Password & Domain Security Check', description: 'Check if a password was exposed in a data breach. Audit domain email security. Private k-anonymity model.' },
}

export default function BreachLookupPage() {
  return <BreachLookupClient />
}
