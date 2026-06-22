'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

type Jurisdiction = 'GDPR' | 'UK-GDPR' | 'CCPA' | 'all'
type OutputType = 'privacy-policy' | 'cookie-banner' | 'data-processing'

interface Config {
  companyName: string
  website: string
  email: string
  country: string
  jurisdiction: Jurisdiction
  output: OutputType
  collectsAnalytics: boolean
  collectsMarketing: boolean
  collectsPayments: boolean
  collectsAccounts: boolean
  hasNewsletters: boolean
  usesThirdParty: boolean
  thirdParties: string
  retentionPeriod: string
}

const DEFAULTS: Config = {
  companyName: 'Acme Corp',
  website: 'acme.com',
  email: 'privacy@acme.com',
  country: 'United States',
  jurisdiction: 'GDPR',
  output: 'privacy-policy',
  collectsAnalytics: true,
  collectsMarketing: false,
  collectsPayments: true,
  collectsAccounts: true,
  hasNewsletters: false,
  usesThirdParty: true,
  thirdParties: 'Stripe (payment processing), Vercel (hosting), Google Analytics (analytics)',
  retentionPeriod: '24 months',
}

function generatePrivacyPolicy(c: Config): string {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const rights = c.jurisdiction === 'CCPA'
    ? `**Your California Privacy Rights**\n\nUnder the California Consumer Privacy Act (CCPA), you have the right to:\n- Know what personal information we collect and how we use it\n- Delete personal information we have collected about you\n- Opt-out of the sale of your personal information (we do not sell personal information)\n- Non-discrimination for exercising your privacy rights`
    : `**Your Rights**\n\nUnder ${c.jurisdiction === 'UK-GDPR' ? 'UK GDPR' : 'GDPR'}, you have the following rights:\n- **Right of access**: Request a copy of the personal data we hold about you\n- **Right to rectification**: Request correction of inaccurate data\n- **Right to erasure**: Request deletion of your personal data ("right to be forgotten")\n- **Right to restriction**: Request that we limit how we use your data\n- **Right to data portability**: Receive your data in a structured, machine-readable format\n- **Right to object**: Object to processing based on legitimate interests or for direct marketing\n- **Right to withdraw consent**: Withdraw consent at any time where processing is based on consent`

  const lawfulBasis = c.jurisdiction === 'CCPA'
    ? 'We process personal information in accordance with the California Consumer Privacy Act (CCPA) and applicable state law.'
    : `We process your personal data on the following lawful bases under Article 6 of the ${c.jurisdiction === 'UK-GDPR' ? 'UK GDPR' : 'GDPR'}:\n- **Contract performance**: When processing is necessary to deliver our services to you\n- **Legitimate interests**: For analytics, security monitoring, and service improvement\n- **Consent**: For marketing communications and optional analytics tracking\n- **Legal obligation**: When required by law`

  const sections = [
    `# Privacy Policy\n\n**${c.companyName}** ("we," "us," or "our")\n\nLast updated: ${date}\n\nThis Privacy Policy describes how ${c.companyName} ("we," "us," or "our") collects, uses, and shares information about you when you use ${c.website} (the "Service").\n\nBy using our Service, you agree to the collection and use of information in accordance with this policy.`,

    `## 1. Information We Collect\n\n${c.collectsAccounts ? '**Account Information**: When you create an account, we collect your name, email address, and password.\n\n' : ''}${c.collectsPayments ? '**Payment Information**: We collect billing details to process transactions. Payment card data is processed securely by Stripe and is never stored on our servers.\n\n' : ''}${c.collectsAnalytics ? '**Usage Data**: We automatically collect information about how you use the Service, including your IP address, browser type, pages visited, and time spent on the site.\n\n' : ''}**Log Data**: When you visit the Service, our servers automatically record information including your IP address, browser type, referring/exit pages, and timestamps.\n\n**Cookies and Tracking Technologies**: We use cookies and similar tracking technologies to improve your experience. See our Cookie Policy section below.`,

    `## 2. How We Use Your Information\n\nWe use the information we collect to:\n- Provide, operate, and maintain the Service\n${c.collectsAccounts ? '- Create and manage your account\n' : ''}- Process transactions and send related information\n${c.collectsAnalytics ? '- Analyze usage patterns to improve the Service\n' : ''}- Send administrative information, such as updates or security alerts\n${c.collectsMarketing ? '- Send marketing communications (with your consent)\n' : ''}${c.hasNewsletters ? '- Deliver newsletters you have subscribed to\n' : ''}- Comply with legal obligations and enforce our terms`,

    `## 3. Legal Basis for Processing\n\n${lawfulBasis}`,

    `## 4. Sharing Your Information\n\nWe do not sell your personal information. We may share your information with:\n\n${c.usesThirdParty ? `**Third-Party Service Providers**: We work with trusted third parties to support our services:\n${c.thirdParties.split(',').map(t => `- ${t.trim()}`).join('\n')}\n\nThese providers are contractually bound to protect your information and may only use it as directed by us.\n\n` : ''}**Legal Requirements**: We may disclose your information if required by law, court order, or to protect the rights, property, or safety of ${c.companyName} or others.\n\n**Business Transfers**: If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.`,

    `## 5. Data Retention\n\nWe retain personal data for ${c.retentionPeriod} after your last interaction with our Service, or as long as necessary to fulfill the purposes described in this policy, unless a longer retention period is required by law. You may request deletion of your data at any time by contacting us at ${c.email}.`,

    `## 6. Cookies\n\nWe use the following types of cookies:\n\n- **Strictly necessary cookies**: Required for the Service to function. Cannot be disabled.\n${c.collectsAnalytics ? '- **Analytics cookies**: Help us understand how visitors interact with the Service. You may opt out.\n' : ''}${c.collectsMarketing ? '- **Marketing cookies**: Used to track visitors across websites for advertising purposes. You may opt out.\n' : ''}\nYou can control cookie preferences through your browser settings or our cookie consent banner.`,

    `## 7. ${rights}`,

    `## 8. Data Security\n\nWe implement industry-standard security measures to protect your personal information, including encryption in transit (TLS), access controls, and regular security reviews. However, no method of transmission over the internet is 100% secure.`,

    `## 9. International Transfers\n\n${c.jurisdiction === 'GDPR' || c.jurisdiction === 'UK-GDPR' ? 'Your information may be transferred to and processed in countries outside the European Economic Area (EEA). When we transfer data internationally, we use appropriate safeguards such as Standard Contractual Clauses (SCCs) approved by the European Commission.' : 'Your information may be transferred to and processed in the United States or other countries. By using our Service, you consent to this transfer.'}`,

    `## 10. Contact Us\n\nIf you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:\n\n**${c.companyName}**\nEmail: ${c.email}\nWebsite: ${c.website}\n\n${c.jurisdiction !== 'CCPA' ? `If you are located in the EU or UK and believe we have violated your data protection rights, you have the right to lodge a complaint with your local supervisory authority.` : 'To submit a CCPA request, contact us at the email above. We will respond within 45 days.'}`,
  ]

  return sections.join('\n\n')
}

