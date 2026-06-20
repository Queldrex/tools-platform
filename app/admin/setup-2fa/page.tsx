'use client'

import { useState } from 'react'

export default function Setup2FAPage() {
  const [adminKey, setAdminKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ qrUrl: string; secret: string; alreadyConfigured: boolean } | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminKey.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/setup-2fa?secret=${encodeURIComponent(adminKey.trim())}`)
      if (!res.ok) {
        setError('Invalid admin key')
        setLoading(false)
        return
      }
      const data = await res.json()
      setResult(data)
    } catch {
      setError('Network error')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060810', fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <div style={{ maxWidth: 480, width: '100%', background: '#0d1117', border: '1px solid #21262d', borderRadius: 16, padding: 40 }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: 10, background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 10, marginBottom: 16 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.35em', color: '#22d3ee', textTransform: 'uppercase', marginBottom: 6 }}>Queldrex Admin</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px', marginBottom: 4 }}>Two-Factor Setup</div>
          <div style={{ fontSize: 13, color: '#475569' }}>One-time setup — scan QR code with Google Authenticator</div>
        </div>

        {!result ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin Secret Key</label>
              <input
                type="password"
                placeholder="Enter your admin secret"
                value={adminKey}
                onChange={e => setAdminKey(e.target.value)}
                autoFocus
                style={{ padding: '12px 14px', borderRadius: 8, border: `1px solid ${error ? '#ef4444' : '#21262d'}`, background: '#0a0f1a', color: '#f1f5f9', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' as const }}
              />
            </div>
            {error && <p style={{ color: '#f87171', fontSize: 12, margin: 0 }}>{error}</p>}
            <button
              type="submit"
              disabled={loading || !adminKey.trim()}
              style={{ padding: '12px 14px', borderRadius: 8, background: '#0891b2', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', width: '100%', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Verifying…' : 'Show Setup QR Code'}
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
            {result.alreadyConfigured && (
              <div style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#fbbf24', width: '100%', boxSizing: 'border-box' as const }}>
                2FA is already configured. This is your current QR code.
              </div>
            )}

            <div style={{ padding: 16, background: 'white', borderRadius: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result.qrUrl} alt="TOTP QR Code" width={200} height={200} />
            </div>

            <div style={{ width: '100%', background: '#161b22', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Manual entry secret</div>
              <code style={{ fontSize: 13, color: '#22d3ee', fontFamily: 'monospace', wordBreak: 'break-all' as const }}>{result.secret}</code>
            </div>

            <div style={{ width: '100%', background: '#0a0f1a', border: '1px solid #21262d', borderRadius: 10, padding: '16px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>Setup steps:</div>
              <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>Open <strong style={{ color: '#f1f5f9' }}>Google Authenticator</strong> (or Authy) on your phone</li>
                <li style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>Tap <strong style={{ color: '#f1f5f9' }}>+</strong> → <strong style={{ color: '#f1f5f9' }}>Scan QR code</strong></li>
                <li style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>Scan the QR code above</li>
                <li style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
                  Add this to Vercel env vars:
                  <div style={{ marginTop: 6, padding: '8px 10px', background: '#161b22', borderRadius: 6, fontSize: 12 }}>
                    <span style={{ color: '#64748b' }}>ADMIN_TOTP_SECRET=</span>
                    <code style={{ color: '#22d3ee', fontFamily: 'monospace' }}>{result.secret}</code>
                  </div>
                </li>
                <li style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>Redeploy — next login will require the 6-digit code</li>
              </ol>
            </div>

            <button
              onClick={() => { setResult(null); setAdminKey('') }}
              style={{ padding: '10px 20px', borderRadius: 8, background: '#161b22', color: '#64748b', border: '1px solid #21262d', cursor: 'pointer', fontSize: 13, width: '100%' }}
            >
              ← Back
            </button>
          </div>
        )}

        <p style={{ fontSize: 11, color: '#1e293b', textAlign: 'center', margin: '24px 0 0' }}>
          This page is only accessible with a valid admin key.
        </p>
      </div>
    </div>
  )
}
