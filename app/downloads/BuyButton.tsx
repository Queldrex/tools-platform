'use client'

import { useState } from 'react'

export default function BuyButton({ productId, price, accent }: { productId: string; price: number; accent: string }) {
  const [loading, setLoading] = useState(false)

  const buy = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, returnTo: `/downloads/${productId}` }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setLoading(false)
    } catch {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={buy}
      disabled={loading}
      className="w-full py-3 rounded-xl text-sm font-black transition-all hover:opacity-90 disabled:opacity-50"
      style={{ background: accent, color: '#000' }}
    >
      {loading ? 'Loading…' : `Buy for $${price}`}
    </button>
  )
}
