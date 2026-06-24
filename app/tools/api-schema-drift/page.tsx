'use client'

import { useState } from 'react'
import Link from 'next/link'
import BuyToolButton from '@/components/BuyToolButton'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const EXAMPLE_A = JSON.stringify({
  openapi: '3.0.0',
  info: { title: 'My API', version: '1.0.0' },
  paths: {
    '/users': {
      get: {
        parameters: [{ name: 'limit', in: 'query', required: false, schema: { type: 'integer' } }],
        responses: { '200': { content: { 'application/json': { schema: { properties: { id: {}, name: {}, email: {} } } } } } }
      }
    },
    '/users/{id}': {
      get: {
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { content: { 'application/json': { schema: { properties: { id: {}, name: {}, email: {}, role: {} } } } } } }
      },
      delete: { parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: {} }
    }
  }
}, null, 2)

const EXAMPLE_B = JSON.stringify({
  openapi: '3.0.0',
  info: { title: 'My API', version: '2.0.0' },
  paths: {
    '/users': {
      get: {
        parameters: [
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer' } },
          { name: 'org_id', in: 'query', required: true, schema: { type: 'string' } }
        ],
        responses: { '200': { content: { 'application/json': { schema: { properties: { id: {}, name: {}, email: {}, createdAt: {} } } } } } }
      }
    },
    '/users/{id}': {
      get: {
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { content: { 'application/json': { schema: { properties: { id: {}, name: {}, email: {} } } } } } }
      }
    },
    '/users/{id}/profile': {
      get: { parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: {} }
    }
  }
}, null, 2)

interface DriftItem {
  type: string
  path: string
  method?: string
  detail: string
  severity: 'critical' | 'high' | 'medium' | 'info'
  consumerImpact?: string
}

interface DriftResult {
  breaking: DriftItem[]
  additive: DriftItem[]
  unchanged: number
  summary: { breakingCount: number; additiveCount: number; unchangedCount: number }
  semver: { bump: string; reason: string }
  aiSmells: string[]
  migrationChecklist: string[]
  changelogText: string
}

const SEV_BADGE: Record<string, { label: string; bg: string; color: string; border: string }> = {
  critical: { label: 'CRITICAL', bg: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'rgba(239,68,68,0.35)' },
  high: { label: 'HIGH', bg: 'rgba(249,115,22,0.15)', color: '#f97316', border: 'rgba(249,115,22,0.35)' },
  medium: { label: 'MEDIUM', bg: 'rgba(234,179,8,0.15)', color: '#eab308', border: 'rgba(234,179,8,0.35)' },
  info: { label: 'ADDITIVE', bg: 'rgba(74,222,128,0.12)', color: '#4ade80', border: 'rgba(74,222,128,0.25)' },
}

const BUMP_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  major: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
  minor: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
  patch: { color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)' },
  none: { color: '#94a3b8', bg: 'rgba(148,163,184,0.05)', border: 'rgba(148,163,184,0.15)' },
}

