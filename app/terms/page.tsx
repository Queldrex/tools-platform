import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Terms of Service — Queldrex',
  description: 'Queldrex LLC terms of service covering the AI Visibility Scanner, Monitor subscription, Pro Tools, custom development, and Agency plan.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-12">
          <p className="text-cyan-500 text-xs font-bold uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-black text-white mb-2">Terms of Service</h1>
          <p className="text-white/30 text-sm">Last updated: June 20, 2026 &nbsp;·&nbsp; Queldrex LLC, a Colorado limited liability company</p>
        </div>

        <div className="space-y-10 text-white/60 text-sm leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-white mb-3">1. Agreement to Terms</h2>
            <p>
              By accessing queldrex.com or purchasing any service from Queldrex LLC (&ldquo;Queldrex,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree, do not use our website or services. These Terms apply to all visitors, users, and customers.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">2. Services Offered</h2>
            <p className="mb-4">Queldrex provides the following products and services:</p>
            <ul className="space-y-3 pl-4">
              <li>
                <strong className="text-white/80">AI Visibility Scanner — $149 one-time</strong><br />
                Scans a domain across 14 AI visibility signals and delivers a complete report package via email. Digital delivery; all sales final after delivery.
              </li>
              <li>
                <strong className="text-white/80">AI Visibility Monitor — $29/month subscription</strong><br />
                Monthly automated rescans of your domain with email alerts when your AI visibility score drops. Includes full access to all Pro Tools. Billed monthly via Stripe; cancel anytime.
              </li>
              <li>
                <strong className="text-white/80">Pro Tools — included with Monitor subscription</strong><br />
                Unlocks full access to: complete Threat Intelligence Feed, unlimited Breach Lookup domain scans, Vibe Coding Security Shield, API Schema Drift Scanner, Database Migration Safety Checker, and Directory Extractor. Access continues while subscription is active.
              </li>
              <li>
                <strong className="text-white/80">Build for Me (Custom Development) — $750–$3,500+ per project</strong><br />
                Project-based custom software development. Each project is scoped, quoted, and confirmed in writing before work begins. 50% deposit required upfront; remainder due on delivery.
              </li>
              <li>
                <strong className="text-white/80">Agency Plan — $99/month (coming soon)</strong><br />
                Multi-domain monitoring plus white-label scan reports. Pricing and availability subject to change prior to launch.
              </li>
              <li>
                <strong className="text-white/80">Free Tools</strong><br />
                Limited access to the Threat Intelligence Feed, Breach Lookup password check, and Directory Extractor. No payment or account required. Usage limits apply.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">3. Subscriptions</h2>
            <ul className="space-y-2.5 pl-4 list-disc">
              <li>Subscriptions are billed monthly via Stripe on the date of initial purchase.</li>
              <li>You may cancel anytime. Cancellation takes effect at the end of the current billing period. You retain access through the period you paid for.</li>
              <li>No partial-month refunds on subscription charges already billed.</li>
              <li>Accounts past due for more than 7 days are suspended. Accounts unpaid for more than 30 days are cancelled and data may be deleted per our retention policy.</li>
              <li>We reserve the right to change subscription pricing with 30 days&apos; notice to active subscribers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">4. Custom Development Terms</h2>
            <ul className="space-y-2.5 pl-4 list-disc">
              <li>All custom project quotes are fixed-price for the described scope. Changes to scope require written agreement and may affect pricing and timeline.</li>
              <li>A 50% deposit is required before work begins. The remaining 50% is due upon delivery and client acceptance.</li>
              <li>Client owns all deliverables (source code, assets, documentation) upon receipt of final payment.</li>
              <li>Queldrex retains the right to display completed work in our portfolio unless the client requests otherwise in writing.</li>
              <li>Custom development is delivered as-is after client acceptance. Post-delivery support is not included unless separately agreed.</li>
              <li>We do not guarantee specific business outcomes, revenue, or performance results from delivered software.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">5. Payments</h2>
            <p>
              All payments are processed securely by Stripe, Inc. We do not store your card number. All prices are in US dollars. Applicable sales tax is collected at checkout via Stripe Tax and remitted to the relevant authority.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">6. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Scan or analyze domains you do not own or are not authorized to test</li>
              <li>Use breach lookup or security tools to harm, harass, or investigate individuals without authorization</li>
              <li>Attempt to access, probe, or disrupt our admin systems or infrastructure</li>
              <li>Reverse-engineer, scrape, or resell our tools, APIs, or platform</li>
              <li>Use our services for any unlawful purpose or in violation of applicable law</li>
              <li>Attempt to circumvent subscription paywalls or usage limits</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">7. Intellectual Property</h2>
            <ul className="space-y-2.5 pl-4 list-disc">
              <li>Queldrex owns the platform, tools, underlying technology, methodology, and all brand assets.</li>
              <li>Customers own their data and the scan results generated for their domains.</li>
              <li>Custom development deliverables transfer fully to the client upon final payment.</li>
              <li>You may not copy, reproduce, or create derivative works from our platform, brand, or tools without express written permission.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">8. Disclaimers</h2>
            <ul className="space-y-2.5 pl-4 list-disc">
              <li>Scanner and monitor results are informational only. They are not a guarantee of AI search placement, rankings, or business outcomes.</li>
              <li>Security tool results (breach lookup, vibe security shield, etc.) are not a substitute for professional security audits or legal compliance advice.</li>
              <li>AI systems (ChatGPT, Perplexity, Google AI, etc.) operate independently and may change behavior without notice. We do not control or guarantee placement in any AI system.</li>
              <li>Our services are provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, express or implied.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Queldrex LLC, its owners, employees, and contractors shall not be liable for any indirect, incidental, special, consequential, or punitive damages. Our total liability for any claim shall not exceed the total amount you paid to Queldrex in the 3 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">10. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Queldrex LLC from any claims, damages, or expenses (including reasonable legal fees) arising from your use of our services, your violation of these Terms, or your violation of any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">11. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the State of Colorado, USA, without regard to conflict of law principles. Any dispute shall be resolved through binding arbitration in Colorado under AAA rules, unless the claim qualifies for small claims court. You waive any right to a jury trial or class action.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">12. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. Material changes will be emailed to active subscribers at least 14 days before taking effect. Continued use of our services after the effective date constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">13. Contact</h2>
            <p>
              Questions about these Terms? Email <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a>. We respond within one business day.
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
