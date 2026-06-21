import { Metadata } from 'next'
import NDAGeneratorClient from './Client'

export const metadata: Metadata = {
  title: 'Free NDA Generator — Create a Non-Disclosure Agreement Online',
  description: 'Generate a complete, professionally worded NDA in seconds. Mutual or one-way, with jurisdiction, duration, and non-compete options. 1 free per day.',
  openGraph: {
    title: 'Free NDA Generator — Create a Non-Disclosure Agreement Online',
    description: 'Generate a complete, professionally worded NDA in seconds. Mutual or one-way, with jurisdiction, duration, and non-compete options. 1 free per day.',
    images: [{ url: '/tool-previews/nda-generator.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Free NDA Generator — Non-Disclosure Agreement Online', description: 'Generate a complete NDA in seconds. Mutual or one-way, with jurisdiction and duration. 1 free per day.' },
}

export default function NDAGeneratorPage() {
  return <NDAGeneratorClient />
}
