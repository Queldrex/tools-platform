import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-12">
          <p className="text-cyan-500 text-xs font-bold uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-black text-white mb-2">Terms of Service</h1>
          <p className="text-white/30 text-sm">Last updated: June 17, 2026</p>
        </div>

        <div className="space-y-10 text-white/60 text-sm leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-white mb-3">1. Agreement to Terms</h2>
            <p>
              By accessing queldrex.com or purchasing any service from Queldrex LLC (&ldquo;Queldrex,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, do not use our website or services. These Terms apply to all visitors, users, and customers.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">2. Services Offered</h2>
            <p className="mb-4">Queldrex provides the following services:</p>
            <ul className="space-y-3 pl-4">
              <li>
                <strong className="text-white/80">AI Visibility Scanner — Free</strong>
                <br />A free website analysis tool that checks for AI visibility signals and returns a score and basic recommendations. No purchase required.
              </li>
              <li>
                <strong className="text-white/80">AI Visibility Bundle — $149</strong>
                <br />A one-time-payment digital product that generates and delivers a complete AI optimization package: an llms.txt file, LocalBusiness JSON-LD schema, robots.txt recommendations, AI metadata recommendations, and deployment instructions. Delivered via email within minutes of payment.
              </li>
              <li>
                <strong className="text-white/80">Done-For-You Implementation — Starting at $499</strong>
                <br />A professional service where Queldrex installs and validates AI visibility optimizations directly on your website. Scope, timeline, and final price are confirmed in writing by email before any work begins. Includes 30 days of email support following completion.
              </li>
            </ul>
            <p className="mt-4">Additional services or tools may be offered in the future and will be subject to these Terms unless separate terms are provided.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">3. Payments and Billing</h2>
            <p className="mb-3">
              All payments are processed securely by Stripe, Inc. We do not store your payment card information. All prices are listed in US dollars. By completing a purchase, you authorize Queldrex to charge the stated price for the applicable service.
            </p>
            <p>
              All products and services are one-time purchases. There are no recurring charges unless a future service explicitly states otherwise in a separate agreement.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">4. Refund Policy</h2>
            <p className="mb-3">
              <strong className="text-white/80">Digital products (AI Visibility Bundle):</strong> All sales are final. Because the report package is generated and delivered digitally upon payment, we do not offer refunds after delivery. If a technical failure prevents delivery of your report, contact us at <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a> within 7 days and we will resolve the issue or issue a full refund at our discretion.
            </p>
            <p>
              <strong className="text-white/80">Implementation service:</strong> Cancellations requested before work has commenced are eligible for a full refund. Once implementation work has begun, refunds are not available. If you are dissatisfied with completed work, contact us within 30 days and we will work to resolve the issue.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">5. Implementation Service Terms</h2>
            <p className="mb-3">
              The Done-For-You Implementation service requires you to provide Queldrex with appropriate access to your website (such as FTP credentials, CMS admin access, or similar). By providing this access, you represent that you own or are authorized to make changes to the website.
            </p>
            <p className="mb-3">
              Queldrex will implement only the specific optimizations described in the service scope confirmed by email. We will not make changes beyond the agreed scope without your written approval.
            </p>
            <p>
              Results from AI visibility optimization depend on third-party AI systems (such as ChatGPT, Perplexity, and Google AI) that are outside our control and may change over time. Queldrex does not guarantee specific outcomes, rankings, or visibility improvements in any AI system.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">6. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Submit URLs you do not own or are not authorized to scan.</li>
              <li>Attempt to reverse-engineer, scrape, or abuse our platform or infrastructure.</li>
              <li>Use our services to scan private, internal, or government systems.</li>
              <li>Use our services for any unlawful purpose or in violation of any applicable law.</li>
              <li>Resell, redistribute, or sublicense our generated files or reports without prior written permission.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">7. Intellectual Property</h2>
            <p className="mb-3">
              The generated files included in your AI Visibility Bundle (llms.txt, JSON-LD schema, HTML report) are delivered for your personal or business use on the submitted website. You own the generated output.
            </p>
            <p>
              The Queldrex platform, software, branding, methodology, and website content are the intellectual property of Queldrex LLC. You may not copy, reproduce, or create derivative works from our platform or brand without express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">8. Disclaimer of Warranties</h2>
            <p>
              Our services are provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, express or implied. Queldrex does not warrant that our scan results are complete, error-free, or that implementing our recommendations will produce specific outcomes. AI systems operate independently and their behavior is beyond our control. We do not guarantee uninterrupted or error-free operation of our platform.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Queldrex LLC, its owners, employees, and contractors shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services, including but not limited to loss of profits, data, or business opportunities. Our total liability for any claim arising out of or related to these Terms or our services shall not exceed the total amount you paid to Queldrex in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">10. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Queldrex LLC and its representatives from any claims, damages, losses, or expenses (including reasonable legal fees) arising from your use of our services, your violation of these Terms, or your violation of any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">11. Governing Law and Disputes</h2>
            <p>
              These Terms are governed by the laws of the State of Colorado, United States, without regard to conflict of law principles. Any dispute arising from these Terms or your use of our services shall be resolved through binding arbitration under the rules of the American Arbitration Association, conducted in Colorado, unless the claim qualifies for small claims court. You waive any right to a jury trial or to participate in a class action.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">12. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. We will post the revised Terms on this page with an updated date. Your continued use of our services after any changes constitutes acceptance of the new Terms. If the changes materially affect your rights, we will make reasonable efforts to notify you.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">13. Contact</h2>
            <p>
              Questions about these Terms or our services? Email us at{' '}
              <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a>.
              We respond to all inquiries within one business day.
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
