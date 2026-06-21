import { Metadata } from 'next'
import Base64Client from './Client'

export const metadata: Metadata = {
  title: 'Free Base64 Encoder & Decoder — Online Base64 Tool',
  description: 'Encode text to Base64 or decode Base64 back to plain text. Full UTF-8 support, swap mode, one-click copy. Runs entirely in your browser.',
  openGraph: {
    title: 'Free Base64 Encoder & Decoder — Online Base64 Tool',
    description: 'Encode text to Base64 or decode Base64 back to plain text. Full UTF-8 support, swap mode, one-click copy. Runs entirely in your browser.',
    images: [{ url: '/tool-previews/base64.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Free Base64 Encoder & Decoder', description: 'Encode or decode Base64 instantly in your browser. UTF-8 safe, one-click copy, swap mode.' },
}

export default function Base64Page() {
  return <Base64Client />
}
