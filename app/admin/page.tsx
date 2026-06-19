'use client'

import { useState, useEffect, useCallback } from 'react'

interface ScanLogEntry {
  scanId: string
  domain: string
  email: string
  score: number
  paid: boolean
  paidAt?: string
  downloadToken?: string
  status: string
  createdAt: string
}

interface FeedbackEntry {
  id: string
  category: string
  name: string
  email: string
  message: string
  createdAt: string
}

interface DfyApplication {
  id: string
  scanId?: string
  name: string
  email: string
  url: string
  platform: string
  score?: number
  message: string
  status: 'new' | 'contacted' | 'payment_sent' | 'paid' | 'rejected'
  createdAt: string
  dfyToken?: string
  implemented?: boolean
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://queldrex.com'

export default function AdminPage() {
  const [secret, setSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState<'scans' | 'downloads' | 'applications' | 'feedback'>('scans')

  // Scans
  const [entries, setEntries] = useState<ScanLogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [delivering, setDelivering] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all')

  // Applications
  const [applications, setApplications] = useState<DfyApplication[]>([])
  const [appsLoading, setAppsLoading] = useState(false)
  const [sendingPayment, setSendingPayment] = useState<string | null>(null)

  const loadApplications = useCallback(async (s: string) => {
    setAppsLoading(true)
    try {
      const res = await fetch('/api/admin/applications', { headers: { 'x-admin-secret': s } })
      if (res.ok) {
        const data = await res.json()
        setApplications(data.applications || [])
      }
    } catch { /* ignore */ }
    setAppsLoading(false)
  }, [])

  const sendPaymentLink = async (app: DfyApplication) => {
    setSendingPayment(app.id)
    try {
      const res = await fetch('/api/admin/send-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ applicationId: app.id }),
      })
      const data = await res.json()
      if (res.ok) {
        setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: 'payment_sent' } : a))
        alert(`Payment link sent to ${app.email}`)
      } else {
        alert(data.error || 'Failed to send payment link')
      }
    } catch {
      alert('Network error')
    }
    setSendingPayment(null)
  }

  const rejectApplication = async (id: string) => {
    await fetch('/api/admin/applications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify({ id, status: 'rejected' }),
    })
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a))
  }

  const [implementing, setImplementing] = useState<string | null>(null)
  const [implementResult, setImplementResult] = useState<Record<string, unknown> | null>(null)
  const [implementError, setImplementError] = useState('')

  const runImplementation = async (app: DfyApplication) => {
    if (!app.dfyToken || !app.scanId) {
      alert('Missing dfyToken or scanId — cannot implement. Check that payment was processed via Stripe.')
      return
    }
    setImplementing(app.id)
    setImplementResult(null)
    setImplementError('')
    try {
      // Step 1: Fetch stored credentials
      const credsRes = await fetch(`/api/dfy/credentials?token=${app.dfyToken}`, {
        headers: { 'x-admin-secret': secret },
      })
      if (!credsRes.ok) {
        const err = await credsRes.json()
        throw new Error(err.error || 'Could not fetch credentials')
      }
      const session = await credsRes.json() as { credentials?: { platform: string; fields?: Record<string, string> } | null; status?: string }

      if (!session.credentials || session.credentials.platform === 'manual') {
        // No automated credentials — mark as manual and notify admin
        setImplementResult({ status: 'manual', message: `Platform: ${session.credentials?.platform || 'not submitted yet'}. Status: ${session.status}. Customer has not submitted credentials or chose manual install. Coordinate directly with ${app.email}.` })
        setImplementing(null)
        return
      }

      // Step 2: Build ImplementationCredentials from stored session
      const { platform, fields = {} } = session.credentials
      let credentials: Record<string, unknown> = { platform }
      if (platform === 'ftp') {
        credentials = { platform: 'ftp', host: fields.host, port: fields.port ? parseInt(fields.port) : 21, username: fields.username, password: fields.password, webRoot: fields.webRoot, secure: fields.secure === 'true' }
      } else if (platform === 'wordpress') {
        credentials = { platform: 'wordpress', siteUrl: fields.siteUrl, username: fields.username, appPassword: fields.appPassword }
      } else if (platform === 'github') {
        credentials = { platform: 'github', repo: fields.repo, branch: fields.branch || 'main', token: fields.token, publicDir: fields.publicDir }
      } else if (platform === 'shopify') {
        credentials = { platform: 'shopify', storeUrl: fields.storeUrl, apiToken: fields.apiToken }
      }

      // Step 3: Run implementation
      const implRes = await fetch('/api/admin/implement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ scanId: app.scanId, credentials, sendEmail: true }),
      })
      const result = await implRes.json()
      if (!implRes.ok) throw new Error(result.error || 'Implementation failed')

      setImplementResult(result)
      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, implemented: true } : a))
      await updateDfyApplication(app.id)
    } catch (err) {
      setImplementError(err instanceof Error ? err.message : 'Implementation failed')
    }
    setImplementing(null)
  }

  const updateDfyApplication = async (id: string) => {
    await fetch('/api/admin/applications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify({ id, implemented: true }),
    }).catch(() => {})
  }

  // Feedback
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([])
  const [fbLoading, setFbLoading] = useState(false)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())

  const markRead = (id: string) => {
    setReadIds(prev => {
      const next = new Set(prev)
      next.add(id)
      try {
        const stored = JSON.parse(localStorage.getItem('fb_read') || '[]') as string[]
        localStorage.setItem('fb_read', JSON.stringify([...new Set([...stored, id])]))
      } catch { /* ignore */ }
      return next
    })
  }

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('fb_read') || '[]') as string[]
      setReadIds(new Set(stored))
    } catch { /* ignore */ }
  }, [])

  const loadScans = useCallback(async (s: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/log', { headers: { 'x-admin-secret': s } })
      if (res.status === 401) { window.location.href = '/admin-login'; return }
      const data = await res.json()
      setEntries(data.entries || [])
      setTotal(data.total || 0)
      setAuthed(true)
    } catch {
      setError('Failed to load')
    }
    setLoading(false)
  }, [])

  const loadFeedback = useCallback(async (s: string) => {
    setFbLoading(true)
    try {
      const res = await fetch('/api/admin/feedback', { headers: { 'x-admin-secret': s } })
      if (res.ok) {
        const data = await res.json()
        setFeedback(data.entries || [])
      }
    } catch { /* ignore */ }
    setFbLoading(false)
  }, [])

  const login = (e: React.FormEvent) => {
    e.preventDefault()
    loadScans(secret)
  }

  useEffect(() => {
    if (authed && tab === 'feedback' && feedback.length === 0) loadFeedback(secret)
    if (authed && tab === 'applications' && applications.length === 0) loadApplications(secret)
  }, [authed, tab, feedback.length, applications.length, secret, loadFeedback, loadApplications])

  // Auto-refresh scans every 30 seconds while on scans tab
  useEffect(() => {
    if (!authed || tab !== 'scans') return
    const id = setInterval(() => loadScans(secret), 30_000)
    return () => clearInterval(id)
  }, [authed, tab, secret, loadScans])

  const [resending, setResending] = useState<string | null>(null)

  const deliver = async (entry: ScanLogEntry) => {
    setDelivering(entry.scanId)
    try {
      const res = await fetch('/api/admin/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ scanId: entry.scanId }),
      })
      const data = await res.json()
      if (res.ok) {
        alert(`Delivered to ${data.to}`)
        loadScans(secret)
      } else {
        alert(data.error || 'Delivery failed')
      }
    } catch {
      alert('Network error')
    }
    setDelivering(null)
  }

  const resend = async (entry: ScanLogEntry) => {
    setResending(entry.scanId)
    try {
      const res = await fetch('/api/admin/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ scanId: entry.scanId }),
      })
      const data = await res.json()
      if (res.ok) {
        const url = data.downloadUrl || ''
        alert(`Resent to ${data.to}\n\nDownload URL:\n${url}`)
      } else {
        alert(data.error || 'Resend failed')
      }
    } catch {
      alert('Network error')
    }
    setResending(null)
  }

  const filtered = entries.filter(e => {
    if (filter === 'paid') return e.paid
    if (filter === 'unpaid') return !e.paid
    return true
  })

  const downloads = entries.filter(e => e.paid && e.downloadToken)

  const paidCount = entries.filter(e => e.paid).length
  const conversionRate = entries.length > 0 ? ((paidCount / entries.length) * 100).toFixed(1) : '0'

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
        <form onSubmit={login} style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 320 }}>
          <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Queldrex Admin</h1>
          <input
            type="password"
            placeholder="Admin secret"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            autoFocus
            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #333', background: '#111', color: '#fff', fontSize: 15 }}
          />
          {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '10px 14px', borderRadius: 8, background: '#6366f1', color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer' }}
          >
            {loading ? 'Loading...' : 'Sign in'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '32px 24px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Queldrex Admin</h1>
          <button onClick={() => { loadScans(secret); if (tab === 'feedback') loadFeedback(secret) }} style={{ padding: '6px 16px', borderRadius: 6, background: '#222', color: '#aaa', border: '1px solid #333', cursor: 'pointer', fontSize: 13 }}>
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {(['scans', 'downloads', 'applications', 'feedback'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 20px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: tab === t ? 600 : 400,
              background: tab === t ? '#6366f1' : '#111', color: tab === t ? '#fff' : '#888', border: '1px solid #333',
            }}>
              {t === 'downloads' ? 'Downloads' : t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'downloads' && downloads.length > 0 && (
                <span style={{ marginLeft: 6, background: '#0891b2', color: '#fff', borderRadius: 99, padding: '1px 7px', fontSize: 11 }}>{downloads.length}</span>
              )}
              {t === 'applications' && applications.filter(a => a.status === 'new').length > 0 && (
                <span style={{ marginLeft: 6, background: '#f87171', color: '#fff', borderRadius: 99, padding: '1px 7px', fontSize: 11 }}>{applications.filter(a => a.status === 'new').length}</span>
              )}
              {t === 'feedback' && feedback.filter(f => !readIds.has(f.id)).length > 0 && (
                <span style={{ marginLeft: 6, background: '#f87171', color: '#fff', borderRadius: 99, padding: '1px 7px', fontSize: 11 }}>{feedback.filter(f => !readIds.has(f.id)).length}</span>
              )}
            </button>
          ))}
        </div>

        {tab === 'scans' && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Total Scans', value: total },
                { label: 'Paid', value: paidCount },
                { label: 'Unpaid', value: entries.length - paidCount },
                { label: 'Conversion', value: `${conversionRate}%` },
              ].map(stat => (
                <div key={stat.label} style={{ background: '#111', border: '1px solid #222', borderRadius: 10, padding: '16px 20px' }}>
                  <div style={{ fontSize: 26, fontWeight: 700 }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {(['all', 'paid', 'unpaid'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '6px 16px', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: filter === f ? 600 : 400,
                  background: filter === f ? '#6366f1' : '#111', color: filter === f ? '#fff' : '#888', border: '1px solid #333',
                }}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Table */}
            <div style={{ background: '#111', border: '1px solid #222', borderRadius: 10, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #222' }}>
                    {['Domain', 'Email', 'Score', 'Status', 'Date', 'Action'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#666', fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#444' }}>No entries</td></tr>
                  )}
                  {filtered.map(entry => (
                    <tr key={entry.scanId} style={{ borderBottom: '1px solid #1a1a1a' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>{entry.domain}</td>
                      <td style={{ padding: '12px 16px', color: '#aaa' }}>{entry.email}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ color: entry.score >= 80 ? '#4ade80' : entry.score >= 50 ? '#facc15' : '#f87171', fontWeight: 600 }}>
                          {entry.score}/100
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                          background: entry.paid ? '#14532d' : '#1c1c1c',
                          color: entry.paid ? '#4ade80' : '#666',
                          border: `1px solid ${entry.paid ? '#166534' : '#333'}`,
                        }}>
                          {entry.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#555' }}>
                        {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {!entry.paid && (
                            <button
                              onClick={() => deliver(entry)}
                              disabled={delivering === entry.scanId}
                              style={{ padding: '4px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 500, background: '#1e1b4b', color: '#818cf8', border: '1px solid #312e81' }}
                            >
                              {delivering === entry.scanId ? 'Sending...' : 'Deliver'}
                            </button>
                          )}
                          {entry.paid && (
                            <button
                              onClick={() => resend(entry)}
                              disabled={resending === entry.scanId}
                              style={{ padding: '4px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 500, background: '#1c2a3a', color: '#60a5fa', border: '1px solid #1e40af' }}
                            >
                              {resending === entry.scanId ? 'Sending...' : 'Resend'}
                            </button>
                          )}
                          {entry.paid && entry.downloadToken && (
                            <a
                              href={`${BASE_URL}/download/${entry.downloadToken}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: '#052e16', color: '#4ade80', border: '1px solid #166534', textDecoration: 'none' }}
                            >
                              View
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ marginTop: 16, fontSize: 12, color: '#333' }}>Showing {filtered.length} of {total} total scans</p>
          </>
        )}

        {tab === 'downloads' && (
          <>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: '#555' }}>
                Customers who purchased the $149 bundle and received a download link. Tokens expire 7 days after issuance.
              </p>
            </div>
            {loading && <p style={{ color: '#666' }}>Loading...</p>}
            {!loading && downloads.length === 0 && (
              <p style={{ color: '#444', padding: 32, textAlign: 'center' }}>No downloads yet — entries appear here after delivery via Stripe webhook or the Deliver button.</p>
            )}
            {downloads.length > 0 && (
              <div style={{ background: '#111', border: '1px solid #222', borderRadius: 10, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #222' }}>
                      {['Domain', 'Email', 'Score', 'Delivered', 'Download Link'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#666', fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {downloads.map(entry => (
                      <tr key={entry.scanId} style={{ borderBottom: '1px solid #1a1a1a' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 500 }}>{entry.domain}</td>
                        <td style={{ padding: '12px 16px', color: '#aaa' }}>{entry.email}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ color: entry.score >= 80 ? '#4ade80' : entry.score >= 50 ? '#facc15' : '#f87171', fontWeight: 600 }}>
                            {entry.score}/100
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#555' }}>
                          {entry.paidAt
                            ? new Date(entry.paidAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : '—'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <a
                              href={`${BASE_URL}/download/${entry.downloadToken}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: '#052e16', color: '#4ade80', border: '1px solid #166534', textDecoration: 'none' }}
                            >
                              Open Page
                            </a>
                            <button
                              onClick={() => { navigator.clipboard.writeText(`${BASE_URL}/download/${entry.downloadToken}`) }}
                              style={{ padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: '#1c1c1c', color: '#888', border: '1px solid #333', cursor: 'pointer' }}
                            >
                              Copy Link
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {downloads.length > 0 && <p style={{ marginTop: 12, fontSize: 12, color: '#333' }}>{downloads.length} download{downloads.length !== 1 ? 's' : ''} issued</p>}
          </>
        )}

        {tab === 'applications' && (
          <div>
            {appsLoading && <p style={{ color: '#666' }}>Loading...</p>}
            {!appsLoading && applications.length === 0 && (
              <p style={{ color: '#444', padding: 32, textAlign: 'center' }}>No applications yet</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {applications.map(app => {
                const statusColors: Record<string, { bg: string; color: string; border: string }> = {
                  new:           { bg: '#1e1b4b', color: '#818cf8', border: '#312e81' },
                  contacted:     { bg: '#1c3a2a', color: '#4ade80', border: '#166534' },
                  payment_sent:  { bg: '#1c2a3a', color: '#60a5fa', border: '#1e40af' },
                  paid:          { bg: '#14532d', color: '#4ade80', border: '#166534' },
                  rejected:      { bg: '#1c1c1c', color: '#555', border: '#333' },
                }
                const sc = statusColors[app.status] || statusColors.new
                return (
                  <div key={app.id} style={{ background: '#111', border: `1px solid ${app.status === 'new' ? '#312e81' : '#222'}`, borderRadius: 10, padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                          {app.status === 'new' && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f87171', flexShrink: 0, display: 'inline-block' }} />}
                          <span style={{ fontSize: 15, fontWeight: 700 }}>{app.name}</span>
                          <span style={{ fontSize: 12, color: '#555' }}>{app.email}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 13, color: '#6366f1' }}>{app.url}</span>
                          <span style={{ fontSize: 11, color: '#555' }}>·</span>
                          <span style={{ fontSize: 12, color: '#666' }}>{app.platform}</span>
                          {app.score !== undefined && (
                            <>
                              <span style={{ fontSize: 11, color: '#555' }}>·</span>
                              <span style={{ fontSize: 12, fontWeight: 600, color: app.score >= 80 ? '#4ade80' : app.score >= 50 ? '#facc15' : '#f87171' }}>Score: {app.score}/100</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                          {app.status.replace('_', ' ')}
                        </span>
                        <span style={{ fontSize: 12, color: '#444' }}>
                          {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: 13, color: '#aaa', lineHeight: 1.6, margin: '0 0 16px', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid #1a1a1a' }}>
                      {app.message}
                    </p>

                    {app.status !== 'rejected' && app.status !== 'paid' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        {app.status !== 'payment_sent' && (
                          <button
                            onClick={() => sendPaymentLink(app)}
                            disabled={sendingPayment === app.id}
                            style={{ padding: '6px 16px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600, background: '#1e1b4b', color: '#818cf8', border: '1px solid #312e81' }}
                          >
                            {sendingPayment === app.id ? 'Sending…' : '💳 Send Payment Link'}
                          </button>
                        )}
                        {app.status === 'payment_sent' && (
                          <button
                            onClick={() => sendPaymentLink(app)}
                            disabled={sendingPayment === app.id}
                            style={{ padding: '6px 16px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600, background: '#1c2a3a', color: '#60a5fa', border: '1px solid #1e40af' }}
                          >
                            {sendingPayment === app.id ? 'Sending…' : '🔄 Resend Payment Link'}
                          </button>
                        )}
                        <button
                          onClick={() => rejectApplication(app.id)}
                          style={{ padding: '6px 16px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 500, background: '#1c1c1c', color: '#666', border: '1px solid #333' }}
                        >
                          Reject
                        </button>
                        <a
                          href={`mailto:${app.email}?subject=Your Queldrex Application&body=Hi ${app.name},%0D%0A%0D%0AThanks for applying...`}
                          style={{ padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: '#1c1c1c', color: '#888', border: '1px solid #333', textDecoration: 'none' }}
                        >
                          ✉️ Email
                        </a>
                      </div>
                    )}

                    {/* Paid DFY — show implementation controls */}
                    {app.status === 'paid' && (
                      <div style={{ marginTop: 4 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => runImplementation(app)}
                            disabled={implementing === app.id || app.implemented}
                            style={{
                              padding: '6px 18px', borderRadius: 6, fontSize: 12, cursor: app.implemented ? 'default' : 'pointer',
                              fontWeight: 700, border: '1px solid',
                              background: app.implemented ? '#052e16' : '#14532d',
                              color: app.implemented ? '#4ade80' : '#86efac',
                              borderColor: app.implemented ? '#166534' : '#16a34a',
                              opacity: implementing === app.id ? 0.7 : 1,
                            }}
                          >
                            {implementing === app.id ? '⚙️ Implementing…' : app.implemented ? '✓ Implemented' : '⚙️ Run Implementation'}
                          </button>
                          {app.dfyToken && (
                            <span style={{ fontSize: 11, color: '#555', fontFamily: 'monospace' }}>
                              token: {app.dfyToken.slice(0, 8)}…
                            </span>
                          )}
                          {!app.dfyToken && (
                            <span style={{ fontSize: 11, color: '#f87171' }}>No dfyToken — payment may not have fully processed yet. Refresh.</span>
                          )}
                          <a
                            href={`mailto:${app.email}?subject=Your AI Visibility Implementation — Queldrex&body=Hi ${app.name},%0D%0A%0D%0AYour implementation is complete!`}
                            style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: '#1c1c1c', color: '#888', border: '1px solid #333', textDecoration: 'none' }}
                          >
                            ✉️ Email
                          </a>
                        </div>

                        {/* Implementation result */}
                        {implementing === null && implementResult && (
                          <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 8, background: '#052e16', border: '1px solid #166534', fontSize: 12 }}>
                            {'status' in implementResult && implementResult.status === 'manual' ? (
                              <p style={{ color: '#fbbf24', margin: 0 }}>⚠️ {String(implementResult.message)}</p>
                            ) : (
                              <>
                                <p style={{ color: '#4ade80', fontWeight: 700, marginBottom: 6 }}>
                                  Implementation {String(implementResult.status || 'complete')} — Score: {String(implementResult.beforeScore ?? '?')} → {String(implementResult.afterScore ?? '?')}
                                </p>
                                {Array.isArray(implementResult.filesImplemented) && implementResult.filesImplemented.length > 0 && (
                                  <ul style={{ margin: 0, padding: '0 0 0 16px', color: '#86efac' }}>
                                    {(implementResult.filesImplemented as Array<{path: string; action: string}>).map((f, i) => (
                                      <li key={i}>{f.action}: {f.path}</li>
                                    ))}
                                  </ul>
                                )}
                                {Array.isArray(implementResult.errors) && implementResult.errors.length > 0 && (
                                  <ul style={{ margin: '8px 0 0', padding: '0 0 0 16px', color: '#f87171' }}>
                                    {(implementResult.errors as string[]).map((e, i) => <li key={i}>{e}</li>)}
                                  </ul>
                                )}
                              </>
                            )}
                          </div>
                        )}
                        {implementError && implementing === null && (
                          <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 8, background: '#1c0a0a', border: '1px solid #7f1d1d', color: '#f87171', fontSize: 12 }}>
                            {implementError}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'feedback' && (
          <div>
            {fbLoading && <p style={{ color: '#666' }}>Loading...</p>}
            {!fbLoading && feedback.length === 0 && (
              <p style={{ color: '#444', padding: 32, textAlign: 'center' }}>No feedback yet</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {feedback.map(entry => (
                <FeedbackCard key={entry.id} entry={entry} isRead={readIds.has(entry.id)} onRead={() => markRead(entry.id)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FeedbackCard({ entry, isRead, onRead }: { entry: FeedbackEntry; isRead: boolean; onRead: () => void }) {
  const [open, setOpen] = useState(false)

  const handleOpen = () => {
    setOpen(true)
    onRead()
  }

  return (
    <>
      <div
        onClick={handleOpen}
        style={{
          background: isRead ? '#111' : '#13111f',
          border: `1px solid ${isRead ? '#222' : '#312e81'}`,
          borderRadius: 10,
          padding: '16px 20px', cursor: 'pointer', transition: 'border-color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#6366f1')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = isRead ? '#222' : '#312e81')}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {!isRead && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f87171', flexShrink: 0 }} />}
            <span style={{ padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: '#1e1b4b', color: '#818cf8', border: '1px solid #312e81' }}>
              {entry.category}
            </span>
            {entry.name && <span style={{ fontSize: 13, fontWeight: isRead ? 400 : 600 }}>{entry.name}</span>}
            {entry.email && <span style={{ fontSize: 12, color: '#555' }}>{entry.email}</span>}
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#444' }}>
              {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            <span style={{ fontSize: 12, color: '#6366f1' }}>View →</span>
          </div>
        </div>
        <p style={{ fontSize: 13, color: isRead ? '#555' : '#aaa', margin: '8px 0 0', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {entry.message}
        </p>
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 24 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#111', border: '1px solid #333', borderRadius: 12, padding: 32, maxWidth: 560, width: '100%', maxHeight: '80vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <span style={{ padding: '3px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: '#1e1b4b', color: '#818cf8', border: '1px solid #312e81' }}>
                {entry.category}
              </span>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#666', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </div>
            {(entry.name || entry.email) && (
              <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #222' }}>
                {entry.name && <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600 }}>{entry.name}</p>}
                {entry.email && (
                  <a href={`mailto:${entry.email}`} style={{ fontSize: 13, color: '#6366f1', textDecoration: 'none' }}>{entry.email}</a>
                )}
              </div>
            )}
            <p style={{ fontSize: 15, color: '#ccc', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: '0 0 20px' }}>{entry.message}</p>
            <p style={{ fontSize: 12, color: '#444', margin: 0 }}>
              {new Date(entry.createdAt).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
