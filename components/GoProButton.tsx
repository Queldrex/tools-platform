'use client'

import { useState } from 'react'

interface GoProButtonProps {
  returnTo?: string
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export default function GoProButton({ returnTo = '/tools', className, style, children }: GoProButtonProps) {
  const [loading, setLoading] = useState(false)

  const start = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout/pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnTo }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setLoading(false)
    } catch {
      setLoading(false)
    }
  }

  return (
    <button onClick={start} disabled={loading} className={className} style={style}>
      {loading ? 'Loading…' : (children ?? 'Go Pro — $79/mo')}
    </button>
  )
}
