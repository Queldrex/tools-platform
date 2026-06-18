import Link from 'next/link'
import QueldrexLogo from './Logo'

export default function Footer() {
  return (
    <footer className="border-t border-white/6 py-16" style={{ background: '#070b14' }}>
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center gap-8">

        <Link href="/">
          <QueldrexLogo size="lg" center />
        </Link>

        <p className="text-white/55 text-sm leading-relaxed max-w-sm">
          Precision software tools for developers and businesses. One-time payment. No subscriptions.
        </p>

        <nav className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-sm text-white/55">
          <Link href="/scanner" className="hover:text-white transition-colors">AI Visibility Scanner</Link>
          <span className="text-white/15">·</span>
          <Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <span className="text-white/15">·</span>
          <Link href="/feedback" className="hover:text-white transition-colors">Feedback</Link>
          <span className="text-white/15">·</span>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <span className="text-white/15">·</span>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <span className="text-white/15">·</span>
          <a href="mailto:hello@queldrex.com" className="hover:text-white transition-colors">hello@queldrex.com</a>
        </nav>

        <a href="https://x.com/queldrex" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.631 5.903-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          @queldrex
        </a>

        <div className="w-full border-t border-white/5" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full text-xs text-white/35">
          <span>© {new Date().getFullYear()} Queldrex LLC. All rights reserved.</span>
          <div className="flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            Payments secured by Stripe
          </div>
        </div>

      </div>
    </footer>
  )
}