export default function ApiSchemaDriftPage() {
  const [specA, setSpecA] = useState('')
  const [specB, setSpecB] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DriftResult | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)
  const [showChecklist, setShowChecklist] = useState(false)
  const [showChangelog, setShowChangelog] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const compare = async () => {
    if (!specA.trim() || !specB.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    setPaywall(false)
    try {
      const res = await fetch('/api/tools/api-schema-drift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specA, specB }),
      })
      const data = await res.json()
      if (data.paywall || res.status === 402) { setPaywall(true); return }
      if (!res.ok) throw new Error(data.error || 'Comparison failed')
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Comparison failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <Link href="/tools" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: 'rgb(99,102,241)', borderColor: 'rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.08)' }}>Live</span>
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#4ade80', borderColor: 'rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.08)' }}>Free · No Account Required</span>
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#60a5fa', borderColor: 'rgba(96,165,250,0.3)', background: 'rgba(96,165,250,0.08)' }}>Optic Replacement</span>
        </div>

        <h1 className="text-4xl font-black text-white mb-3">API Schema <span style={{ color: 'rgb(99,102,241)' }}>Drift Scanner</span></h1>
        <p className="text-white/55 text-base mb-4 max-w-2xl">Detect breaking changes between two OpenAPI specs instantly. Free comparison here — license this tool for your CI/CD pipeline from $49, or get all 51 tools from $149.</p>

        <div className="flex flex-wrap items-center gap-4 mb-8">
          <BuyToolButton toolId="api-schema-drift" price={49} className="text-sm font-bold hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-0 p-0" style={{ color: 'rgb(99,102,241)' }} />
          <Link href="/pricing" className="text-sm font-bold text-white/50 hover:text-white/70 transition-colors">All 51 tools — from $149 →</Link>
        </div>

        <div className="rounded-xl border px-4 py-3 mb-6 text-sm" style={{ background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.15)' }}>
          <span className="text-white/40">Optic shut down in January 2026. This tool fills the gap — free paste-and-compare, no account required.</span>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-2">
          {[{ label: 'Current Spec (A)', value: specA, set: setSpecA, example: EXAMPLE_A, side: 'A' }, { label: 'New Spec (B)', value: specB, set: setSpecB, example: EXAMPLE_B, side: 'B' }].map(({ label, value, set, example, side }) => (
            <div key={side} className="rounded-2xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white/50 uppercase tracking-wider">{label}</span>
                <button onClick={() => set(example)} className="text-xs text-white/30 hover:text-white/60 transition-colors">Load example →</button>
              </div>
              <textarea
                value={value}
                onChange={e => set(e.target.value)}
                placeholder='{"openapi":"3.0.0","paths":{...}}'
                rows={12}
                className="w-full text-xs text-white/70 placeholder-white/20 outline-none resize-none font-mono"
                style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '12px 14px' }}
              />
              <p className="text-[10px] text-white/25 mt-2">Paste as JSON (OpenAPI 3.x or Swagger 2.x)</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center mb-6 mt-4">
          <button
            onClick={compare}
            disabled={loading || !specA.trim() || !specB.trim()}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-black text-white transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 0 24px rgba(99,102,241,0.35)' }}
          >
            {loading ? 'Comparing…' : 'Compare Schemas'}
          </button>
        </div>

        {error && <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>}

        {paywall && !loading && (
          <div className="rounded-2xl border p-8 text-center mb-6" style={{ background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.2)' }}>
            <svg className="w-10 h-10 mx-auto mb-4" style={{ color: 'rgb(99,102,241)' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>
            <h3 className="text-xl font-black text-white mb-2">Unlimited comparisons with a license</h3>
            <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">Get this tool for your CI/CD pipeline — $49 one-time, or all 51 tools from $149.</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <BuyToolButton toolId="api-schema-drift" price={49} label="Get this tool — $49" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black cursor-pointer" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff' }} />
              <Link href="/pricing" className="text-sm text-white/45 hover:text-white transition-colors">All 51 tools — from $149 →</Link>
            </div>
          </div>
        )}

        {!result && !loading && (
          <div className="mt-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/25">Sample Report</span>
              <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
            <p className="text-xs text-white/30 text-center mb-6">This is what a real drift comparison looks like. Load the example above and click Compare to generate yours.</p>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Breaking Changes', count: 3, color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
                { label: 'Additive Changes', count: 2, color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)' },
                { label: 'Unchanged', count: 1, color: '#94a3b8', bg: 'rgba(148,163,184,0.05)', border: 'rgba(148,163,184,0.12)' },
              ].map(s => (
                <div key={s.label} className="rounded-xl border p-4 text-center" style={{ background: s.bg, borderColor: s.border }}>
                  <div className="text-3xl font-black" style={{ color: s.color }}>{s.count}</div>
                  <div className="text-xs font-bold mt-1" style={{ color: s.color }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mb-3">
              <div className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2">Breaking Changes</div>
              {[
                { method: 'GET', path: '/users', detail: 'New required query parameter org_id added — existing clients will get 400 Bad Request', severity: 'critical' },
                { method: 'GET', path: '/users/{id}', detail: 'Parameter id type changed string → integer — existing string IDs will fail validation', severity: 'high' },
                { method: 'DELETE', path: '/users/{id}', detail: 'Endpoint removed — clients calling this will get 404', severity: 'critical' },
              ].map((b, i) => {
                const sev = SEV_BADGE[b.severity] || SEV_BADGE.critical
                return (
                  <div key={i} className="rounded-xl border p-4 mb-2" style={{ background: '#0d1117', borderColor: 'rgba(248,113,113,0.2)' }}>
                    <div className="flex items-start gap-3">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded flex-shrink-0 mt-0.5" style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>{sev.label}</span>
                      <div>
                        <span className="text-xs font-mono font-bold text-white/50 mr-2">{b.method}</span>
                        <span className="text-xs font-mono text-white/70">{b.path}</span>
                        <p className="text-xs text-white/50 mt-1">{b.detail}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-green-400 mb-2">Additive Changes (safe)</div>
              {[
                { method: 'GET', path: '/users', detail: 'New response field createdAt added — backwards compatible' },
                { method: 'GET', path: '/users/{id}/profile', detail: 'New endpoint added — clients unaffected' },
              ].map((a, i) => (
                <div key={i} className="rounded-xl border p-4 mb-2" style={{ background: '#0d1117', borderColor: 'rgba(74,222,128,0.15)' }}>
                  <div className="flex items-start gap-3">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded flex-shrink-0 mt-0.5" style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' }}>ADDITIVE</span>
                    <div>
                      <span className="text-xs font-mono font-bold text-white/50 mr-2">{a.method}</span>
                      <span className="text-xs font-mono text-white/70">{a.path}</span>
                      <p className="text-xs text-white/50 mt-1">{a.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-white/20 text-center mt-3">← This is a sample. Your drift report will appear here.</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Verdict banner */}
            {(() => {
              const hasBreaking = result.breaking.length > 0
              const hasAdditive = result.additive.length > 0
              const banner = hasBreaking
                ? { icon: '🔴', text: 'Breaking Changes Detected — Major version bump required before deploying', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', color: '#ef4444' }
                : hasAdditive
                  ? { icon: '🟡', text: 'Non-Breaking Additions — Safe to deploy with minor version bump', bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.25)', color: '#eab308' }
                  : { icon: '🟢', text: 'No Breaking Changes — Safe to deploy', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.25)', color: '#4ade80' }
              return (
                <div className="rounded-xl border px-6 py-4 flex items-center gap-4" style={{ background: banner.bg, borderColor: banner.border }}>
                  <span className="text-2xl flex-shrink-0">{banner.icon}</span>
                  <span className="text-base font-black" style={{ color: banner.color }}>{banner.text}</span>
                </div>
              )
            })()}

            {/* SemVer recommendation */}
            {result.semver && result.semver.bump !== 'none' && (() => {
              const bc = BUMP_COLORS[result.semver.bump] || BUMP_COLORS.none
              return (
                <div className="rounded-xl border px-5 py-3 flex items-center gap-3" style={{ background: bc.bg, borderColor: bc.border }}>
                  <span className="text-xs font-bold text-white/40 uppercase tracking-wider flex-shrink-0">SemVer</span>
                  <span className="text-sm font-black uppercase" style={{ color: bc.color }}>{result.semver.bump} bump</span>
                  <span className="text-xs text-white/40">{result.semver.reason}</span>
                </div>
              )
            })()}

            {/* Summary counts */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Breaking Changes', count: result.summary.breakingCount, color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
                { label: 'Additive Changes', count: result.summary.additiveCount, color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)' },
                { label: 'Unchanged', count: result.summary.unchangedCount, color: '#94a3b8', bg: 'rgba(148,163,184,0.05)', border: 'rgba(148,163,184,0.12)' },
              ].map(s => (
                <div key={s.label} className="rounded-xl border p-4 text-center" style={{ background: s.bg, borderColor: s.border }}>
                  <div className="text-3xl font-black" style={{ color: s.color }}>{s.count}</div>
                  <div className="text-xs font-bold mt-1" style={{ color: s.color }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* AI Spec Smells */}
            {result.aiSmells && result.aiSmells.length > 0 && (
              <div className="rounded-xl border px-5 py-4" style={{ background: 'rgba(234,179,8,0.06)', borderColor: 'rgba(234,179,8,0.2)' }}>
                <div className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-2">AI-Generated Spec Patterns Detected</div>
                <ul className="space-y-1">
                  {result.aiSmells.map((smell, i) => (
                    <li key={i} className="text-xs text-white/50 flex items-start gap-2">
                      <span className="text-yellow-500 flex-shrink-0 mt-0.5">•</span>
                      {smell}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Breaking changes */}
            {result.breaking.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2">Breaking Changes</div>
                {result.breaking.map((b, i) => {
                  const sev = SEV_BADGE[b.severity] || SEV_BADGE.critical
                  return (
                    <div key={i} className="rounded-xl border p-4 mb-2" style={{ background: '#0d1117', borderColor: 'rgba(248,113,113,0.2)' }}>
                      <div className="flex items-start gap-3">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded flex-shrink-0 mt-0.5" style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>{sev.label}</span>
                        <div className="flex-1">
                          {b.method && <span className="text-xs font-mono font-bold text-white/50 mr-2">{b.method}</span>}
                          <span className="text-xs font-mono text-white/70">{b.path}</span>
                          <p className="text-xs text-white/50 mt-1">{b.detail}</p>
                          {b.consumerImpact && <p className="text-xs text-white/30 mt-1 italic">{b.consumerImpact}</p>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Additive changes */}
            {result.additive.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-green-400 mb-2">Additive Changes</div>
                {result.additive.map((a, i) => (
                  <div key={i} className="rounded-xl border p-4 mb-2" style={{ background: '#0d1117', borderColor: 'rgba(74,222,128,0.15)' }}>
                    <div className="flex items-start gap-3">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded flex-shrink-0 mt-0.5" style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' }}>ADDITIVE</span>
                      <div>
                        {a.method && <span className="text-xs font-mono font-bold text-white/50 mr-2">{a.method}</span>}
                        <span className="text-xs font-mono text-white/70">{a.path}</span>
                        <p className="text-xs text-white/50 mt-1">{a.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Migration checklist */}
            {result.migrationChecklist && result.migrationChecklist.length > 0 && (
              <div className="rounded-xl border" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
                <button
                  onClick={() => setShowChecklist(v => !v)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-black text-white">Migration Checklist</span>
                  <span className="text-white/40 text-xs">{showChecklist ? '▲ Hide' : '▼ Show'}</span>
                </button>
                {showChecklist && (
                  <div className="px-5 pb-4">
                    <div className="flex justify-end mb-2">
                      <button
                        onClick={() => copyText(result.migrationChecklist.join('\n'), 'checklist')}
                        className="text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1 rounded border"
                        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                      >
                        {copied === 'checklist' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <pre className="text-xs text-white/60 font-mono overflow-x-auto max-h-48 overflow-y-auto" style={{ background: '#070b14', borderRadius: 8, padding: '12px 14px' }}>
                      {result.migrationChecklist.join('\n')}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Changelog */}
            {result.changelogText && (
              <div className="rounded-xl border" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
                <button
                  onClick={() => setShowChangelog(v => !v)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-black text-white">Auto-Generated Changelog</span>
                  <span className="text-white/40 text-xs">{showChangelog ? '▲ Hide' : '▼ Show'}</span>
                </button>
                {showChangelog && (
                  <div className="px-5 pb-4">
                    <div className="flex justify-end mb-2">
                      <button
                        onClick={() => copyText(result.changelogText, 'changelog')}
                        className="text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1 rounded border"
                        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                      >
                        {copied === 'changelog' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <textarea
                      readOnly
                      value={result.changelogText}
                      rows={4}
                      className="w-full text-xs text-white/60 font-mono resize-none outline-none"
                      style={{ background: '#070b14', borderRadius: 8, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.07)' }}
                    />
                  </div>
                )}
              </div>
            )}

            {result.breaking.length === 0 && result.additive.length === 0 && (
              <div className="rounded-xl border p-8 text-center" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="text-lg font-black text-white mb-1">No changes detected</div>
                <div className="text-sm text-white/40">Both specs appear identical.</div>
              </div>
            )}
          </div>
        )}

        {/* Who This Is For */}
        <div className="mt-16 mb-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/25">Who This Is For</span>
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { title: 'Backend Teams', desc: 'Doing API versioning — catch breaking changes before they ship to consumers.' },
              { title: 'Platform Engineers', desc: 'Maintaining internal SDK clients — see exactly what changes will break auto-generated code.' },
              { title: 'API-First SaaS Companies', desc: 'Managing consumer contracts — get semver recommendations and migration checklists automatically.' },
              { title: 'DevOps Engineers', desc: 'Adding spec diff to CI/CD pipelines — license and embed into your pipeline for $49.' },
            ].map(item => (
              <div key={item.title} className="rounded-xl border px-5 py-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="text-sm font-black text-white mb-1">{item.title}</div>
                <div className="text-xs text-white/45">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
