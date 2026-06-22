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
  status: 'new' | 'contacted' | 'payment_sent' | 'paid' | 'rejected' | 'complete'
  createdAt: string
  dfyToken?: string
  implemented?: boolean
  ticketNumber?: number
  priority?: 'critical' | 'high' | 'medium' | 'low'
  notes?: string
  statusHistory?: Array<{ status: string; at: string }>
}

interface SecurityLogEntry {
  id: string
  ip: string
  path: string
  method: string
  success: boolean
  action?: string
  createdAt: string
}

const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://queldrex.com').replace(/^﻿/, '').trim()

export default function AdminPage() {
  const [secret, setSecret] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [sessionToken, setSessionToken] = useState('')
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState<'overview' | 'scans' | 'downloads' | 'applications' | 'feedback' | 'legal' | 'test' | 'security' | 'toolrequests' | 'buildrequests' | 'revenue'>('overview')

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
  const [sendingDiscovery, setSendingDiscovery] = useState<string | null>(null)
  const [completing, setCompleting] = useState<string | null>(null)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [loginLocked, setLoginLocked] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [updatingPriority, setUpdatingPriority] = useState<Record<string, boolean>>({})
  const [notesFlash, setNotesFlash] = useState<Record<string, boolean>>({})
  const [lastSeenPipelineAt, setLastSeenPipelineAt] = useState<string | null>(null)

  // Security
  const [secLog, setSecLog] = useState<SecurityLogEntry[]>([])
  const [secFlagged, setSecFlagged] = useState<Array<{ ip: string; count: number }>>([])
  const [secLoading, setSecLoading] = useState(false)

  // Tool Requests
  const [toolRequests, setToolRequests] = useState<Array<{ id: string; name: string; email: string; toolName: string; description: string; useCase?: string; category?: string; status: string; createdAt: string }>>([])
  const [trLoading, setTrLoading] = useState(false)

  // Build Requests
  const [buildRequests, setBuildRequests] = useState<Array<{ id: string; name: string; email: string; company?: string; serviceType: string; description: string; budget?: string; timeline?: string; status: string; createdAt: string }>>([])
  const [brLoading, setBrLoading] = useState(false)

  // Revenue
  const [revenue, setRevenue] = useState<{ mrr: number; activeSubscriptions: number; recentSales: Array<{ id: string; amount: number; currency: string; customerEmail: string; created: number; mode: string; productName: string }>; totalRevenueLast20: number } | null>(null)
  const [revenueLoading, setRevenueLoading] = useState(false)

  // Notification system — replaces alert() with in-page toasts with error codes
  const [notifications, setNotifications] = useState<Array<{ id: string; type: 'success' | 'error' | 'warning'; title: string; detail?: string; code?: string }>>([])

  const notify = useCallback((type: 'success' | 'error' | 'warning', title: string, detail?: string, code?: string) => {
    const id = Math.random().toString(36).slice(2)
    setNotifications(prev => [...prev.slice(-4), { id, type, title, detail, code }])
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 7000)
  }, [])

  const loadApplications = useCallback(async (tok: string) => {
    setAppsLoading(true)
    try {
      const res = await fetch('/api/admin/applications', { headers: { 'x-session-token': tok } })
      if (res.ok) {
        const data = await res.json()
        setApplications(data.applications || [])
      }
    } catch { /* ignore */ }
    setAppsLoading(false)
  }, [])

  const appendStatusHistory = async (app: DfyApplication, newStatus: string) => {
    const entry = { status: newStatus, at: new Date().toISOString() }
    const history = [...(app.statusHistory || []), entry]
    setApplications(prev => prev.map(a => a.id === app.id ? { ...a, statusHistory: history } : a))
    await fetch('/api/admin/applications', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-session-token': sessionToken }, body: JSON.stringify({ id: app.id, statusHistory: history }) }).catch(() => {})
  }

  const sendPaymentLink = async (app: DfyApplication) => {
    setSendingPayment(app.id)
    try {
      const res = await fetch('/api/admin/send-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-token': sessionToken },
        body: JSON.stringify({ applicationId: app.id }),
      })
      const data = await res.json()
      if (res.ok) {
        setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: 'payment_sent' } : a))
        appendStatusHistory(app, 'payment_sent')
        notify('success', `Payment link sent to ${app.email}`)
      } else {
        notify('error', 'Failed to send payment link', data.error, `HTTP ${res.status}`)
      }
    } catch (e) {
      notify('error', 'Network error', String(e), 'NETWORK_ERROR')
    }
    setSendingPayment(null)
  }

  const sendDiscovery = async (app: DfyApplication) => {
    setSendingDiscovery(app.id)
    try {
      const res = await fetch('/api/admin/send-discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-token': sessionToken },
        body: JSON.stringify({ applicationId: app.id }),
      })
      const data = await res.json()
      if (res.ok) {
        setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: 'contacted' } : a))
        appendStatusHistory(app, 'contacted')
        notify('success', `Discovery email sent to ${app.email}`)
      } else {
        notify('error', 'Failed to send discovery email', data.error, `HTTP ${res.status}`)
      }
    } catch (e) {
      notify('error', 'Network error', String(e), 'NETWORK_ERROR')
    }
    setSendingDiscovery(null)
  }

  const completeDfy = async (app: DfyApplication) => {
    if (!window.confirm(`Mark "${app.name}" complete?\n\nThis permanently deletes their credentials from our system and emails them a deletion receipt.\n\nThis cannot be undone.`)) return
    setCompleting(app.id)
    try {
      const res = await fetch('/api/admin/complete-dfy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-token': sessionToken },
        body: JSON.stringify({ applicationId: app.id }),
      })
      const data = await res.json()
      if (res.ok) {
        setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: 'complete', implemented: true } : a))
        appendStatusHistory(app, 'complete')
        notify('success', `Credentials deleted — receipt sent to ${app.email}`, `Deleted at ${new Date(data.deletedAt).toLocaleString()}`)
      } else {
        notify('error', 'Failed to complete', data.error, `HTTP ${res.status}`)
      }
    } catch (e) {
      notify('error', 'Network error', String(e), 'NETWORK_ERROR')
    }
    setCompleting(null)
  }

  const rejectApplication = async (id: string) => {
    const app = applications.find(a => a.id === id)
    await fetch('/api/admin/applications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-session-token': sessionToken },
      body: JSON.stringify({ id, status: 'rejected' }),
    })
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a))
    if (app) appendStatusHistory(app, 'rejected')
  }

  const [implementing, setImplementing] = useState<string | null>(null)
  const [implementResult, setImplementResult] = useState<Record<string, unknown> | null>(null)
  const [implementError, setImplementError] = useState('')

  const runImplementation = async (app: DfyApplication) => {
    if (!app.dfyToken || !app.scanId) {
      notify('error', 'Cannot run implementation', 'Missing dfyToken or scanId — verify Stripe payment completed.', 'MISSING_TOKEN')
      return
    }
    setImplementing(app.id)
    setImplementResult(null)
    setImplementError('')
    try {
      // Step 1: Fetch stored credentials
      const credsRes = await fetch(`/api/dfy/credentials?token=${app.dfyToken}`, {
        headers: { 'x-session-token': sessionToken },
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
        headers: { 'Content-Type': 'application/json', 'x-session-token': sessionToken },
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
      headers: { 'Content-Type': 'application/json', 'x-session-token': sessionToken },
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
    try {
      const ts = localStorage.getItem('pipeline_seen_at')
      if (ts) setLastSeenPipelineAt(ts)
    } catch { /* ignore */ }
  }, [])

  const loadScans = useCallback(async (tok: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/log', { headers: { 'x-session-token': tok } })
      if (res.status === 401) {
        setError('Invalid access key')
        setLoginAttempts(prev => {
          const next = prev + 1
          if (next >= 3) setLoginLocked(true)
          return next
        })
        setLoading(false)
        return
      }
      const data = await res.json()
      setEntries(data.entries || [])
      setTotal(data.total || 0)
      setAuthed(true)
    } catch {
      setError('Failed to load')
    }
    setLoading(false)
  }, [])

  const loadFeedback = useCallback(async (tok: string) => {
    setFbLoading(true)
    try {
      const res = await fetch('/api/admin/feedback', { headers: { 'x-session-token': tok } })
      if (res.ok) {
        const data = await res.json()
        setFeedback(data.entries || [])
      }
    } catch { /* ignore */ }
    setFbLoading(false)
  }, [])

  const loadSecurity = useCallback(async (tok: string) => {
    setSecLoading(true)
    try {
      const res = await fetch('/api/admin/security', { headers: { 'x-session-token': tok } })
      if (res.ok) {
        const data = await res.json()
        setSecLog(data.log || [])
        setSecFlagged(data.flaggedIps || [])
      }
    } catch { /* ignore */ }
    setSecLoading(false)
  }, [])

  const loadToolRequests = useCallback(async (tok: string) => {
    setTrLoading(true)
    try {
      const res = await fetch('/api/tool-requests', { headers: { 'x-session-token': tok } })
      if (res.ok) { const d = await res.json(); setToolRequests(d.requests || []) }
    } catch { /* ignore */ }
    setTrLoading(false)
  }, [])

  const loadBuildRequests = useCallback(async (tok: string) => {
    setBrLoading(true)
    try {
      const res = await fetch('/api/build-request', { headers: { 'x-session-token': tok } })
      if (res.ok) { const d = await res.json(); setBuildRequests(d.requests || []) }
    } catch { /* ignore */ }
    setBrLoading(false)
  }, [])

  const loadRevenue = useCallback(async (tok: string) => {
    setRevenueLoading(true)
    try {
      const res = await fetch('/api/admin/revenue', { headers: { 'x-session-token': tok } })
      if (res.ok) { const d = await res.json(); setRevenue(d) }
    } catch { /* ignore */ }
    setRevenueLoading(false)
  }, [])

  // Restore admin session on page refresh
  useEffect(() => {
    try {
      const saved = localStorage.getItem('queldrex_admin_token')
      if (saved) {
        fetch('/api/admin/log?limit=1', { headers: { 'x-session-token': saved } })
          .then(res => {
            if (res.ok) {
              setSessionToken(saved)
              loadScans(saved)
              loadApplications(saved)
              loadFeedback(saved)
              loadSecurity(saved)
            } else {
              localStorage.removeItem('queldrex_admin_token')
            }
          })
          .catch(() => { /* network error — stay on login */ })
      }
    } catch { /* ignore */ }
  }, [loadScans, loadApplications, loadFeedback, loadSecurity])

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loginLocked) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, totp: totpCode }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 429) {
          setLoginLocked(true)
          setError('Too many failed attempts. Try again in 1 hour.')
        } else {
          setLoginAttempts(prev => {
            const next = prev + 1
            if (next >= 5) setLoginLocked(true)
            return next
          })
          const remaining = data.remaining ?? 0
          setError(`${data.error || 'Login failed'}${remaining > 0 ? ` — ${remaining} attempt${remaining === 1 ? '' : 's'} remaining` : ''}`)
        }
        setLoading(false)
        return
      }
      const tok = data.sessionToken as string
      setSessionToken(tok)
      try { localStorage.setItem('queldrex_admin_token', tok) } catch { /* ignore */ }
      loadScans(tok)
      loadApplications(tok)
      loadFeedback(tok)
      loadSecurity(tok)
    } catch {
      setError('Network error — try again')
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authed && tab === 'feedback' && feedback.length === 0) loadFeedback(sessionToken)
    if (authed && tab === 'applications' && applications.length === 0) loadApplications(sessionToken)
    if (authed && tab === 'security' && secLog.length === 0) loadSecurity(sessionToken)
    if (authed && tab === 'toolrequests' && toolRequests.length === 0) loadToolRequests(sessionToken)
    if (authed && tab === 'buildrequests' && buildRequests.length === 0) loadBuildRequests(sessionToken)
    if (authed && tab === 'revenue' && !revenue) loadRevenue(sessionToken)
  }, [authed, tab, feedback.length, applications.length, secLog.length, toolRequests.length, buildRequests.length, revenue, sessionToken, loadFeedback, loadApplications, loadSecurity, loadToolRequests, loadBuildRequests, loadRevenue])

  useEffect(() => {
    if (authed && tab === 'applications') {
      const now = new Date().toISOString()
      setLastSeenPipelineAt(now)
      try { localStorage.setItem('pipeline_seen_at', now) } catch { /* ignore */ }
    }
  }, [authed, tab])

  // Auto-refresh scans every 30 seconds while on scans tab
  useEffect(() => {
    if (!authed || tab !== 'scans') return
    const id = setInterval(() => loadScans(sessionToken), 30_000)
    return () => clearInterval(id)
  }, [authed, tab, sessionToken, loadScans])

  const [resending, setResending] = useState<string | null>(null)

  const deliver = async (entry: ScanLogEntry) => {
    setDelivering(entry.scanId)
    try {
      const res = await fetch('/api/admin/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-token': sessionToken },
        body: JSON.stringify({ scanId: entry.scanId }),
      })
      const data = await res.json()
      if (res.ok) {
        notify('success', `Report delivered to ${data.to}`)
        loadScans(sessionToken)
      } else {
        notify('error', 'Delivery failed', data.error, `HTTP ${res.status}`)
      }
    } catch (e) {
      notify('error', 'Network error', String(e), 'NETWORK_ERROR')
    }
    setDelivering(null)
  }

  const resend = async (entry: ScanLogEntry) => {
    setResending(entry.scanId)
    try {
      const res = await fetch('/api/admin/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-token': sessionToken },
        body: JSON.stringify({ scanId: entry.scanId }),
      })
      const data = await res.json()
      if (res.ok) {
        notify('success', `Report resent to ${data.to}`, data.downloadUrl ? `Download: ${data.downloadUrl}` : undefined)
      } else {
        notify('error', 'Resend failed', data.error, `HTTP ${res.status}`)
      }
    } catch (e) {
      notify('error', 'Network error', String(e), 'NETWORK_ERROR')
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060810', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, rgba(6,182,212,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <form onSubmit={login} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 20, width: 360, background: '#0d1117', border: '1px solid #21262d', borderRadius: 16, padding: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <div style={{ padding: 10, background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.35em', color: '#22d3ee', textTransform: 'uppercase', marginBottom: 4 }}>Queldrex</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px' }}>Triage System</div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>Authorized personnel only</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Access key"
                value={secret}
                onChange={e => setSecret(e.target.value)}
                autoFocus
                disabled={loginLocked}
                style={{ padding: '12px 44px 12px 14px', borderRadius: 8, border: `1px solid ${error ? '#ef4444' : '#21262d'}`, background: '#0a0f1a', color: '#f1f5f9', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' as const }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#475569' }}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6-digit authenticator code"
                value={totpCode}
                onChange={e => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={loginLocked}
                style={{ padding: '12px 14px', borderRadius: 8, border: `1px solid ${error && error.includes('authenticator') ? '#ef4444' : '#21262d'}`, background: '#0a0f1a', color: '#f1f5f9', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' as const, letterSpacing: '0.2em' }}
              />
              <p style={{ fontSize: 10, color: '#334155', margin: 0 }}>Leave blank if 2FA not yet configured</p>
            </div>
            {error && (
              <p style={{ color: '#f87171', fontSize: 12, margin: 0 }}>{error}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || loginLocked}
            style={{ padding: '12px 14px', borderRadius: 8, background: loginLocked ? '#1e293b' : '#0891b2', color: loginLocked ? '#475569' : '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: loginLocked ? 'not-allowed' : 'pointer', width: '100%' }}
          >
            {loginLocked ? 'Too many attempts — refresh and try again' : loading ? 'Verifying…' : 'Access Triage System'}
          </button>
          <p style={{ fontSize: 10, color: '#1e293b', textAlign: 'center', margin: 0 }}>
            This system is monitored. Unauthorized access is prohibited.
          </p>
        </form>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060810', color: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>

      {/* Top bar */}
      <div style={{ background: '#0d1117', borderBottom: '1px solid #21262d', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 8px rgba(34,211,238,0.6)' }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', color: '#22d3ee', textTransform: 'uppercase' }}>Queldrex</span>
          <span style={{ color: '#21262d' }}>|</span>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', color: '#64748b', textTransform: 'uppercase' }}>Triage System</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#334155' }}>Secure session active</span>
          <button
            onClick={() => { loadScans(sessionToken); loadApplications(sessionToken); loadFeedback(sessionToken); loadSecurity(sessionToken) }}
            style={{ padding: '5px 14px', borderRadius: 6, background: '#161b22', color: '#64748b', border: '1px solid #21262d', cursor: 'pointer', fontSize: 12 }}
          >
            ↻ Refresh all
          </button>
        </div>
      </div>

      {/* Nav tabs */}
      <div style={{ background: '#0d1117', borderBottom: '1px solid #21262d', padding: '0 24px', display: 'flex', overflowX: 'auto', position: 'sticky', top: 56, zIndex: 9 }}>
        {([
          { id: 'overview', label: 'Overview', badge: null as number | null },
          { id: 'scans', label: 'Scans', badge: null as number | null },
          { id: 'downloads', label: 'Reports', badge: downloads.length > 0 ? downloads.length : null as number | null },
          { id: 'applications', label: 'Pipeline', badge: applications.filter(a => a.status === 'new' && (!lastSeenPipelineAt || a.createdAt > lastSeenPipelineAt)).length || null as number | null },
          { id: 'feedback', label: 'Feedback', badge: feedback.filter(f => !readIds.has(f.id)).length || null as number | null },
          { id: 'security', label: 'Security', badge: secFlagged.length > 0 ? secFlagged.length : null as number | null },
          { id: 'toolrequests', label: 'Tool Requests', badge: toolRequests.filter(r => r.status === 'new').length || null as number | null },
          { id: 'buildrequests', label: 'Build Requests', badge: buildRequests.filter(r => r.status === 'new').length || null as number | null },
          { id: 'legal', label: 'Compliance', badge: null as number | null },
          { id: 'test', label: 'System Test', badge: null as number | null },
          { id: 'revenue', label: 'Revenue', badge: null as number | null },
        ] as { id: typeof tab; label: string; badge: number | null }[]).map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            style={{
              padding: '14px 18px', background: 'transparent', border: 'none',
              borderBottom: tab === item.id ? '2px solid #22d3ee' : '2px solid transparent',
              color: tab === item.id ? '#e2e8f0' : '#64748b',
              fontSize: 12, fontWeight: tab === item.id ? 600 : 400,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
            }}
          >
            {item.label}
            {item.badge != null && item.badge > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', borderRadius: 99, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>{item.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Notification toasts */}
      {notifications.length > 0 && (
        <div style={{ position: 'fixed', top: 116, right: 20, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 380 }}>
          {notifications.map(n => (
            <div key={n.id} style={{ background: n.type === 'success' ? '#0d2218' : n.type === 'warning' ? '#1c1400' : '#1c0a0a', border: `1px solid ${n.type === 'success' ? '#166534' : n.type === 'warning' ? '#78350f' : '#7f1d1d'}`, borderRadius: 10, padding: '12px 16px', boxShadow: '0 4px 24px rgba(0,0,0,0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: n.detail || n.code ? 4 : 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: n.type === 'success' ? '#14532d' : n.type === 'warning' ? '#78350f' : '#7f1d1d', color: n.type === 'success' ? '#4ade80' : n.type === 'warning' ? '#fbbf24' : '#f87171' }}>
                      {n.type === 'success' ? 'SUCCESS' : n.type === 'warning' ? 'WARNING' : 'ERROR'}
                    </span>
                    {n.code && <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#475569', background: '#0d1117', padding: '1px 6px', borderRadius: 4 }}>{n.code}</span>}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.4 }}>{n.title}</div>
                  {n.detail && <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, lineHeight: 1.4 }}>{n.detail}</div>}
                </div>
                <button onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 16, lineHeight: 1, flexShrink: 0, padding: '0 2px' }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>

        {tab === 'overview' && (
          <OverviewTab
            totalScans={total}
            paidCount={paidCount}
            conversionRate={conversionRate}
            newApplications={applications.filter(a => a.status === 'new').length}
            activeDfy={applications.filter(a => a.status === 'paid').length}
            recentScans={entries.slice(0, 5)}
            recentApps={applications.slice(0, 5)}
            baseUrl={BASE_URL}
            onNavigate={(t) => setTab(t as typeof tab)}
          />
        )}

        {tab === 'scans' && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Total Scans', value: total, color: '#22d3ee' },
                { label: 'Paid', value: paidCount, color: '#4ade80' },
                { label: 'Unpaid', value: entries.length - paidCount, color: '#f1f5f9' },
                { label: 'Conversion', value: `${conversionRate}%`, color: '#a78bfa' },
              ].map(stat => (
                <div key={stat.label} style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 12, padding: '16px 20px' }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: stat.color, letterSpacing: '-1px' }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {(['all', 'paid', 'unpaid'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '6px 16px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: filter === f ? 600 : 400,
                  background: filter === f ? '#083344' : '#0d1117', color: filter === f ? '#22d3ee' : '#475569',
                  border: `1px solid ${filter === f ? '#0e7490' : '#21262d'}`,
                }}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Table */}
            <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #21262d', background: '#0a0f1a' }}>
                    {['Domain', 'Email', 'Score', 'Status', 'Date', 'Action'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#444' }}>No entries</td></tr>
                  )}
                  {filtered.map(entry => (
                    <tr key={entry.scanId} style={{ borderBottom: '1px solid #161b22' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#e2e8f0' }}>{entry.domain}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{entry.email}</td>
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
                      <td style={{ padding: '12px 16px', color: '#475569', fontSize: 12 }}>
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
            <p style={{ marginTop: 12, fontSize: 11, color: '#334155' }}>Showing {filtered.length} of {total} total scans · Auto-refreshes every 30s</p>
          </>
        )}

        {tab === 'downloads' && (
          <>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', margin: '0 0 4px' }}>Reports Issued</h2>
              <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>
                Customers who paid and received their AI Visibility Report. Download tokens expire 7 days after issuance.
              </p>
            </div>
            {loading && <p style={{ color: '#475569', fontSize: 13 }}>Loading...</p>}
            {!loading && downloads.length === 0 && (
              <div style={{ padding: '48px 32px', textAlign: 'center', background: '#0d1117', border: '1px solid #21262d', borderRadius: 12 }}>
                <p style={{ color: '#334155', margin: 0, fontSize: 13 }}>No reports issued yet. Reports appear here after Stripe payment confirmation or manual delivery.</p>
              </div>
            )}
            {downloads.length > 0 && (
              <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #21262d', background: '#0a0f1a' }}>
                      {['Domain', 'Email', 'Score', 'Delivered', 'Download Link'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {downloads.map(entry => (
                      <tr key={entry.scanId} style={{ borderBottom: '1px solid #161b22' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#e2e8f0' }}>{entry.domain}</td>
                        <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 12 }}>{entry.email}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ color: entry.score >= 80 ? '#4ade80' : entry.score >= 50 ? '#facc15' : '#f87171', fontWeight: 700 }}>
                            {entry.score}/100
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#475569', fontSize: 12 }}>
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
                              style={{ padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: '#052e16', color: '#4ade80', border: '1px solid #166534', textDecoration: 'none' }}
                            >
                              Open ↗
                            </a>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`${BASE_URL}/download/${entry.downloadToken}`)
                                notify('success', 'Download link copied to clipboard', entry.domain)
                              }}
                              style={{ padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: '#161b22', color: '#64748b', border: '1px solid #21262d', cursor: 'pointer' }}
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
            {downloads.length > 0 && <p style={{ marginTop: 12, fontSize: 11, color: '#334155' }}>{downloads.length} report{downloads.length !== 1 ? 's' : ''} delivered</p>}
          </>
        )}

        {tab === 'applications' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', margin: '0 0 4px' }}>DFY Pipeline</h2>
              <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>Manage Done-For-You service applications from first contact to completion.</p>
            </div>
            {appsLoading && <p style={{ color: '#475569', fontSize: 13 }}>Loading...</p>}
            {!appsLoading && applications.length === 0 && (
              <div style={{ padding: '48px 32px', textAlign: 'center', background: '#0d1117', border: '1px solid #21262d', borderRadius: 12 }}>
                <p style={{ color: '#334155', margin: 0, fontSize: 13 }}>No applications yet. Applications appear when clients submit the DFY form.</p>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {applications.map(app => {
                const statusColors: Record<string, { bg: string; color: string; border: string }> = {
                  new:           { bg: '#1e1b4b', color: '#818cf8', border: '#312e81' },
                  contacted:     { bg: '#0d2218', color: '#4ade80', border: '#166534' },
                  payment_sent:  { bg: '#0c1929', color: '#60a5fa', border: '#1e40af' },
                  paid:          { bg: '#052e16', color: '#4ade80', border: '#166534' },
                  rejected:      { bg: '#0d1117', color: '#475569', border: '#21262d' },
                  complete:      { bg: '#031d2a', color: '#22d3ee', border: '#0e7490' },
                }
                const sc = statusColors[app.status] || statusColors.new
                const priorityColors: Record<string, string> = { critical: '#f87171', high: '#fb923c', medium: '#facc15', low: '#64748b' }
                const ticketId = `QT-${String(app.ticketNumber || 0).padStart(4, '0')}`
                const appPriority = app.priority || 'medium'
                return (
                  <div key={app.id} style={{ background: '#0d1117', border: `1px solid ${app.status === 'new' ? '#312e81' : '#21262d'}`, borderRadius: 12, padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                          {app.ticketNumber && <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: '#22d3ee', background: '#083344', border: '1px solid #0e7490', padding: '1px 6px', borderRadius: 4 }}>{ticketId}</span>}
                          {app.status === 'new' && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f87171', boxShadow: '0 0 6px #f87171', flexShrink: 0, display: 'inline-block' }} />}
                          <span style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>{app.name}</span>
                          <span style={{ fontSize: 12, color: '#475569' }}>{app.email}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: '#22d3ee' }}>{app.url}</span>
                          <span style={{ fontSize: 11, color: '#21262d' }}>·</span>
                          <span style={{ fontSize: 12, color: '#475569', textTransform: 'capitalize' }}>{app.platform}</span>
                          {app.score !== undefined && (
                            <>
                              <span style={{ fontSize: 11, color: '#21262d' }}>·</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: app.score >= 80 ? '#4ade80' : app.score >= 50 ? '#facc15' : '#f87171' }}>{app.score}/100</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <select
                          value={appPriority}
                          disabled={!!updatingPriority[app.id]}
                          onChange={async e => {
                            const p = e.target.value
                            setUpdatingPriority(prev => ({ ...prev, [app.id]: true }))
                            setApplications(prev => prev.map(a => a.id === app.id ? { ...a, priority: p as DfyApplication['priority'] } : a))
                            await fetch('/api/admin/applications', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-session-token': sessionToken }, body: JSON.stringify({ id: app.id, priority: p }) }).catch(() => {})
                            setUpdatingPriority(prev => ({ ...prev, [app.id]: false }))
                          }}
                          style={{ padding: '2px 8px', borderRadius: 6, background: '#0d1117', color: priorityColors[appPriority], border: `1px solid ${priorityColors[appPriority]}`, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                        >
                          <option value="critical">CRITICAL</option>
                          <option value="high">HIGH</option>
                          <option value="medium">MEDIUM</option>
                          <option value="low">LOW</option>
                        </select>
                        <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {app.status.replace('_', ' ')}
                        </span>
                        <span style={{ fontSize: 11, color: '#334155' }}>
                          {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, margin: '0 0 12px', padding: '12px 16px', background: '#080d14', borderRadius: 8, border: '1px solid #161b22' }}>
                      {app.message}
                    </p>

                    <div style={{ marginBottom: 16 }}>
                      <textarea
                        defaultValue={app.notes || ''}
                        placeholder="Internal notes (only you see this)..."
                        rows={2}
                        onBlur={async e => {
                          const notes = e.target.value
                          setApplications(prev => prev.map(a => a.id === app.id ? { ...a, notes } : a))
                          await fetch('/api/admin/applications', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-session-token': sessionToken }, body: JSON.stringify({ id: app.id, notes }) }).catch(() => {})
                          setNotesFlash(prev => ({ ...prev, [app.id]: true }))
                          setTimeout(() => setNotesFlash(prev => ({ ...prev, [app.id]: false })), 2000)
                        }}
                        style={{ background: '#080d14', border: '1px solid #161b22', color: '#94a3b8', fontSize: 12, borderRadius: 6, padding: 8, width: '100%', resize: 'vertical', boxSizing: 'border-box', outline: 'none', fontFamily: 'system-ui, sans-serif' }}
                      />
                      {notesFlash[app.id] && <span style={{ fontSize: 10, color: '#4ade80', marginLeft: 4 }}>Saved</span>}
                    </div>

                    {app.statusHistory && app.statusHistory.length > 0 && (
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                        {app.statusHistory.map((h, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#334155', flexShrink: 0 }} />
                            <span style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', fontWeight: 600 }}>{h.status.replace('_', ' ')}</span>
                            <span style={{ fontSize: 10, color: '#1e293b' }}>{new Date(h.at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {app.status !== 'rejected' && app.status !== 'paid' && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {/* Step 1: new → send discovery/scheduling email */}
                        {app.status === 'new' && (
                          <button
                            onClick={() => sendDiscovery(app)}
                            disabled={sendingDiscovery === app.id}
                            style={{ padding: '6px 16px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600, background: '#1c3a1c', color: '#4ade80', border: '1px solid #166534' }}
                          >
                            {sendingDiscovery === app.id ? 'Sending…' : '📅 Send Discovery Email'}
                          </button>
                        )}
                        {/* Step 2: contacted → send payment link */}
                        {app.status === 'contacted' && (
                          <button
                            onClick={() => sendPaymentLink(app)}
                            disabled={sendingPayment === app.id}
                            style={{ padding: '6px 16px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600, background: '#1e1b4b', color: '#818cf8', border: '1px solid #312e81' }}
                          >
                            {sendingPayment === app.id ? 'Sending…' : '💳 Send Payment Link ($499)'}
                          </button>
                        )}
                        {/* Resend if payment already sent */}
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

                        {/* Mark Complete — deletes credentials + emails client proof of deletion */}
                        {app.implemented && (
                          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #1a2233' }}>
                            <button
                              onClick={() => completeDfy(app)}
                              disabled={completing === app.id}
                              style={{ padding: '6px 16px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 700, background: '#083344', color: '#22d3ee', border: '1px solid #0e7490' }}
                            >
                              {completing === app.id ? '🔒 Deleting…' : '🔒 Mark Complete & Delete Credentials'}
                            </button>
                            <p style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>Permanently wipes their passwords from our system and emails them a deletion receipt.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Credentials deleted confirmation */}
                    {app.status === 'complete' && (
                      <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, background: '#031d2a', border: '1px solid #0e7490' }}>
                        <span style={{ fontSize: 11, color: '#22d3ee', fontWeight: 600 }}>🔒 Complete — credentials permanently deleted, receipt sent to {app.email}</span>
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
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', margin: '0 0 4px' }}>Feedback</h2>
              <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>Messages submitted through the feedback form. Click any card to read the full message.</p>
            </div>
            {fbLoading && <p style={{ color: '#475569', fontSize: 13 }}>Loading...</p>}
            {!fbLoading && feedback.length === 0 && (
              <div style={{ padding: '48px 32px', textAlign: 'center', background: '#0d1117', border: '1px solid #21262d', borderRadius: 12 }}>
                <p style={{ color: '#334155', margin: 0, fontSize: 13 }}>No feedback yet. Customer messages appear here when submitted.</p>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {feedback.map(entry => (
                <FeedbackCard key={entry.id} entry={entry} isRead={readIds.has(entry.id)} onRead={() => markRead(entry.id)} />
              ))}
            </div>
          </div>
        )}

        {tab === 'security' && (
          <SecurityTab log={secLog} flagged={secFlagged} loading={secLoading} onRefresh={() => loadSecurity(sessionToken)} />
        )}

        {tab === 'toolrequests' && (
          <RequestsTab
            title="Tool Requests"
            subtitle="Submitted via /request-tool — what users want built next"
            requests={toolRequests}
            loading={trLoading}
            onRefresh={() => loadToolRequests(sessionToken)}
            statusColors={{ new: '#22d3ee', reviewing: '#a78bfa', planned: '#fbbf24', building: '#f97316', live: '#4ade80', declined: '#ef4444' }}
            onStatusChange={async (id, status) => {
              await fetch('/api/tool-requests', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-session-token': sessionToken }, body: JSON.stringify({ id, status }) })
              setToolRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
            }}
            statuses={['new', 'reviewing', 'planned', 'building', 'live', 'declined']}
            nameField="toolName"
          />
        )}

        {tab === 'buildrequests' && (
          <RequestsTab
            title="Build Requests"
            subtitle="Submitted via /services — custom project quote requests"
            requests={buildRequests}
            loading={brLoading}
            onRefresh={() => loadBuildRequests(sessionToken)}
            statusColors={{ new: '#22d3ee', reviewing: '#a78bfa', quoted: '#fbbf24', building: '#f97316', complete: '#4ade80', declined: '#ef4444' }}
            onStatusChange={async (id, status) => {
              await fetch('/api/build-request', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-session-token': sessionToken }, body: JSON.stringify({ id, status }) })
              setBuildRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
            }}
            statuses={['new', 'reviewing', 'quoted', 'building', 'complete', 'declined']}
            nameField="serviceType"
          />
        )}

        {tab === 'legal' && <LegalTab />}

        {tab === 'test' && <TestTab sessionToken={sessionToken} baseUrl={BASE_URL} notify={notify} />}

        {tab === 'revenue' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', margin: '0 0 4px' }}>Revenue</h2>
                <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>Live data from Stripe — active subscriptions and recent completed checkouts.</p>
              </div>
              <button onClick={() => loadRevenue(sessionToken)} style={{ padding: '6px 14px', borderRadius: 6, background: '#161b22', color: '#64748b', border: '1px solid #21262d', cursor: 'pointer', fontSize: 12 }}>↻ Refresh</button>
            </div>
            {revenueLoading && <p style={{ color: '#475569', fontSize: 13 }}>Loading Stripe data…</p>}
            {revenue && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  {[
                    { label: 'MRR', value: `$${revenue.mrr.toFixed(2)}`, color: '#4ade80' },
                    { label: 'Active Subscriptions', value: String(revenue.activeSubscriptions), color: '#22d3ee' },
                    { label: 'Last 20 Sales', value: `$${revenue.totalRevenueLast20.toFixed(2)}`, color: '#a78bfa' },
                  ].map(stat => (
                    <div key={stat.label} style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 12, padding: '18px 22px' }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: stat.color, letterSpacing: '-1px' }}>{stat.value}</div>
                      <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#334155', marginBottom: 12 }}>Recent Sales</p>
                  <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 12, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #21262d', background: '#0a0f1a' }}>
                          {['Customer', 'Product', 'Amount', 'Date'].map(h => (
                            <th key={h} style={{ padding: '11px 16px', textAlign: h === 'Amount' || h === 'Date' ? 'right' : 'left', color: '#475569', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {revenue.recentSales.length === 0 && (
                          <tr><td colSpan={4} style={{ padding: 32, textAlign: 'center', color: '#334155' }}>No completed sales in recent sessions</td></tr>
                        )}
                        {revenue.recentSales.map((s, i) => (
                          <tr key={s.id} style={{ borderBottom: '1px solid #161b22', background: i % 2 === 0 ? '#0d1117' : '#0a0f1a' }}>
                            <td style={{ padding: '11px 16px', color: '#94a3b8', fontSize: 12 }}>{s.customerEmail}</td>
                            <td style={{ padding: '11px 16px', color: '#64748b', fontSize: 12 }}>{s.productName}</td>
                            <td style={{ padding: '11px 16px', textAlign: 'right', fontWeight: 700, color: '#e2e8f0' }}>${s.amount.toFixed(2)}</td>
                            <td style={{ padding: '11px 16px', textAlign: 'right', color: '#475569', fontSize: 12 }}>{new Date(s.created * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Requests Tab (shared for Tool Requests + Build Requests) ─────────────────

function RequestsTab({ title, subtitle, requests, loading, onRefresh, statusColors, onStatusChange, statuses, nameField }: {
  title: string; subtitle: string
  requests: Array<Record<string, string>>
  loading: boolean; onRefresh: () => void
  statusColors: Record<string, string>
  onStatusChange: (id: string, status: string) => Promise<void>
  statuses: string[]
  nameField: string
}) {
  const [open, setOpen] = useState<string | null>(null)
  const selected = requests.find(r => r.id === open)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{title}</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>{subtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#475569' }}>{requests.length} total</span>
          <button onClick={onRefresh} style={{ padding: '6px 14px', borderRadius: 6, background: '#161b22', color: '#64748b', border: '1px solid #21262d', cursor: 'pointer', fontSize: 12 }}>↻ Refresh</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#475569' }}>Loading…</div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#334155', background: '#0d1117', borderRadius: 12, border: '1px solid #21262d' }}>
          No requests yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {requests.map(r => (
            <div
              key={r.id}
              onClick={() => setOpen(r.id)}
              style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 10, padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                    color: statusColors[r.status] || '#888',
                    background: `${statusColors[r.status] || '#888'}18`,
                    border: `1px solid ${statusColors[r.status] || '#888'}44`,
                  }}>{r.status}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r[nameField] || '—'}</span>
                </div>
                <div style={{ fontSize: 12, color: '#475569' }}>{r.name} · {r.email}{r.company ? ` · ${r.company}` : ''}</div>
              </div>
              <div style={{ fontSize: 12, color: '#334155', whiteSpace: 'nowrap' }}>
                {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div onClick={() => setOpen(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 14, padding: 32, maxWidth: 600, width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{selected[nameField] || '—'}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{selected.name} · <a href={`mailto:${selected.email}`} style={{ color: '#22d3ee', textDecoration: 'none' }}>{selected.email}</a>{selected.company ? ` · ${selected.company}` : ''}</div>
              </div>
              <button onClick={() => setOpen(null)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {selected.budget && <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}>Budget: {selected.budget}</span>}
              {selected.timeline && <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}>Timeline: {selected.timeline}</span>}
              {selected.category && <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}>Category: {selected.category}</span>}
              {selected.useCase && <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}>Use case: {selected.useCase}</span>}
            </div>

            <div style={{ background: '#070b14', borderRadius: 8, padding: '14px 16px', marginBottom: 20 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#cbd5e1', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selected.description}</p>
            </div>

            <div style={{ marginBottom: 4, fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Update Status</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {statuses.map(s => (
                <button
                  key={s}
                  onClick={() => onStatusChange(selected.id, s)}
                  style={{
                    padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: '1px solid',
                    background: selected.status === s ? `${statusColors[s] || '#888'}22` : 'transparent',
                    borderColor: selected.status === s ? (statusColors[s] || '#888') : '#21262d',
                    color: selected.status === s ? (statusColors[s] || '#888') : '#475569',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #21262d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#334155' }}>{new Date(selected.createdAt).toLocaleString()}</span>
              <a href={`mailto:${selected.email}?subject=Re: Your Queldrex request`} style={{ padding: '7px 16px', borderRadius: 6, background: '#0891b2', color: '#000', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                Reply →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Overview Dashboard ──────────────────────────────────────────────────────

function OverviewTab({ totalScans, paidCount, conversionRate, newApplications, activeDfy, recentScans, recentApps, baseUrl, onNavigate }: {
  totalScans: number; paidCount: number; conversionRate: string
  newApplications: number; activeDfy: number
  recentScans: Array<{ scanId: string; domain: string; email: string; score: number; paid: boolean }>
  recentApps: Array<{ id: string; name: string; email: string; url: string; status: string }>
  baseUrl: string; onNavigate: (tab: string) => void
}) {
  const metrics = [
    { label: 'Total Scans', value: totalScans, color: '#22d3ee', sub: 'all time' },
    { label: 'Paid Customers', value: paidCount, color: '#4ade80', sub: 'reports delivered' },
    { label: 'New Applications', value: newApplications, color: newApplications > 0 ? '#f87171' : '#334155', sub: newApplications > 0 ? 'needs attention' : 'none pending' },
    { label: 'Conversion Rate', value: `${conversionRate}%`, color: '#a78bfa', sub: 'scan → purchase' },
  ]

  const statusColor: Record<string, string> = {
    new: '#818cf8', contacted: '#4ade80', payment_sent: '#60a5fa',
    paid: '#4ade80', complete: '#22d3ee', rejected: '#475569',
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', margin: '0 0 4px' }}>Triage Overview</h2>
        <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>Live snapshot of your Queldrex operation.</p>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {metrics.map(m => (
          <div key={m.label} style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 12, padding: '20px 22px' }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: m.color, marginBottom: 4, letterSpacing: '-1px' }}>{m.value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 2 }}>{m.label}</div>
            <div style={{ fontSize: 11, color: '#334155' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Recent scans */}
        <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Recent Scans</span>
            <button onClick={() => onNavigate('scans')} style={{ fontSize: 11, color: '#22d3ee', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>View all →</button>
          </div>
          {recentScans.length === 0
            ? <p style={{ color: '#21262d', fontSize: 12, margin: 0 }}>No scans yet</p>
            : recentScans.map(s => (
              <div key={s.scanId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #161b22' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0' }}>{s.domain}</div>
                  <div style={{ fontSize: 11, color: '#334155' }}>{s.email}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: s.score >= 80 ? '#4ade80' : s.score >= 50 ? '#facc15' : '#f87171' }}>{s.score}/100</div>
                  <div style={{ fontSize: 10, color: s.paid ? '#4ade80' : '#334155', fontWeight: 600 }}>{s.paid ? 'PAID' : 'FREE'}</div>
                </div>
              </div>
            ))
          }
        </div>

        {/* DFY Pipeline */}
        <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.12em' }}>DFY Pipeline</span>
            <button onClick={() => onNavigate('applications')} style={{ fontSize: 11, color: '#22d3ee', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>View all →</button>
          </div>
          {recentApps.length === 0
            ? <p style={{ color: '#21262d', fontSize: 12, margin: 0 }}>No applications yet</p>
            : recentApps.map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #161b22' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.url}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, color: statusColor[a.status] || '#64748b', border: '1px solid currentColor', whiteSpace: 'nowrap', marginLeft: 8, flexShrink: 0 }}>
                  {a.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            ))
          }
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>Quick Actions</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a href={`${baseUrl}/scanner`} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: '#161b22', color: '#94a3b8', border: '1px solid #21262d', textDecoration: 'none' }}>
            Open Scanner ↗
          </a>
          <button onClick={() => onNavigate('applications')} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: newApplications > 0 ? '#1e1b4b' : '#161b22', color: newApplications > 0 ? '#818cf8' : '#94a3b8', border: `1px solid ${newApplications > 0 ? '#312e81' : '#21262d'}`, cursor: 'pointer' }}>
            {newApplications > 0 ? `${newApplications} New Application${newApplications > 1 ? 's' : ''}` : 'Pipeline'}
          </button>
          {activeDfy > 0 && (
            <button onClick={() => onNavigate('applications')} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: '#14532d', color: '#4ade80', border: '1px solid #166534', cursor: 'pointer' }}>
              {activeDfy} Active DFY
            </button>
          )}
          <button onClick={() => onNavigate('legal')} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: '#161b22', color: '#94a3b8', border: '1px solid #21262d', cursor: 'pointer' }}>
            Compliance
          </button>
          <button onClick={() => onNavigate('test')} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: '#161b22', color: '#94a3b8', border: '1px solid #21262d', cursor: 'pointer' }}>
            System Test
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Security Monitor Tab ───────────────────────────────────────────────────

function SecurityTab({ log, flagged, loading, onRefresh }: {
  log: SecurityLogEntry[]
  flagged: Array<{ ip: string; count: number }>
  loading: boolean
  onRefresh: () => void
}) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', margin: '0 0 4px' }}>Security Monitor</h2>
        <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>All admin access attempts are logged. Flagged IPs have 3+ failed attempts.</p>
      </div>

      {flagged.length > 0 && (
        <div style={{ background: '#1c0a0a', border: '1px solid #7f1d1d', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            ⚠ Suspicious IPs — {flagged.length} flagged
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {flagged.map(f => (
              <div key={f.ip} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#0d0606', borderRadius: 8, border: '1px solid #450a0a' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#fca5a5' }}>{f.ip}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#f87171', background: '#450a0a', padding: '2px 8px', borderRadius: 99 }}>{f.count} failed attempts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Events', value: log.length, color: '#22d3ee' },
          { label: 'Failed Attempts', value: log.filter(e => !e.success).length, color: '#f87171' },
          { label: 'Successful Logins', value: log.filter(e => e.success && e.action === 'login').length, color: '#4ade80' },
        ].map(s => (
          <div key={s.label} style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color, letterSpacing: '-1px', marginBottom: 2 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#475569' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #21262d', background: '#0a0f1a' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Access Log (last 200)</span>
          <button onClick={onRefresh} disabled={loading} style={{ padding: '4px 12px', borderRadius: 6, background: '#161b22', color: '#64748b', border: '1px solid #21262d', cursor: 'pointer', fontSize: 11 }}>
            {loading ? 'Loading…' : '↻ Refresh'}
          </button>
        </div>
        {loading && <p style={{ color: '#475569', fontSize: 12, padding: '20px 18px', margin: 0 }}>Loading security log…</p>}
        {!loading && log.length === 0 && <p style={{ color: '#334155', fontSize: 12, padding: '32px 18px', margin: 0, textAlign: 'center' }}>No events yet. Events are logged when admin APIs are accessed.</p>}
        {!loading && log.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #161b22' }}>
                {['Time', 'IP', 'Path', 'Result', 'Action'].map(h => (
                  <th key={h} style={{ padding: '8px 16px', textAlign: 'left', color: '#334155', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {log.map(e => (
                <tr key={e.id} style={{ borderBottom: '1px solid #0d1117', background: e.success ? 'transparent' : 'rgba(127,29,29,0.15)' }}>
                  <td style={{ padding: '7px 16px', color: '#334155', fontFamily: 'monospace', fontSize: 11, whiteSpace: 'nowrap' }}>
                    {new Date(e.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td style={{ padding: '7px 16px', fontFamily: 'monospace', color: e.success ? '#64748b' : '#fca5a5', fontSize: 11 }}>{e.ip}</td>
                  <td style={{ padding: '7px 16px', color: '#475569', fontFamily: 'monospace', fontSize: 11 }}>{e.path}</td>
                  <td style={{ padding: '7px 16px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: e.success ? '#052e16' : '#450a0a', color: e.success ? '#4ade80' : '#f87171' }}>
                      {e.success ? 'OK' : 'DENIED'}
                    </span>
                  </td>
                  <td style={{ padding: '7px 16px', color: '#334155', fontSize: 11 }}>{e.action || e.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── Legal Compliance Tab ───────────────────────────────────────────────────

const LEGAL_DOCS = [
  { name: 'Privacy Policy', href: '/privacy', lastUpdated: '2026-06-17', intervalDays: 180 },
  { name: 'Terms of Service', href: '/terms', lastUpdated: '2026-06-17', intervalDays: 180 },
  { name: 'Refund Policy', href: '/refunds', lastUpdated: '2026-06-19', intervalDays: 180 },
]

const REVIEW_CHECKLIST = [
  'Are all data collection practices still accurately described in the Privacy Policy?',
  'Did you add new third-party services? Add them to Privacy Policy Section 4.',
  'Did data retention periods change?',
  'New features, tools, or pricing changes? Update Terms of Service and Refund Policy.',
  'Are you selling in any new U.S. states? May need state-specific privacy rights.',
  'Did Colorado CPA or CCPA rules change? Check state AG websites.',
  'Is the Queldrex LLC business email and address still correct on all pages?',
]

const IMMEDIATE_TRIGGERS = [
  'Adding a new product that collects different data — update Privacy Policy same day',
  'Changing how long you store personal data — update immediately',
  'Adding a new payment processor — update Privacy Policy Section 4',
  'A data breach — notify affected users within 72 hours (CCPA / general best practice)',
  'New data sharing arrangement with a partner',
]

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
}

function nextReviewDate(dateStr: string, intervalDays: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + intervalDays)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysUntilReview(dateStr: string, intervalDays: number): number {
  const reviewMs = new Date(dateStr).getTime() + intervalDays * 86_400_000
  return Math.ceil((reviewMs - Date.now()) / 86_400_000)
}

function TestTab({ sessionToken, baseUrl, notify }: { sessionToken: string; baseUrl: string; notify: (type: 'success' | 'error' | 'warning', title: string, detail?: string, code?: string) => void }) {
  const [health, setHealth] = useState<Record<string, { ok: boolean; detail: string }> | null>(null)
  const [healthLoading, setHealthLoading] = useState(false)
  const [seededApp, setSeededApp] = useState<{ applicationId: string; dfyToken: string | null; links: { admin: string; implPage: string | null } } | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [cleaning, setCleaning] = useState(false)

  const runHealthCheck = async () => {
    setHealthLoading(true)
    try {
      const res = await fetch('/api/admin/test', { headers: { 'x-session-token': sessionToken } })
      const data = await res.json()
      setHealth(data.checks)
      const failed = Object.entries(data.checks as Record<string, { ok: boolean; detail: string }>).filter(([, v]) => !v.ok)
      if (failed.length === 0) notify('success', 'All systems operational')
      else failed.forEach(([key, v]) => notify('error', `${key} check failed`, v.detail, `CHECK_${key.toUpperCase()}`))
    } catch (e) { notify('error', 'Health check failed', String(e), 'HEALTH_CHECK_ERROR') }
    setHealthLoading(false)
  }

  const seedTest = async (stage: string) => {
    setSeeding(true)
    try {
      const res = await fetch('/api/admin/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-token': sessionToken },
        body: JSON.stringify({ stage }),
      })
      const data = await res.json()
      if (data.ok) { setSeededApp(data); notify('success', `Test application seeded at stage: ${stage}`, `ID: ${data.applicationId}`) }
      else notify('error', 'Seed failed', data.error, `HTTP ${res.status}`)
    } catch (e) { notify('error', 'Network error', String(e), 'NETWORK_ERROR') }
    setSeeding(false)
  }

  const cleanup = async () => {
    setCleaning(true)
    try {
      const res = await fetch('/api/admin/test', { method: 'DELETE', headers: { 'x-session-token': sessionToken } })
      const data = await res.json()
      notify('success', `Cleaned up ${data.deleted} test application(s)`)
      setSeededApp(null)
    } catch (e) { notify('error', 'Cleanup failed', String(e), 'CLEANUP_ERROR') }
    setCleaning(false)
  }

  const checkColor = (ok: boolean) => ok ? '#4ade80' : '#f87171'
  const checkIcon = (ok: boolean) => ok ? '✓' : '✗'

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>System Test Panel</h2>
        <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>Health check all services and run end-to-end flow tests. Error codes appear as notification toasts.</p>
      </div>

      {/* Health Check */}
      <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>System Health</h3>
          <button onClick={runHealthCheck} disabled={healthLoading} style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600, background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}>
            {healthLoading ? 'Checking…' : 'Run Health Check'}
          </button>
        </div>
        {health ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            {Object.entries(health).map(([key, val]) => (
              <tr key={key}>
                <td style={{ padding: '5px 0', fontSize: 12, color: '#64748b', textTransform: 'capitalize', width: '30%' }}>{key.replace(/([A-Z])/g, ' $1')}</td>
                <td style={{ padding: '5px 0', fontSize: 12, fontWeight: 700, color: checkColor(val.ok) }}>{checkIcon(val.ok)}</td>
                <td style={{ padding: '5px 0', fontSize: 12, color: '#94a3b8' }}>{val.detail}</td>
              </tr>
            ))}
          </table>
        ) : (
          <p style={{ color: '#444', fontSize: 12, margin: 0 }}>Click Run Health Check to test all services.</p>
        )}
      </div>

      {/* Flow Test */}
      <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>DFY Flow Test — Step by Step</h3>
        <div style={{ fontSize: 12, color: '#64748b', lineHeight: 2, marginBottom: 16 }}>
          <div style={{ marginBottom: 8, padding: '10px 14px', background: '#0d1117', borderRadius: 8, border: '1px solid #1e293b' }}>
            <strong style={{ color: '#fbbf24' }}>Seed a test application at any stage:</strong>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {['new', 'contacted', 'payment_sent', 'paid'].map(stage => (
              <button key={stage} onClick={() => seedTest(stage)} disabled={seeding} style={{ padding: '6px 14px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 600, background: stage === 'paid' ? '#14532d' : '#1e293b', color: stage === 'paid' ? '#4ade80' : '#94a3b8', border: `1px solid ${stage === 'paid' ? '#166534' : '#334155'}` }}>
                {seeding ? '…' : `Seed as "${stage}"`}
              </button>
            ))}
          </div>

          {seededApp && (
            <div style={{ background: '#0d2218', border: '1px solid #166534', borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ color: '#4ade80', fontWeight: 700, fontSize: 13, marginBottom: 12 }}>✓ Test application seeded — follow these steps:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { n: 1, text: 'Go to Applications tab → find "TEST: Test Client (test-business.com)"', link: null, action: 'Switch to Applications tab and locate the seeded record' },
                  { n: 2, text: 'Click "Send Discovery Email" → check hello@queldrex.com for the email', link: null, action: null },
                  { n: 3, text: 'Click "Send Payment Link ($499)" → open the link below', link: null, action: null },
                  { n: 4, text: 'On Stripe checkout → click "Add promotion code" → enter TEST100 → pay $0', link: null, action: null },
                  ...(seededApp.links.implPage ? [
                    { n: 5, text: 'Submit credentials + signature:', link: seededApp.links.implPage, action: 'Open credential submission form' },
                    { n: 6, text: 'Back in admin Applications → click "⚙️ Run Implementation" (or skip, then click "🔒 Mark Complete & Delete Credentials")', link: null, action: null },
                    { n: 7, text: 'Check hello@queldrex.com for: signed agreement email + deletion receipt email', link: null, action: null },
                    { n: 8, text: 'Revisit impl page — should show green deletion confirmation:', link: seededApp.links.implPage, action: 'Verify deletion screen' },
                  ] : []),
                ].map(step => (
                  <div key={step.n} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ background: '#052e16', color: '#4ade80', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{step.n}</span>
                    <div>
                      <span style={{ color: '#94a3b8', fontSize: 12 }}>{step.text}</span>
                      {step.link && (
                        <a href={step.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginLeft: 8, padding: '2px 8px', borderRadius: 4, fontSize: 10, background: '#083344', color: '#22d3ee', border: '1px solid #0e7490', textDecoration: 'none' }}>
                          Open →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #166534', fontSize: 11, color: '#4ade80' }}>
                Application ID: <span style={{ fontFamily: 'monospace', color: '#86efac' }}>{seededApp.applicationId}</span>
                {seededApp.dfyToken && <> · dfyToken: <span style={{ fontFamily: 'monospace', color: '#86efac' }}>{seededApp.dfyToken.slice(0, 8)}…</span></>}
              </div>
            </div>
          )}

          <div style={{ padding: '10px 14px', background: '#0d1117', borderRadius: 8, border: '1px solid #1e293b' }}>
            <strong style={{ color: '#e2e8f0', fontSize: 12 }}>Scan Flow Test</strong><br />
            <span>Go to <a href={`${baseUrl}/scanner`} target="_blank" rel="noopener noreferrer" style={{ color: '#22d3ee' }}>{baseUrl}/scanner</a> → scan any website (try <code style={{ background: '#1e293b', padding: '1px 5px', borderRadius: 3 }}>example.com</code> for a low-score baseline) → enter your email → verify score email arrives → click download link → verify download page loads correctly.</span>
          </div>
        </div>

        <button onClick={cleanup} disabled={cleaning} style={{ padding: '6px 14px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 500, background: '#1c1c1c', color: '#666', border: '1px solid #333' }}>
          {cleaning ? 'Cleaning…' : '🗑 Clean Up All Test Data'}
        </button>
      </div>

      {/* Platform coverage */}
      <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 12, padding: 20 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Platform Coverage</h3>
        <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 12px' }}>These are all the platform types the DFY implementation supports. Each has its own credential fields and install process.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
          {[
            { name: 'FTP / cPanel', status: 'Full', color: '#4ade80' },
            { name: 'WordPress', status: 'Full', color: '#4ade80' },
            { name: 'Vercel / Netlify / GitHub', status: 'Full', color: '#4ade80' },
            { name: 'Shopify', status: 'Full', color: '#4ade80' },
            { name: 'Wix', status: 'Manual 48hr', color: '#fbbf24' },
            { name: 'Squarespace', status: 'Manual 48hr', color: '#fbbf24' },
            { name: 'Webflow', status: 'Manual 48hr', color: '#fbbf24' },
            { name: 'Other / Custom', status: 'Manual', color: '#94a3b8' },
          ].map(p => (
            <div key={p.name} style={{ padding: '8px 12px', borderRadius: 8, background: '#0d1117', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 2 }}>{p.name}</div>
              <div style={{ fontSize: 10, color: p.color, fontWeight: 600 }}>{p.status}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: '#475569', margin: '12px 0 0' }}>
          Full = automated implementation via API. Manual = Sean manually applies fixes and delivers within 48 hours.
        </p>
      </div>
    </div>
  )
}

function LegalTab() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', margin: '0 0 4px' }}>Compliance</h2>
        <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>
          Review legal pages every 6 months. Auto-reminder emails fire when any page is within 20 days of its review date.
        </p>
      </div>

      {/* Document status cards */}
      <div style={{ display: 'grid', gap: 12, marginBottom: 32 }}>
        {LEGAL_DOCS.map(doc => {
          const age = daysSince(doc.lastUpdated)
          const daysLeft = daysUntilReview(doc.lastUpdated, doc.intervalDays)
          const isOverdue = daysLeft <= 0
          const isWarning = daysLeft > 0 && daysLeft <= 20
          const statusColor = isOverdue ? '#f87171' : isWarning ? '#fbbf24' : '#4ade80'
          const statusLabel = isOverdue ? `OVERDUE by ${Math.abs(daysLeft)} days` : isWarning ? `Due in ${daysLeft} days` : `Due in ${daysLeft} days`
          const dotColor = isOverdue ? '#f87171' : isWarning ? '#fbbf24' : '#4ade80'

          return (
            <div key={doc.name} style={{ background: '#0d1117', border: `1px solid ${isOverdue ? '#7f1d1d' : isWarning ? '#78350f' : '#21262d'}`, borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: dotColor, flexShrink: 0, boxShadow: `0 0 6px ${dotColor}` }} />
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{doc.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#666' }}>
                    Last updated: {new Date(doc.lastUpdated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    &nbsp;·&nbsp; {age} days ago
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: 12, color: statusColor, fontWeight: 600 }}>{statusLabel}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#555' }}>Next review: {nextReviewDate(doc.lastUpdated, doc.intervalDays)}</p>
                </div>
                <a
                  href={doc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: '6px 14px', borderRadius: 6, background: '#1a1a1a', color: '#888', border: '1px solid #333', fontSize: 12, textDecoration: 'none', flexShrink: 0 }}
                >
                  View page →
                </a>
              </div>
            </div>
          )
        })}
      </div>

      {/* Review checklist */}
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 12, padding: '20px 24px' }}>
          <p style={{ margin: '0 0 14px', fontWeight: 600, fontSize: 13, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>6-Month Review Checklist</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {REVIEW_CHECKLIST.map((item, i) => (
              <label key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
                <input type="checkbox" style={{ marginTop: 2, flexShrink: 0, accentColor: '#6366f1' }} />
                <span style={{ fontSize: 13, color: '#aaa', lineHeight: 1.5 }}>{item}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ background: '#0d1117', border: '1px solid #7f1d1d', borderRadius: 12, padding: '20px 24px' }}>
          <p style={{ margin: '0 0 14px', fontWeight: 600, fontSize: 13, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Update Immediately If...</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {IMMEDIATE_TRIGGERS.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: '#f87171', flexShrink: 0, fontSize: 13 }}>!</span>
                <span style={{ fontSize: 13, color: '#aaa', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20, padding: '14px 20px', background: '#0c1117', border: '1px solid #1e3a5f', borderRadius: 8 }}>
        <p style={{ margin: 0, fontSize: 12, color: '#5b8fc2', lineHeight: 1.6 }}>
          <strong style={{ color: '#7eb8f0' }}>After updating any legal page:</strong> update the <code style={{ background: '#111', padding: '1px 5px', borderRadius: 3 }}>lastUpdated</code> date in{' '}
          <code style={{ background: '#111', padding: '1px 5px', borderRadius: 3 }}>app/api/cron/legal-review/route.ts</code> and the{' '}
          <code style={{ background: '#111', padding: '1px 5px', borderRadius: 3 }}>LEGAL_DOCS</code> array above so the countdown resets.
          Auto-reminder emails go to <strong style={{ color: '#7eb8f0' }}>hello@queldrex.com</strong> starting when any page is within 20 days of its review date.
        </p>
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
