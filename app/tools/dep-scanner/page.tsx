import { Metadata } from 'next'
import DepScannerPage from './Client'

export const metadata: Metadata = {
  title: 'Free Dependency CVE Scanner — npm & Python Vulnerability Checker',
  description: 'Paste your package.json or requirements.txt and check every dependency against Google\'s OSV database. Real CVE IDs, CVSS scores, and fix versions — instant results.',
  openGraph: {
    title: 'Free Dependency CVE Scanner — npm & Python Vulnerability Checker',
    description: 'Scan npm and Python dependencies for known CVEs using Google\'s OSV database. Real CVE data, real CVSS scores, real fix versions.',
    images: [{ url: '/tool-previews/dep-scanner.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Dependency CVE Scanner',
    description: 'Check every npm or Python dependency for known CVEs against Google\'s OSV database.',
  },
}

export default DepScannerPage
