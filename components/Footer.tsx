import Link from 'next/link'
import QueldrexLogo from './Logo'

const FOOTER_NAV = [
  {
    heading: 'Tools',
    links: [
      { label: 'Browse Tools', href: '/tools' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Downloads', href: '/downloads' },
      { label: 'Request a Tool', href: '/request-tool' },
    ],
  },
  {
    heading: 'Services',
    links: [
      { label: 'Implementation', href: '/services' },
      { label: 'Done For You', href: '/apply' },
      { label: 'Agency Program', href: '/agency' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Portfolio', href: '/portfolio' },
      { label: 'Contact', href: '/contact' },
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
    <footer className="border-t pt-16 pb-10" style={{ background: '#09090B', borderColor: 'rgba(255,255,255,0.07)' }}>
      <div className="max-w-7xl mx-auto px-6">

        {/* Top row: logo + tagline + columns */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 pb-12 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>

          {/* Brand */}
          <div className="col-span-2">
            <Link href="/">
              <QueldrexLogo size="lg" />
            </Link>
            <p className="text-sm leading-relaxed mt-4 max-w-xs" style={{ color: '#A1A1AA' }}>
              48 tools for developers and small teams. Free to start.
            </p>
            <a
              href="https://x.com/queldrex"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-5 transition-colors text-sm hover:text-white"
              style={{ color: '#A1A1AA' }}
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
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: '#FAFAFA' }}>{col.heading}</p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm transition-colors hover:text-white" style={{ color: '#A1A1AA' }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 text-xs" style={{ color: '#A1A1AA' }}>
          <span>© 2026 Queldrex LLC. Castle Rock, CO.</span>
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
