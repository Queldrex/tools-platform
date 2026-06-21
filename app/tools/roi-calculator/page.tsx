import { Metadata } from 'next'
import RoiCalculatorPage from './Client'

export const metadata: Metadata = {
  title: 'Free ROI Calculator — Return on Investment & Payback Period',
  description: 'Calculate ROI, annualized return, payback period, and risk-adjusted scenarios for any business investment. Standard finance formula — pure math, instant results.',
  openGraph: {
    title: 'Free ROI Calculator — Return on Investment & Payback Period',
    description: 'Calculate ROI, annualized return, payback period, and conservative/base/optimistic scenarios for any business investment.',
    images: [{ url: '/tool-previews/roi-calculator.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free ROI Calculator',
    description: 'Calculate ROI, payback period, and risk-adjusted scenarios for any investment.',
  },
}

export default RoiCalculatorPage
