import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Refund Policy — Queldrex',
  description: 'Queldrex LLC refund policy for the AI Visibility Scanner, Monitor subscription, Pro Tools, and custom development services.',
}

export default function RefundsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-10">
          <Link href="/" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-8">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Queldrex
          </Link>
          <p className="text-cyan-500 text-xs font-bold tracking-[0.28em] uppercase mb-3">Legal</p>
          <h1 className="text-3xl font-black text-white mb-3">Refund Policy</h1>
          <p className="text-white/40 text-sm">Last updated: June 20, 2026 &nbsp;·&nbsp; Queldrex LLC, a Colorado limited liability company</p>
        </div>

        <div
          className="rounded-2xl border p-8 space-y-8 text-white/70 text-sm leading-relaxed"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}
        >

          <section>
            <h2 className="text-white font-bold text-base mb-3">1. AI Visibility Scanner — $149 one-time</h2>
            <ul className="space-y-2.5 pl-4 list-disc">
              <li><strong className="text-white/80">Report not delivered within 48 hours:</strong> full refund, no questions asked.</li>
              <li><strong className="text-white/80">Report delivered but technically defective</strong> (corrupted files, missing sections): full refund or re-delivery at your choice.</li>
              <li><strong className="text-white/80">Report delivered and working:</strong> no refund. Each report is custom-generated for your domain and delivered digitally.</li>
            </ul>
            <p className="mt-3">Contact us within 7 days of purchase at <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a>.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">2. AI Visibility Monitor — $29/month subscription</h2>
            <ul className="space-y-2.5 pl-4 list-disc">
              <li>No refunds for billing periods already charged.</li>
              <li>Cancel anytime — access continues through the end of the period you paid for.</li>
              <li>If we experience a service outage exceeding 72 continuous hours, a pro-rated credit will be applied to your next billing cycle.</li>
            </ul>
            <p className="mt-3">Cancel instantly via your Stripe billing portal or email <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a>.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">3. Pro Tools — included with Monitor subscription</h2>
            <p>
              Pro Tools access is part of the Monitor subscription. Refunds follow the subscription policy in Section 2 above. There is no separate charge for Pro Tools.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">4. Build for Me — Custom Development</h2>
            <ul className="space-y-2.5 pl-4 list-disc">
              <li><strong className="text-white/80">50% deposit:</strong> non-refundable once work has begun. If you cancel before work starts, the deposit is fully refunded.</li>
              <li><strong className="text-white/80">If Queldrex fails to deliver the agreed scope:</strong> full deposit refunded.</li>
              <li><strong className="text-white/80">Final 50% payment:</strong> withheld if deliverables do not match the agreed written specification. We will work to resolve any gap before the final payment is due.</li>
              <li>Disputes must be raised within 14 days of delivery. We resolve all disputes by email before any other action.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">5. How to Request a Refund</h2>
            <p className="mb-3">
              Email <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a> with the subject line <strong className="text-white">Refund Request</strong> and include:
            </p>
            <ul className="list-none space-y-1.5">
              {[
                'The email address used at checkout',
                'Your Stripe receipt or order number',
                'The reason for your request',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <svg className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3">We respond within 2 business days. Approved refunds are processed within 5–10 business days to your original payment method via Stripe.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">6. Chargebacks</h2>
            <p>
              If you initiate a chargeback before contacting us, we reserve the right to dispute it with evidence of delivery. We resolve legitimate issues quickly — please email us first.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">7. Governing Law</h2>
            <p>
              This Refund Policy is governed by the laws of the State of Colorado, USA. By purchasing from Queldrex LLC, you agree to this policy.
            </p>
          </section>

          <div className="pt-4 border-t border-white/8">
            <p className="text-white/35 text-xs">
              Questions? Contact us at{' '}
              <a href="mailto:hello@queldrex.com" className="text-white/50 hover:text-white transition-colors">hello@queldrex.com</a>
              {' '}·{' '}
              <Link href="/terms" className="text-white/50 hover:text-white transition-colors">Terms of Service</Link>
              {' '}·{' '}
              <Link href="/privacy" className="text-white/50 hover:text-white transition-colors">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
