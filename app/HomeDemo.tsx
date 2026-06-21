'use client'

import { useState, useEffect } from 'react'

interface DnsRecord {
  found: boolean
  data: string[] | { priority: number; exchange: string }[] | Record<string, unknown> | null
  ttl?: number
  propagated?: boolean
}

interface DnsResult {
  domain: string
  records: Record<string, DnsRecord>
  propagationStatus: string
  error?: string
  paywall?: boolean
}

function recordSummary(type: string, rec: DnsRecord): string {
  if (!rec.found || !rec.data) return 'Not set'
  if (type === 'MX' && Array.isArray(rec.data)) {
    const first = rec.data[0] as { priority: number; exchange: string }
    return first ? first.exchange.slice(0, 28) : 'Not set'
  }
  if (type === 'SOA' && rec.data && typeof rec.data === 'object' && !Array.isArray(rec.data)) {
    const soa = rec.data as Record<string, unknown>
    return String(soa.mname || '').slice(0, 28)
  }
  if (Array.isArray(rec.data) && rec.data.length > 0) {
    return String(rec.data[0]).slice(0, 28)
  }
  return 'Found'
}

const SHOW_TYPES = ['A', 'MX', 'NS', 'DMARC'] as const

export default function HomeDemo() {
  const [result, setResult] = useState<DnsResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tools/dns-health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: 'queldrex.com' }),
    })
      .then(r => r.json())
      .then((data: DnsResult) => { setResult(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-8 justify-center">
        <div className="w-4 h-4 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        <span className="text-sm" style={{ color: '#A1A1AA' }}>Running live DNS check on queldrex.com…</span>
      </div>
    )
  }

  if (!result || result.error || result.paywall || !result.records) return null

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: '#111318', borderColor: 'rgba(255,255,255,0.07)' }}>
      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0d1117' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#A1A1AA' }}>
            Live · DNS Health · queldrex.com
          </span>
        </div>
        <a href="/tools/dns-health" className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors">
          Try your domain →
        </a>
      </div>
      <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        {SHOW_TYPES.map(type => {
          const rec = result.records[type]
          if (!rec) return null
          return (
            <div key={type} className="rounded-xl p-4" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-black uppercase tracking-widest" style={{ color: '#7C3AED' }}>{type}</div>
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: rec.found ? '#4ade80' : '#f87171' }}
                  title={rec.found ? 'Found' : 'Not set'}
                />
              </div>
              <div className="text-xs font-mono leading-relaxed" style={{ color: '#A1A1AA' }}>
                {recordSummary(type, rec)}
              </div>
              {rec.ttl ? (
                <div className="text-[10px] mt-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>TTL {rec.ttl}s</div>
              ) : null}
            </div>
          )
        })}
      </div>
      <div className="px-5 pb-4 text-center">
        <a href="/tools/dns-health" className="text-xs font-bold transition-colors" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Check propagation, SPF, DKIM, CAA, and more →
        </a>
      </div>
    </div>
  )
}
