'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface AgencyClient {
  id: string
  domain: string
  contactEmail?: string
  label?: string
  addedAt: string
  lastScanAt?: string
  lastScore?: number
  scoreHistory?: Array<{ date: string; score: number }>
}

interface AgencyInfo {
  agencyId: string
  email: string
  agencyName: string
  status: string
  scansUsedThisMonth: number
  scansLimit: number
}

function grade(score: number) {
  if (score >= 80) return 'A'
  if (score >= 65) return 'B'
  if (score >= 50) return 'C'
  if (score >= 35) return 'D'
  return 'F'
}

function scoreColor(score: number) {
  if (score >= 65) return '#22c55e'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

function Trend({ history }: { history?: Array<{ date: string; score: number }> }) {
  if (!history || history.length < 2) return <span className="text-white/20 text-xs">—</span>
  const last = history[history.length - 1].score
  const prev = history[history.length - 2].score
  const diff = last - prev
  if (diff > 0) return <span className="text-green-400 text-xs font-bold">↑ {diff}</span>
  if (diff < 0) return <span className="text-red-400 text-xs font-bold">↓ {Math.abs(diff)}</span>
  return <span className="text-white/30 text-xs">→</span>
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [state, setState] = useState<'verifying' | 'loading' | 'ready' | 'error' | 'login'>('verifying')
  const [agency, setAgency] = useState<AgencyInfo | null>(null)
  const [clients, setClients] = useState<AgencyClient[]>([])
  const [errorMsg, setErrorMsg] = useState('')
  const [scanningId, setScanningId] = useState<string | null>(null)

  const [newDomain, setNewDomain] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginSent, setLoginSent] = useState(false)
  const [loginError, setLoginError] = useState('')

  const loadClients = useCallback(async (agencyId: string) => {
    const res = await fetch(`/api/agency/clients?agencyId=${encodeURIComponent(agencyId)}`)
    const data = await res.json()
    if (res.ok) setClients(data.clients || [])
  }, [])

  useEffect(() => {
    async function verify() {
      if (!token) {
        const stored = sessionStorage.getItem('agency_id')
        const storedInfo = sessionStorage.getItem('agency_info')
        if (stored && storedInfo) {
          setAgency(JSON.parse(storedInfo))
          await loadClients(stored)
          setState('ready')
          return
        }
        setState('login')
        return
      }
      try {
        const res = await fetch(`/api/agency/verify?token=${encodeURIComponent(token)}`)
        const data = await res.json()
        if (!res.ok) {
          setErrorMsg('This login link has expired or already been used.')
          setState('error')
          return
        }
        sessionStorage.setItem('agency_id', data.agencyId)
        sessionStorage.setItem('agency_info', JSON.stringify(data))
        setAgency(data)
        setState('loading')
        await loadClients(data.agencyId)
        setState('ready')
      } catch {
        setErrorMsg('Verification failed. Please try again.')
        setState('error')
      }
    }
    verify()
  }, [token, loadClients])

  async function handleAddClient(e: React.FormEvent) {
    e.preventDefault()
    if (!agency) return
    setAddError('')
    setAddLoading(true)
    try {
      const res = await fetch('/api/agency/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyId: agency.agencyId,
          domain: newDomain,
          label: newLabel || undefined,
          contactEmail: newEmail || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setAddError(data.error || 'Failed to add client'); return }
      setClients(data.clients || [])
      setNewDomain('')
      setNewLabel('')
      setNewEmail('')
    } catch {
      setAddError('Network error. Please try again.')
    } finally {
      setAddLoading(false)
    }
  }

  async function handleRemoveClient(clientId: string) {
    if (!agency) return
    const res = await fetch(`/api/agency/clients?agencyId=${encodeURIComponent(agency.agencyId)}&clientId=${encodeURIComponent(clientId)}`, {
      method: 'DELETE',
    })
    const data = await res.json()
    if (res.ok) setClients(data.clients || [])
  }

  async function handleScan(client: AgencyClient) {
    if (!agency) return
    setScanningId(client.id)
    try {
      await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: client.domain, email: agency.email }),
      })
      await loadClients(agency.agencyId)
    } finally {
      setScanningId(null)
    }
  }

  async function handleLoginLink(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const res = await fetch('/api/agency/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail }),
      })
      const data = await res.json()
      if (!res.ok) { setLoginError(data.error || 'Could not send link.'); return }
      setLoginSent(true)
    } catch {
      setLoginError('Network error.')
    } finally {
      setLoginLoading(false)
    }
  }

  if (state === 'verifying' || state === 'loading') {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-white/40">{state === 'verifying' ? 'Verifying login…' : 'Loading your clients…'}</p>
        </div>
      </div>
    )
  }

  if (state === 'login') {
    return (
      <div className="max-w-md mx-auto px-6 py-24">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white mb-2">Agency Dashboard</h1>
          <p className="text-sm text-white/45">Enter your email to get a login link</p>
        </div>
        {loginSent ? (
          <div className="text-center rounded-2xl p-8" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="text-2xl mb-3">📬</div>
            <div className="text-cyan-400 font-bold mb-1">Check your inbox</div>
            <p className="text-sm text-white/40">We sent a login link to <strong className="text-white/70">{loginEmail}</strong>. It expires in 15 minutes.</p>
          </div>
        ) : (
          <div className="rounded-2xl p-8" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)' }}>
            <form onSubmit={handleLoginLink} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Agency email address</label>
                <input
                  type="email"
                  required
                  placeholder="you@agency.com"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-cyan-400/50"
                  style={{ background: '#070b14', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              {loginError && <p className="text-xs text-red-400">{loginError}</p>}
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 rounded-xl text-sm font-black text-black disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}
              >
                {loginLoading ? 'Sending…' : 'Send Login Link →'}
              </button>
            </form>
            <p className="text-center text-xs text-white/30 mt-4">
              Not a subscriber yet?{' '}
              <Link href="/agency" className="text-cyan-400 hover:text-cyan-300 transition-colors">Sign up here →</Link>
            </p>
          </div>
        )}
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <p className="text-white/60 mb-6">{errorMsg}</p>
        <Link href="/agency"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-black"
          style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
          Get a New Login Link →
        </Link>
      </div>
    )
  }

  const usedPercent = agency ? Math.round((agency.scansUsedThisMonth / agency.scansLimit) * 100) : 0

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">{agency?.agencyName}</h1>
          <p className="text-sm text-white/40">{agency?.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(6,214,255,0.1)', color: '#06d6ff' }}>
            Agency Plan
          </span>
          <div className="text-right">
            <div className="text-xs text-white/40 mb-1">{agency?.scansUsedThisMonth} of {agency?.scansLimit} scans used</div>
            <div className="w-32 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${usedPercent}%`, background: usedPercent > 80 ? '#ef4444' : '#06d6ff' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Clients table */}
      <div className="rounded-2xl overflow-hidden mb-8" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-6 py-4 border-b border-white/6">
          <h2 className="text-sm font-bold text-white">Clients ({clients.length})</h2>
        </div>

        {clients.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-white/35 text-sm mb-2">No clients added yet.</p>
            <p className="text-white/20 text-xs">Add your first client below to start scanning.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/6">
                  {['Client', 'Score', 'Grade', 'Trend', 'Last Scanned', 'Actions'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-bold text-white/30 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr key={client.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{client.label || client.domain}</div>
                      {client.label && <div className="text-xs text-white/35 mt-0.5">{client.domain}</div>}
                    </td>
                    <td className="px-6 py-4">
                      {client.lastScore !== undefined ? (
                        <span className="text-lg font-black" style={{ color: scoreColor(client.lastScore) }}>
                          {client.lastScore}
                        </span>
                      ) : (
                        <span className="text-white/20 text-xs">Not scanned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {client.lastScore !== undefined ? (
                        <span className="text-sm font-black px-2 py-0.5 rounded" style={{ color: scoreColor(client.lastScore), background: `${scoreColor(client.lastScore)}15` }}>
                          {grade(client.lastScore)}
                        </span>
                      ) : (
                        <span className="text-white/20 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Trend history={client.scoreHistory} />
                    </td>
                    <td className="px-6 py-4 text-xs text-white/35">
                      {client.lastScanAt
                        ? new Date(client.lastScanAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleScan(client)}
                          disabled={scanningId === client.id}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          style={{ background: 'rgba(6,214,255,0.08)', color: '#06d6ff', border: '1px solid rgba(6,214,255,0.2)' }}
                        >
                          {scanningId === client.id ? 'Scanning…' : 'Scan Now'}
                        </button>
                        <button
                          onClick={() => handleRemoveClient(client.id)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors text-white/30 hover:text-red-400 hover:bg-red-400/5"
                          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add client form */}
      <div className="rounded-2xl p-6" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 className="text-sm font-bold text-white mb-4">Add a Client</h3>
        <form onSubmit={handleAddClient}>
          <div className="grid md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs font-semibold text-white/40 mb-1.5 uppercase tracking-wider">Domain <span className="text-red-400">*</span></label>
              <input
                type="text"
                required
                placeholder="clientsite.com"
                value={newDomain}
                onChange={e => setNewDomain(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:ring-1 focus:ring-cyan-400/50"
                style={{ background: '#070b14', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/40 mb-1.5 uppercase tracking-wider">Client Business Name</label>
              <input
                type="text"
                placeholder="Sunrise Plumbing Co."
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:ring-1 focus:ring-cyan-400/50"
                style={{ background: '#070b14', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/40 mb-1.5 uppercase tracking-wider">Client Email (for reports)</label>
              <input
                type="email"
                placeholder="client@business.com"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:ring-1 focus:ring-cyan-400/50"
                style={{ background: '#070b14', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
          </div>
          {addError && <p className="text-xs text-red-400 mb-3">{addError}</p>}
          <button
            type="submit"
            disabled={addLoading}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-black disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}
          >
            {addLoading ? 'Adding…' : '+ Add Client'}
          </button>
        </form>
      </div>

      <div className="mt-8 text-center">
        <Link href="/agency" className="text-xs text-white/30 hover:text-white/60 transition-colors">
          ← Back to Agency page
        </Link>
      </div>
    </div>
  )
}

export default function AgencyDashboardPage() {
  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <Suspense fallback={
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <DashboardContent />
      </Suspense>
      <Footer />
    </div>
  )
}
