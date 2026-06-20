'use client'

import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem('cookie_consent')) setVisible(true)
    } catch { setVisible(true) }
  }, [])

  const accept = () => {
    try { localStorage.setItem('cookie_consent', '1') } catch { /* ignore */ }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 999,
        background: '#0d1117', borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '14px 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
      }}
    >
      <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)', maxWidth: 640, lineHeight: 1.5 }}>
        Queldrex uses functional cookies only — no tracking, no advertising, no third-party analytics.
        We store your preferences and session data to make the site work.{' '}
        <a href="/privacy" style={{ color: '#06d6ff', textDecoration: 'none' }}>Privacy Policy</a>
      </p>
      <button
        onClick={accept}
        style={{
          padding: '8px 20px', borderRadius: 8, background: '#06d6ff',
          color: '#000', fontWeight: 700, fontSize: 13, border: 'none',
          cursor: 'pointer', flexShrink: 0,
        }}
      >
        Got it
      </button>
    </div>
  )
}
