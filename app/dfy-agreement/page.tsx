import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Done-For-You Service Agreement — Queldrex',
  description: 'Terms governing Queldrex Done-For-You AI Visibility Implementation service.',
}

export default function DfyAgreementPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-12">
          <p className="text-cyan-500 text-xs font-bold uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-black text-white mb-2">Done-For-You Service Agreement</h1>
          <p className="text-white/30 text-sm">Effective: June 2026 &nbsp;·&nbsp; Queldrex LLC, a Colorado limited liability company</p>
        </div>

        <div className="space-y-10 text-white/60 text-sm leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-white mb-3">1. Parties</h2>
            <p>
              This Service Agreement (&ldquo;Agreement&rdquo;) is between <strong className="text-white/80">Queldrex LLC</strong> (&ldquo;Queldrex,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;), a Colorado limited liability company, and the customer who completes payment for the Done-For-You AI Visibility Implementation service (&ldquo;you&rdquo; or &ldquo;Client&rdquo;). By completing payment you agree to be bound by this Agreement.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">2. Scope of Work</h2>
            <p className="mb-3">Queldrex will implement the following AI visibility fixes on the website you specify in your application (&ldquo;the Site&rdquo;):</p>
            <ul className="space-y-2 pl-4 list-disc">
              <li>Generate and deploy an <strong className="text-white/80">llms.txt</strong> file to your web root</li>
              <li>Generate and deploy a <strong className="text-white/80">LocalBusiness JSON-LD schema</strong> into your site&apos;s &lt;head&gt;</li>
              <li>Update your <strong className="text-white/80">robots.txt</strong> to permit AI crawler access and add a Sitemap directive</li>
              <li>Generate and deploy a <strong className="text-white/80">sitemap.xml</strong> to your web root</li>
              <li>Add <strong className="text-white/80">Open Graph and canonical URL tags</strong> to your homepage</li>
              <li>Deliver a <strong className="text-white/80">before/after AI visibility score report</strong> confirming every signal was fixed</li>
            </ul>
            <p className="mt-3">
              Any work outside this scope (custom development, content creation, SEO copywriting, or fixing issues unrelated to AI visibility signals) is not included and would require a separate agreement.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">3. Timeline</h2>
            <p>
              Queldrex will complete implementation within <strong className="text-white/80">48–72 hours</strong> of receiving your valid hosting credentials. The timeline begins when Queldrex confirms access to your hosting environment, not when payment is received. If credentials are incomplete or invalid, the timeline pauses until corrected credentials are provided.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">4. Payment</h2>
            <p>
              The fee for this service is <strong className="text-white/80">$499 USD</strong>, paid in full at checkout via Stripe. Payment is non-refundable once implementation has begun. If implementation has not yet started, you may request a full refund within 24 hours of payment by emailing <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a>. Please also review our full <Link href="/refunds" className="text-cyan-400 hover:text-cyan-300">Refund Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">5. Score Improvement Commitment</h2>
            <p>
              Queldrex commits to improving your AI visibility score to <strong className="text-white/80">80 or above out of 100</strong> based on our 14-signal scoring system. If your score does not reach 80+ after implementation, we will work with you at no additional charge to identify and address the remaining signals. This commitment applies only to signals within our scope of work (Section 2) and assumes you maintain the installed files without removing or overwriting them.
            </p>
            <p className="mt-3">
              AI visibility scores reflect technical signal implementation and do not guarantee increased web traffic, search rankings, revenue, or citations by any specific AI platform. Those outcomes depend on factors outside our control.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">6. Client Responsibilities</h2>
            <ul className="space-y-2 pl-4 list-disc">
              <li>You must provide accurate hosting credentials (FTP, WordPress app password, GitHub token, or Shopify API token) within 7 days of payment. Failure to provide credentials within this window may result in forfeiture of the service without refund.</li>
              <li>You must have legal authority to make changes to the Site. You represent that you own or control the Site and have the right to authorize the changes described in Section 2.</li>
              <li>You must not remove, overwrite, or disable the installed files after implementation without first contacting Queldrex. Doing so may void the score improvement commitment in Section 5.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">7. Credential Security</h2>
            <p>
              Hosting credentials you provide are encrypted using AES-256-GCM encryption immediately upon submission and are accessible only to Queldrex personnel performing the implementation. Credentials are permanently deleted from our systems within <strong className="text-white/80">7 days</strong> of implementation completion. We will never use your credentials for any purpose other than the implementation described in Section 2.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">8. Intellectual Property</h2>
            <p>
              All files generated and installed by Queldrex (llms.txt, schema code, robots.txt, sitemap.xml, and associated HTML snippets) become your property upon delivery. Queldrex retains no ownership or license rights to these files after delivery. Queldrex retains ownership of its tools, systems, and methods used to generate these files.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">9. Limitation of Liability</h2>
            <p>
              Queldrex&apos;s total liability to you under this Agreement shall not exceed the amount you paid for the service ($499). Queldrex is not liable for indirect, incidental, special, or consequential damages, including lost revenue, lost traffic, or business interruption, even if advised of the possibility of such damages.
            </p>
            <p className="mt-3">
              Queldrex is not responsible for third-party platform changes (e.g., changes to AI crawler behavior, robots.txt parsing, or llms.txt standards) that occur after implementation and affect your score.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">10. Governing Law</h2>
            <p>
              This Agreement is governed by the laws of the State of Colorado, United States, without regard to conflict-of-law principles. Any disputes arising under this Agreement shall be resolved in the courts of Douglas County, Colorado.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">11. Entire Agreement</h2>
            <p>
              This Agreement, together with Queldrex&apos;s <Link href="/terms" className="text-cyan-400 hover:text-cyan-300">Terms of Service</Link> and <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</Link>, constitutes the entire agreement between you and Queldrex regarding the Done-For-You service and supersedes any prior communications or representations.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-3">12. Contact</h2>
            <p>
              Questions about this Agreement? Email <a href="mailto:hello@queldrex.com" className="text-cyan-400 hover:text-cyan-300">hello@queldrex.com</a>. We respond within one business day.
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
