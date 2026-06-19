import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Refund Policy — Queldrex',
  description: 'Queldrex LLC refund policy for AI Visibility Reports and Done-For-You services.',
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
          <p className="text-white/40 text-sm">Last updated: June 19, 2026 &nbsp;·&nbsp; Queldrex LLC, a Colorado limited liability company</p>
        </div>

        <div
          className="rounded-2xl border p-8 space-y-8 text-white/70 text-sm leading-relaxed"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <section>
            <h2 className="text-white font-bold text-base mb-3">1. Digital Products — AI Visibility Report Bundle ($149)</h2>
            <p className="mb-3">
              All sales of digital products, including the AI Visibility Report Bundle, are <strong className="text-white">final and non-refundable</strong> once the report package has been generated and delivered to your email address. Where required by law, applicable sales tax is collected and remitted to the relevant tax authority; tax amounts are <strong className="text-white">non-refundable</strong> in all cases as they are remitted at the time of transaction.
            </p>
            <p className="mb-3">
              Because each report is custom-generated for a specific website at the time of purchase and immediately delivered as a downloadable file package, we are unable to &quot;take back&quot; or resell digital goods.
            </p>
            <p>
              <strong className="text-white">Technical issues:</strong> If you did not receive your download email, the download link is broken, or the files in your package are corrupted or incomplete, contact us at{' '}
              <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">hello@queldrex.com</a>{' '}
              within 7 days of purchase. We will re-send your files or provide a working download link at no charge.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">2. Done-For-You Implementation Service (Starting at $499)</h2>
            <p className="mb-3">
              Done-For-You implementation services are eligible for a full refund if requested <strong className="text-white">before work has begun</strong> (i.e., before you have submitted hosting credentials and before an implementation slot has been assigned).
            </p>
            <p className="mb-3">
              Once implementation work has begun, refunds are issued at our discretion based on the percentage of work completed. If we are unable to complete the implementation due to factors within our control (e.g., our error, technical failure on our end), you will receive a full refund.
            </p>
            <p>
              If implementation is blocked due to factors outside our control — including inaccessible credentials, site restrictions, incompatible platforms, or failure to respond within the 48-hour credential window — no refund will be issued, but we will provide a full report package equivalent to the $149 bundle at no additional charge.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">3. How to Request a Refund</h2>
            <p className="mb-3">
              To request a refund (where eligible under Section 2 above), email{' '}
              <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">hello@queldrex.com</a>{' '}
              with the subject line <strong className="text-white">Refund Request</strong> and include:
            </p>
            <ul className="list-none space-y-1.5 ml-0">
              {[
                'The email address used at checkout',
                'Your Stripe receipt or order number',
                'The reason for your refund request',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <svg className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3">
              Eligible refunds are processed within 5–10 business days. Refunds are returned to the original payment method via Stripe.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">4. Chargebacks</h2>
            <p>
              If you initiate a chargeback with your card issuer before contacting us, we reserve the right to dispute the chargeback and provide evidence of delivery. We encourage you to contact us first — we resolve legitimate issues quickly and fairly.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">5. Governing Law</h2>
            <p>
              This Refund Policy is governed by the laws of the State of Colorado, without regard to its conflict of law provisions. By purchasing from Queldrex LLC, you agree to this policy.
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
