import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Visibility Monitor — Monthly Rescan & Alerts | Queldrex',
  description: 'Monthly AI visibility rescans for your domain. Get alerted if your score drops 5+ points. Catch ranking drops before AI stops recommending you. $79/month.',
  alternates: { canonical: 'https://queldrex.com/monitor' },
  openGraph: {
    title: 'AI Visibility Monitor — Monthly Rescan & Alerts | Queldrex',
    description: 'Monthly AI visibility rescans. Get alerted if your score drops before AI stops recommending you. $79/month.',
    url: 'https://queldrex.com/monitor',
    siteName: 'Queldrex',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Visibility Monitor — Monthly Rescan & Alerts | Queldrex',
    description: 'Monthly AI visibility rescans. Get alerted if your score drops before AI stops recommending you. $79/month.',
  },
}

export default function MonitorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