function generateCookieBanner(c: Config): string {
  const types = [
    'Strictly necessary cookies (required for the site to work)',
    c.collectsAnalytics && 'Analytics cookies (help us improve the site)',
    c.collectsMarketing && 'Marketing cookies (used to personalize ads)',
  ].filter(Boolean).join('\n- ')

  return `<!-- Cookie Consent Banner HTML -->
<!-- Add this before the closing </body> tag on every page -->

<div id="cookie-banner" style="position:fixed;bottom:0;left:0;right:0;background:#111;color:#eee;padding:20px;z-index:99999;border-top:1px solid #333;font-family:Arial,sans-serif;">
  <div style="max-width:900px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;">
    <div style="flex:1;min-width:250px;">
      <p style="margin:0 0 6px;font-size:15px;font-weight:700;">${c.companyName} uses cookies</p>
      <p style="margin:0;font-size:13px;color:#aaa;">We use cookies to enhance your experience, analyze traffic, and${c.collectsMarketing ? ' personalize advertising.' : ' improve our services.'} By clicking "Accept All," you consent to our use of cookies. You can manage your preferences at any time.</p>
    </div>
    <div style="display:flex;gap:10px;flex-shrink:0;">
      <button onclick="setCookieConsent('necessary')" style="padding:10px 18px;border:1px solid #444;background:transparent;color:#ccc;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">Necessary Only</button>
      <button onclick="setCookieConsent('all')" style="padding:10px 18px;background:#06d6ff;color:#000;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:700;">Accept All</button>
    </div>
  </div>
</div>

<script>
  function setCookieConsent(level) {
    localStorage.setItem('cookieConsent', level);
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    document.getElementById('cookie-banner').style.display = 'none';
    if (level === 'all') {
      // Initialize analytics and marketing cookies here
      console.log('Full consent granted');
    }
  }
  // Hide banner if already consented
  if (localStorage.getItem('cookieConsent')) {
    document.getElementById('cookie-banner').style.display = 'none';
  }
</script>

<!-- ========================================= -->
<!-- Cookie Banner Plain Text (for legal copy) -->
<!-- ========================================= -->

We use cookies on this website. These include:
- ${types}

By clicking "Accept All," you consent to the use of all cookies. You may click "Necessary Only" to allow only essential cookies. You can change your cookie preferences at any time in your browser settings or by contacting ${c.email}.

For more information, see our Privacy Policy at ${c.website}/privacy.`
}

