'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface SigData {
  name: string
  title: string
  company: string
  email: string
  phone: string
  website: string
  linkedin: string
  twitter: string
  photoUrl: string
  accentColor: string
  dividerColor: string
  template: 'clean' | 'bold' | 'minimal'
}

const DEFAULTS: SigData = {
  name: 'Alex Jordan',
  title: 'Founder & CEO',
  company: 'Acme Corp',
  email: 'alex@acme.com',
  phone: '+1 (555) 000-0100',
  website: 'acme.com',
  linkedin: 'linkedin.com/in/alexjordan',
  twitter: '',
  photoUrl: '',
  accentColor: '#06d6ff',
  dividerColor: '#06d6ff',
  template: 'clean',
}

const ACCENT_OPTIONS = [
  '#06d6ff', '#6366f1', '#f87171', '#34d399', '#fbbf24', '#a78bfa', '#000000',
]

function buildHtml(d: SigData): string {
  const photo = d.photoUrl
    ? `<img src="${d.photoUrl}" width="72" height="72" style="border-radius:50%;object-fit:cover;display:block;" alt="${d.name}" />`
    : ''

  const links: string[] = []
  if (d.email) links.push(`<a href="mailto:${d.email}" style="color:${d.accentColor};text-decoration:none;">${d.email}</a>`)
  if (d.phone) links.push(`<a href="tel:${d.phone.replace(/\D/g, '')}" style="color:#888;text-decoration:none;">${d.phone}</a>`)
  if (d.website) links.push(`<a href="https://${d.website.replace(/^https?:\/\//, '')}" style="color:#888;text-decoration:none;">${d.website}</a>`)
  if (d.linkedin) links.push(`<a href="https://${d.linkedin.replace(/^https?:\/\//, '')}" style="color:#888;text-decoration:none;">LinkedIn</a>`)
  if (d.twitter) links.push(`<a href="https://x.com/${d.twitter.replace('@', '')}" style="color:#888;text-decoration:none;">@${d.twitter.replace('@', '')}</a>`)

  if (d.template === 'minimal') {
    return `<table style="font-family:Arial,sans-serif;font-size:13px;color:#333;border-collapse:collapse;">
  <tr><td style="padding:0;">
    <strong style="color:#111;font-size:14px;">${d.name}</strong>${d.title ? ` · <span style="color:#666;">${d.title}</span>` : ''}${d.company ? ` · <span style="color:#666;">${d.company}</span>` : ''}
    <br /><span style="color:#999;font-size:12px;">${links.join(' &nbsp;·&nbsp; ')}</span>
  </td></tr>
</table>`
  }

  if (d.template === 'bold') {
    return `<table style="font-family:Arial,sans-serif;border-collapse:collapse;">
  <tr>
    ${photo ? `<td style="padding:0 16px 0 0;vertical-align:top;">${photo}</td>` : ''}
    <td style="padding:0;vertical-align:top;border-left:4px solid ${d.accentColor};padding-left:16px;">
      <p style="margin:0 0 2px 0;font-size:18px;font-weight:900;color:#111;">${d.name}</p>
      <p style="margin:0 0 4px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${d.accentColor};">${d.title}${d.company ? ` · ${d.company}` : ''}</p>
      <p style="margin:0;font-size:12px;color:#888;">${links.join(' &nbsp;|&nbsp; ')}</p>
    </td>
  </tr>
</table>`
  }

  // clean (default)
  return `<table style="font-family:Arial,sans-serif;border-collapse:collapse;">
  <tr>
    ${photo ? `<td style="padding:0 16px 0 0;vertical-align:middle;">${photo}</td>` : ''}
    <td style="padding:0;vertical-align:middle;">
      <p style="margin:0 0 2px 0;font-size:15px;font-weight:700;color:#111;">${d.name}</p>
      <p style="margin:0 0 8px 0;font-size:12px;color:#666;">${d.title}${d.company ? `, ${d.company}` : ''}</p>
      <table style="border-collapse:collapse;"><tr><td style="border-top:2px solid ${d.accentColor};padding-top:8px;font-size:12px;color:#888;">
        ${links.join(' &nbsp;&middot;&nbsp; ')}
      </td></tr></table>
    </td>
  </tr>
</table>`
}

