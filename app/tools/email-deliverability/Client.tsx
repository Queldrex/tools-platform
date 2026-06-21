'use client'
import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface CheckItem { label: string; pass: boolean; detail?: string }
interface Result {
  domain: string; score: number; grade: string
  spf: { found: boolean; record: string; passAll: boolean }
  dmarc: { found: boolean; policy: string; record: string }
  dkim: { selectorsFound: string[]; selectorsChecked: string[] }
  mx: { found: boolean; records: Array<{ priority: number; exchange: string }> }
  blacklisted: boolean; blacklists: Array<{ host: string; listed: boolean }>
  checkedAt: string
}

const GRADE_COLORS: Record<string, string> = { A: '#4ade80', B: '#86efac', C: '#facc15', F: '#f87171' }

export default function EmailDeliverabilityPage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)

  const check = async (domainArg?: string) => {
    const d = (domainArg ?? domain).trim()
    if (!d) return
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    try {
      const res = await fetch('/api/tools/email-deliverability', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: d }),
      })
      const data = await res.json()
      if (data.paywall || res.status === 402) { setPaywall(true); return }
      if (!res.ok) throw new Error(data.error || 'Check failed')
      setResult(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Check failed') }
    finally { setLoading(false) }
  }

  const loadExample = () => { setDomain('mailchimp.com'); check('mailchimp.com') }

  const checks: CheckItem[] = result ? [
    { label: 'SPF Record', pass: result.spf.found, detail: result.spf.found ? (result.spf.passAll ? '~all (softfail)' : result.spf.record?.slice(0, 80)) : 'No SPF record found — emails may fail delivery' },
    { label: 'DMARC Policy', pass: result.dmarc.found, detail: result.dmarc.found ? `p=${result.dmarc.policy}` : 'No DMARC record — spoofed emails will not be blocked' },
    { label: 'DKIM Selectors', pass: result.dkim.selectorsFound.length > 0, detail: result.dkim.selectorsFound.length > 0 ? `Found: ${result.dkim.selectorsFound.join(', ')}` : `Checked ${result.dkim.selectorsChecked.length} common selectors — none found` },
    { label: 'MX Records', pass: result.mx.found, detail: result.mx.found ? result.mx.records.map(r => `${r.exchange} (${r.priority})`).join(', ').slice(0, 100) : 'No MX records — domain cannot receive email' },
    { label: 'Blacklist Clean', pass: !result.blacklisted, detail: result.blacklisted ? `Listed on: ${result.blacklists.filter(b => b.listed).map(b => b.host).join(', ')}` : `Clean across ${result.blacklists.length} RBL blacklists` },
  ] : []

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/tools" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>All Tools
        </Link>
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#06d6ff', borderColor: 'rgba(6,214,255,0.3)', background: 'rgba(6,214,255,0.08)' }}>Live</span>
          <span className="text-sm font-bold text-white/30">3 free checks/day · Unlimited with Pro</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">Email <span style={{ color: '#06d6ff' }}>Deliverability Checker</span></h1>
        <p className="text-white/55 text-base mb-6 max-w-xl">Check SPF, DMARC, DKIM, MX records, and blacklist status for any domain. Real DNS lookups via Cloudflare. Know exactly why your emails land in spam.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">How it works</p>
            <p className="text-sm text-white/60 leading-relaxed">Checks all five deliverability signals that email providers use to decide if your email lands in the inbox or spam. Queries SPF, DKIM (15 common selectors), DMARC, and MX records via Cloudflare DNS-over-HTTPS. Blacklist check tests against known blocklists via DNS lookup. Zero third-party APIs.</p>
          </div>
          <div className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">What you get</p>
            <ul className="space-y-2">
              {['SPF record and policy strength (pass / softfail / fail)', 'DKIM selectors found (Google, SendGrid, Mailchimp +12)', 'DMARC policy: p=none vs p=quarantine vs p=reject', 'MX records with priority order', 'Deliverability score with plain-English explanation'].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/55">
                  <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border p-6 mb-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Domain</label>
          <div className="flex gap-3">
            <input value={domain} onChange={e => setDomain(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()}
              placeholder="example.com" className="flex-1 text-sm text-white placeholder-white/20 outline-none"
              style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 16px' }} />
            <button onClick={() => check()} disabled={loading || !domain.trim()}
              className="px-5 py-3 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.02] disabled:opacity-50 whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 16px rgba(6,214,255,0.25)' }}>
              {loading ? 'Checking DNS…' : 'Check'}
            </button>
          </div>
          <div className="flex justify-end mt-3">
            <button onClick={loadExample} disabled={loading} className="px-4 py-2 rounded-xl text-sm font-bold border transition-colors hover:bg-white/5 disabled:opacity-40" style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>
              Try Example → mailchimp.com
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>}
        {paywall && !loading && (
          <div className="rounded-2xl border p-8 text-center mb-6" style={{ background: 'rgba(6,214,255,0.05)', borderColor: 'rgba(6,214,255,0.2)' }}>
            <h3 className="text-xl font-black text-white mb-2">Unlimited checks with Pro</h3>
            <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">Monitor all your domains for deliverability issues with Pro — $79/month.</p>
            <Link href="/monitor" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Start Pro — $79/month</Link>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="rounded-2xl border p-6 flex items-center gap-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="text-center flex-shrink-0">
                <div className="text-6xl font-black" style={{ color: GRADE_COLORS[result.grade] ?? '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>{result.grade}</div>
                <div className="text-xs font-black uppercase tracking-widest text-white/35 mt-1">Grade</div>
              </div>
              <div className="flex-1">
                <div className="h-2.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${result.score}%`, background: `linear-gradient(90deg,${GRADE_COLORS[result.grade] ?? '#94a3b8'},${GRADE_COLORS[result.grade] ?? '#94a3b8'}aa)` }} />
                </div>
                <div className="text-2xl font-black text-white">{result.score}<span className="text-sm text-white/30">/100</span></div>
                <div className="text-xs text-white/35 mt-0.5 font-mono">{result.domain}</div>
              </div>
            </div>
            {checks.map(c => (
              <div key={c.label} className="rounded-xl border px-5 py-4 flex items-start gap-4" style={{ background: '#0d1117', borderColor: c.pass ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)' }}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`} style={{ background: c.pass ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)' }}>
                  {c.pass ? <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    : <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>}
                </div>
                <div>
                  <div className="text-sm font-black text-white">{c.label}</div>
                  {c.detail && <div className="text-xs text-white/40 mt-0.5 font-mono break-all">{c.detail}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        <section className="mt-16 pt-8 border-t max-w-2xl" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-lg font-black text-white mb-4">SPF, DKIM, and DMARC explained</h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#A1A1AA' }}>SPF (Sender Policy Framework) is a DNS TXT record that lists which mail servers are authorized to send email for your domain. When a recipient server receives a message from you, it checks the sending IP against your SPF record. A &quot;softfail&quot; (~all) flags unauthorized senders but still delivers the message. A &quot;fail&quot; (-all) tells servers to reject them outright. Missing SPF means anyone can spoof your domain as a sender.</p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#A1A1AA' }}>DKIM (DomainKeys Identified Mail) adds a cryptographic signature to every outbound email. The signature is verified using a public key published in your DNS. Even if a message is forwarded or relayed, the signature travels with it. Without DKIM, your emails have no proof of authenticity — spam filters treat them with more suspicion, and phishing using your domain name is trivial.</p>
          <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>DMARC ties SPF and DKIM together and tells recipient servers what to do with email that fails both checks. &quot;p=none&quot; only sends reports — no filtering. &quot;p=quarantine&quot; routes failing messages to spam. &quot;p=reject&quot; blocks them entirely. A perfect score means SPF is present with -all, DKIM is configured, and DMARC is set to at least p=quarantine with an rua reporting address. Google and Yahoo now require these records for bulk senders.</p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
