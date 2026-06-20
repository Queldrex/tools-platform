'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

type Platform = 'ftp' | 'wordpress' | 'github' | 'shopify' | 'wix' | 'squarespace' | 'webflow' | 'other'

const MANUAL_PLATFORMS = new Set<Platform>(['wix', 'squarespace', 'webflow', 'other'])

const PLATFORMS: { id: Platform; label: string; desc: string }[] = [
  { id: 'ftp',         label: 'FTP / cPanel',                    desc: 'Shared hosting — Bluehost, GoDaddy, SiteGround, DreamHost, HostGator, Namecheap, etc.' },
  { id: 'wordpress',   label: 'WordPress',                       desc: 'Self-hosted WordPress on any host. We use an application password — no admin login needed.' },
  { id: 'github',      label: 'Vercel / Netlify / GitHub Pages', desc: 'Git-deployed sites. We commit files directly to your repo and they auto-deploy.' },
  { id: 'shopify',     label: 'Shopify',                         desc: 'We inject schema into your theme via the Shopify Admin API.' },
  { id: 'wix',         label: 'Wix',                             desc: 'No credentials needed. We apply fixes manually via your site — done within 48 hours.' },
  { id: 'squarespace', label: 'Squarespace',                     desc: 'No credentials needed. We apply fixes manually via your site — done within 48 hours.' },
  { id: 'webflow',     label: 'Webflow',                         desc: 'No credentials needed. We apply fixes manually via your site — done within 48 hours.' },
  { id: 'other',       label: 'Other / Not Sure',                desc: "Custom CMS, Framer, or anything else. Tell us what it is and we'll handle it." },
]

const FIELD_LABELS: Partial<Record<Platform, { label: string; key: string; type?: string; placeholder: string; hint?: string; steps?: string[] }[]>> = {
  ftp: [
    {
      label: 'FTP Host', key: 'host', placeholder: 'ftp.yourdomain.com',
      hint: 'Your FTP server address — usually ftp.yourdomain.com or your server IP.',
      steps: ['Log in to cPanel at yourdomain.com/cpanel', 'Click FTP Accounts under the Files section', 'Your hostname is listed there — or check your hosting welcome email'],
    },
    {
      label: 'FTP Port', key: 'port', placeholder: '21 (default)',
      hint: 'Leave blank — we use port 21 by default. Only change if your host told you a different port.',
    },
    {
      label: 'FTP Username', key: 'username', placeholder: 'your-ftp-username',
      hint: 'Found in cPanel → FTP Accounts. Usually your cPanel username or a sub-account you created.',
    },
    {
      label: 'FTP Password', key: 'password', type: 'password', placeholder: 'your-ftp-password',
      hint: 'The password for the FTP account above. Reset it in cPanel → FTP Accounts → Change Password if needed.',
    },
    {
      label: 'Web Root Path (optional)', key: 'webRoot', placeholder: '/public_html',
      hint: "The server folder that holds your website files. Leave blank — we'll detect it.",
      steps: ['Open File Manager in cPanel', 'Find the folder containing your index.html or home page', 'Common paths: /public_html · /www · /htdocs'],
    },
  ],
  wordpress: [
    {
      label: 'WordPress Site URL', key: 'siteUrl', placeholder: 'https://yoursite.com',
      hint: 'The full URL of your WordPress site — exactly as you type it in a browser.',
    },
    {
      label: 'Admin Username', key: 'username', placeholder: 'admin',
      hint: 'The username you use to log in to yoursite.com/wp-admin.',
    },
    {
      label: 'Application Password', key: 'appPassword', type: 'password', placeholder: 'xxxx xxxx xxxx xxxx xxxx xxxx',
      hint: "A one-time key so we can make changes without your main password. You can delete it from WordPress after we're done.",
      steps: [
        'Go to yoursite.com/wp-admin and log in',
        'Click Users in the left menu → click your username',
        'Scroll down to the Application Passwords section',
        'Type "Queldrex" in the name box → click Add New Application Password',
        'Copy the password shown — WordPress only displays it once',
      ],
    },
  ],
  github: [
    {
      label: 'GitHub Repository', key: 'repo', placeholder: 'username/repository-name',
      hint: 'The owner and name of your repo — visible in the GitHub URL after github.com/',
      steps: ['Go to github.com and open your repository', 'Look at your browser URL: github.com/username/repo-name', 'Enter just the username/repo-name part (e.g. johnsmith/my-website)'],
    },
    {
      label: 'Branch', key: 'branch', placeholder: 'main',
      hint: 'The branch Vercel or Netlify deploys from — usually main or master.',
      steps: ['Open your GitHub repo', "Look at the branch dropdown above the file list — it shows your active branch name", "Enter that here (usually 'main' or 'master')"],
    },
    {
      label: 'GitHub Personal Access Token', key: 'token', type: 'password', placeholder: 'ghp_xxxxxxxxxxxxxxxxxxxx',
      hint: "A secure key that lets us commit files to your repo. You can delete it from GitHub after we're done.",
      steps: [
        'Go to github.com → click your profile photo (top right) → Settings',
        'Scroll to the bottom of the left sidebar → click Developer settings',
        'Click Personal access tokens → Tokens (classic)',
        'Click Generate new token (classic) → name it "Queldrex"',
        'Check the repo checkbox (gives permission to commit files)',
        'Scroll down → click Generate token',
        'Copy it immediately — GitHub only shows it once',
      ],
    },
    {
      label: 'Public folder (optional)', key: 'publicDir', placeholder: 'public',
      hint: "The folder in your repo where public/static files live. Leave blank — we'll auto-detect it.",
      steps: ['Next.js or Nuxt → public', 'Hugo → static', 'GitHub Pages → docs (or leave blank)', 'Vite / React → dist', "Not sure? Leave it blank — we'll figure it out"],
    },
  ],
  shopify: [
    {
      label: 'Shopify Store URL', key: 'storeUrl', placeholder: 'yourstore.myshopify.com',
      hint: 'Your permanent Shopify URL — do NOT include https://',
      steps: ['In Shopify Admin, click Settings (bottom left) → Domains', 'Your store URL ends in .myshopify.com', 'Enter it without https:// (e.g. my-store.myshopify.com)'],
    },
    {
      label: 'Admin API Access Token', key: 'apiToken', type: 'password', placeholder: 'shpat_xxxxxxxxxxxxxxxxxxxx',
      hint: "A scoped API key for your theme. You can delete it from Shopify Apps after we're done.",
      steps: [
        'In Shopify Admin → Settings → Apps and sales channels',
        'Click Develop apps (top right) → Create an app → name it "Queldrex"',
        'Click Configure Admin API scopes → check write_themes and read_themes → Save',
        'Click Install app → copy the Admin API access token',
        'Important: copy it now — Shopify only shows it once',
      ],
    },
  ],
  other: [
    { label: 'Platform / CMS', key: 'platform', placeholder: 'e.g. Framer, custom PHP, Drupal…', hint: 'Tell us what your site runs on so we can prepare the right approach' },
    { label: 'Any notes (optional)', key: 'notes', placeholder: 'Hosting provider, CMS version, anything relevant' },
  ],
}

