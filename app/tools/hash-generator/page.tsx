import { Metadata } from 'next'
import HashGeneratorClient from './Client'

export const metadata: Metadata = {
  title: 'Free Hash Generator — MD5, SHA-1, SHA-256, SHA-512 Online',
  description: 'Generate cryptographic hashes from text or files. SHA-256, SHA-512, SHA-384, SHA-1 — computed instantly in your browser. No upload, no account.',
  openGraph: {
    title: 'Free Hash Generator — MD5, SHA-1, SHA-256, SHA-512 Online',
    description: 'Generate cryptographic hashes from text or files. SHA-256, SHA-512, SHA-384, SHA-1 — computed instantly in your browser. No upload, no account.',
    images: [{ url: '/tool-previews/hash-generator.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Free Hash Generator — SHA-256, SHA-512 Online', description: 'Generate cryptographic hashes from text or files instantly in your browser. No upload, no account.' },
}

export default function HashGeneratorPage() {
  return <HashGeneratorClient />
}
