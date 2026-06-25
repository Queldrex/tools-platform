'use client'

import { useState } from 'react'

interface BuyToolButtonProps {
  toolId: string
  price: number
  label?: string
  className?: string
  style?: React.CSSProperties
}

export default function BuyToolButton({ toolId, price, label, className, style }: BuyToolButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleBuy = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/checkout/tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId, returnTo: window.location.pathname }),
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
    <span className="inline-flex flex-col items-start gap-1">
      <button
        onClick={handleBuy}
        disabled={loading}
        className={className}
        style={style}
      >
        {loading ? 'Redirecting…' : (label ?? `Get this tool — $${price} →`)}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </span>
  )
}