const SIGNALS = [
  { name: 'llms.txt',               desc: 'AI-readable site description for ChatGPT, Perplexity, Claude, and Google AI',              pts: '+25 pts' },
  { name: 'JSON-LD Schema',         desc: 'LocalBusiness or Organization structured data so AI understands who and where you are',    pts: '+20 pts' },
  { name: 'JSON-LD (FAQ + Review)', desc: 'FAQ Schema and Review Schema added where applicable',                                      pts: 'Advanced' },
  { name: 'robots.txt',             desc: 'AI bot permissions (GPTBot, ClaudeBot, PerplexityBot, Googlebot, Google-Extended)',        pts: '+5 pts' },
  { name: 'sitemap.xml',            desc: 'Full page index so AI crawlers discover all your content',                                 pts: '+10 pts' },
  { name: 'Open Graph + Canonical', desc: 'Social sharing metadata and canonical URL tag',                                            pts: '+10 pts' },
  { name: 'HTTPS Verification',     desc: 'Confirm SSL is active and properly configured',                                            pts: '+10 pts' },
  { name: 'About / Team page',      desc: 'Add or update your About page with AI-indexable content',                                  pts: 'Advanced' },
  { name: 'Content Freshness',      desc: 'dateModified schema on key pages to signal active content',                                pts: 'Advanced' },
]

