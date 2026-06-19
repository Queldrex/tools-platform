'use client'

import { useState, useEffect, useCallback } from 'react'

interface ScanLogEntry {
  scanId: string
  domain: string
  email: string
  score: number
  paid: boolean
  paidAt?: string
  status: string
  createdAt: string
}

export default function AdminPage() {
  const [secret, setSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [entries, setEntries] = useState<ScanLogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [delivering, setDelivering] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all')

  const load = useCallback(async (s: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/log', {
        headers: { 'x-admin-secret': s },
      })
      if (res.status === 401) { setError('Wrong secret'); setLoading(false); return }
      const data = await res.json()
      setEntries(data.entries || [])
      setTotal(data.total || 0)
      setAuthed(true)
    } catch {
      setError('Failed to load')
    }
    setLoading(false)
  }, [])

  const login = (e: React.FormEvent) => {
    e.preventDefault()
    load(secret)
  }

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
        setEntries(prev => prev.map(e =>
          e.scanId === entry.scanId ? { ...e, paid: true, status: 'DELIVERED' } : e
        ))
        alert(`Delivered to ${data.to}`)
      } else {
        alert(data.error || 'Delivery failed')
      }
    } catch {
      alert('Network error')
    }
    setDelivering(null)
  }

  const filtered = entries.filter(e => {
    if (filter === 'paid') return e.paid
    if (filter === 'unpaid') return !e.paid
    return true
  })

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
          <button onClick={() => load(secret)} style={{ padding: '6px 16px', borderRadius: 6, background: '#222', color: '#aaa', border: '1px solid #333', cursor: 'pointer', fontSize: 13 }}>
            Refresh
          </button>
        </div>

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
                    <span style={{
                      color: entry.score >= 80 ? '#4ade80' : entry.score >= 50 ? '#facc15' : '#f87171',
                      fontWeight: 600,
                    }}>
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
                    {!entry.paid && (
                      <button
                        onClick={() => deliver(entry)}
                        disabled={delivering === entry.scanId}
                        style={{
                          padding: '4px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 500,
                          background: '#1e1b4b', color: '#818cf8', border: '1px solid #312e81',
                        }}
                      >
                        {delivering === entry.scanId ? 'Sending...' : 'Deliver'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ marginTop: 16, fontSize: 12, color: '#333' }}>
          Showing {filtered.length} of {total} total scans
        </p>
      </div>
    </div>
  )
}
