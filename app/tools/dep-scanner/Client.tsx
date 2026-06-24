'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PaywallCard from '@/components/PaywallCard'

const SEV = { critical: '#f87171', high: '#fb923c', medium: '#facc15', low: '#94a3b8' }

interface Vuln { id: string; summary: string; severity: string; cvssScore: number | null; fixedIn: string; url: string }
interface Pkg { name: string; version: string; vulns: Vuln[]; isVulnerable: boolean }
interface Summary { total: number; vulnerable: number; clean: number; critical: number; high: number; medium: number; low: number }
interface Result { packages: Pkg[]; summary: Summary; ecosystem: string; scannedAt: string }

export default function DepScannerPage() {
  const [tab, setTab] = useState<'npm' | 'python'>('npm')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const scan = async (contentArg?: string, tabArg?: 'npm' | 'python') => {
    const c = (contentArg ?? content).trim()
    const t = tabArg ?? tab
    if (!c) return
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    try {
      const res = await fetch('/api/tools/dep-scanner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: c, ecosystem: t }),
      })
      const data = await res.json()
      if (data.paywall || res.status === 402) { setPaywall(true); return }
      if (!res.ok) throw new Error(data.error || 'Scan failed')
      setResult(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Scan failed') }
    finally { setLoading(false) }
  }

  const EXAMPLE_PKG = `{\n  "dependencies": {\n    "lodash": "4.17.20",\n    "axios": "0.21.1",\n    "node-fetch": "2.6.1",\n    "minimist": "1.2.5",\n    "ws": "7.4.5"\n  }\n}`
  const loadExample = () => { setTab('npm'); setContent(EXAMPLE_PKG); scan(EXAMPLE_PKG, 'npm') }

  const toggle = (name: string) => setExpanded(s => { const n = new Set(s); n.has(name) ? n.delete(name) : n.add(name); return n })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); scan() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [content, tab])

  const placeholder = tab === 'npm'
    ? '{\n  "dependencies": {\n    "express": "4.18.0",\n    "lodash": "4.17.20"\n  },\n  "devDependencies": {\n    "jest": "29.0.0"\n  }\n}'
    : 'requests==2.28.0\nflask>=2.0.0\nnumpy==1.24.0\npillow==9.0.0'

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/tools" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>All Tools
        </Link>
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.08)' }}>Live</span>
          <span className="text-sm font-bold text-white/30">2 free scans/day · Unlimited with Pro</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">Dependency <span style={{ color: '#f87171' }}>CVE Scanner</span></h1>
        <p className="text-white/55 text-base mb-4 max-w-2xl">Paste your package.json or requirements.txt and check every dependency against Google's OSV vulnerability database in real time. Real CVE data, real CVSS scores, real fix versions.</p>
        <div className="flex gap-3 flex-wrap mb-6">
          <Link href="/pricing" className="inline-flex items-center gap-1 text-sm font-black px-4 py-2 rounded-xl text-black" style={{ background: 'linear-gradient(135deg,#f87171,#dc2626)' }}>Get this tool — $29 →</Link>
          <Link href="/pricing" className="inline-flex items-center gap-1 text-sm font-black px-4 py-2 rounded-xl border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>All 51 tools — from $99 →</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">How it works</p>
            <p className="text-sm text-white/60 leading-relaxed">Sends every package name and version to Google&apos;s OSV (Open Source Vulnerability) database — the same database that powers GitHub&apos;s Dependabot alerts. Results include real CVE IDs, CVSS severity scores, the version that fixes each vulnerability, and direct links to the GitHub Security Advisory.</p>
          </div>
          <div className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">What you get</p>
            <ul className="space-y-2">
              {['CVE IDs and CVSS scores for every vulnerable package', 'Fixed version for each vulnerability', 'Link to the full GitHub Security Advisory', 'Severity breakdown: Critical / High / Medium / Low', 'Supports npm (package.json) and PyPI (requirements.txt)'].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/55">
                  <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border p-6 mb-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex gap-2 mb-5">
            {(['npm', 'python'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className="px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
                style={tab === t ? { background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' } : { background: 'transparent', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {t === 'npm' ? 'npm (package.json)' : 'Python (requirements.txt)'}
              </button>
            ))}
          </div>
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder={placeholder} rows={12}
            className="w-full text-sm text-white/80 placeholder-white/20 outline-none resize-y font-mono"
            style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '14px 16px', minHeight: 260 }} />
          <div className="flex justify-between items-center mt-4">
            <button onClick={loadExample} disabled={loading} className="px-4 py-3 rounded-xl text-sm font-bold border transition-colors hover:bg-white/5 disabled:opacity-40" style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>
              Try Example → lodash, axios, ws with CVEs
            </button>
            <button onClick={() => scan()} disabled={loading || !content.trim()}
              className="px-6 py-3 rounded-xl text-sm font-black text-white transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#dc2626,#b91c1c)', boxShadow: '0 0 20px rgba(220,38,38,0.3)' }}>
              {loading ? 'Scanning OSV database…' : <>Scan for CVEs <span className="opacity-30 text-xs">⌘↵</span></>}
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>}
        {paywall && !loading && <PaywallCard toolId="dep-scanner" toolName="Dependency CVE Scanner" monthlyPrice={19} freeLimit={2} accent="#f87171" />}

        {result && (
          <div className="space-y-5">
            <div className="rounded-2xl border p-5 grid grid-cols-2 md:grid-cols-4 gap-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="text-center"><div className="text-4xl font-black" style={{ color: result.summary.vulnerable > 0 ? '#f87171' : '#4ade80' }}>{result.summary.vulnerable}</div><div className="text-xs text-white/40 mt-1 font-bold uppercase tracking-wider">Vulnerable</div></div>
              <div className="text-center"><div className="text-4xl font-black" style={{ color: '#f87171' }}>{result.summary.critical}</div><div className="text-xs text-white/40 mt-1 font-bold uppercase tracking-wider">Critical</div></div>
              <div className="text-center"><div className="text-4xl font-black" style={{ color: '#fb923c' }}>{result.summary.high}</div><div className="text-xs text-white/40 mt-1 font-bold uppercase tracking-wider">High</div></div>
              <div className="text-center"><div className="text-4xl font-black" style={{ color: '#4ade80' }}>{result.summary.clean}</div><div className="text-xs text-white/40 mt-1 font-bold uppercase tracking-wider">Clean</div></div>
            </div>

            {result.packages.filter(p => p.isVulnerable).map(pkg => (
              <div key={pkg.name} className="rounded-xl border overflow-hidden" style={{ borderColor: `${SEV[pkg.vulns[0]?.severity as keyof typeof SEV] ?? '#94a3b8'}33` }}>
                <button onClick={() => toggle(pkg.name)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded" style={{ background: `${SEV[pkg.vulns[0]?.severity as keyof typeof SEV] ?? '#94a3b8'}20`, color: SEV[pkg.vulns[0]?.severity as keyof typeof SEV] ?? '#94a3b8', border: `1px solid ${SEV[pkg.vulns[0]?.severity as keyof typeof SEV] ?? '#94a3b8'}44` }}>{pkg.vulns[0]?.severity}</span>
                    <span className="font-black text-white font-mono">{pkg.name}</span>
                    <span className="text-white/35 text-sm font-mono">{pkg.version || 'any'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/40">{pkg.vulns.length} vuln{pkg.vulns.length !== 1 ? 's' : ''}</span>
                    <svg className={`w-4 h-4 text-white/30 transition-transform ${expanded.has(pkg.name) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </button>
                {expanded.has(pkg.name) && (
                  <div className="border-t px-5 py-4 space-y-4" style={{ background: '#0a0f1a', borderColor: 'rgba(255,255,255,0.05)' }}>
                    {pkg.vulns.map(v => (
                      <div key={v.id}>
                        <div className="flex items-start gap-3 mb-1">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded flex-shrink-0 mt-0.5" style={{ background: `${SEV[v.severity as keyof typeof SEV]}20`, color: SEV[v.severity as keyof typeof SEV], border: `1px solid ${SEV[v.severity as keyof typeof SEV]}44` }}>{v.severity}{v.cvssScore ? ` ${v.cvssScore}` : ''}</span>
                          <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-white hover:underline">{v.id}</a>
                        </div>
                        <p className="text-xs text-white/55 ml-0 mb-1">{v.summary}</p>
                        {v.fixedIn && <p className="text-xs font-bold" style={{ color: '#4ade80' }}>Fix: upgrade to {v.fixedIn}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {result.packages.filter(p => !p.isVulnerable).length > 0 && (
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-green-400 mb-3">Clean Packages ({result.packages.filter(p => !p.isVulnerable).length})</p>
                <div className="flex flex-wrap gap-2">
                  {result.packages.filter(p => !p.isVulnerable).map(p => (
                    <span key={p.name} className="text-xs px-3 py-1 rounded-full font-mono" style={{ background: 'rgba(74,222,128,0.08)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>{p.name}{p.version ? `@${p.version}` : ''}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <div className="mt-10 mb-8">
          <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Who This Is For</p>
          <ul className="space-y-2 text-sm text-white/55">
            <li>• Developers auditing npm or PyPI dependencies for known CVEs before a release</li>
            <li>• Security engineers checking CVSS scores and fixed versions before patching</li>
            <li>• DevOps teams running quick vulnerability scans without installing Snyk or a CLI tool</li>
            <li>• Open-source maintainers verifying their dependency tree is clean for contributors</li>
          </ul>
        </div>
        <section className="mt-16 pt-8 border-t max-w-2xl" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-lg font-black text-white mb-4">Understanding CVEs, CVSS scores, and OSV</h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#A1A1AA' }}>This tool queries the OSV (Open Source Vulnerability) database — a Google-maintained, open vulnerability database that powers GitHub&apos;s Dependabot alerts and the npm audit command. OSV aggregates vulnerability reports from GitHub Security Advisories, PyPI, NVD, and dozens of other sources into a single normalized format. When you paste your package file, every name and version is sent to the OSV batch API and results come back within seconds.</p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#A1A1AA' }}>CVSS (Common Vulnerability Scoring System) scores rate severity from 0 to 10. Scores 0–3.9 are Low — exploitable but limited impact. Scores 4.0–6.9 are Medium — exploitable under specific conditions or with significant effort. Scores 7.0–8.9 are High — serious vulnerabilities with real-world exploitation potential. Scores 9.0–10 are Critical — remotely exploitable, no authentication required, full system compromise possible. CVE IDs (e.g. CVE-2021-44228) are the universal identifiers assigned by MITRE; use them to look up patches, PoCs, and mitigations in any security database.</p>
          <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>When a vulnerability shows &quot;Fixed in version X&quot;, upgrade to that version or higher. Run your package manager&apos;s update command (npm update packagename or pip install --upgrade packagename) and then re-lock your dependencies. If a fix is not yet available, check the advisory for workarounds. Beyond security, keeping dependencies current reduces bundle size, improves performance, and prevents the compounding technical debt of skipping major versions for years.</p>
        </section>
      </main>
      <div className="max-w-5xl mx-auto px-6 pb-12">
        <div className="mt-14 rounded-2xl border p-6 text-center" style={{ background: 'rgba(248,113,113,0.04)', borderColor: 'rgba(248,113,113,0.15)' }}>
          <p className="text-white font-black mb-1">Add dependency scanning to your platform</p>
          <p className="text-white/40 text-sm mb-4">OSV database, CVE IDs + CVSS scores, fixed versions, npm and Python support. One-time license.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#f87171,#dc2626)' }}>Get this tool — $29 →</Link>
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>All 51 tools — from $99 →</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
