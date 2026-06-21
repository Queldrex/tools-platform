import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Refund Policy — Queldrex',
  description: 'Queldrex LLC refund policy for the AI Visibility Scanner, Monitor subscription, Agency Plan, Pro Tools, and custom development services. Colorado consumer rights included.',
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
          <p className="text-white/40 text-sm">
            Effective: June 20, 2026 &nbsp;·&nbsp; Last updated: June 20, 2026 &nbsp;·&nbsp; Queldrex LLC, a Colorado limited liability company
          </p>
        </div>

        <div
          className="rounded-2xl border p-8 space-y-8 text-white/70 text-sm leading-relaxed"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}
        >

          <section>
            <p className="text-white/55">
              We want you to be satisfied with every Queldrex product. If something goes wrong, we make it right. Contact us at <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a> before initiating a chargeback — we resolve legitimate issues quickly and without friction.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">1. AI Visibility Scanner — $399 one-time</h2>
            <ul className="space-y-2.5 pl-4 list-disc">
              <li>
                <strong className="text-white/80">Report not delivered within 24 hours of payment:</strong> full refund, no questions asked. Email us with your payment receipt and we will process the refund immediately.
              </li>
              <li>
                <strong className="text-white/80">Report delivered but technically defective</strong> (corrupted files, missing signal sections, factual errors in results): full refund or re-delivery at your choice. Contact within 7 days of delivery.
              </li>
              <li>
                <strong className="text-white/80">Report delivered and working, but you are not satisfied:</strong> contact us within 7 days of delivery. We will review your concern and issue a refund if the report failed to deliver the promised 14-signal analysis or the fix package was incomplete. Dissatisfaction with your score is not grounds for a refund — the score is an accurate reflection of the signals we found.
              </li>
              <li>
                <strong className="text-white/80">After 7 days of delivery:</strong> no refund. Each report is custom-generated for your specific domain and delivered digitally.
              </li>
            </ul>
            <p className="mt-3">
              To request a refund, email <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a> with subject: <strong className="text-white/80">Refund Request — Scanner</strong>, and include your domain and purchase email.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">2. AI Visibility Monitor — $79/month subscription</h2>
            <ul className="space-y-2.5 pl-4 list-disc">
              <li>
                <strong className="text-white/80">New subscribers (first 7 days):</strong> if you subscribed within the last 7 days and are not satisfied, email us for a full refund of your first payment. No questions asked.
              </li>
              <li>
                <strong className="text-white/80">Existing subscribers:</strong> no refund for billing periods already charged. Cancel before your next billing date to stop future charges. You retain access through the end of the paid period.
              </li>
              <li>
                <strong className="text-white/80">Service outage:</strong> if we experience a confirmed service outage exceeding 72 continuous hours, a pro-rated credit will be applied to your next billing cycle.
              </li>
            </ul>
            <p className="mt-3">
              Cancel anytime from your Monitor dashboard or email <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a>. Cancellation takes effect at the end of your current billing period.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">3. Agency Plan — $299/month subscription</h2>
            <ul className="space-y-2.5 pl-4 list-disc">
              <li>
                <strong className="text-white/80">New subscribers (first 7 days):</strong> full refund of your first payment if requested within 7 days of your first charge.
              </li>
              <li>
                <strong className="text-white/80">Existing subscribers:</strong> no refund for billing periods already charged. Cancel before your next billing date to prevent future charges. Access continues through the paid period.
              </li>
              <li>
                <strong className="text-white/80">Unused scan credits:</strong> monthly scan credits (25/month) do not roll over and are not refundable on cancellation.
              </li>
            </ul>
            <p className="mt-3">
              Cancel anytime from your Agency dashboard or email <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">4. Pro Tools — included with Monitor and Agency</h2>
            <p>
              Pro Tools (Vibe Coding Security Shield, API Schema Drift Scanner, Database Migration Safety Checker, full Threat Intelligence Feed, unlimited Breach Lookup) are included at no additional charge with Monitor ($79/mo) and Agency ($299/mo) subscriptions. Refunds follow the subscription policy above. There is no separate charge to refund.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">5. Build for Me — Custom Development</h2>
            <ul className="space-y-2.5 pl-4 list-disc">
              <li>
                <strong className="text-white/80">Deposit (50%) — before work begins:</strong> fully refundable if you cancel before Queldrex begins work. Non-refundable once work has started.
              </li>
              <li>
                <strong className="text-white/80">If Queldrex fails to deliver the agreed scope:</strong> full deposit refunded. We stand behind our commitments.
              </li>
              <li>
                <strong className="text-white/80">Final payment (50%) — on delivery:</strong> withheld until deliverables match the written specification. We resolve any scope gap before the final payment is due.
              </li>
              <li>
                Disputes must be raised within 14 days of delivery. We resolve all disputes by email first. No litigation without first attempting good-faith resolution.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">6. Free Tools</h2>
            <p>
              The Directory Extractor, Threat Intelligence Feed (free tier), and Breach Lookup (password check) are provided at no charge. No payment is collected, so no refund applies.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">7. How to Request a Refund</h2>
            <p className="mb-3">
              Email <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a> with the subject <strong className="text-white/80">Refund Request</strong> and include:
            </p>
            <ul className="list-none space-y-1.5">
              {[
                'The email address used at checkout',
                'Your Stripe receipt or order number',
                'The product (Scanner / Monitor / Agency / Custom Build)',
                'The reason for your request',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <svg className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3">
              We respond within 2 business days. Approved refunds are processed within 5–10 business days to your original payment method via Stripe.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">8. Chargebacks</h2>
            <p>
              If you initiate a chargeback or payment dispute before contacting us, we reserve the right to contest it with evidence of delivery. Please email us first — we resolve legitimate issues quickly and will not make you fight for a refund you deserve.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">9. Colorado Consumer Rights</h2>
            <p>
              Nothing in this Refund Policy limits or waives any rights you may have under the Colorado Consumer Protection Act (C.R.S. § 6-1-101 et seq.) or other applicable Colorado or federal consumer protection law. If you believe you have been treated unfairly, you also have the right to file a complaint with the Colorado Attorney General&apos;s Consumer Protection Section at coag.gov/consumer.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3">10. Governing Law</h2>
            <p>
              This Refund Policy is governed by the laws of the State of Colorado, USA. By purchasing from Queldrex LLC, you agree to the terms of this policy.
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
