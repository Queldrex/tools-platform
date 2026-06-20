import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Privacy Policy — Queldrex',
  description: 'Queldrex LLC privacy policy covering the AI Visibility Scanner, Monitor subscription, Pro Tools, and custom development services.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-12">
          <p className="text-cyan-500 text-xs font-bold uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-black text-white mb-2">Privacy Policy</h1>
          <p className="text-white/30 text-sm">Last updated: June 20, 2026 &nbsp;·&nbsp; Queldrex LLC, a Colorado limited liability company</p>
        </div>

        <div className="space-y-10 text-white/60 text-sm leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-white mb-3">1. Who We Are</h2>
            <p>
              Queldrex LLC (&ldquo;Queldrex,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is a Colorado limited liability company. We operate queldrex.com and provide software tools, AI visibility services, subscriptions, and custom software development. For questions about this policy, contact us at <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">2. What Information We Collect</h2>
            <p className="mb-4">We collect only what is necessary to deliver our services:</p>
            <ul className="space-y-3 pl-4">
              <li>
                <strong className="text-white/80">AI Visibility Scanner</strong> — the domain URL you submit and your email address. Used to run the analysis and deliver your report. Paid scan results retained 90 days; free scan results deleted after 48 hours.
              </li>
              <li>
                <strong className="text-white/80">AI Visibility Monitor (subscription)</strong> — your email address and the domain(s) you are monitoring. We store monthly scan scores and score history to power alerts and your dashboard. Retained while your subscription is active and for 12 months after cancellation.
              </li>
              <li>
                <strong className="text-white/80">Pro Tools</strong> — no separate account is required. Tool usage is linked to your monitor subscription email. We do not log individual tool queries (e.g., breach lookup searches stay client-side or are not linked to your identity).
              </li>
              <li>
                <strong className="text-white/80">Custom Development (Build for Me)</strong> — name, email address, company name, project description, budget, and all project communications. Retained for 3 years for business records.
              </li>
              <li>
                <strong className="text-white/80">Payment data</strong> — processed entirely by Stripe. We never receive, store, or have access to your card number. We store: Stripe customer ID, subscription ID, and payment status.
              </li>
              <li>
                <strong className="text-white/80">Security logs</strong> — IP addresses of requests to our admin system, retained for 30 days for security monitoring and fraud prevention.
              </li>
              <li>
                <strong className="text-white/80">Cookies</strong> — functional session cookies only. No advertising, tracking, or analytics cookies.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">3. How We Use Your Information</h2>
            <ul className="space-y-2 pl-4 list-disc">
              <li>Deliver purchased reports, tools, and services</li>
              <li>Send monthly AI visibility scan results and score-drop alerts (monitor subscribers)</li>
              <li>Send magic-link login emails for your monitor dashboard</li>
              <li>Respond to support requests and project inquiries</li>
              <li>Fraud prevention and admin security monitoring</li>
              <li>Legal compliance and business recordkeeping</li>
            </ul>
            <p className="mt-4">We do not sell, rent, share, or trade your personal data with any third party for marketing purposes. We do not send promotional emails unless you explicitly request them.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">4. Data Retention</h2>
            <ul className="space-y-2.5 pl-4 list-disc">
              <li><strong className="text-white/80">Free scan results</strong> — deleted after 48 hours</li>
              <li><strong className="text-white/80">Paid scan results</strong> — retained for 90 days</li>
              <li><strong className="text-white/80">Monitor scan history</strong> — retained while subscription is active + 12 months after cancellation</li>
              <li><strong className="text-white/80">Custom build project records</strong> — retained for 3 years</li>
              <li><strong className="text-white/80">Payment records</strong> — retained for 7 years (legal requirement)</li>
              <li><strong className="text-white/80">Security logs</strong> — retained for 30 days</li>
              <li><strong className="text-white/80">DFY credentials</strong> — deleted within 48 hours of project completion and confirmed by email receipt</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">5. Third-Party Services</h2>
            <p className="mb-4">We use the following services to operate our platform, each subject to its own privacy policy:</p>
            <ul className="space-y-2.5 pl-4">
              <li><strong className="text-white/80">Stripe</strong> — payment processing. We never see your card details. <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">stripe.com/privacy</a></li>
              <li><strong className="text-white/80">Upstash</strong> — Redis database for scan results, subscriptions, and tool data. <a href="https://upstash.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">upstash.com/privacy</a></li>
              <li><strong className="text-white/80">Resend</strong> — transactional email delivery for reports, alerts, and magic links. <a href="https://resend.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">resend.com/privacy</a></li>
              <li><strong className="text-white/80">Vercel</strong> — website hosting and serverless infrastructure. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">vercel.com/legal/privacy-policy</a></li>
            </ul>
            <p className="mt-4">We do not use Google Analytics, Facebook Pixel, or any advertising or behavioral tracking services.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">6. Cookies</h2>
            <p>
              We use only the functional cookies required for the website to operate (such as session state during a scan or tool use). We do not use advertising cookies, tracking cookies, or analytics cookies. You can disable cookies in your browser; this may affect certain functionality.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">7. Security</h2>
            <p>
              All data transmitted between your browser and our servers is encrypted via HTTPS/TLS. Payment data is handled entirely by Stripe and never stored on our infrastructure. Admin access is protected by multi-factor authentication and IP-based rate limiting. Credentials provided for custom development work are encrypted at rest and deleted within 48 hours of project completion.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">8. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="space-y-2 pl-4 list-disc">
              <li>Request access to the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your personal data</li>
              <li>Cancel your subscription instantly via the Stripe billing portal</li>
              <li>Request a copy of your scan history</li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, email <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a>. We respond within 5 business days.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">9. California Residents — CCPA</h2>
            <p className="mb-3">California residents have additional rights under the CCPA:</p>
            <ul className="space-y-2 pl-4 list-disc">
              <li><strong className="text-white/80">Right to Know</strong> — request disclosure of categories and specific pieces of personal information we hold</li>
              <li><strong className="text-white/80">Right to Delete</strong> — request deletion of your personal information</li>
              <li><strong className="text-white/80">Right to Opt-Out of Sale</strong> — we do not sell personal information. There is nothing to opt out of.</li>
              <li><strong className="text-white/80">Right to Non-Discrimination</strong> — we will not discriminate against you for exercising any CCPA right</li>
            </ul>
            <p className="mt-3">Contact <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a> to exercise CCPA rights. We respond within 45 days as required by law.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">10. Children&apos;s Privacy</h2>
            <p>
              Our services are not directed at individuals under 13. We do not knowingly collect data from minors. If you believe we have inadvertently collected such data, contact us immediately and we will delete it.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy when our services or legal requirements change. Material changes will be emailed to active subscribers. Continued use of our services after an update constitutes acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">12. Contact</h2>
            <p>
              For any questions, concerns, or to exercise your rights, contact us at <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a>. We respond to all inquiries within one business day.
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
