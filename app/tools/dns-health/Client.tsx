'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface MXRecord { priority: number; exchange: string }
interface SoaData { mname: string; rname: string; serial: number; refresh: number; retry: number; expire: number; minimum: number }
interface CaaRecord { flag: number; tag: string; value: string }
interface RecordGroup<T = string | MXRecord | SoaData | CaaRecord> { found: boolean; data: T[]; ttl?: number; propagated?: boolean }

interface Result {
  domain: string
  propagationStatus: 'propagated' | 'propagating' | 'not-found'
  hasIPv6: boolean
  hasCAA: boolean
  records: {
    A: RecordGroup<string> & { propagated: boolean }
    AAAA: RecordGroup<string>
    MX: RecordGroup<MXRecord>
    NS: RecordGroup<string>
    TXT: RecordGroup<string>
    SOA: RecordGroup<SoaData> & { data: [SoaData | null] }
    CAA: RecordGroup<CaaRecord>
    DMARC: RecordGroup<string>
    WWW: RecordGroup<string>
  }
  checkedAt: string
}

const PROP_COLORS: Record<string, string> = { propagated: '#4ade80', propagating: '#facc15', 'not-found': '#f87171' }
const PROP_LABELS: Record<string, string> = { propagated: 'Propagated', propagating: 'Still propagating', 'not-found': 'Domain not found' }

function DnsHealthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)
  const [shared, setShared] = useState(false)

  const check = async (domainArg?: string) => {
    const d = (domainArg ?? domain).trim()
    if (!d) return
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    try {
      const res = await fetch('/api/tools/dns-health', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: d }),
      })
      const data = await res.json()
      if (data.paywall || res.status === 402) { setPaywall(true); return }
      if (!res.ok) throw new Error(data.error || 'Check failed')
      setResult(data)
      router.replace('?domain=' + encodeURIComponent(d), { scroll: false })
    } catch (e) { setError(e instanceof Error ? e.message : 'Check failed') }
    finally { setLoading(false) }
  }

  const loadExample = () => { setDomain('cloudflare.com'); check('cloudflare.com') }

  useEffect(() => {
    const d = searchParams.get('domain')
    if (d) { setDomain(d); check(d) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); check() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [domain])

  function shareResult() {
    navigator.clipboard.writeText(window.location.href)
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  const formatTTL = (s: number) => s >= 3600 ? `${Math.floor(s / 3600)}h` : s >= 60 ? `${Math.floor(s / 60)}m` : `${s}s`

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/tools" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>All Tools
        </Link>
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#34d399', borderColor: 'rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.08)' }}>Live</span>
          <span className="text-sm font-bold text-white/30">5 free checks/day · Unlimited with Pro</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">DNS <span style={{ color: '#34d399' }}>Health Check</span></h1>
        <p className="text-white/55 text-base mb-4 max-w-xl">Query A, AAAA, MX, NS, TXT, SOA, CAA, and DMARC records in real time via Cloudflare and Google DNS. Verify propagation status instantly.</p>
        <div className="flex gap-3 flex-wrap mb-6">
          <Link href="/pricing" className="inline-flex items-center gap-1 text-sm font-black px-4 py-2 rounded-xl text-black" style={{ background: 'linear-gradient(135deg,#34d399,#059669)' }}>Get this tool — $29 →</Link>
          <Link href="/pricing" className="inline-flex items-center gap-1 text-sm font-black px-4 py-2 rounded-xl border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>All 51 tools — from $99 →</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">How it works</p>
            <p className="text-sm text-white/60 leading-relaxed">Queries both Cloudflare (1.1.1.1) and Google (8.8.8.8) DNS resolvers simultaneously, then compares results to detect propagation mismatches. Returns A, AAAA, MX, TXT, NS, CNAME, and CAA records in real-time. All queries use DNS-over-HTTPS for privacy — no UDP leakage.</p>
          </div>
          <div className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">What you get</p>
            <ul className="space-y-2">
              {['A, AAAA, MX, TXT, NS, CNAME, and CAA records', 'Side-by-side Cloudflare vs Google resolver results', 'Propagation status — do both resolvers agree?', 'TTL values for every record', 'SPF record parsed and highlighted from TXT records'].map((item, i) => (
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
              style={{ background: 'linear-gradient(135deg,#34d399,#059669)', boxShadow: '0 0 16px rgba(52,211,153,0.25)' }}>
              {loading ? 'Querying DNS…' : 'Check DNS'}
            </button>
          </div>
          <div className="flex justify-end mt-3">
            <button onClick={loadExample} disabled={loading} className="px-4 py-2 rounded-xl text-sm font-bold border transition-colors hover:bg-white/5 disabled:opacity-40" style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>
              Try Example → cloudflare.com
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>}
        {paywall && !loading && (
          <div className="rounded-2xl border p-8 text-center mb-6" style={{ background: 'rgba(52,211,153,0.05)', borderColor: 'rgba(52,211,153,0.2)' }}>
            <h3 className="text-xl font-black text-white mb-2">Unlimited DNS checks with Pro</h3>
            <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">Pro includes unlimited DNS monitoring and full site health checks.</p>
            <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#34d399,#059669)' }}>Upgrade to Pro →</Link>
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className="rounded-2xl border p-5 flex flex-wrap gap-4 items-center justify-between" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex flex-wrap gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-white/35 mb-1">Propagation</div>
                  <div className="text-sm font-black" style={{ color: PROP_COLORS[result.propagationStatus] }}>{PROP_LABELS[result.propagationStatus]}</div>
                </div>
                <div className="border-l pl-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div className="text-xs font-black uppercase tracking-widest text-white/35 mb-1">IPv6</div>
                  <div className="text-sm font-black" style={{ color: result.hasIPv6 ? '#4ade80' : '#94a3b8' }}>{result.hasIPv6 ? 'Supported' : 'Not configured'}</div>
                </div>
                <div className="border-l pl-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div className="text-xs font-black uppercase tracking-widest text-white/35 mb-1">CAA</div>
                  <div className="text-sm font-black" style={{ color: result.hasCAA ? '#4ade80' : '#94a3b8' }}>{result.hasCAA ? 'Restricted' : 'Open'}</div>
                </div>
              </div>
              <button onClick={shareResult}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:bg-white/5"
                style={{ color: shared ? '#4ade80' : 'rgba(255,255,255,0.4)', borderColor: shared ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.1)' }}>
                {shared ? '✓ Copied!' : 'Share result'}
              </button>
            </div>

            {([
              { key: 'A', label: 'A Records (IPv4)' },
              { key: 'AAAA', label: 'AAAA Records (IPv6)' },
              { key: 'MX', label: 'MX Records (Mail)' },
              { key: 'NS', label: 'NS Records (Nameservers)' },
              { key: 'TXT', label: 'TXT Records' },
              { key: 'DMARC', label: 'DMARC Record' },
              { key: 'SOA', label: 'SOA Record' },
              { key: 'CAA', label: 'CAA Records' },
              { key: 'WWW', label: 'www Subdomain' },
            ] as const).map(({ key, label }) => {
              const rec = result.records[key]
              return (
                <div key={key} className="rounded-xl border px-5 py-4" style={{ background: '#0d1117', borderColor: rec.found ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-widest text-white/40">{label}</span>
                    <div className="flex items-center gap-2">
                      {rec.ttl ? <span className="text-xs text-white/25 font-mono">TTL {formatTTL(rec.ttl)}</span> : null}
                      <span className="text-xs font-bold" style={{ color: rec.found ? '#4ade80' : '#94a3b8' }}>{rec.found ? 'Found' : 'Not found'}</span>
                    </div>
                  </div>
                  {rec.found && (
                    <div className="space-y-1">
                      {key === 'MX' && (rec.data as MXRecord[]).map((r, i) => (
                        <div key={i} className="font-mono text-xs text-white/60 flex gap-3">
                          <span className="text-white/25 flex-shrink-0">{r.priority}</span>
                          <span>{r.exchange}</span>
                        </div>
                      ))}
                      {key === 'SOA' && rec.data[0] && (() => {
                        const s = rec.data[0] as unknown as SoaData
                        return <div className="font-mono text-xs text-white/60">{s.mname} · Serial {s.serial} · Refresh {formatTTL(s.refresh)}</div>
                      })()}
                      {key === 'CAA' && (rec.data as CaaRecord[]).map((r, i) => (
                        <div key={i} className="font-mono text-xs text-white/60">{r.tag} &quot;{r.value}&quot;</div>
                      ))}
                      {!['MX', 'SOA', 'CAA'].includes(key) && (rec.data as string[]).map((r, i) => (
                        <div key={i} className="font-mono text-xs text-white/60 break-all">{r}</div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-10 mb-8">
          <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Who This Is For</p>
          <ul className="space-y-2 text-sm text-white/55">
            <li>• DevOps engineers troubleshooting DNS propagation delays after a migration</li>
            <li>• SaaS founders verifying MX, DMARC, and SPF records before launching email campaigns</li>
            <li>• Agencies auditing client DNS configurations for missing CAA or IPv6 records</li>
            <li>• Developers checking TTL values and resolver consistency across Cloudflare and Google</li>
          </ul>
        </div>

        <section className="mt-16 pt-8 border-t max-w-2xl" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-lg font-black text-white mb-4">How DNS health checking works</h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#A1A1AA' }}>This tool queries both Cloudflare (1.1.1.1) and Google (8.8.8.8) DNS resolvers simultaneously. If the two resolvers return different results for your domain, DNS propagation is still in progress — your zone change has reached one resolver but not the other. This is normal for 1 to 48 hours after a record change, depending on your TTL.</p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#A1A1AA' }}>Each DNS record type has a specific role. A records map your domain to an IPv4 address. AAAA records do the same for IPv6. MX records control which mail servers receive your email — priority numbers determine delivery order (lower = higher priority). TXT records carry SPF (authorized senders), DKIM (cryptographic signature), and domain verification tokens. NS records identify your authoritative nameservers — these change when you migrate DNS providers. CAA records restrict which Certificate Authorities can issue SSL certs for your domain.</p>
          <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>TTL (Time to Live) is how long resolvers cache your DNS records before re-querying. Low TTLs (300 seconds) mean changes propagate quickly but increase DNS query load. High TTLs (86400 seconds = 1 day) reduce load but slow propagation. Best practice: lower your TTL to 300 before any planned migration, wait for the old TTL to expire, make the change, then raise the TTL back after the migration is complete.</p>
        </section>
        <div className="mt-14 rounded-2xl border p-6 text-center" style={{ background: 'rgba(52,211,153,0.04)', borderColor: 'rgba(52,211,153,0.15)' }}>
          <p className="text-white font-black mb-1">Add DNS health checking to your platform</p>
          <p className="text-white/40 text-sm mb-4">Full DNS record audit, propagation check, DMARC/SPF/CAA, resolver comparison. One-time license.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#34d399,#059669)' }}>Get this tool — $29 →</Link>
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>All 51 tools — from $99 →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function DnsHealthPage() {
  return <Suspense fallback={null}><DnsHealthContent /></Suspense>
}