export default function ImplCredentialsPage() {
  const params = useParams()
  const token = params.token as string

  const [platform, setPlatform] = useState<Platform | null>(null)
  const [fields, setFields] = useState<Record<string, string>>({})
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const isManual = platform !== null && MANUAL_PLATFORMS.has(platform)
  const canSubmit = platform !== null && agreed

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!platform || !agreed) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/dfy/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, platform, fields }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Submission failed')
      }
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Email hello@queldrex.com.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen text-white" style={{ background: '#070b14' }}>
        <Header />
        <main className="max-w-lg mx-auto px-6 py-32 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" style={{ background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.3)' }}>
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white mb-3">
            {isManual ? "Got it — we'll handle everything." : 'All set.'}
          </h1>
          <p className="text-white/60 leading-relaxed">
            {isManual
              ? `Your site is on ${PLATFORMS.find(p => p.id === platform)?.label}. We'll apply all AI visibility fixes manually within 48 hours and email you a before/after report confirming every change.`
              : "We have your details. On your booked implementation day, we'll connect, make all changes, and email you a before/after visibility report confirming everything passed."
            }
          </p>
          <p className="text-white/35 text-sm mt-6">Questions? <a href="mailto:hello@queldrex.com" className="text-cyan-400">hello@queldrex.com</a></p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-16">

        <div className="mb-10">
          <p className="text-cyan-500 text-xs font-bold tracking-[0.28em] uppercase mb-3">Done-For-You Implementation</p>
          <h1 className="text-3xl font-black text-white mb-3">Submit your hosting details</h1>
          <p className="text-white/55 text-sm leading-relaxed max-w-lg">
            This link is private and tied to your order. We use these details only to install your AI visibility files.
          </p>
        </div>

        {/* What we'll implement */}
        <div className="rounded-2xl border border-white/8 p-6 mb-8" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">What We Will Implement</p>
          <div className="space-y-3">
            {SIGNALS.map(s => (
              <div key={s.name} className="flex items-start gap-3">
                <span className="text-green-400 mt-0.5 flex-shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">{s.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: s.pts.startsWith('+') ? 'rgba(34,197,94,0.1)' : 'rgba(6,182,212,0.1)', color: s.pts.startsWith('+') ? '#4ade80' : '#06d6ff', border: `1px solid ${s.pts.startsWith('+') ? 'rgba(34,197,94,0.2)' : 'rgba(6,182,212,0.2)'}` }}>{s.pts}</span>
                  </div>
                  <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/30 mt-4 pt-4 border-t border-white/8">
            Signals marked <span className="text-cyan-400/70">Advanced</span> are implemented where your platform allows. Coverage is confirmed in your before/after report.
          </p>
        </div>

        {/* Security notice */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 p-4 mb-8" style={{ background: 'rgba(245,158,11,0.06)' }}>
          <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          <p className="text-xs text-amber-300/80 leading-relaxed">
            Your credentials are transmitted over HTTPS and stored encrypted. We access your site only during the agreed implementation window and delete all credentials permanently within 48 hours of completion.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Platform selector */}
          <div>
            <label className="block text-sm font-bold text-white mb-4">What platform is your website on?</label>
            <div className="space-y-3">
              {PLATFORMS.map(p => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => { setPlatform(p.id); setFields({}) }}
                  className="w-full text-left rounded-xl border p-4 transition-all"
                  style={{
                    background: platform === p.id ? 'rgba(6,182,212,0.08)' : 'rgba(255,255,255,0.02)',
                    borderColor: platform === p.id ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: platform === p.id ? '#06d6ff' : 'rgba(255,255,255,0.25)' }}>
                      {platform === p.id && <div className="w-2 h-2 rounded-full" style={{ background: '#06d6ff' }} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">{p.label}</p>
                        {MANUAL_PLATFORMS.has(p.id) && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
                            No credentials needed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/45 mt-0.5">{p.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Manual platform — no credentials, just confirm */}
          {platform && isManual && platform !== 'other' && (
            <div className="rounded-2xl border border-green-500/20 p-6" style={{ background: 'rgba(34,197,94,0.04)' }}>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <p className="text-sm font-bold text-green-300 mb-1">No credentials needed for {PLATFORMS.find(p => p.id === platform)?.label}</p>
                  <p className="text-xs text-white/50 leading-relaxed">
                    {platform === 'wix' && "Wix doesn't support external FTP access. We'll log in via your shared Wix account and apply all fixes manually — JSON-LD via custom code injection and llms.txt content via a workaround page."}
                    {platform === 'squarespace' && "Squarespace doesn't allow FTP. We'll apply your JSON-LD schema via the code injection panel and handle llms.txt via the best available workaround."}
                    {platform === 'webflow' && "Webflow sites are deployed via their platform. We'll add your JSON-LD via custom code in your site settings and handle static file hosting separately."}
                  </p>
                  <p className="text-xs text-white/40 mt-3">
                    <strong className="text-white/60">Timeline:</strong> Fixes applied within 48 hours. You&apos;ll receive a before/after report by email when complete.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Credential fields for technical platforms */}
          {platform && !isManual && FIELD_LABELS[platform] && (
            <div className="rounded-2xl border border-white/8 p-6 space-y-5" style={{ background: '#111827' }}>
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider">
                {PLATFORMS.find(p2 => p2.id === platform)?.label} Access Details
              </p>
              {(FIELD_LABELS[platform] ?? []).map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">{f.label}</label>
                  <input
                    type={f.type || 'text'}
                    placeholder={f.placeholder}
                    value={fields[f.key] || ''}
                    onChange={e => setFields(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                  {f.hint && <p className="text-xs text-white/35 mt-1.5 leading-relaxed">{f.hint}</p>}
                  {f.steps && f.steps.length > 0 && (
                    <ol className="mt-2 space-y-1 pl-0.5">
                      {f.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-white/28">
                          <span className="font-bold text-white/20 flex-shrink-0 w-4 text-right">{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* "Other" platform */}
          {platform === 'other' && (
            <div className="rounded-2xl border border-white/8 p-6 space-y-5" style={{ background: '#111827' }}>
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Tell us about your setup</p>
              {(FIELD_LABELS.other ?? []).map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">{f.label}</label>
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    value={fields[f.key] || ''}
                    onChange={e => setFields(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    autoComplete="off"
                  />
                  {f.hint && <p className="text-xs text-white/35 mt-1.5 leading-relaxed">{f.hint}</p>}
                  {f.steps && f.steps.length > 0 && (
                    <ol className="mt-2 space-y-1 pl-0.5">
                      {f.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-white/28">
                          <span className="font-bold text-white/20 flex-shrink-0 w-4 text-right">{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Service Agreement */}
          {platform && (
            <div className="rounded-2xl border border-white/10 p-6 space-y-4" style={{ background: '#0d1117' }}>
              <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Done-For-You Service Agreement</p>
              <div className="text-xs text-white/45 leading-relaxed space-y-3 max-h-56 overflow-y-auto pr-1 border border-white/6 rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <p>This Service Agreement (&quot;Agreement&quot;) is between <strong className="text-white/70">Queldrex LLC</strong>, a Colorado limited liability company (&quot;Provider&quot;), and you (&quot;Client&quot;), effective upon submission of this form.</p>

                <p><strong className="text-white/70">1. Scope of Services.</strong> Provider will implement the following AI visibility signals on the website identified by this order: llms.txt, JSON-LD structured data (LocalBusiness / Organization schema), FAQ Schema and Review Schema where applicable, robots.txt with AI bot permissions, sitemap.xml, Open Graph metadata and canonical URL tag, HTTPS configuration verification, About/Team page content optimization, and content freshness signals (dateModified schema). Implementation scope may vary by platform.</p>

                <p><strong className="text-white/70">2. Access and Authorization.</strong> Client grants Provider limited, temporary access to the website solely to implement the services above. Client confirms they own the website or are legally authorized to grant this access on behalf of the website owner. Provider will access the site only during the agreed implementation window.</p>

                <p><strong className="text-white/70">3. Data Security.</strong> All credentials are transmitted via HTTPS encryption and stored in encrypted format. Provider will permanently delete all credentials within 48 hours of implementation completion.</p>

                <p><strong className="text-white/70">4. Timeline and Deliverables.</strong> For platforms requiring credentials (FTP, WordPress, GitHub, Shopify): implementation is performed on the booked slot. For manual platforms (Wix, Squarespace, Webflow): implementation is completed within 48 hours of this submission. Client will receive a before/after AI visibility report confirming every signal implemented.</p>

                <p><strong className="text-white/70">5. Limitation of Liability.</strong> Provider&apos;s liability is limited to the amount paid for this service. Provider is not responsible for changes to third-party platforms, AI crawling behavior, or search ranking outcomes after implementation.</p>

                <p><strong className="text-white/70">6. Governing Law.</strong> This Agreement is governed by the laws of the State of Colorado. By submitting this form, Client acknowledges reading and agreeing to this Agreement and to Queldrex&apos;s <a href="/terms" className="text-cyan-400">Terms of Service</a> and <a href="/refunds" className="text-cyan-400">Refund Policy</a>.</p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group mt-2">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-0.5 flex-shrink-0 w-4 h-4 rounded accent-cyan-500"
                />
                <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors leading-relaxed">
                  I have read and agree to the Service Agreement above. I confirm I own or am authorized to modify this website, and I authorize Queldrex LLC to make the technical changes described above on my behalf.
                </span>
              </label>
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm rounded-lg border border-red-500/20 p-3" style={{ background: 'rgba(239,68,68,0.06)' }}>
              {error}
            </p>
          )}

          {platform && (
            <button
              type="submit"
              disabled={submitting || !canSubmit}
              className="w-full py-4 rounded-xl text-sm font-black text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.01]"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: canSubmit ? '0 0 24px rgba(6,182,212,0.25)' : 'none' }}
            >
              {submitting ? 'Submitting…' : !agreed ? 'Accept Service Agreement to Continue' : isManual ? 'Confirm — Apply My Fixes' : 'Submit Hosting Details'}
            </button>
          )}

        </form>
      </main>
      <Footer />
    </div>
  )
}
