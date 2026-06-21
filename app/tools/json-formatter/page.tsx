import { Metadata } from 'next'
import JsonFormatterClient from './Client'

export const metadata: Metadata = {
  title: 'Free JSON Formatter & Validator — Format and Beautify JSON Online',
  description: 'Format, validate, and minify JSON instantly in your browser. Live syntax checking, error highlighting, indent control. No account required.',
  openGraph: {
    title: 'Free JSON Formatter & Validator — Format and Beautify JSON Online',
    description: 'Format, validate, and minify JSON instantly in your browser. Live syntax checking, error highlighting, indent control. No account required.',
    images: [{ url: '/tool-previews/json-formatter.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Free JSON Formatter & Validator — Format and Beautify JSON Online', description: 'Format, validate, and minify JSON instantly in your browser. Live syntax checking, error highlighting, indent control. No account required.' },
}

export default function JsonFormatterPage() {
  return <JsonFormatterClient />
}
