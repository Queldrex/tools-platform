'use client'

import { useState } from 'react'
import Link from 'next/link'
import BuyToolButton from '@/components/BuyToolButton'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const EXAMPLE_SQL = `-- Production migration: add org support
BEGIN;

SET lock_timeout = '5s';

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

interface Finding {
  id: string
  severity: string
  name: string
  message: string
  line: number
  lockType?: string
  lockDurationHint?: string
  rollbackSql?: string
  expandContract?: string[]
  dialectNote?: string
}

interface MigrationResult {
  findings: Finding[]
  positives: string[]
  riskLevel: 'safe' | 'caution' | 'dangerous' | 'critical'
  recommendation: string
  linesScanned: number
  aiSmells: string[]
  zeroDowntimeVerdict: 'safe' | 'maintenance-window' | 'caution'
}

const DOWNTIME_CONFIG = {
  safe: { color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)', icon: '✓', label: 'Zero-Downtime Safe', desc: 'This migration can run without a maintenance window.' },
  caution: { color: '#facc15', bg: 'rgba(250,204,21,0.08)', border: 'rgba(250,204,21,0.2)', icon: '⚠', label: 'Caution', desc: 'Some operations may briefly impact performance. Test on staging first.' },
  'maintenance-window': { color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', icon: '✕', label: 'Maintenance Window Required', desc: 'This migration will cause downtime. Schedule a maintenance window.' },
}

function FindingCard({ f }: { f: Finding }) {
  const [showRollback, setShowRollback] = useState(false)
  const [showExpand, setShowExpand] = useState(false)

  return (
    <div className="rounded-xl border p-4 mb-2" style={{ background: '#0d1117', borderColor: `${SEV_COLOR[f.severity] ?? '#94a3b8'}22` }}>
      <div className="flex items-start gap-3">
        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded flex-shrink-0 mt-0.5" style={{ background: `${SEV_COLOR[f.severity] ?? '#94a3b8'}18`, color: SEV_COLOR[f.severity] ?? '#94a3b8', border: `1px solid ${SEV_COLOR[f.severity] ?? '#94a3b8'}44` }}>{f.severity}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-0.5">
            <span className="text-sm font-bold text-white">{f.name}</span>
            <span className="text-xs text-white/30">Line {f.line}</span>
            {f.lockType && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>{f.lockType}</span>
            )}
          </div>
          <p className="text-xs text-white/55 mb-1">{f.message}</p>
          {f.lockDurationHint && (
            <p className="text-xs italic mb-1" style={{ color: '#f59e0b' }}>Lock estimate: {f.lockDurationHint}</p>
          )}
          {f.dialectNote && (
            <p className="text-xs italic mb-1" style={{ color: '#60a5fa' }}>{f.dialectNote}</p>
          )}
          {f.rollbackSql && (
            <div className="mt-2">
              <button onClick={() => setShowRollback(v => !v)} className="text-xs font-semibold flex items-center gap-1" style={{ color: '#4ade80' }}>
                <span>{showRollback ? '▾' : '▸'}</span> Rollback SQL
              </button>
              {showRollback && (
                <pre className="mt-2 text-xs rounded-lg p-3 overflow-x-auto" style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', color: '#86efac' }}>{f.rollbackSql}</pre>
              )}
            </div>
          )}
          {f.expandContract && f.expandContract.length > 0 && (
            <div className="mt-2">
              <button onClick={() => setShowExpand(v => !v)} className="text-xs font-semibold flex items-center gap-1" style={{ color: '#818cf8' }}>
                <span>{showExpand ? '▾' : '▸'}</span> Safe alternative (Expand-Contract)
              </button>
              {showExpand && (
                <ol className="mt-2 space-y-1">
                  {f.expandContract.map((step, i) => (
                    <li key={i} className="text-xs flex gap-2" style={{ color: '#a5b4fc' }}>
                      <span className="font-bold flex-shrink-0" style={{ color: '#818cf8' }}>{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DatabaseMigrationPage() {
  const [sql, setSql] = useState('')
  const [dialect, setDialect] = useState('postgresql')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MigrationResult | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)

  const check = async () => {
    if (!sql.trim()) return
    if (paywall) return
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
      if (res.status === 402) { setPaywall(true); setLoading(false); return }
      if (!res.ok) throw new Error(data.error || 'Check failed')
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Check failed')
    }
    setLoading(false)
  }

  const risk = result ? RISK_CONFIG[result.riskLevel] : null
  const dtConfig = result ? DOWNTIME_CONFIG[result.zeroDowntimeVerdict] : null

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/tools" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: 'rgb(16,185,129)', borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.08)' }}>Free · No Login Required</span>
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: 'rgb(96,165,250)', borderColor: 'rgba(96,165,250,0.3)', background: 'rgba(96,165,250,0.08)' }}>Multi-DB</span>
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: 'rgb(148,163,184)', borderColor: 'rgba(148,163,184,0.3)', background: 'rgba(148,163,184,0.08)' }}>Squawk Alternative</span>
        </div>

        <h1 className="text-4xl font-black text-white mb-3">Migration <span style={{ color: 'rgb(16,185,129)' }}>Safety Checker</span></h1>
        <p className="text-white/55 text-base mb-4 max-w-2xl">Paste any SQL migration and get an instant risk analysis: lock types, downtime estimates, rollback SQL, and zero-downtime alternatives. Free scan here — license from $49, or all 51 tools from $149.</p>

        <div className="flex flex-wrap gap-3 mb-8">
          <BuyToolButton toolId="database-migration" price={49} className="inline-flex items-center gap-1.5 text-sm font-black px-4 py-2 rounded-xl transition-all hover:scale-[1.02] cursor-pointer" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff' }} />
          <Link href="/pricing" className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl border transition-all hover:border-white/20" style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
            All 51 tools — from $149 →
          </Link>
        </div>

        <div className="rounded-xl border px-4 py-3 mb-6 text-xs" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}>
          More thorough than Squawk — multi-DB support, lock duration estimates, rollback SQL, and expand-contract guidance included.
        </div>

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
            <button onClick={() => setSql(EXAMPLE_SQL)} className="text-xs text-white/30 hover:text-white/60 transition-colors">Load example →</button>
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
              {loading ? 'Checking…' : 'Check Migration Safety'}
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>}

        {paywall && (
          <div className="rounded-2xl border p-8 text-center mb-6" style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)' }}>
            <svg className="w-10 h-10 mx-auto mb-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>
            <h3 className="text-xl font-black text-white mb-2">Unlimited checks with Pro</h3>
            <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">License this tool for your CI/CD pipeline for $49 one-time, or get all 51 tools from $149.</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <BuyToolButton toolId="database-migration" price={49} label="Get this tool — $49" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-white cursor-pointer" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }} />
              <Link href="/pricing" className="text-sm text-white/45 hover:text-white transition-colors">All 51 tools from $149 →</Link>
            </div>
          </div>
        )}

        {!result && !loading && !paywall && (
          <div className="mt-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/25">Sample Report</span>
              <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
            <p className="text-xs text-white/30 text-center mb-6">This is what a real migration check looks like. Load the example above and click Check to generate yours.</p>

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

            <div className="rounded-xl border p-4 mb-4" style={{ background: 'rgba(74,222,128,0.05)', borderColor: 'rgba(74,222,128,0.15)' }}>
              <div className="text-xs font-bold uppercase tracking-widest text-green-400 mb-3">Safety Signals Found</div>
              {['Migration is wrapped in BEGIN/COMMIT transaction', 'CONCURRENT index creation avoids table lock', 'Rollback statements provided'].map((p, i) => (
                <div key={i} className="flex items-start gap-2 mb-1.5">
                  <svg className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  <span className="text-xs text-white/60">{p}</span>
                </div>
              ))}
            </div>

            <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Findings (2)</div>
            {[
              { sev: 'high', name: 'NOT NULL Without Default on Existing Rows', line: 4, msg: 'Adding a NOT NULL column without DEFAULT will fail on PostgreSQL if the table has existing rows. Provide a DEFAULT or do a 3-phase migration.', lockType: 'ACCESS EXCLUSIVE', lockDurationHint: 'full table scan — ~100K rows/sec' },
              { sev: 'medium', name: 'Column Dropped Without Data Backup Check', line: 9, msg: 'Dropping legacy_flag with no preceding backup or archive step. If this data has business value, export it first.', lockType: 'ACCESS EXCLUSIVE', lockDurationHint: 'instant' },
            ].map((f, i) => (
              <div key={i} className="rounded-xl border p-4 mb-2" style={{ background: '#0d1117', borderColor: `${SEV_COLOR[f.sev]}22` }}>
                <div className="flex items-start gap-3">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded flex-shrink-0 mt-0.5" style={{ background: `${SEV_COLOR[f.sev]}18`, color: SEV_COLOR[f.sev], border: `1px solid ${SEV_COLOR[f.sev]}44` }}>{f.sev}</span>
                  <div>
                    <div className="flex items-center flex-wrap gap-2 mb-0.5">
                      <span className="text-sm font-bold text-white">{f.name}</span>
                      <span className="text-xs text-white/30">Line {f.line}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>{f.lockType}</span>
                    </div>
                    <p className="text-xs text-white/55">{f.msg}</p>
                    <p className="text-xs italic mt-1" style={{ color: '#f59e0b' }}>Lock estimate: {f.lockDurationHint}</p>
                  </div>
                </div>
              </div>
            ))}
            <p className="text-[10px] text-white/20 text-center mt-3">← This is a sample. Your migration report will appear here.</p>
          </div>
        )}

        {result && risk && dtConfig && (
          <div className="space-y-4">
            <div className="rounded-2xl border p-5 flex items-center gap-4" style={{ background: dtConfig.bg, borderColor: dtConfig.border }}>
              <span className="text-2xl font-black flex-shrink-0" style={{ color: dtConfig.color }}>{dtConfig.icon}</span>
              <div>
                <div className="text-sm font-black" style={{ color: dtConfig.color }}>{dtConfig.label}</div>
                <div className="text-xs text-white/50 mt-0.5">{dtConfig.desc}</div>
              </div>
            </div>

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

            {result.aiSmells.length > 0 && (
              <div className="rounded-xl border p-4" style={{ background: 'rgba(250,204,21,0.05)', borderColor: 'rgba(250,204,21,0.2)' }}>
                <div className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-3">AI-Generated Migration Patterns Detected</div>
                {result.aiSmells.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 mb-1.5">
                    <span className="text-yellow-400 flex-shrink-0 mt-0.5">⚡</span>
                    <span className="text-xs text-white/60">{s}</span>
                  </div>
                ))}
              </div>
            )}

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

            {result.findings.length > 0 ? (
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Findings ({result.findings.length})</div>
                {result.findings.map((f, i) => <FindingCard key={i} f={f} />)}
              </div>
            ) : (
              <div className="rounded-xl border p-6 text-center" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="text-sm text-white/50">No risky patterns detected. Review positives above and test on staging before production.</div>
              </div>
            )}
          </div>
        )}

        <div className="mt-16 mb-10">
          <h2 className="text-2xl font-black text-white mb-6">Who This Is For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Backend Engineers', desc: 'Running Postgres or MySQL migrations on tables with millions of rows.' },
              { title: 'Platform Teams', desc: 'Enforcing zero-downtime deploy policies across engineering organizations.' },
              { title: 'DevOps Engineers', desc: 'Reviewing migrations in CI pipelines before they reach production.' },
              { title: 'SaaS Teams', desc: 'Scaling from thousands to millions of rows and needing safe migration patterns.' },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-sm font-black text-white mb-1">{item.title}</div>
                <div className="text-xs text-white/50">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ─────────────────────────────────────────── */}
        <div className="mt-10 mb-6 space-y-3">
          <h2 className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>Common questions</h2>
          {[
            { q: "What databases does this support?", a: "PostgreSQL and MySQL — the two most common relational databases in production SaaS. The analyzer understands syntax differences between them for operations like column type changes, index creation, and foreign key constraints." },
            { q: "What risks does it check for?", a: "Table locks on large tables, full-table rewrites on columns with active reads, missing indexes after foreign key additions, irreversible destructive operations (DROP COLUMN, TRUNCATE), and missing rollback procedures. Each risk is explained with a concrete fix." },
            { q: "Does Queldrex store my database schema?", a: "No. Your migration SQL is processed for risk analysis and is not stored or retained after the response is generated. Do not include real table data or production connection strings in the migration text." },
            { q: "What's the most common migration mistake?", a: "Adding a NOT NULL column without a default to a large table. This locks the entire table while backfilling existing rows — which can take minutes or hours on tables with millions of rows, causing downtime. The safe path is: add nullable, backfill in batches, then add the NOT NULL constraint." },
          ].map(({ q, a }) => (
            <details key={q} className="rounded-xl border group" style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#0d1117' }}>
              <summary className="px-4 py-3.5 text-sm font-bold cursor-pointer list-none flex items-center justify-between" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {q}
                <svg className="w-4 h-4 flex-shrink-0 transition-transform group-open:rotate-180" style={{ color: 'rgba(255,255,255,0.3)' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </summary>
              <div className="px-4 pb-4 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{a}</div>
            </details>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
