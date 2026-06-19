'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

type Platform = 'ftp' | 'wordpress' | 'github' | 'shopify' | 'wix' | 'squarespace' | 'webflow' | 'other'

// Closed platforms — no credentials needed, manual implementation
const MANUAL_PLATFORMS = new Set<Platform>(['wix', 'squarespace', 'webflow', 'other'])

const PLATFORMS: { id: Platform; label: string; desc: string }[] = [
  { id: 'ftp',         label: 'FTP / cPanel',                 desc: 'Shared hosting — Bluehost, GoDaddy, SiteGround, DreamHost, HostGator, Namecheap, etc.' },
  { id: 'wordpress',   label: 'WordPress',                    desc: 'Self-hosted WordPress on any host. We use an application password — no admin login needed.' },
  { id: 'github',      label: 'Vercel / Netlify / GitHub Pages', desc: 'Git-deployed sites. We commit files directly to your repo and they auto-deploy.' },
  { id: 'shopify',     label: 'Shopify',                      desc: 'We inject schema into your theme via the Shopify Admin API.' },
  { id: 'wix',         label: 'Wix',                          desc: 'No credentials needed. We apply fixes manually via your site — done within 48 hours.' },
  { id: 'squarespace', label: 'Squarespace',                  desc: 'No credentials needed. We apply fixes manually via your site — done within 48 hours.' },
  { id: 'webflow',     label: 'Webflow',                      desc: 'No credentials needed. We apply fixes manually via your site — done within 48 hours.' },
  { id: 'other',       label: 'Other / Not Sure',             desc: 'Custom CMS, Framer, or anything else. Tell us what it is and we\'ll handle it.' },
]

const FIELD_LABELS: Partial<Record<Platform, { label: string; key: string; type?: string; placeholder: string; hint?: string }[]>> = {
  ftp: [
    { label: 'FTP Host',                   key: 'host',      placeholder: 'ftp.yourdomain.com',  hint: 'Found in your hosting control panel under FTP accounts' },
    { label: 'FTP Port',                   key: 'port',      placeholder: '21 (default)',         hint: 'Leave blank for standard port 21' },
    { label: 'FTP Username',               key: 'username',  placeholder: 'your-ftp-username' },
    { label: 'FTP Password',               key: 'password',  type: 'password', placeholder: 'your-ftp-password' },
    { label: 'Web Root Path (optional)',   key: 'webRoot',   placeholder: '/public_html',         hint: 'We auto-detect this if left blank. Common: /public_html, /www, /htdocs' },
  ],
  wordpress: [
    { label: 'WordPress Site URL',         key: 'siteUrl',     placeholder: 'https://yoursite.com',              hint: 'The URL where WordPress is installed' },
    { label: 'Admin Username',             key: 'username',    placeholder: 'admin' },
    { label: 'Application Password',       key: 'appPassword', type: 'password', placeholder: 'xxxx xxxx xxxx xxxx xxxx xxxx', hint: 'WordPress Admin → Users → Your Profile → Application Passwords → Add New' },
  ],
  github: [
    { label: 'GitHub Repository',          key: 'repo',      placeholder: 'username/repository-name', hint: 'Example: acme-corp/website' },
    { label: 'Branch',                     key: 'branch',    placeholder: 'main',                      hint: 'The branch Vercel/Netlify deploys from (usually main or master)' },
    { label: 'GitHub Personal Access Token', key: 'token',   type: 'password', placeholder: 'ghp_xxxxxxxxxxxxxxxxxxxx', hint: 'GitHub → Settings → Developer settings → Personal access tokens → Generate (need: repo full control)' },
    { label: 'Public folder (optional)',   key: 'publicDir', placeholder: 'public',                    hint: 'Where static files live. Usually: public (Next.js/Nuxt), static (Hugo), docs (GitHub Pages). Leave blank to auto-detect.' },
  ],
  shopify: [
    { label: 'Shopify Store URL',          key: 'storeUrl',  placeholder: 'yourstore.myshopify.com', hint: 'Do NOT include https://' },
    { label: 'Admin API Access Token',     key: 'apiToken',  type: 'password', placeholder: 'shpat_xxxxxxxxxxxxxxxxxxxx', hint: 'Shopify Admin → Settings → Apps → Develop apps → Create app → Admin API access token (need: write_themes)' },
  ],
  other: [
    { label: 'Platform / CMS',            key: 'platform',  placeholder: 'e.g. Framer, custom PHP, Drupal…',  hint: 'Tell us what your site runs on so we can prepare the right approach' },
    { label: 'Any notes (optional)',       key: 'notes',     placeholder: 'Hosting provider, CMS version, anything relevant' },
  ],
}