function generateDPA(c: Config): string {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  return `DATA PROCESSING AGREEMENT

This Data Processing Agreement ("DPA") is entered into between ${c.companyName} ("Data Controller" or "Controller") and the applicable service provider ("Data Processor" or "Processor").

Effective Date: ${date}

1. DEFINITIONS

"Personal Data" means any information relating to an identified or identifiable natural person.
"Processing" means any operation or set of operations performed on Personal Data.
"Data Subject" means the individual to whom the Personal Data relates.
"${c.jurisdiction === 'CCPA' ? 'CCPA' : 'GDPR'}" refers to ${c.jurisdiction === 'CCPA' ? 'the California Consumer Privacy Act (Cal. Civ. Code § 1798.100 et seq.)' : 'Regulation (EU) 2016/679 of the European Parliament and of the Council'}.

2. SCOPE AND PURPOSE

The Processor shall process Personal Data only on documented instructions from the Controller, for the purposes described in Schedule A below, and in accordance with this DPA and applicable data protection law.

3. OBLIGATIONS OF THE PROCESSOR

The Processor shall:
(a) Process Personal Data only on the Controller's documented instructions
(b) Ensure that persons authorized to process Personal Data have committed themselves to confidentiality
(c) Implement appropriate technical and organizational security measures
(d) Assist the Controller in responding to Data Subject requests
(e) Delete or return all Personal Data upon termination of services
(f) Provide all information necessary to demonstrate compliance with this DPA
(g) Not engage sub-processors without prior written consent from the Controller

4. DATA SUBJECT RIGHTS

The Processor shall assist the Controller in fulfilling its obligations to respond to requests from Data Subjects, including requests for access, rectification, erasure, restriction, portability, and objection.

5. SECURITY MEASURES

The Processor shall implement and maintain appropriate technical and organizational security measures, including:
- Encryption of Personal Data in transit and at rest
- Access controls and authentication requirements
- Regular security testing and vulnerability assessments
- Incident response and breach notification procedures

6. DATA BREACH NOTIFICATION

The Processor shall notify the Controller without undue delay (and in any event within 72 hours) after becoming aware of a Personal Data breach, providing sufficient information to allow the Controller to meet its own notification obligations.

7. INTERNATIONAL TRANSFERS

The Processor shall not transfer Personal Data to third countries or international organizations without the Controller's prior written consent and, where required, appropriate safeguards in accordance with applicable law (e.g., Standard Contractual Clauses).

8. SUB-PROCESSORS

Current approved sub-processors:
${c.thirdParties.split(',').map(t => `- ${t.trim()}`).join('\n')}

9. AUDIT RIGHTS

The Controller has the right to audit the Processor's data processing activities, with reasonable notice, to verify compliance with this DPA.

10. GOVERNING LAW

This DPA shall be governed by and construed in accordance with the laws applicable to ${c.jurisdiction === 'CCPA' ? 'the State of California, USA' : c.jurisdiction === 'UK-GDPR' ? 'England and Wales' : 'the European Union'}.

---
SCHEDULE A: DESCRIPTION OF PROCESSING ACTIVITIES

Nature and Purpose: ${['Providing the contracted services', c.collectsAnalytics && 'Analytics and service improvement', c.collectsPayments && 'Payment processing', c.collectsMarketing && 'Marketing communications'].filter(Boolean).join('; ')}

Categories of Personal Data: ${['Contact information (name, email)', c.collectsAccounts && 'Account credentials', c.collectsPayments && 'Payment information', c.collectsAnalytics && 'Usage data and IP addresses'].filter(Boolean).join('; ')}

Categories of Data Subjects: Customers, users, and visitors of ${c.website}

Retention Period: ${c.retentionPeriod}

---

Controller: ${c.companyName}
Contact: ${c.email}
Website: ${c.website}`
}

