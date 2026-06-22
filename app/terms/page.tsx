import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Terms of Service — Queldrex',
  description: 'Queldrex LLC terms of service — governed by Colorado law, covering all products: AI Visibility Scanner, Monitor, Agency Plan, Pro Tools, and custom development.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-12">
          <p className="text-cyan-500 text-xs font-bold uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-black text-white mb-2">Terms of Service</h1>
          <p className="text-white/30 text-sm">
            Effective: June 20, 2026 &nbsp;·&nbsp; Last updated: June 20, 2026 &nbsp;·&nbsp; Queldrex LLC, a Colorado limited liability company
          </p>
        </div>

        <div className="space-y-10 text-white/60 text-sm leading-relaxed">

          <section id="agreement">
            <h2 className="text-base font-bold text-white mb-3">1. Agreement to Terms</h2>
            <p>
              By accessing queldrex.com, creating an account, purchasing any product, or using any service offered by Queldrex LLC (&ldquo;Queldrex,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree, do not use our website or services. These Terms apply to all visitors, users, and customers.
            </p>
          </section>

          <section id="about">
            <h2 className="text-base font-bold text-white mb-3">2. About Queldrex LLC</h2>
            <p>
              Queldrex LLC is a Colorado limited liability company headquartered in Castle Rock, Colorado (Douglas County). We build and operate AI visibility scanning tools, security tools, subscription monitoring services, and custom software development. Contact: <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a>.
            </p>
          </section>

          <section id="eligibility">
            <h2 className="text-base font-bold text-white mb-3">3. Eligibility</h2>
            <ul className="space-y-2 pl-4 list-disc">
              <li>You must be at least 18 years old to use Queldrex services or make purchases. By using this site, you represent that you are 18 or older.</li>
              <li>If you are purchasing or using Queldrex services on behalf of a business or organization, you represent that you have the authority to bind that entity to these Terms.</li>
              <li>Queldrex services are not intended for children under 13. See our <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</Link> for COPPA details.</li>
            </ul>
          </section>

          <section id="products">
            <h2 className="text-base font-bold text-white mb-3">4. Products and Services</h2>
            <div className="space-y-5">
              <div>
                <p className="font-semibold text-white/80 mb-1">AI Visibility Scanner — $399 one-time</p>
                <p>Scans your domain across 14 AI visibility signals and delivers a complete report package to your email. Each report is custom-generated for your domain. Digital delivery; sale is final after report delivery except as provided in our <Link href="/refunds" className="text-cyan-400 hover:text-cyan-300">Refund Policy</Link>.</p>
              </div>
              <div>
                <p className="font-semibold text-white/80 mb-1">AI Visibility Monitor — $79/month subscription</p>
                <p>Monthly automated rescans of your domain with email alerts when your AI visibility score drops. Includes full access to all Pro Tools while subscription is active. <strong className="text-white/70">Auto-renews monthly.</strong> You will be charged $79 on the same date each month until you cancel. Cancel anytime — see Section 5.</p>
              </div>
              <div>
                <p className="font-semibold text-white/80 mb-1">Agency Plan — $99/month or $996/year subscription</p>
                <p>Multi-client AI visibility management for agencies. Includes 25 client scans/month, white-label HTML reports, bulk client dashboard, and monthly auto-delivered client reports. Available on monthly billing ($99/month) or annual billing ($996/year, equivalent to $83/month). <strong className="text-white/70">Auto-renews on the same billing cycle until cancelled.</strong> Cancel anytime — see Section 5.</p>
              </div>
              <div>
                <p className="font-semibold text-white/80 mb-1">Pro Tools — included with Monitor and Agency subscriptions</p>
                <p>Unlocks full access to: Vibe Coding Security Shield, API Schema Drift Scanner, Database Migration Safety Checker, complete Threat Intelligence Feed, and unlimited Breach Lookup domain scans. Access continues while subscription is active and terminates at cancellation.</p>
              </div>
              <div>
                <p className="font-semibold text-white/80 mb-1">Security Tools — Authorized Use Only</p>
                <p>
                  The Vibe Coding Security Shield, Breach Lookup (domain security), and Threat Intelligence Feed are provided for <strong className="text-white/70">authorized security testing and research only</strong>. By using these tools, you represent that: (a) you own or have explicit written authorization to test any system, domain, or code you submit; (b) your use complies with the Computer Fraud and Abuse Act (18 U.S.C. § 1030), the Electronic Communications Privacy Act, and all applicable laws; and (c) you will not use results to harm, extort, or take unauthorized action against any third party. Queldrex is not liable for unauthorized or unlawful use of security tools.
                </p>
              </div>
              <div>
                <p className="font-semibold text-white/80 mb-1">Free Tools — Directory Extractor, Threat Feed Preview, Breach Password Check</p>
                <p>Available at no charge subject to usage limits. No account required. Usage limits may change at any time. Free tools are provided as-is with no uptime guarantee.</p>
              </div>
              <div>
                <p className="font-semibold text-white/80 mb-1">Build for Me / Custom Development — $750–$3,500+ per project</p>
                <p>Project-based custom software development. Each engagement is scoped, quoted, and confirmed in writing before work begins. A separate project agreement governs each engagement; these Terms apply to the inquiry and intake process.</p>
              </div>
            </div>
          </section>

          <section id="subscriptions">
            <h2 className="text-base font-bold text-white mb-3">5. Subscription Terms and Cancellation</h2>
            <ul className="space-y-2.5 pl-4 list-disc">
              <li><strong className="text-white/80">Auto-renewal:</strong> Subscriptions renew automatically each month on the date of initial purchase. You authorize Queldrex to charge your payment method on file via Stripe until you cancel.</li>
              <li><strong className="text-white/80">Cancellation:</strong> You may cancel your subscription at any time from your dashboard or by emailing <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a>. Cancellation takes effect at the end of the current billing period. You retain access through the date you paid for. Cancellation is as simple as subscribing — no hoops, no waiting periods.</li>
              <li><strong className="text-white/80">New subscriber refund:</strong> If you are a new subscriber and request cancellation within 7 days of your first charge, we will issue a full refund. See our <Link href="/refunds" className="text-cyan-400 hover:text-cyan-300">Refund Policy</Link>.</li>
              <li><strong className="text-white/80">Existing subscriber charges:</strong> No partial-month refunds on billing periods already charged, except for the 7-day new subscriber window.</li>
              <li><strong className="text-white/80">Failed payments:</strong> If a payment fails, Stripe will retry up to 3 times. After 3 failed attempts, your subscription is suspended. You have 7 days to update your payment method before the subscription is cancelled and access removed.</li>
              <li><strong className="text-white/80">Price changes:</strong> We may change subscription pricing with 30 days&apos; advance notice to active subscribers by email. Continued use after the effective date constitutes acceptance of the new price.</li>
            </ul>
          </section>

          <section id="custom-dev">
            <h2 className="text-base font-bold text-white mb-3">6. Custom Development Terms</h2>
            <ul className="space-y-2.5 pl-4 list-disc">
              <li>All custom project quotes are fixed-price for the described scope. Changes to scope require written agreement and may affect pricing and timeline.</li>
              <li>A 50% deposit is required before work begins. The remaining 50% is due upon delivery and client acceptance.</li>
              <li>Client owns all deliverables (source code, assets, documentation) upon receipt of final payment in full.</li>
              <li>Queldrex retains the right to display completed work in our portfolio unless the client requests otherwise in writing prior to project start.</li>
              <li>Post-delivery support is not included unless separately agreed and documented.</li>
              <li>We do not guarantee specific business outcomes, revenue, or performance results from delivered software.</li>
            </ul>
          </section>

          <section id="payments">
            <h2 className="text-base font-bold text-white mb-3">7. Payment Terms</h2>
            <ul className="space-y-2 pl-4 list-disc">
              <li>All payments are processed securely by Stripe, Inc. We do not store your card number.</li>
              <li>All prices are in US dollars (USD).</li>
              <li>Colorado sales tax may be collected at checkout where applicable. Queldrex is registering for a Colorado sales tax license. Digital products and SaaS services may be subject to Colorado sales tax under C.R.S. § 39-26-102. Applicable tax will be displayed at checkout.</li>
              <li>For custom development, invoices are due within 14 days of issuance unless otherwise agreed in writing.</li>
            </ul>
          </section>

          <section id="acceptable-use">
            <h2 className="text-base font-bold text-white mb-3">8. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Scan, probe, or analyze domains, systems, or code you do not own or lack explicit written authorization to test</li>
              <li>Use breach lookup, threat feed, or security tools to harm, harass, stalk, or investigate individuals without authorization</li>
              <li>Attempt to access, probe, or disrupt Queldrex&apos;s admin systems, databases, or infrastructure</li>
              <li>Reverse-engineer, decompile, disassemble, or extract proprietary logic from Queldrex tools</li>
              <li>Scrape, crawl, or systematically harvest data from queldrex.com</li>
              <li>Resell, sublicense, or redistribute Queldrex scan reports or tool outputs without permission (Agency Plan subscribers may white-label reports per plan terms)</li>
              <li>Circumvent subscription paywalls, rate limits, or usage restrictions</li>
              <li>Use our services in violation of any applicable local, state, federal, or international law</li>
            </ul>
            <p className="mt-3">
              Violations may result in immediate account termination, forfeiture of paid fees, and referral to law enforcement where applicable.
            </p>
          </section>

          <section id="ip">
            <h2 className="text-base font-bold text-white mb-3">9. Intellectual Property</h2>
            <ul className="space-y-2.5 pl-4 list-disc">
              <li>Queldrex owns the platform, tools, underlying algorithms, methodology, brand assets, and all content on queldrex.com.</li>
              <li>Customers own the data they submit (domain URLs, code snippets) and the scan results generated for their use.</li>
              <li>Custom development deliverables transfer fully to the client upon final payment in full.</li>
              <li>You may not copy, reproduce, modify, or create derivative works from Queldrex&apos;s platform, brand, or tools without express written permission.</li>
            </ul>
          </section>

          <section id="disclaimers">
            <h2 className="text-base font-bold text-white mb-3">10. Disclaimers</h2>
            <ul className="space-y-2.5 pl-4 list-disc">
              <li>All services are provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.</li>
              <li>Scanner and monitor scores are informational and based on observable technical signals. They are not a guarantee of AI search placement, rankings, or business outcomes.</li>
              <li>AI systems (ChatGPT, Perplexity, Google AI, etc.) operate independently and may change behavior, indexing, and recommendations without notice. Queldrex does not control or guarantee placement in any AI system.</li>
              <li>Security tool results are not a substitute for a full professional security audit, penetration test, or legal compliance opinion.</li>
              <li>We do not warrant that queldrex.com will be uninterrupted, error-free, or free of viruses or other harmful components.</li>
            </ul>
          </section>

          <section id="liability">
            <h2 className="text-base font-bold text-white mb-3">11. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Queldrex LLC, its members, managers, employees, and contractors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to lost profits, lost data, loss of goodwill, or business interruption, even if advised of the possibility of such damages.
            </p>
            <p className="mt-3">
              Our total aggregate liability for any claim arising from or relating to our services shall not exceed the total amount you paid to Queldrex in the 12 months immediately preceding the claim.
            </p>
            <p className="mt-3">
              Some jurisdictions, including Colorado, do not allow the exclusion of certain implied warranties or limitation of certain damages. To the extent such exclusions or limitations are prohibited by applicable law, they do not apply to you, and our liability is limited to the minimum extent permitted by law.
            </p>
          </section>

          <section id="indemnification">
            <h2 className="text-base font-bold text-white mb-3">12. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Queldrex LLC, its members, managers, employees, and contractors from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys&apos; fees) arising out of or in connection with: (a) your use of our services in violation of these Terms; (b) your violation of any applicable law or third-party right; or (c) any content or data you submit to our platform.
            </p>
          </section>

          <section id="colorado-consumer">
            <h2 className="text-base font-bold text-white mb-3">13. Colorado Consumer Protection</h2>
            <p>
              Queldrex operates in compliance with the Colorado Consumer Protection Act (C.R.S. § 6-1-101 et seq.), which prohibits deceptive trade practices. We make honest representations about our products and their capabilities. Nothing in these Terms limits any rights you may have under Colorado consumer protection law. If you believe we have made a deceptive representation, contact us at <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a> and we will address it promptly.
            </p>
          </section>

          <section id="governing-law">
            <h2 className="text-base font-bold text-white mb-3">14. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms are governed by the laws of the State of Colorado, USA, without regard to conflict-of-law principles.
            </p>
            <p className="mt-3">
              For disputes involving amounts of $5,000 or less, either party may bring a claim in Douglas County, Colorado small claims court. For disputes exceeding $5,000, the parties agree to binding arbitration in Colorado under the rules of the American Arbitration Association (AAA), with proceedings in Douglas County, Colorado. You waive any right to participate in a class action lawsuit or class-wide arbitration.
            </p>
            <p className="mt-3">
              Nothing in this section prevents either party from seeking emergency injunctive or equitable relief in any court of competent jurisdiction to prevent irreparable harm.
            </p>
          </section>

          <section id="hipaa-glb">
            <h2 className="text-base font-bold text-white mb-3">15. HIPAA and Financial Privacy</h2>
            <p>
              Queldrex is not a covered entity or business associate under HIPAA and does not handle protected health information. Queldrex is not a financial institution subject to the Gramm-Leach-Bliley Act. Do not submit protected health information or regulated financial data through Queldrex tools.
            </p>
          </section>

          <section id="changes">
            <h2 className="text-base font-bold text-white mb-3">16. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. Material changes will be emailed to active subscribers at least 30 days before taking effect. For non-material changes, we will update the &ldquo;Last updated&rdquo; date at the top of this page. Continued use of our services after the effective date of changes constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section id="contact">
            <h2 className="text-base font-bold text-white mb-3">17. Contact</h2>
            <p>
              Questions about these Terms? Email <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a>. We respond within one business day.
            </p>
            <p className="mt-3 text-white/40">
              Queldrex LLC · Castle Rock, Colorado · hello@queldrex.com · queldrex.com
            </p>
          </section>

        </div>

        <div className="mt-14 pt-8 border-t border-white/5 flex flex-wrap gap-4 text-xs text-white/30">
          <Link href="/" className="hover:text-white transition-colors">← Back to Queldrex</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/refunds" className="hover:text-white transition-colors">Refund Policy</Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
