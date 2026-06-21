import { Metadata } from 'next'
import InvoiceFraudPage from './Client'

export const metadata: Metadata = {
  title: 'Free Invoice Fraud Detector — BEC & Scam Invoice Scanner',
  description: 'Scan any invoice for fraud signals — Business Email Compromise (BEC) patterns, round-number manipulation, urgency pressure, fake vendor indicators, and bank account change scams.',
  openGraph: {
    title: 'Free Invoice Fraud Detector — BEC & Scam Invoice Scanner',
    description: 'Run 20+ fraud detection rules against any invoice. Detects BEC email patterns, urgency pressure, round-number manipulation, and fake vendor indicators.',
    images: [{ url: '/tool-previews/invoice-fraud.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Invoice Fraud Detector',
    description: 'Scan invoices for BEC indicators, fraud patterns, and scam signals instantly.',
  },
}

export default InvoiceFraudPage
