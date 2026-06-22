import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Privacy Policy — Queldrex',
  description: 'Queldrex LLC privacy policy — Colorado Privacy Act compliant, covering all products including AI Visibility Scanner, Monitor, Agency Plan, Pro Tools, and custom development.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-12">
          <p className="text-cyan-500 text-xs font-bold uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-black text-white mb-2">Privacy Policy</h1>
          <p className="text-white/30 text-sm">
            Effective: June 20, 2026 &nbsp;·&nbsp; Last updated: June 20, 2026 &nbsp;·&nbsp; Queldrex LLC, a Colorado limited liability company
          </p>
        </div>

        <div className="space-y-10 text-white/60 text-sm leading-relaxed">

          <section id="who-we-are">
            <h2 className="text-base font-bold text-white mb-3">1. Who We Are</h2>
            <p>
              Queldrex LLC (&ldquo;Queldrex,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is a Colorado limited liability company headquartered in Castle Rock, Colorado. We operate queldrex.com and provide AI visibility scanning tools, security tools, subscription monitoring services, and custom software development. Questions about this policy: <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a>.
            </p>
          </section>

          <section id="data-collected">
            <h2 className="text-base font-bold text-white mb-3">2. What Information We Collect</h2>
            <p className="mb-4">We collect only what is necessary to deliver our services:</p>
            <ul className="space-y-3 pl-4">
              <li>
                <strong className="text-white/80">AI Visibility Scanner ($399 one-time)</strong> — the domain URL you submit and your email address. Used to run the scan and deliver your report. Paid scan results retained 12 months; free scan data deleted after 48 hours.
              </li>
              <li>
                <strong className="text-white/80">AI Visibility Monitor ($79/month)</strong> — your email address and monitored domain(s). We store monthly scan scores and history to power alerts and your dashboard. Retained while subscription is active and 12 months after cancellation.
              </li>
              <li>
                <strong className="text-white/80">Agency Plan ($99/month)</strong> — agency name, email address, client domain list, and scan history for up to 25 client domains per month. Retained while subscription is active and 12 months after cancellation.
              </li>
              <li>
                <strong className="text-white/80">Pro Tools (Vibe Security Shield, API Schema Drift Scanner, Database Migration Safety Checker)</strong> — no separate account required. Tool usage is linked to your Monitor or Agency subscription. Code and data you submit for security scanning is processed in memory and not stored after the session.
              </li>
              <li>
                <strong className="text-white/80">Directory Extractor, Threat Intelligence Feed, Breach Lookup (Free Tools)</strong> — no account or email required. URLs submitted to the Directory Extractor are not logged. Breach Lookup password checks use k-anonymity (your password is never sent to our servers or to Have I Been Pwned in full). Domain security queries are not linked to your identity.
              </li>
              <li>
                <strong className="text-white/80">Build for Me (Custom Development)</strong> — name, email, company, project description, budget, and all project communications. Retained for 7 years for business and tax records.
              </li>
              <li>
                <strong className="text-white/80">Payment data</strong> — processed entirely by Stripe, Inc. Queldrex never receives, stores, or has access to your card number, CVV, or full card details. We store: Stripe customer ID, subscription ID, and payment status only.
              </li>
              <li>
                <strong className="text-white/80">Security and server logs</strong> — IP addresses of all requests, retained for 30 days for security monitoring, fraud prevention, and rate limiting.
              </li>
              <li>
                <strong className="text-white/80">Cookies</strong> — functional session cookies only (e.g., cookie consent preference). No advertising, tracking, or analytics cookies are used on this site.
              </li>
            </ul>
          </section>

          <section id="how-we-use">
            <h2 className="text-base font-bold text-white mb-3">3. How We Use Your Information</h2>
            <ul className="space-y-2 pl-4 list-disc">
              <li>Deliver purchased scan reports and tool outputs</li>
              <li>Send monthly AI visibility scan results and score-drop alerts (Monitor/Agency subscribers)</li>
              <li>Send magic-link login emails for dashboard access</li>
              <li>Process subscription billing and send receipts via Stripe</li>
              <li>Respond to support requests and project inquiries</li>
              <li>Fraud prevention and admin security monitoring</li>
              <li>Comply with legal obligations (tax, business records)</li>
              <li>Improve tool accuracy and signal coverage</li>
            </ul>
            <p className="mt-4 font-medium text-white/70">We do not sell, rent, share, or trade your personal data with any third party for marketing or advertising purposes. We do not send promotional emails unless you explicitly opt in.</p>
          </section>

          <section id="what-we-dont-do">
            <h2 className="text-base font-bold text-white mb-3">4. What We Do NOT Do</h2>
            <ul className="space-y-2 pl-4 list-disc">
              <li>We do not sell your personal data to any third party</li>
              <li>We do not share your data with advertisers</li>
              <li>We do not use Google Analytics, Facebook Pixel, or any behavioral tracking or advertising technology</li>
              <li>We do not use tracking cookies or third-party analytics cookies</li>
              <li>We do not store your payment card details</li>
              <li>We do not retain submitted code or security scan data after your session</li>
            </ul>
          </section>

          <section id="cookies">
            <h2 className="text-base font-bold text-white mb-3">5. Cookies and Tracking</h2>
            <p>
              We use only functional cookies required for the website to operate — specifically a cookie that stores your cookie consent preference. We do not use advertising cookies, tracking pixels, analytics cookies, or any third-party cookie-based services. You can disable cookies in your browser without losing access to any Queldrex features.
            </p>
          </section>

          <section id="data-retention">
            <h2 className="text-base font-bold text-white mb-3">6. Data Retention</h2>
            <ul className="space-y-2.5 pl-4 list-disc">
              <li><strong className="text-white/80">Free scan data</strong> — deleted after 48 hours</li>
              <li><strong className="text-white/80">Paid scan reports</strong> — retained 12 months</li>
              <li><strong className="text-white/80">Monitor and Agency scan history</strong> — retained while subscription is active + 12 months after cancellation</li>
              <li><strong className="text-white/80">Custom development project records</strong> — retained 7 years (tax and business records)</li>
              <li><strong className="text-white/80">Payment records</strong> — retained 7 years as required by law</li>
              <li><strong className="text-white/80">Security and server logs</strong> — retained 30 days</li>
              <li><strong className="text-white/80">Credentials submitted for custom development</strong> — encrypted at rest, deleted within 48 hours of project completion and confirmed by email</li>
            </ul>
          </section>

          <section id="colorado-rights">
            <h2 className="text-base font-bold text-white mb-3">7. Your Rights — Colorado Privacy Act (CPA)</h2>
            <p className="mb-3">
              The Colorado Privacy Act (C.R.S. § 6-1-1301 et seq.), effective July 1, 2023, grants Colorado residents rights over their personal data. Queldrex currently processes data below the CPA&apos;s mandatory applicability thresholds (100,000 consumers/year or 25,000 consumers/year when deriving revenue from data sale). However, we honor these rights for all users regardless of residency:
            </p>
            <ul className="space-y-2 pl-4 list-disc">
              <li><strong className="text-white/80">Right to Access</strong> — request a copy of the personal data we hold about you</li>
              <li><strong className="text-white/80">Right to Correct</strong> — request correction of inaccurate personal data</li>
              <li><strong className="text-white/80">Right to Delete</strong> — request deletion of your personal data (subject to legal retention requirements)</li>
              <li><strong className="text-white/80">Right to Data Portability</strong> — receive your data in a portable format</li>
              <li><strong className="text-white/80">Right to Opt Out of Sale</strong> — we do not sell personal data. There is nothing to opt out of.</li>
              <li><strong className="text-white/80">Right to Appeal</strong> — if we deny a request, you may appeal by emailing hello@queldrex.com</li>
            </ul>
            <p className="mt-3">
              To exercise any right, email <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a>. We will respond within 45 days as required by the Colorado Privacy Act (extendable by an additional 45 days with notice for complex requests).
            </p>
          </section>

          <section id="security">
            <h2 className="text-base font-bold text-white mb-3">8. Security</h2>
            <p className="mb-3">
              We take reasonable measures to protect your information:
            </p>
            <ul className="space-y-2 pl-4 list-disc">
              <li>All data is transmitted over HTTPS/TLS</li>
              <li>Credentials submitted for custom development are encrypted at rest using AES-256-GCM</li>
              <li>Payment processing is handled entirely by Stripe — card data never touches our servers</li>
              <li>Admin access is protected by TOTP two-factor authentication and IP-based rate limiting</li>
            </ul>
            <p className="mt-3">
              <strong className="text-white/80">Security Breach Notification:</strong> In the event of a security breach affecting Colorado residents&apos; personal data, Queldrex will notify affected individuals in the most expedient time possible and no later than 30 days after discovery, as required by Colorado Revised Statutes § 6-1-716.
            </p>
          </section>

          <section id="third-parties">
            <h2 className="text-base font-bold text-white mb-3">9. Third-Party Services</h2>
            <p className="mb-4">We use the following services to operate our platform, each subject to its own privacy policy:</p>
            <ul className="space-y-2.5 pl-4">
              <li><strong className="text-white/80">Stripe</strong> — payment processing. Card data never reaches Queldrex. <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">stripe.com/privacy</a></li>
              <li><strong className="text-white/80">Upstash / Redis</strong> — database for scan results, subscriptions, and tool data. <a href="https://upstash.com/static/trust/privacy.pdf" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">upstash.com privacy</a></li>
              <li><strong className="text-white/80">Resend</strong> — transactional email (scan reports, magic links, alerts). <a href="https://resend.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">resend.com/privacy</a></li>
              <li><strong className="text-white/80">Vercel</strong> — website hosting and serverless infrastructure. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">vercel.com/legal/privacy-policy</a></li>
              <li><strong className="text-white/80">Have I Been Pwned (HIBP)</strong> — breach lookup uses k-anonymity: only the first 5 characters of a SHA-1 hash are sent to HIBP&apos;s API. Your full password or email is never transmitted.</li>
            </ul>
            <p className="mt-4">We do not use Google Analytics, Facebook Pixel, LinkedIn Insight Tag, or any advertising network technology.</p>
          </section>

          <section id="gdpr">
            <h2 className="text-base font-bold text-white mb-3">8. Additional Rights — EU/EEA Residents (GDPR)</h2>
            <p className="mb-3">
              If you are located in the European Union or European Economic Area, you have additional rights under the General Data Protection Regulation (GDPR). We process your personal data on the following legal bases:
            </p>
            <ul className="space-y-2 pl-4 list-disc mb-3">
              <li><strong className="text-white/80">Contract performance</strong> — when you purchase a scan, subscribe, or use a paid tool, processing is necessary to deliver the service.</li>
              <li><strong className="text-white/80">Legitimate interests</strong> — server logs for security, fraud prevention, and abuse detection.</li>
              <li><strong className="text-white/80">Legal obligations</strong> — tax records and business compliance.</li>
            </ul>
            <p className="mb-3">In addition to the rights in Section 7, EU/EEA residents have the right to: object to processing based on legitimate interests; restrict processing in limited circumstances; and lodge a complaint with your local data protection authority (supervisory authority) in your EU member state.</p>
            <p>We transfer data to US-based processors (Stripe, Vercel, Upstash, Resend) under standard contractual clauses or their applicable transfer mechanisms. We are not required to designate an EU representative as we do not engage in large-scale processing of EU personal data. Contact: <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a>.</p>
          </section>

          <section id="email-communications">
            <h2 className="text-base font-bold text-white mb-3">9. Email Communications (CAN-SPAM)</h2>
            <p className="mb-3">
              Queldrex sends transactional emails only: scan reports, subscription receipts, score alerts, and magic login links. These are not marketing emails. We do not send unsolicited commercial email. All emails include:
            </p>
            <ul className="space-y-2 pl-4 list-disc">
              <li>Our identity (Queldrex LLC) and business address (Castle Rock, CO 80104)</li>
              <li>A way to opt out of non-essential email communications</li>
            </ul>
            <p className="mt-3">To stop transactional emails, cancel your subscription or email <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a>.</p>
          </section>

          <section id="children">
            <h2 className="text-base font-bold text-white mb-3">11. Children&apos;s Privacy (COPPA)</h2>
            <p>
              Queldrex tools and services are intended for users 18 years of age and older and are not directed at children. We do not knowingly collect personal information from anyone under 13. If we discover we have inadvertently collected data from a child under 13, we will delete it immediately. If you believe a child has provided us with personal information, contact us at <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a>.
            </p>
          </section>

          <section id="dmca">
            <h2 className="text-base font-bold text-white mb-3">12. Copyright / DMCA</h2>
            <p>
              Queldrex respects intellectual property rights. If you believe content on queldrex.com infringes your copyright, send a DMCA takedown notice to <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a> with: identification of the copyrighted work, identification of the infringing content and its location, your contact information, a statement of good faith belief, and your signature. We will respond promptly.
            </p>
          </section>

          <section id="exclusions">
            <h2 className="text-base font-bold text-white mb-3">13. HIPAA and Financial Privacy</h2>
            <p>
              Queldrex is not a covered entity under HIPAA and does not handle protected health information. Queldrex is not a financial institution subject to the Gramm-Leach-Bliley Act. These regulations do not apply to our services.
            </p>
          </section>

          <section id="accessibility">
            <h2 className="text-base font-bold text-white mb-3">14. Accessibility</h2>
            <p>
              Queldrex is committed to making queldrex.com accessible to users with disabilities. We make good faith efforts to comply with WCAG 2.1 Level AA guidelines. If you encounter an accessibility barrier, please email <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a> and we will address it promptly.
            </p>
          </section>

          <section id="changes">
            <h2 className="text-base font-bold text-white mb-3">15. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy when our services or legal requirements change. Material changes will be emailed to active subscribers at least 14 days before taking effect. Continued use of our services after the effective date constitutes acceptance of the revised policy.
            </p>
          </section>

          <section id="contact">
            <h2 className="text-base font-bold text-white mb-3">16. Contact</h2>
            <p>
              For any questions, concerns, or to exercise your rights under this policy or applicable law, contact us at <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a>. We respond to general inquiries within one business day and to formal data rights requests within 45 days as required by the Colorado Privacy Act.
            </p>
            <p className="mt-3 text-white/40">
              Queldrex LLC · Castle Rock, Colorado · hello@queldrex.com · queldrex.com
            </p>
          </section>

        </div>

        <div className="mt-14 pt-8 border-t border-white/5 flex flex-wrap gap-4 text-xs text-white/30">
          <Link href="/" className="hover:text-white transition-colors">← Back to Queldrex</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/refunds" className="hover:text-white transition-colors">Refund Policy</Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
