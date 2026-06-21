'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const EXAMPLE_SQL = `-- Production migration: add org support
BEGIN;

ALTER TABLE users ADD COLUMN org_id UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'member';
CREATE INDEX CONCURRENTLY idx_users_org_id ON users(org_id);

ALTER TABLE projects ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE projects DROP COLUMN legacy_flag;

-- Rollback: ALTER TABLE users DROP COLUMN org_id, DROP COLUMN role;
-- Rollback: ALTER TABLE projects ADD COLUMN legacy_flag BOOLEAN;
COMMIT;`

const SEV_COLOR: Record<string, string> = {
  critical: '#f87171',
  high: '#fb923c',
  medium: '#facc15',
  low: '#94a3b8',
}

const RISK_CONFIG = {
  safe: { color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)', label: 'Safe to Run' },
  caution: { color: '#facc15', bg: 'rgba(250,204,21,0.08)', border: 'rgba(250,204,21,0.2)', label: 'Proceed with Caution' },
  dangerous: { color: '#fb923c', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.2)', label: 'Dangerous' },
  critical: { color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', label: 'Critical Risk' },
}

interface MigrationResult {
  findings: Array<{ id: string; severity: string; name: string; message: string; line: number }>
  positives: string[]
  riskLevel: 'safe' | 'caution' | 'dangerous' | 'critical'
  recommendation: string
  linesScanned: number
}

export default function DatabaseMigrationPage() {
  const [sql, setSql] = useState('')
  const [dialect, setDialect] = useState('postgresql')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MigrationResult | null>(null)
  const [error, setError] = useState('')
  const [checkCount, setCheckCount] = useState(0)

  const check = async () => {
    if (!sql.trim()) return
    if (checkCount >= 1) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/tools/database-migration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql, dialect }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Check failed')
      setResult(data)
      setCheckCount(c => c + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Check failed')
    }
    setLoading(false)
  }

  const risk = result ? RISK_CONFIG[result.riskLevel] : null

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/tools" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: 'rgb(16,185,129)', borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.08)' }}>Live</span>
          <span className="text-sm font-bold text-white/30">Pro Tool Â· Unlimited with $79/month</span>
        </div>

        <h1 className="text-4xl font-black text-white mb-3">Migration <span style={{ color: 'rgb(16,185,129)' }}>Safety Checker</span></h1>
        <p className="text-white/55 text-base mb-8 max-w-2xl">Paste your SQL migration. Get an instant safety report â€” risky patterns flagged, positive signals highlighted, and a clear risk level before you run anything in production.</p>

        <div className="rounded-2xl border p-6 mb-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <select
              value={dialect}
              onChange={e => setDialect(e.target.value)}
              className="text-sm text-white rounded-lg px-3 py-2 outline-none"
              style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <option value="postgresql">PostgreSQL</option>
              <option value="mysql">MySQL</option>
              <option value="sqlite">SQLite</option>
            </select>
            <button onClick={() => setSql(EXAMPLE_SQL)} className="text-xs text-white/30 hover:text-white/60 transition-colors">Load example â†’</button>
          </div>

          <textarea
            value={sql}
            onChange={e => setSql(e.target.value)}
            placeholder="-- Paste your SQL migration here..."
            rows={14}
            className="w-full text-sm text-white/80 placeholder-white/20 outline-none resize-y font-mono"
            style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '14px 16px', minHeight: 280 }}
          />

          <div className="flex items-center justify-between mt-4 gap-4 flex-wrap">
            <span className="text-xs text-white/30">{sql.split('\n').length} lines</span>
            <button
              onClick={check}
              disabled={loading || !sql.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-white transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}
            >
              {loading ? 'Checkingâ€¦' : 'Check Migration Safety'}
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>}

        {checkCount >= 1 && (
          <div className="rounded-2xl border p-8 text-center mb-6" style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)' }}>
            <svg className="w-10 h-10 mx-auto mb-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>
            <h3 className="text-xl font-black text-white mb-2">Unlimited checks with Pro</h3>
            <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">Pro subscribers get unlimited migration checks, all tools, and monthly AI visibility monitoring â€” $79/month.</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Start Pro â€” $79/month</Link>
              <Link href="/pricing" className="text-sm text-white/45 hover:text-white transition-colors">See all features â†’</Link>
            </div>
          </div>
        )}

        {/* Sample Output â€” always visible so people know what they get */}
        {!result && !loading && checkCount === 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/25">Sample Report</span>
              <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
            <p className="text-xs text-white/30 text-center mb-6">This is what a real migration check looks like. Load the example above and click Check to generate yours.</p>

            {/* Sample risk level */}
            <div className="rounded-2xl border p-6 mb-4" style={{ background: 'rgba(250,204,21,0.08)', borderColor: 'rgba(250,204,21,0.2)' }}>
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest mb-1 text-yellow-400">Risk Level</div>
                  <div className="text-3xl font-black text-yellow-400">Proceed with Caution</div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white/60">Migration contains a NOT NULL column addition without a default value, which will lock the table on large datasets. Consider a multi-step migration.</p>
                  <p className="text-xs text-white/35 mt-1">21 lines scanned</p>
                </div>
              </div>
            </div>

            {/* Sample positives */}
            <div className="rounded-xl border p-4 mb-4" style={{ background: 'rgba(74,222,128,0.05)', borderColor: 'rgba(74,222,128,0.15)' }}>
              <div className="text-xs font-bold uppercase tracking-widest text-green-400 mb-3">Safety Signals Found</div>
              {['Migration is wrapped in BEGIN/COMMIT transaction', 'CONCURRENT index creation avoids table lock', 'Rollback statements provided'].map((p, i) => (
                <div key={i} className="flex items-start gap-2 mb-1.5">
                  <svg className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  <span className="text-xs text-white/60">{p}</span>
                </div>
              ))}
            </div>

            {/* Sample findings */}
            <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Findings (2)</div>
            {[
              { sev: 'high', name: 'NOT NULL Without Default on Existing Rows', line: 4, msg: 'Adding a NOT NULL column without DEFAULT will fail on PostgreSQL if the table has existing rows. Provide a DEFAULT or do a 3-phase migration.' },
              { sev: 'medium', name: 'Column Dropped Without Data Backup Check', line: 9, msg: 'Dropping legacy_flag with no preceding backup or archive step. If this data has business value, export it first.' },
            ].map((f, i) => (
              <div key={i} className="rounded-xl border p-4 mb-2" style={{ background: '#0d1117', borderColor: `${SEV_COLOR[f.sev]}22` }}>
                <div className="flex items-start gap-3">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded flex-shrink-0 mt-0.5" style={{ background: `${SEV_COLOR[f.sev]}18`, color: SEV_COLOR[f.sev], border: `1px solid ${SEV_COLOR[f.sev]}44` }}>{f.sev}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-white">{f.name}</span>
                      <span className="text-xs text-white/30">Line {f.line}</span>
                    </div>
                    <p className="text-xs text-white/55">{f.msg}</p>
                  </div>
                </div>
              </div>
            ))}
            <p className="text-[10px] text-white/20 text-center mt-3">â† This is a sample. Your migration report will appear here.</p>
          </div>
        )}

        {result && risk && (
          <div className="space-y-4">
            {/* Risk level */}
            <div className="rounded-2xl border p-6" style={{ background: risk.bg, borderColor: risk.border }}>
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: risk.color }}>Risk Level</div>
                  <div className="text-3xl font-black" style={{ color: risk.color }}>{risk.label}</div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white/60">{result.recommendation}</p>
                  <p className="text-xs text-white/35 mt-1">{result.linesScanned} lines scanned</p>
                </div>
              </div>
            </div>

            {/* Positives */}
            {result.positives.length > 0 && (
              <div className="rounded-xl border p-4" style={{ background: 'rgba(74,222,128,0.05)', borderColor: 'rgba(74,222,128,0.15)' }}>
                <div className="text-xs font-bold uppercase tracking-widest text-green-400 mb-3">Safety Signals Found</div>
                {result.positives.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 mb-1.5">
                    <svg className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    <span className="text-xs text-white/60">{p}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Findings */}
            {result.findings.length > 0 ? (
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Findings ({result.findings.length})</div>
                {result.findings.map((f, i) => (
                  <div key={i} className="rounded-xl border p-4 mb-2" style={{ background: '#0d1117', borderColor: `${SEV_COLOR[f.severity]}22` }}>
                    <div className="flex items-start gap-3">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded flex-shrink-0 mt-0.5" style={{ background: `${SEV_COLOR[f.severity]}18`, color: SEV_COLOR[f.severity], border: `1px solid ${SEV_COLOR[f.severity]}44` }}>{f.severity}</span>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold text-white">{f.name}</span>
                          <span className="text-xs text-white/30">Line {f.line}</span>
                        </div>
                        <p className="text-xs text-white/55">{f.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border p-6 text-center" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="text-sm text-white/50">No risky patterns detected. Review positives above and test on staging before production.</div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