function generateOutput(c: Config): string {
  switch (c.output) {
    case 'privacy-policy': return generatePrivacyPolicy(c)
    case 'cookie-banner': return generateCookieBanner(c)
    case 'data-processing': return generateDPA(c)
  }
}

export default function GdprGeneratorPage() {
  const [config, setConfig] = useState<Config>(DEFAULTS)
  const [copied, setCopied] = useState(false)

  const update = (patch: Partial<Config>) => setConfig(c => ({ ...c, ...patch }))
  const output = generateOutput(config)

  function copy() {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const Toggle = ({ label, value, onChange, desc }: { label: string; value: boolean; onChange: (v: boolean) => void; desc?: string }) => (
    <button onClick={() => onChange(!value)}
      className="flex items-start gap-3 text-left w-full px-3 py-2.5 rounded-xl border transition-all"
      style={{ background: value ? 'rgba(6,182,212,0.07)' : 'rgba(255,255,255,0.02)', borderColor: value ? 'rgba(6,182,212,0.25)' : 'rgba(255,255,255,0.06)' }}>
      <span className="flex-shrink-0 w-4 h-4 mt-0.5 rounded flex items-center justify-center"
        style={{ background: value ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.07)', border: value ? '1px solid rgba(6,182,212,0.5)' : '1px solid rgba(255,255,255,0.15)' }}>
        {value && <svg className="w-2.5 h-2.5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
      </span>
      <div>
        <p className="text-sm font-semibold text-white/70">{label}</p>
        {desc && <p className="text-xs text-white/30 mt-0.5">{desc}</p>}
      </div>
    </button>
  )

  const inputCls = "w-full bg-transparent border rounded-lg px-3 py-2 text-white/70 text-sm outline-none placeholder:text-white/20"
  const inputStyle = { borderColor: 'rgba(255,255,255,0.1)' }
  const labelCls = "block text-xs font-bold text-white/30 uppercase tracking-wider mb-1"

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-10">

        <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/30 hover:text-white/60 transition-colors mb-8">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase mb-3"
            style={{ borderColor: 'rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.08)', color: '#f87171' }}>
            Free Tool · Legal / Compliance
          </div>
          <h1 className="text-3xl font-black text-white mb-1">GDPR / Privacy Policy Generator</h1>
          <p className="text-white/40 text-sm">Generate a privacy policy, cookie consent banner, or data processing agreement tailored to GDPR, UK GDPR, or CCPA. <span className="text-amber-400">For informational use — always have legal counsel review compliance documents before publishing.</span></p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Config */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-black uppercase tracking-widest text-white/25 mb-4">Your Details</p>
              <div className="space-y-3">
                <div><label className={labelCls}>Company Name</label><input className={inputCls} style={inputStyle} value={config.companyName} onChange={e => update({ companyName: e.target.value })} /></div>
                <div><label className={labelCls}>Website</label><input className={inputCls} style={inputStyle} value={config.website} onChange={e => update({ website: e.target.value })} /></div>
                <div><label className={labelCls}>Privacy Email</label><input className={inputCls} style={inputStyle} value={config.email} onChange={e => update({ email: e.target.value })} /></div>
                <div><label className={labelCls}>Data Retention</label><input className={inputCls} style={inputStyle} value={config.retentionPeriod} onChange={e => update({ retentionPeriod: e.target.value })} placeholder="24 months" /></div>
              </div>
            </div>

            <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-black uppercase tracking-widest text-white/25 mb-3">Jurisdiction</p>
              {(['GDPR', 'UK-GDPR', 'CCPA', 'all'] as Jurisdiction[]).map(j => (
                <button key={j} onClick={() => update({ jurisdiction: j })}
                  className="w-full text-left px-3 py-2 rounded-lg mb-1 text-sm font-semibold transition-all"
                  style={{ background: config.jurisdiction === j ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.03)', color: config.jurisdiction === j ? '#06d6ff' : 'rgba(255,255,255,0.45)', border: config.jurisdiction === j ? '1px solid rgba(6,182,212,0.3)' : '1px solid transparent' }}>
                  {j === 'all' ? 'All (GDPR + CCPA)' : j}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-black uppercase tracking-widest text-white/25 mb-3">Output Type</p>
              {([
                { key: 'privacy-policy', label: 'Privacy Policy' },
                { key: 'cookie-banner', label: 'Cookie Banner (HTML)' },
                { key: 'data-processing', label: 'Data Processing Agreement' },
              ] as { key: OutputType; label: string }[]).map(o => (
                <button key={o.key} onClick={() => update({ output: o.key })}
                  className="w-full text-left px-3 py-2 rounded-lg mb-1 text-sm font-semibold transition-all"
                  style={{ background: config.output === o.key ? 'rgba(248,113,113,0.12)' : 'rgba(255,255,255,0.03)', color: config.output === o.key ? '#f87171' : 'rgba(255,255,255,0.45)', border: config.output === o.key ? '1px solid rgba(248,113,113,0.3)' : '1px solid transparent' }}>
                  {o.label}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-black uppercase tracking-widest text-white/25 mb-3">What You Collect</p>
              <div className="space-y-2">
                <Toggle label="User accounts" value={config.collectsAccounts} onChange={v => update({ collectsAccounts: v })} />
                <Toggle label="Payment info" value={config.collectsPayments} onChange={v => update({ collectsPayments: v })} />
                <Toggle label="Analytics / tracking" value={config.collectsAnalytics} onChange={v => update({ collectsAnalytics: v })} />
                <Toggle label="Marketing / ads" value={config.collectsMarketing} onChange={v => update({ collectsMarketing: v })} />
                <Toggle label="Email newsletters" value={config.hasNewsletters} onChange={v => update({ hasNewsletters: v })} />
              </div>
            </div>

            <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <Toggle label="Uses third-party services" value={config.usesThirdParty} onChange={v => update({ usesThirdParty: v })} />
              {config.usesThirdParty && (
                <div className="mt-3">
                  <label className={labelCls}>Third-party services (comma separated)</label>
                  <textarea value={config.thirdParties} onChange={e => update({ thirdParties: e.target.value })} rows={3}
                    className={inputCls + ' resize-none mt-1'} style={inputStyle}
                    placeholder="Stripe, Google Analytics, Vercel" />
                </div>
              )}
            </div>
          </div>

          {/* Output */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border overflow-hidden sticky top-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/6">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-white/25">
                    {config.output === 'privacy-policy' ? 'Privacy Policy' : config.output === 'cookie-banner' ? 'Cookie Banner' : 'Data Processing Agreement'}
                  </p>
                  <p className="text-[10px] text-white/20 mt-0.5">Jurisdiction: {config.jurisdiction}</p>
                </div>
                <button onClick={copy}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: copied ? 'rgba(74,222,128,0.12)' : 'rgba(6,182,212,0.1)', color: copied ? '#4ade80' : '#06d6ff', border: `1px solid ${copied ? 'rgba(74,222,128,0.25)' : 'rgba(6,182,212,0.25)'}` }}>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <textarea readOnly value={output}
                className="w-full p-5 text-xs text-white/55 font-mono resize-none outline-none leading-relaxed"
                style={{ background: 'transparent', minHeight: 600, lineHeight: 1.7 }} />
            </div>
          </div>
        </div>

        <div className="mt-6 px-4 py-3 rounded-xl border" style={{ background: 'rgba(251,191,36,0.06)', borderColor: 'rgba(251,191,36,0.2)' }}>
          <p className="text-xs text-amber-400 font-bold">Legal Disclaimer</p>
          <p className="text-xs text-white/40 mt-1">This tool generates template language for informational purposes. It does not constitute legal advice. Privacy and data protection laws vary by jurisdiction and change frequently. Always have a qualified attorney review your privacy policy and compliance documents before publishing them.</p>
        </div>

        {/* How It Works */}
        <div className="mt-14 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-xl font-black text-white mb-1">How It Works</h2>
          <p className="text-white/35 text-sm mb-8">Generates three distinct legal documents from your inputs — privacy policy, cookie banner HTML, and a Data Processing Agreement.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { n: '01', title: 'Configure your details', body: 'Enter company name, DPO email, and website. Toggle which data types you collect: email, name, payment, analytics, cookies.' },
              { n: '02', title: 'Select jurisdiction', body: 'Choose GDPR (EU), UK-GDPR, CCPA (California), or "All" to generate language covering multiple frameworks simultaneously.' },
              { n: '03', title: 'Generate & copy', body: 'Three documents generated: full privacy policy (~1,200 words), cookie consent banner (HTML + JS), and a DPA template.' },
            ].map(s => (
              <div key={s.n} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-xs font-black text-white/20 mb-2">{s.n}</div>
                <div className="text-sm font-black text-white mb-1">{s.title}</div>
                <div className="text-xs text-white/45 leading-relaxed">{s.body}</div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-4">Sample output sections (Privacy Policy)</p>
            <div className="space-y-3">
              {[
                { section: 'Data Collected', content: 'We collect: email addresses, usage analytics. We do not sell your personal data to third parties.' },
                { section: 'Legal Basis (GDPR Art. 6)', content: 'Processing is based on: (a) consent for marketing, (b) legitimate interests for analytics, (c) contract performance for service delivery.' },
                { section: 'Your Rights', content: 'Under GDPR you have the right to: access, rectification, erasure, portability, restriction, and to lodge a complaint with a supervisory authority.' },
                { section: 'Data Retention', content: 'Personal data is retained for no longer than necessary for the purpose collected, and deleted within 90 days of account closure.' },
              ].map(r => (
                <div key={r.section} className="border-l-2 border-white/10 pl-3">
                  <p className="text-xs font-bold text-white/50 mb-0.5">{r.section}</p>
                  <p className="text-xs text-white/35 leading-relaxed">{r.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
