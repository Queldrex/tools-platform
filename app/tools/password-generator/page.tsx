import { Metadata } from 'next'
import PasswordGeneratorClient from './Client'

export const metadata: Metadata = {
  title: 'Free Password Generator — Cryptographically Secure Passwords Online',
  description: 'Generate strong, random passwords instantly. Set length, character sets, and quantity. Uses crypto.getRandomValues() — runs entirely in your browser.',
  openGraph: {
    title: 'Free Password Generator — Cryptographically Secure Passwords Online',
    description: 'Generate strong, random passwords instantly. Set length, character sets, and quantity. Uses crypto.getRandomValues() — runs entirely in your browser.',
    images: [{ url: '/tool-previews/password-generator.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Free Password Generator — Cryptographically Secure Passwords', description: 'Generate strong, random passwords instantly in your browser. Never transmitted.' },
}

export default function PasswordGeneratorPage() {
  return <PasswordGeneratorClient />
}
