'use client'
import { useState } from 'react'

export default function EmailCapture() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('Failed')
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') return (
    <p className="text-sm font-bold" style={{ color: '#4ade80' }}>✓ You&apos;re in. We&apos;ll email you when new tools drop.</p>
  )

  return (
    <form onSubmit={submit} className="flex gap-2 max-w-sm mx-auto">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium outline-none"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-5 py-2.5 rounded-xl text-sm font-black text-black disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg,#a78bfa,#7c3aed)' }}
      >
        {status === 'loading' ? '…' : 'Notify me'}
      </button>
      {status === 'error' && <p className="text-xs text-red-400 mt-1">Something went wrong. Try again.</p>}
    </form>
  )
}