export default function EmailSignaturePage() {
  const [data, setData] = useState<SigData>(DEFAULTS)
  const [copiedHtml, setCopiedHtml] = useState(false)
  const [showInstructions, setShowInstructions] = useState<'gmail' | 'outlook' | 'apple' | null>(null)

  const update = (patch: Partial<SigData>) => setData(d => ({ ...d, ...patch }))
  const html = buildHtml(data)

  function copyHtml() {
    navigator.clipboard.writeText(html)
    setCopiedHtml(true)
    setTimeout(() => setCopiedHtml(false), 2000)
  }

  const inputCls = "w-full bg-transparent border rounded-lg px-3 py-2 text-white/70 text-sm outline-none placeholder:text-white/20"
  const inputStyle = { borderColor: 'rgba(255,255,255,0.1)' }
  const labelCls = "block text-xs font-bold text-white/30 uppercase tracking-wider mb-1"

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-10">

        <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/30 hover:text-white/60 transition-colors mb-8">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase mb-3"
            style={{ borderColor: 'rgba(6,182,212,0.25)', background: 'rgba(6,182,212,0.08)', color: '#06d6ff' }}>
            Free Tool · Business
          </div>
          <h1 className="text-3xl font-black text-white mb-1">Email Signature Generator</h1>
          <p className="text-white/40 text-sm">Build a professional HTML email signature in seconds. Works with Gmail, Outlook, and Apple Mail. Free, no login required.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* FORM */}
          <div className="space-y-4">
            <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-black uppercase tracking-widest text-white/25 mb-4">Your Info</p>
              <div className="space-y-3">
                <div><label className={labelCls}>Full Name</label><input className={inputCls} style={inputStyle} value={data.name} onChange={e => update({ name: e.target.value })} placeholder="Alex Jordan" /></div>
                <div><label className={labelCls}>Job Title</label><input className={inputCls} style={inputStyle} value={data.title} onChange={e => update({ title: e.target.value })} placeholder="Founder & CEO" /></div>
                <div><label className={labelCls}>Company</label><input className={inputCls} style={inputStyle} value={data.company} onChange={e => update({ company: e.target.value })} placeholder="Acme Corp" /></div>
                <div><label className={labelCls}>Email</label><input className={inputCls} style={inputStyle} value={data.email} onChange={e => update({ email: e.target.value })} placeholder="alex@company.com" /></div>
                <div><label className={labelCls}>Phone</label><input className={inputCls} style={inputStyle} value={data.phone} onChange={e => update({ phone: e.target.value })} placeholder="+1 (555) 000-0100" /></div>
                <div><label className={labelCls}>Website</label><input className={inputCls} style={inputStyle} value={data.website} onChange={e => update({ website: e.target.value })} placeholder="yoursite.com" /></div>
                <div><label className={labelCls}>LinkedIn URL</label><input className={inputCls} style={inputStyle} value={data.linkedin} onChange={e => update({ linkedin: e.target.value })} placeholder="linkedin.com/in/yourname" /></div>
                <div><label className={labelCls}>Twitter / X handle</label><input className={inputCls} style={inputStyle} value={data.twitter} onChange={e => update({ twitter: e.target.value })} placeholder="@yourhandle" /></div>
                <div><label className={labelCls}>Photo URL (optional)</label><input className={inputCls} style={inputStyle} value={data.photoUrl} onChange={e => update({ photoUrl: e.target.value })} placeholder="https://yoursite.com/photo.jpg" /></div>
              </div>
            </div>

            <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-black uppercase tracking-widest text-white/25 mb-4">Style</p>
              <div className="mb-4">
                <label className={labelCls}>Template</label>
                <div className="flex gap-2">
                  {(['clean', 'bold', 'minimal'] as const).map(t => (
                    <button key={t} onClick={() => update({ template: t })}
                      className="flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all"
                      style={{
                        background: data.template === t ? '#06d6ff' : 'rgba(255,255,255,0.05)',
                        color: data.template === t ? '#000' : 'rgba(255,255,255,0.4)',
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Accent Color</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {ACCENT_OPTIONS.map(c => (
                    <button key={c} onClick={() => update({ accentColor: c, dividerColor: c })}
                      className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                      style={{
                        background: c,
                        border: data.accentColor === c ? '2px solid white' : '2px solid transparent',
                        outline: data.accentColor === c ? '2px solid rgba(255,255,255,0.3)' : 'none',
                      }} />
                  ))}
                  <input type="color" value={data.accentColor}
                    onChange={e => update({ accentColor: e.target.value, dividerColor: e.target.value })}
                    className="w-7 h-7 rounded-full cursor-pointer border-0 p-0 bg-transparent" />
                </div>
              </div>
            </div>
          </div>

          {/* PREVIEW + OUTPUT */}
          <div className="space-y-4">
            <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: 'rgba(0,0,0,0.1)' }}>
              <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: '#9ca3af' }}>Preview</p>
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </div>

            <div className="rounded-2xl border overflow-hidden" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/6">
                <span className="text-xs font-bold text-white/25 uppercase tracking-widest">HTML Output</span>
                <button onClick={copyHtml}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: copiedHtml ? 'rgba(74,222,128,0.12)' : 'rgba(6,182,212,0.1)', color: copiedHtml ? '#4ade80' : '#06d6ff', border: `1px solid ${copiedHtml ? 'rgba(74,222,128,0.25)' : 'rgba(6,182,212,0.25)'}` }}>
                  {copiedHtml ? 'Copied!' : 'Copy HTML'}
                </button>
              </div>
              <pre className="p-4 text-[10px] font-mono text-white/40 overflow-auto max-h-48 whitespace-pre-wrap break-all">{html}</pre>
            </div>

            {/* Instructions */}
            <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-black uppercase tracking-widest text-white/25 mb-3">How to add this to your email client</p>
              <div className="flex gap-2 mb-4">
                {(['gmail', 'outlook', 'apple'] as const).map(client => (
                  <button key={client} onClick={() => setShowInstructions(showInstructions === client ? null : client)}
                    className="flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all"
                    style={{
                      background: showInstructions === client ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.05)',
                      color: showInstructions === client ? '#06d6ff' : 'rgba(255,255,255,0.4)',
                      border: showInstructions === client ? '1px solid rgba(6,182,212,0.3)' : '1px solid transparent',
                    }}>
                    {client === 'apple' ? 'Apple Mail' : client.charAt(0).toUpperCase() + client.slice(1)}
                  </button>
                ))}
              </div>
              {showInstructions === 'gmail' && (
                <ol className="space-y-1 text-xs text-white/50 list-decimal list-inside">
                  <li>Click "Copy HTML" above</li>
                  <li>Open Gmail → Settings (gear icon) → See all settings</li>
                  <li>Under General, scroll to "Signature" → Create new</li>
                  <li>Click the source icon (&lt;&gt;) in the signature editor</li>
                  <li>Paste the HTML and click OK</li>
                  <li>Scroll down and click "Save Changes"</li>
                </ol>
              )}
              {showInstructions === 'outlook' && (
                <ol className="space-y-1 text-xs text-white/50 list-decimal list-inside">
                  <li>Click "Copy HTML" above</li>
                  <li>Open Outlook → File → Options → Mail → Signatures</li>
                  <li>Click "New" and name your signature</li>
                  <li>In the Edit box, paste the HTML directly</li>
                  <li>If formatting is lost, try pasting into a .htm file and importing</li>
                  <li>Click OK to save</li>
                </ol>
              )}
              {showInstructions === 'apple' && (
                <ol className="space-y-1 text-xs text-white/50 list-decimal list-inside">
                  <li>Click "Copy HTML" above</li>
                  <li>Open TextEdit → Format → Make Plain Text</li>
                  <li>Paste the HTML and save as "signature.html"</li>
                  <li>Open Apple Mail → Preferences → Signatures</li>
                  <li>Create a new signature and close Preferences</li>
                  <li>Navigate to ~/Library/Mail/V10/MailData/Signatures/</li>
                  <li>Replace the .mailsignature file contents with your HTML</li>
                </ol>
              )}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-14 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-xl font-black text-white mb-1">How It Works</h2>
          <p className="text-white/35 text-sm mb-8">Generates table-based HTML email signatures that work in Gmail, Outlook, and Apple Mail — instantly in your browser.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { n: '01', title: 'Fill your details', body: 'Name, title, company, phone, email, website, and social links. Choose from 3 templates: Clean, Bold, or Minimal.' },
              { n: '02', title: 'Live preview', body: 'Your signature renders as real HTML in the preview panel as you type. What you see is exactly what email clients will show.' },
              { n: '03', title: 'Install in 3 steps', body: 'Copy the HTML, go to Gmail Settings → Signature → Paste. Outlook: File → Options → Mail → Signatures → New → Paste.' },
            ].map(s => (
              <div key={s.n} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-xs font-black text-white/20 mb-2">{s.n}</div>
                <div className="text-sm font-black text-white mb-1">{s.title}</div>
                <div className="text-xs text-white/45 leading-relaxed">{s.body}</div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-4">Sample signature output (Clean template)</p>
            <div className="rounded-lg overflow-hidden border border-white/10">
              <div style={{ fontFamily: 'Arial, sans-serif', padding: '16px', background: '#fff', color: '#111' }}>
                <table style={{ borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ paddingRight: '16px', borderRight: '3px solid #06d6ff', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Alex Jordan</div>
                        <div style={{ color: '#555', fontSize: '13px' }}>Founder, Acme Corp</div>
                        <div style={{ color: '#06d6ff', fontSize: '12px', marginTop: '4px' }}>alex@acme.com</div>
                      </td>
                      <td style={{ paddingLeft: '16px', verticalAlign: 'top' }}>
                        <div style={{ color: '#888', fontSize: '12px' }}>acme.com</div>
                        <div style={{ color: '#888', fontSize: '12px' }}>San Francisco, CA</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
