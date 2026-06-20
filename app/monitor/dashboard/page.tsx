'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Suspense } from 'react'

interface ScorePoint { score: number; scannedAt: string }

interface Monitor {
  id: string
  domain: string
  status: 'active' | 'cancelled' | 'past_due'
  lastScore?: number
  lastScanAt?: string
  scoreHistory?: ScorePoint[]
}

function scoreColor(score: number) {
  if (score >= 70) return '#22c55e'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

function ScoreBar({ history }: { history: ScorePoint[] }) {
  const last6 = history.slice(-6)
  if (last6.length === 0) return <p className="text-xs text-white/30">No history yet</p>
  const max = Math.max(...last6.map(p => p.score), 1)
  return (
    <div className="flex items-end gap-1 h-10">
      {last6.map((p, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
          <div
            className="w-full rounded-sm min-h-[2px]"
            style={{ height: `${(p.score / max) * 36}px`, background: scoreColor(p.score) }}
          />
        </div>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: Monitor['status'] }) {
  const map = {
    active: { label: 'Active', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    cancelled: { label: 'Cancelled', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
    past_due: { label: 'Past Due', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  }
  const s = map[status] || map.active
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{ color: s.color, background: s.bg }}>
      {s.label}
    </span>
  )
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [state, setState] = useState<'verifying' | 'loading' | 'ready' | 'error'>('verifying')
  const [email, setEmail] = useState<string | null>(null)
  const [monitors, setMonitors] = useState<Monitor[]>([])
  const [errorMsg, setErrorMsg] = useState('')
  const [scanQueued, setScanQueued] = useState<string | null>(null)

  const loadMonitors = useCallback(async (userEmail: string) => {
    setState('loading')
    try {
      const res = await fetch(`/api/monitor/dashboard?email=${encodeURIComponent(userEmail)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setMonitors(data.monitors || [])
      setState('ready')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load monitors')
      setState('error')
    }
  }, [])

  useEffect(() => {
    async function verify() {
      if (!token) {
        const stored = sessionStorage.getItem('monitor_email')
        if (stored) { setEmail(stored); loadMonitors(stored); return }
        setErrorMsg('No login token found. Please request a login link.')
        setState('error')
        return
      }
      try {
        const res = await fetch(`/api/monitor/verify?token=${encodeURIComponent(token)}`)
        const data = await res.json()
        if (!res.ok) {
          setErrorMsg('This login link has expired or already been used. Please request a new one.')
          setState('error')
          return
        }
        const userEmail = data.email as string
        sessionStorage.setItem('monitor_email', userEmail)
        setEmail(userEmail)
        await loadMonitors(userEmail)
      } catch {
        setErrorMsg('Verification failed. Please try again.')
        setState('error')
      }
    }
    verify()
  }, [token, loadMonitors])

  if (state === 'verifying' || state === 'loading') {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-white/40">{state === 'verifying' ? 'Verifying login…' : 'Loading your monitors…'}</p>
        </div>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <p className="text-white/60 mb-6">{errorMsg}</p>
        <Link href="/monitor"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-black"
          style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
          Get a New Login Link →
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-1">Monitoring Dashboard</h1>
        <p className="text-sm text-white/40">{email}</p>
      </div>

      {monitors.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ border: '1px dashed rgba(255,255,255,0.1)' }}>
          <p className="text-white/40 mb-4">No active monitors found for this email.</p>
          <Link href="/monitor"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-black"
            style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
            Start Monitoring →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {monitors.map(m => (
            <div key={m.id} className="rounded-2xl p-6" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-base font-bold text-white">{m.domain}</h2>
                    <StatusBadge status={m.status} />
                  </div>
                  {m.lastScanAt && (
                    <p className="text-xs text-white/30">
                      Last scan: {new Date(m.lastScanAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
                {m.lastScore !== undefined && (
                  <div className="text-right flex-shrink-0">
                    <div className="text-3xl font-black" style={{ color: scoreColor(m.lastScore) }}>{m.lastScore}</div>
                    <div className="text-xs text-white/30">/ 100</div>
                  </div>
                )}
              </div>

              {m.scoreHistory && m.scoreHistory.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2">Score trend (last 6 scans)</p>
                  <ScoreBar history={m.scoreHistory} />
                </div>
              )}

              {m.status === 'active' && (
                <button
                  onClick={() => setScanQueued(m.id)}
                  disabled={scanQueued === m.id}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  style={{ background: 'rgba(6,214,255,0.08)', color: '#06d6ff', border: '1px solid rgba(6,214,255,0.2)' }}
                >
                  {scanQueued === m.id ? 'Scan queued ✓' : 'Request Manual Scan'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/monitor" className="text-xs text-white/30 hover:text-white/60 transition-colors">
          ← Back to Monitor page
        </Link>
      </div>
    </div>
  )
}

export default function MonitorDashboardPage() {
  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <Suspense fallback={
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <DashboardContent />
      </Suspense>
      <Footer />
    </div>
  )
}
