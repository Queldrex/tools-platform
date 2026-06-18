import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-12">
          <p className="text-cyan-500 text-xs font-bold uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-black text-white mb-2">Privacy Policy</h1>
          <p className="text-white/30 text-sm">Last updated: June 17, 2026</p>
        </div>

        <div className="space-y-10 text-white/60 text-sm leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-white mb-3">1. Who We Are</h2>
            <p>
              Queldrex LLC (&ldquo;Queldrex,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is a Colorado limited liability company. We operate queldrex.com and provide software tools including the AI Visibility Scanner. For questions about this policy, contact us at <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">2. What Information We Collect</h2>
            <p className="mb-4">We collect only what is necessary to deliver our services:</p>
            <ul className="space-y-3 pl-4">
              <li>
                <strong className="text-white/80">Website URL</strong> — the URL you submit for scanning. This is used to run the analysis and is not stored after 48 hours.
              </li>
              <li>
                <strong className="text-white/80">Email address</strong> — collected when you request a report. Used only to deliver your purchased report package and respond to any support requests.
              </li>
              <li>
                <strong className="text-white/80">Scan results</strong> — the technical output generated from your submitted URL (AI visibility score, signal checks, generated files). Retained for 48 hours to support delivery, then automatically deleted.
              </li>
              <li>
                <strong className="text-white/80">Payment data</strong> — processed entirely by Stripe. Queldrex does not receive, store, or have access to your payment card information at any point.
              </li>
              <li>
                <strong className="text-white/80">Basic usage data</strong> — standard server logs including IP address, browser type, and request timestamps. Retained by our hosting provider (Vercel) according to their standard policies.
              </li>
            </ul>
            <p className="mt-4">We do not collect names, phone numbers, physical addresses, or any information beyond what is listed above.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">3. How We Use Your Information</h2>
            <ul className="space-y-2 pl-4 list-disc">
              <li>To perform the website scan you submitted and generate your AI visibility report.</li>
              <li>To deliver your purchased report package to the email address you provided.</li>
              <li>To process your payment securely through Stripe.</li>
              <li>To respond to support requests or inquiries you send us directly.</li>
              <li>To detect and prevent abuse or misuse of our platform.</li>
            </ul>
            <p className="mt-4">
              We do not sell, rent, share, or trade your personal data with any third party for marketing or commercial purposes. We do not send promotional emails unless you explicitly request them.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">4. Third-Party Services We Use</h2>
            <p className="mb-4">We use the following third-party services to operate our platform. Each is subject to its own privacy policy:</p>
            <ul className="space-y-2.5 pl-4">
              <li><strong className="text-white/80">Stripe</strong> — payment processing. We never see your card details. <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">Stripe Privacy Policy</a>.</li>
              <li><strong className="text-white/80">Resend</strong> — transactional email delivery. Used only to send you your report after purchase.</li>
              <li><strong className="text-white/80">Upstash</strong> — temporary Redis database used to store scan results. Data is automatically deleted after 48 hours.</li>
              <li><strong className="text-white/80">Vercel</strong> — website hosting and serverless infrastructure. Handles standard request logs.</li>
            </ul>
            <p className="mt-4">We do not use Google Analytics, Facebook Pixel, or any advertising or behavioral tracking services.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">5. Data Retention</h2>
            <ul className="space-y-2.5 pl-4 list-disc">
              <li><strong className="text-white/80">Scan results and submitted URLs</strong> — automatically deleted after 48 hours.</li>
              <li><strong className="text-white/80">Email addresses</strong> — retained only as needed to fulfill your order and support requests. You may request deletion at any time.</li>
              <li><strong className="text-white/80">Payment records</strong> — retained by Stripe per their legal and compliance obligations. We retain only a Stripe transaction reference for our records.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">6. Cookies</h2>
            <p>
              We use only the functional cookies required for the website to operate (such as session state during a scan). We do not use advertising cookies, tracking cookies, or analytics cookies. You can disable cookies in your browser settings; this may affect certain site functionality.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">7. Security</h2>
            <p>
              All data transmitted between your browser and our servers is encrypted using HTTPS/TLS. Payment data is handled entirely by Stripe and never transmitted to or stored on our infrastructure. Scan results are stored in a temporary database with access controls and are automatically purged after 48 hours.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">8. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="space-y-2 pl-4 list-disc">
              <li>Request access to the personal data we hold about you.</li>
              <li>Request correction of inaccurate personal data.</li>
              <li>Request deletion of your personal data.</li>
              <li>Withdraw consent where processing is based on consent.</li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, email us at <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a>. We will respond within 5 business days.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">9. Children&apos;s Privacy</h2>
            <p>
              Our services are not directed at or intended for use by individuals under the age of 18. We do not knowingly collect personal data from minors. If you believe we have inadvertently collected such data, contact us immediately and we will delete it.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy when our services or legal requirements change. We will post the updated policy on this page with a revised date. Continued use of our services after an update constitutes acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">11. Contact</h2>
            <p>
              For any questions or concerns about this Privacy Policy, or to exercise your rights, contact us at <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a>. We respond to all inquiries within one business day.
            </p>
          </section>

        </div>

        <div className="mt-14 pt-8 border-t border-white/5">
          <Link href="/" className="text-white/30 hover:text-white text-sm transition-colors">← Back to Queldrex</Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
