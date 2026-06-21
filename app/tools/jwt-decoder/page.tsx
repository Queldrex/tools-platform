import { Metadata } from 'next'
import JwtDecoderClient from './Client'

export const metadata: Metadata = {
  title: 'Free JWT Decoder — Decode JSON Web Tokens Online',
  description: 'Decode JWT tokens instantly. See header, payload, and signature without a private key. Verify expiry, issuer, and claims. Runs in your browser.',
  openGraph: {
    title: 'Free JWT Decoder — Decode JSON Web Tokens Online',
    description: 'Decode JWT tokens instantly. See header, payload, and signature without a private key. Verify expiry, issuer, and claims. Runs in your browser.',
    images: [{ url: '/tool-previews/jwt-decoder.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Free JWT Decoder — Decode JSON Web Tokens Online', description: 'Decode JWT tokens instantly. See header, payload, and signature without a private key. Verify expiry, issuer, and claims. Runs in your browser.' },
}

export default function JwtDecoderPage() {
  return <JwtDecoderClient />
}