export default function ImplCredentialsPage() {
  const params = useParams()
  const token = params.token as string

  const [platform, setPlatform] = useState<Platform | null>(null)
  const [fields, setFields] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const isManual = platform !== null && MANUAL_PLATFORMS.has(platform)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!platform) return
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
            {isManual ? 'Got it — we\'ll handle everything.' : 'All set.'}
          </h1>
          <p className="text-white/60 leading-relaxed">
            {isManual
              ? `Your site is on ${PLATFORMS.find(p => p.id === platform)?.label}. We'll apply your AI visibility fixes manually within 48 hours and email you a before/after report confirming every signal that changed.`
              : "We have your details. On your booked implementation day, we'll connect, make all the changes, and email you a before/after visibility report confirming everything passed."
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
            This link is private and tied to your order. We use these details only to install your AI visibility files. Credentials are deleted immediately after implementation.
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 p-4 mb-8" style={{ background: 'rgba(245,158,11,0.06)' }}>
          <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          <p className="text-xs text-amber-300/80 leading-relaxed">
            Your credentials are transmitted over HTTPS and stored encrypted. We access your site only during the agreed implementation window and delete all credentials immediately after.
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
                    {platform === 'wix' && 'Wix doesn\'t support external FTP access. We\'ll log in via your shared Wix account and apply all fixes manually — JSON-LD via custom code injection and llms.txt content via a workaround page.'}
                    {platform === 'squarespace' && 'Squarespace doesn\'t allow FTP. We\'ll apply your JSON-LD schema via the code injection panel and handle llms.txt via the best available workaround.'}
                    {platform === 'webflow' && 'Webflow sites are deployed via their platform. We\'ll add your JSON-LD via custom code in your site settings and handle static file hosting separately.'}
                  </p>
                  <p className="text-xs text-white/40 mt-3">
                    <strong className="text-white/60">Timeline:</strong> Fixes applied within 48 hours. You&apos;ll receive a before/after report by email when complete.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Credential fields for technical platforms + "other" */}
          {platform && !isManual && FIELD_LABELS[platform] && (
            <div className="rounded-2xl border border-white/8 p-6 space-y-5" style={{ background: '#111827' }}>
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider">
                {PLATFORMS.find(p2 => p2.id === platform)?.label} Details
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
                </div>
              ))}
            </div>
          )}

          {/* "Other" platform — ask what it is */}
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
                </div>
              ))}
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
              disabled={submitting}
              className="w-full py-4 rounded-xl text-sm font-black text-black disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:scale-[1.01]"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 24px rgba(6,182,212,0.25)' }}
            >
              {submitting ? 'Submitting…' : isManual ? 'Confirm — Apply My Fixes' : 'Submit Hosting Details'}
            </button>
          )}

          <p className="text-xs text-white/25 text-center leading-relaxed">
            By submitting, you confirm you own or are authorized to modify this website, per our{' '}
            <a href="/terms" className="text-white/40 hover:text-white/60">Terms of Service</a>.
            {!isManual && ' All credentials are permanently deleted within 48 hours of implementation.'}
          </p>

        </form>
      </main>
      <Footer />
    </div>
  )
}
