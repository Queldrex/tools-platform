import Link from 'next/link'
import QueldrexLogo from './Logo'

const FOOTER_NAV = [
  {
    heading: 'Products',
    links: [
      { label: 'All Tools', href: '/tools' },
      { label: 'AI Visibility Scanner', href: '/scanner' },
      { label: 'AI Monitor', href: '/monitor' },
      { label: 'Agency Plan', href: '/agency' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Portfolio', href: '/portfolio' },
      { label: 'Blog', href: '/blog' },
      { label: 'Build for Me', href: '/services' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Sample Audit Report', href: '/sample-audit' },
      { label: 'Roadmap', href: '/roadmap' },
      { label: 'Request a Tool', href: '/request-tool' },
      { label: 'Feedback', href: '/feedback' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Refund Policy', href: '/refunds' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/6 pt-16 pb-10" style={{ background: '#070b14' }}>
      <div className="max-w-7xl mx-auto px-6">

        {/* Top row: logo + tagline + columns */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 pb-12 border-b border-white/5">

          {/* Brand */}
          <div className="col-span-2">
            <Link href="/">
              <QueldrexLogo size="lg" />
            </Link>
            <p className="text-white/40 text-sm leading-relaxed mt-4 max-w-xs">
              Precision AI visibility tools, security audits, and custom software for businesses. Queldrex LLC, Castle Rock, Colorado.
            </p>
            <a
              href="https://x.com/queldrex"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-5 text-white/35 hover:text-white transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.631 5.903-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              @queldrex
            </a>
          </div>

          {/* Nav columns */}
          {FOOTER_NAV.map((col) => (
            <div key={col.heading}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4">{col.heading}</p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-white/50 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 text-xs text-white/30">
          <span>© {new Date().getFullYear()} Queldrex LLC, a Colorado limited liability company. All rights reserved.</span>
          <div className="flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            Payments secured by Stripe
          </div>
        </div>

      </div>
    </footer>
  )
}
