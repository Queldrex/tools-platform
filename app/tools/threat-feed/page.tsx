'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface ThreatEntry {
  id: string
  indicator: string
  indicatorType: 'URL' | 'IP'
  category: 'MALWARE' | 'C2' | 'BOTNET'
  severity: 'critical' | 'high' | 'medium'
  source: string
  status: 'active' | 'inactive'
  malwareFamily?: string
  firstSeen: string
}

type Filter = 'ALL' | 'MALWARE' | 'C2' | 'BOTNET'

const SEV_COLOR: Record<string, string> = {
  critical: '#f87171',
  high: '#fb923c',
  medium: '#facc15',
}

const SEV_BG: Record<string, string> = {
  critical: 'rgba(248,113,113,0.12)',
  high: 'rgba(251,146,60,0.12)',
  medium: 'rgba(250,204,21,0.10)',
}

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}

export default function ThreatFeedPage() {
  const [entries, setEntries] = useState<ThreatEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<Filter>('ALL')
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/threat-feed')
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data.error || 'Feed temporarily unavailable')
        return
      }
      setEntries(data.entries || [])
      setUpdatedAt(new Date())
      setError('')
    } catch {
      setError('Failed to fetch threat feed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [load])

  const visible = filter === 'ALL' ? entries : entries.filter(e => e.category === filter)
  const active = entries.filter(e => e.status === 'active').length
  const counts = { MALWARE: 0, C2: 0, BOTNET: 0 } as Record<string, number>
  entries.forEach(e => { counts[e.category] = (counts[e.category] || 0) + 1 })

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* Back */}
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/30 hover:text-white/60 transition-colors mb-8">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-red-400">Live</span>
              <span className="text-xs text-white/25">·</span>
              <span className="text-xs text-white/35 font-mono">
                {updatedAt ? `Updated ${fmt(updatedAt.toISOString())}` : 'Loading…'}
              </span>
            </div>
            <h1 className="text-3xl font-black text-white">Threat Intelligence Feed</h1>
            <p className="text-white/45 text-sm mt-1">Live cyber threat indicators from global intelligence sources</p>
          </div>
          <button
            onClick={load}
            className="self-start flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white/50 border border-white/10 hover:border-white/20 hover:text-white transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Refresh
          </button>
        </div>

        {/* Stats */}
        {!loading && entries.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total IOCs', value: entries.length, color: '#06d6ff' },
              { label: 'Active Threats', value: active, color: '#f87171' },
              { label: 'Malware URLs', value: counts.MALWARE || 0, color: '#fb923c' },
              { label: 'C2 / Botnets', value: (counts.C2 || 0) + (counts.BOTNET || 0), color: '#facc15' },
            ].map(s => (
              <div key={s.label} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-white/35">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          {(['ALL', 'MALWARE', 'C2', 'BOTNET'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: filter === f ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${filter === f ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.08)'}`,
                color: filter === f ? '#06d6ff' : 'rgba(255,255,255,0.4)',
              }}
            >
              {f}{f !== 'ALL' && ` (${counts[f] || 0})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
          {loading && (
            <div className="py-16 text-center">
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-white/35 text-sm">Fetching threat intelligence…</p>
            </div>
          )}

          {!loading && error && (
            <div className="py-16 text-center">
              <p className="text-red-400 text-sm mb-2">{error}</p>
              <button onClick={load} className="text-xs text-white/40 hover:text-white transition-colors">Try again</button>
            </div>
          )}

          {!loading && !error && visible.length === 0 && (
            <div className="py-16 text-center text-white/30 text-sm">No entries for this filter.</div>
          )}

          {!loading && !error && visible.length > 0 && (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Severity', 'Indicator', 'Type', 'Category', 'Family', 'Source', 'Status', 'First Seen'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visible.slice(0, 10).map(e => (
                      <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase" style={{ color: SEV_COLOR[e.severity], background: SEV_BG[e.severity] }}>
                            {e.severity}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 max-w-[220px]">
                          <span className="font-mono text-[11px] truncate block" style={{ color: 'rgba(255,255,255,0.6)' }} title={e.indicator}>
                            {e.indicator.length > 40 ? e.indicator.slice(0, 40) + '…' : e.indicator}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}>
                            {e.indicatorType}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-white/40 font-medium">{e.category}</td>
                        <td className="px-4 py-2.5 text-white/30">{e.malwareFamily || '—'}</td>
                        <td className="px-4 py-2.5 text-white/35">{e.source}</td>
                        <td className="px-4 py-2.5">
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: e.status === 'active' ? '#f87171' : '#475569' }} />
                            <span style={{ color: e.status === 'active' ? '#f87171' : 'rgba(255,255,255,0.25)' }}>
                              {e.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-white/25 font-mono">{fmt(e.firstSeen)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paywall */}
              {visible.length > 10 && (
                <div>
                  {/* Blurred preview rows */}
                  <div className="overflow-x-auto pointer-events-none opacity-20 blur-sm select-none" aria-hidden>
                    <table className="w-full text-xs">
                      <tbody>
                        {[0, 1, 2].map(i => (
                          <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td className="px-4 py-2.5"><div className="h-4 w-14 rounded" style={{ background: 'rgba(248,113,113,0.3)' }} /></td>
                            <td className="px-4 py-2.5"><div className="h-4 w-40 rounded" style={{ background: 'rgba(255,255,255,0.1)' }} /></td>
                            <td className="px-4 py-2.5"><div className="h-4 w-10 rounded" style={{ background: 'rgba(255,255,255,0.08)' }} /></td>
                            <td className="px-4 py-2.5"><div className="h-4 w-16 rounded" style={{ background: 'rgba(255,255,255,0.08)' }} /></td>
                            <td className="px-4 py-2.5"><div className="h-4 w-20 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} /></td>
                            <td className="px-4 py-2.5"><div className="h-4 w-16 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} /></td>
                            <td className="px-4 py-2.5"><div className="h-4 w-12 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} /></td>
                            <td className="px-4 py-2.5"><div className="h-4 w-24 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Paywall card */}
                  <div className="mx-4 mb-4 rounded-xl border p-6 text-center" style={{ background: 'rgba(6,182,212,0.05)', borderColor: 'rgba(6,182,212,0.25)' }}>
                    <div className="flex justify-center mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)' }}>
                        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-base font-black text-white mb-1">See the full threat feed</h3>
                    <p className="text-sm text-white/45 mb-4 max-w-sm mx-auto">
                      Pro subscribers get unlimited access to real-time threat intelligence — {visible.length} active indicators, updated every 15 minutes.
                    </p>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      <Link href="/pricing"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-black"
                        style={{ background: 'linear-gradient(135deg,#f87171,#dc2626)', boxShadow: '0 0 20px rgba(248,113,113,0.25)' }}>
                        Upgrade to Pro →
                      </Link>
                      <a href="/pricing" className="text-sm text-white/40 hover:text-white transition-colors">
                        See all plans →
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-xs text-white/20 mt-4 text-center">
          Data sourced from URLhaus and Feodo Tracker (abuse.ch). Updated every 15 minutes. For defensive use only.
        </p>

        {/* Who This Is For */}
        <div className="mt-10 mb-8">
          <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Who This Is For</p>
          <ul className="space-y-2 text-sm text-white/55">
            <li>• Security engineers monitoring live OSINT threat intelligence feeds</li>
            <li>• DevOps teams tracking CVEs and threat actor activity relevant to their stack</li>
            <li>• SOC analysts supplementing commercial feeds with a curated open-source alternative</li>
            <li>• Founders staying informed on security incidents that could affect their vendors</li>
          </ul>
        </div>

        {/* How It Works */}
        <div className="mt-14 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-xl font-black text-white mb-1">How It Works</h2>
          <p className="text-white/35 text-sm mb-8">Live threat data from two authoritative open-source intelligence feeds — no API key required.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { n: '01', title: 'Two OSINT sources', body: 'URLhaus (malicious URLs) and Feodo Tracker (botnet C2 IPs) from abuse.ch are fetched and normalized on each request.' },
              { n: '02', title: 'Unified format', body: 'Each indicator is normalized to: indicator, indicatorType (IP/URL/domain), category, severity, source, malwareFamily, firstSeen.' },
              { n: '03', title: 'Filter & search', body: 'Filter by severity (critical, high, medium, low), search by indicator value, or export all active indicators as CSV.' },
            ].map(s => (
              <div key={s.n} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-xs font-black text-white/20 mb-2">{s.n}</div>
                <div className="text-sm font-black text-white mb-1">{s.title}</div>
                <div className="text-xs text-white/45 leading-relaxed">{s.body}</div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-4">Sample indicators (live data)</p>
            <div className="space-y-2">
              {[
                { indicator: '27.133.154.218', type: 'IP', category: 'BOTNET', severity: 'medium', family: 'QakBot', source: 'Feodo Tracker' },
                { indicator: 'http://malicious-site.ru/payload.exe', type: 'URL', category: 'MALWARE', severity: 'high', family: 'AgentTesla', source: 'URLhaus' },
                { indicator: '185.234.218.146', type: 'IP', category: 'BOTNET', severity: 'critical', family: 'Emotet', source: 'Feodo Tracker' },
              ].map((r, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
                    style={{ background: r.severity === 'critical' ? 'rgba(248,113,113,0.15)' : r.severity === 'high' ? 'rgba(251,146,60,0.15)' : 'rgba(250,204,21,0.12)', color: r.severity === 'critical' ? '#f87171' : r.severity === 'high' ? '#fb923c' : '#facc15' }}>
                    {r.severity}
                  </span>
                  <div className="min-w-0">
                    <code className="text-xs font-mono text-white/70 block truncate">{r.indicator}</code>
                    <span className="text-[10px] text-white/30">{r.type} · {r.category} · {r.family} · {r.source}</span>
                  </div>
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
