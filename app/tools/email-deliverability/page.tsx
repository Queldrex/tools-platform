import { Metadata } from 'next'
import EmailDeliverabilityPage from './Client'

export const metadata: Metadata = {
  title: 'Free Email Deliverability Checker — SPF, DKIM & DMARC Tester',
  description: 'Check SPF, DKIM, DMARC, MX records, and blacklist status for any domain. Real DNS lookups via Cloudflare. Find exactly why your emails land in spam.',
  openGraph: {
    title: 'Free Email Deliverability Checker — SPF, DKIM & DMARC Tester',
    description: 'Test your email domain\'s SPF, DKIM, and DMARC configuration. Identify deliverability issues before they land your email in spam.',
    images: [{ url: '/tool-previews/email-deliverability.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Email Deliverability Checker',
    description: 'Check SPF, DKIM, DMARC, and blacklist status for any domain instantly.',
  },
}

export default EmailDeliverabilityPage
