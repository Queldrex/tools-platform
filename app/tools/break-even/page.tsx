import { Metadata } from 'next'
import BreakEvenClient from './Client'

export const metadata: Metadata = {
  title: 'Free Break-Even Calculator — Find Your Break-Even Point Online',
  description: 'Calculate exactly how many units you need to sell to cover costs. Contribution margin, profit targets, and break-even chart. Free, no account needed.',
  openGraph: {
    title: 'Free Break-Even Calculator — Find Your Break-Even Point Online',
    description: 'Calculate exactly how many units you need to sell to cover costs. Contribution margin, profit targets, and break-even chart. Free, no account needed.',
    images: [{ url: '/tool-previews/break-even.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Free Break-Even Calculator — Find Your Break-Even Point', description: 'Calculate how many units you need to sell to cover costs. Contribution margin, profit targets, and SVG chart.' },
}

export default function BreakEvenPage() {
  return <BreakEvenClient />
}
