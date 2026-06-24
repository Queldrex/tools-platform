'use client'

import { useState } from 'react'

interface BundleButtonProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export default function BundleButton({ className, style, children }: BundleButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleBuy = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/checkout/bundle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnTo: '/tools' }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setError('Checkout failed — try again.')
    } catch {
      setError('Checkout failed — try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <span className="inline-flex flex-col items-center gap-1 w-full">
      <button
        onClick={handleBuy}
        disabled={loading}
        className={className}
        style={style}
      >
        {loading ? 'Redirecting…' : (children ?? 'Get the Bundle — $149')}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </span>
  )
}
