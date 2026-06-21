'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface CertInfo { subject: string; issuerOrg: string; issuerCN: string; validFrom: string; validTo: string; daysUntilExpiry: number; fingerprint256: string; sans: string[]; selfSigned: boolean; authorized: boolean }
interface TLSInfo { protocol: string; cipher: string; isSecure: boolean }
interface HeaderInfo { hsts: string | null; csp: string | null; xFrameOptions: string | null; xContentTypeOptions: string | null; referrerPolicy: string | null; permissionsPolicy: string | null }
interface Result { domain: string; grade: string; certificate: CertInfo; tls: TLSInfo; headers: HeaderInfo; issues: string[]; checkedAt: string }

const GRADE_COLOR: Record<string, string> = { 'A+': '#4ade80', A: '#4ade80', B: '#86efac', C: '#facc15', F: '#f87171' }

export default function SSLInspectorPage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)

  const inspect = async (domainArg?: string) => {
    const d = (domainArg ?? domain).trim()
    if (!d) return
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    try {
      const res = await fetch('/api/tools/ssl-inspector', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: d }),
      })
      const data = await res.json()
      if (data.paywall || res.status === 402) { setPaywall(true); return }
      if (!res.ok) throw new Error(data.error || 'Inspection failed')
      setResult(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Inspection failed') }
    finally { setLoading(false) }
  }

  const loadExample = () => { setDomain('github.com'); inspect('github.com') }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); inspect() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [domain])

  const headerRows = result ? [
    { label: 'HSTS', val: result.headers.hsts, required: true },
    { label: 'Content-Security-Policy', val: result.headers.csp, required: false },
    { label: 'X-Frame-Options', val: result.headers.xFrameOptions, required: true },
    { label: 'X-Content-Type-Options', val: result.headers.xContentTypeOptions, required: true },
    { label: 'Referrer-Policy', val: result.headers.referrerPolicy, required: false },
    { label: 'Permissions-Policy', val: result.headers.permissionsPolicy, required: false },
  ] : []

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/tools" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>All Tools
        </Link>
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#a78bfa', borderColor: 'rgba(167,139,250,0.3)', background: 'rgba(167,139,250,0.08)' }}>Live</span>
          <span className="text-sm font-bold text-white/30">3 free inspections/day Â· Unlimited with Pro</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">SSL / TLS <span style={{ color: '#a78bfa' }}>Inspector</span></h1>
        <p className="text-white/55 text-base mb-6 max-w-xl">Real TLS handshake â€” checks certificate expiry, cipher strength, protocol version, and security headers. No external scan APIs. Direct socket connection to your server.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">How it works</p>
            <p className="text-sm text-white/60 leading-relaxed">Connects directly to your server and performs a real TLS handshake â€” the same way a browser would. Reads the actual certificate chain, checks expiry, detects deprecated protocols (TLS 1.0/1.1), and inspects your HTTP security headers. No third-party APIs â€” raw socket connection to port 443.</p>
          </div>
          <div className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">What you get</p>
            <ul className="space-y-2">
              {['Certificate issuer, expiry date, and days remaining', 'TLS protocol version (1.2 vs 1.3) and cipher suite', 'Security header audit: HSTS, CSP, X-Frame-Options', 'Overall grade: A+ to F with specific issues', 'Subject Alternative Names (SANs) â€” all domains on the cert'].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/55">
                  <span className="text-green-400 mt-0.5 flex-shrink-0">âœ“</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border p-6 mb-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Domain</label>
          <div className="flex gap-3">
            <input value={domain} onChange={e => setDomain(e.target.value)} onKeyDown={e => e.key === 'Enter' && inspect()}
              placeholder="example.com" className="flex-1 text-sm text-white placeholder-white/20 outline-none"
              style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 16px' }} />
            <button onClick={() => inspect()} disabled={loading || !domain.trim()}
              className="px-5 py-3 rounded-xl text-sm font-black text-white transition-all hover:scale-[1.02] disabled:opacity-50 whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 16px rgba(124,58,237,0.3)' }}>
              {loading ? 'Connecting…' : <>Inspect <span className="opacity-30 text-xs">⌘↵</span></>}
            </button>
          </div>
          <div className="flex justify-end mt-3">
            <button onClick={loadExample} disabled={loading} className="px-4 py-2 rounded-xl text-sm font-bold border transition-colors hover:bg-white/5 disabled:opacity-40" style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>
              Try Example â†’ github.com
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>}
        {paywall && !loading && (
          <div className="rounded-2xl border p-8 text-center mb-6" style={{ background: 'rgba(167,139,250,0.05)', borderColor: 'rgba(167,139,250,0.2)' }}>
            <h3 className="text-xl font-black text-white mb-2">Unlimited inspections with Pro</h3>
            <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">Monitor SSL health across all your domains with Pro â€” $79/month.</p>
            <Link href="/monitor" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-white" style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}>Start Pro â€” $79/month</Link>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="rounded-2xl border p-6 flex items-center gap-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="text-center flex-shrink-0 w-20">
                <div className="text-5xl font-black" style={{ color: GRADE_COLOR[result.grade] ?? '#94a3b8' }}>{result.grade}</div>
                <div className="text-xs font-black uppercase tracking-widest text-white/35 mt-1">Grade</div>
              </div>
              <div className="flex-1 border-l pl-6" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="text-lg font-black text-white mb-1">{result.certificate.subject}</div>
                <div className="text-xs text-white/40 mb-1">Issued by <span className="text-white/60">{result.certificate.issuerOrg || result.certificate.issuerCN}</span></div>
                <div className="flex flex-wrap gap-3 mt-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>{result.tls.protocol}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>{result.tls.cipher}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={result.certificate.daysUntilExpiry > 30 ? { background: 'rgba(74,222,128,0.1)', color: '#4ade80' } : { background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>
                    {result.certificate.daysUntilExpiry > 0 ? `${result.certificate.daysUntilExpiry}d left` : `Expired ${Math.abs(result.certificate.daysUntilExpiry)}d ago`}
                  </span>
                </div>
              </div>
            </div>

            {result.issues.length > 0 && (
              <div className="rounded-xl border px-5 py-4" style={{ background: 'rgba(248,113,113,0.05)', borderColor: 'rgba(248,113,113,0.15)' }}>
                <div className="text-xs font-black uppercase tracking-widest text-red-400 mb-3">Issues Found</div>
                <ul className="space-y-2">
                  {result.issues.map((issue, i) => <li key={i} className="text-sm text-white/70 flex items-start gap-2"><span className="text-red-400 flex-shrink-0 mt-0.5">â€¢</span>{issue}</li>)}
                </ul>
              </div>
            )}

            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="px-5 py-3 border-b text-xs font-black uppercase tracking-widest text-white/35" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.06)' }}>Security Headers</div>
              {headerRows.map(r => (
                <div key={r.label} className="px-5 py-3 border-b flex items-start gap-3 last:border-0" style={{ background: '#0a0f1a', borderColor: 'rgba(255,255,255,0.04)' }}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`} style={{ background: r.val ? 'rgba(74,222,128,0.15)' : r.required ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.06)' }}>
                    {r.val ? <svg className="w-2.5 h-2.5 text-green-400" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      : <svg className="w-2.5 h-2.5" style={{ color: r.required ? '#f87171' : '#ffffff33' }} fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white/70 font-mono">{r.label}</div>
                    {r.val && <div className="text-xs text-white/30 font-mono truncate mt-0.5">{r.val.slice(0, 100)}</div>}
                  </div>
                </div>
              ))}
            </div>

            {result.certificate.sans.length > 0 && (
              <div className="rounded-xl border px-5 py-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="text-xs font-black uppercase tracking-widest text-white/35 mb-3">Subject Alternative Names ({result.certificate.sans.length})</div>
                <div className="flex flex-wrap gap-2">
                  {result.certificate.sans.slice(0, 20).map(san => <span key={san} className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>{san}</span>)}
                  {result.certificate.sans.length > 20 && <span className="text-xs text-white/25">+{result.certificate.sans.length - 20} more</span>}
                </div>
              </div>
            )}
          </div>
        )}

        <section className="mt-16 pt-8 border-t max-w-2xl" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-lg font-black text-white mb-4">How SSL/TLS inspection works</h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#A1A1AA' }}>This tool opens a real TLS handshake to your server — the same process a browser performs when you visit an HTTPS site. It reads the certificate chain directly from the server, not from a cached database. You get the actual expiry date, the issuer, every domain on the certificate (Subject Alternative Names), the negotiated TLS version, and the cipher suite your server prefers.</p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#A1A1AA' }}>TLS 1.3 is the current standard. If your server still negotiates TLS 1.2 it will work but may lose points on security audits. TLS 1.0 and 1.1 are deprecated and will cause browser warnings on some configurations. The cipher suite matters too: ECDHE key exchange with AES-GCM encryption is what you want; RC4 or 3DES are deprecated and insecure.</p>
          <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>Certificate expiry is the most common cause of preventable outages. Browsers show a hard error when a cert expires — no warning, no bypass for most users. If your cert expires in under 30 days, set up auto-renewal immediately. Let&apos;s Encrypt renews at 60 days remaining; most commercial CAs renew at 30 days. Wildcard certs cover all subdomains but require DNS-01 challenge validation and don&apos;t appear in public Certificate Transparency logs per subdomain.</p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
