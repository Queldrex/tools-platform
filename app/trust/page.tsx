import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Trust & Security — Queldrex',
  description: 'How Queldrex handles your data, payments, and privacy. No accounts, no stored passwords, Stripe for payments.',
  alternates: { canonical: 'https://queldrex.com/trust' },
}

const STORES = [
  {
    title: 'Your IP address',
    detail: 'Used only to enforce free tier rate limits (1–10 uses/day per tool). Automatically deleted after 24 hours.',
    accent: '#4ade80',
  },
  {
    title: 'Your email (after purchase)',
    detail: 'Used to send your lifetime access link. Stored securely. Never sold, never shared, never used for marketing without consent.',
    accent: '#4ade80',
  },
  {
    title: 'Your Stripe customer ID',
    detail: 'Lets us restore your access if you clear cookies or switch devices. Stripe handles all card data — we never see it.',
    accent: '#4ade80',
  },
]

const DOES_NOT_STORE = [
  'Passwords — we have no accounts',
  'Card numbers — Stripe handles all payments (PCI Level 1)',
  'Tool outputs — your NDA, contract, proposal, or report is generated client-side or deleted from our servers immediately',
  'Tracking cookies — the only cookies we set are your access tokens after purchase',
  'Browser history, device fingerprints, or behavioral data',
]

export default function TrustPage() {
  return (
    <div className="min-h-screen" style={{ background: '#09090B' }}>
      <Header />

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-12 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Queldrex · Trust &amp; Security
        </p>
        <h1 className="text-4xl font-black mb-4" style={{ color: '#FAFAFA', letterSpacing: '-0.02em' }}>
          How we handle your data.
        </h1>
        <p className="text-lg" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Short version: we store as little as possible and use Stripe for all payments.
          No accounts, no passwords, no surprises.
        </p>
      </section>

      {/* What we store */}
      <section className="max-w-3xl mx-auto px-6 pb-14">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-6" style={{ color: '#4ade80' }}>
          What we store
        </p>
        <div className="space-y-4">
          {STORES.map(item => (
            <div key={item.title} className="rounded-2xl border p-6 flex gap-4" style={{ background: '#0c0e14', borderColor: 'rgba(74,222,128,0.15)' }}>
              <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5" style={{ background: 'rgba(74,222,128,0.15)' }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="#4ade80" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-black text-white mb-1">{item.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What we don't store */}
      <section className="max-w-3xl mx-auto px-6 pb-14">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-6" style={{ color: '#f87171' }}>
          What we do NOT store
        </p>
        <div className="rounded-2xl border p-6 space-y-3" style={{ background: '#0c0e14', borderColor: 'rgba(248,113,113,0.15)' }}>
          {DOES_NOT_STORE.map(item => (
            <div key={item} className="flex gap-3 items-start">
              <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5" style={{ background: 'rgba(248,113,113,0.15)' }}>
                <svg className="w-3 h-3" fill="none" stroke="#f87171" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Payments */}
      <section className="max-w-3xl mx-auto px-6 pb-14">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-6" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Payments
        </p>
        <div className="rounded-2xl border p-6 space-y-5" style={{ background: '#0c0e14', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <svg className="w-4 h-4" fill="none" stroke="#6366f1" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-black text-white mb-1">Stripe (PCI Level 1)</p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                All payments are processed by Stripe — the highest level of payment security certification. We never see, store, or touch your card number.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.12)' }}>
              <svg className="w-4 h-4" fill="none" stroke="#4ade80" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-black text-white mb-1">7-day money-back guarantee</p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Not satisfied? Email <a href="mailto:hello@queldrex.com" className="text-white/70 underline hover:text-white">hello@queldrex.com</a> within 7 days. No questions asked, full refund.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(251,191,36,0.12)' }}>
              <svg className="w-4 h-4" fill="none" stroke="#fbbf24" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 9V7a3 3 0 015.12-2.12M15 9v2a3 3 0 01-3 3m0 0v2m0 0h.01M12 12H9m3 0h3" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-black text-white mb-1">Cancel Pro anytime</p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Pro subscribers can cancel directly from the Stripe billing portal. No forms, no calls, no waiting. One-time purchases never expire.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI tools */}
      <section className="max-w-3xl mx-auto px-6 pb-14">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-6" style={{ color: 'rgba(255,255,255,0.25)' }}>
          AI-powered tools
        </p>
        <div className="rounded-2xl border p-6" style={{ background: '#0c0e14', borderColor: 'rgba(255,255,255,0.08)' }}>
          <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Some tools (Contract Risk Scanner, Vibe Security, Proposal Generator, and others) use the{' '}
            <span className="text-white/80 font-semibold">Groq API</span> to run llama-3.3-70b inference.
            What you submit to these tools is sent to Groq&apos;s servers for processing.
          </p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>
            We do not store, log, or review your AI inputs. Groq&apos;s privacy policy governs how they handle inference data.
          </p>
          <a
            href="https://groq.com/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-bold hover:opacity-80 transition-opacity"
            style={{ color: '#06d6ff' }}
          >
            Groq Privacy Policy →
          </a>
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Questions about privacy or security?</p>
        <a href="mailto:hello@queldrex.com" className="text-white font-black text-lg hover:opacity-80 transition-opacity">
          hello@queldrex.com
        </a>
        <div className="mt-8">
          <Link href="/privacy" className="text-sm underline hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Full Privacy Policy →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
