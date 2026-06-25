import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Queldrex — Professional Tools for Developers'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090B',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 800,
            height: 600,
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.25) 0%, rgba(109,40,217,0.08) 50%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(60px)',
          }}
        />

        {/* Logo wordmark */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-0.04em',
            marginBottom: 28,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
            Q
          </div>
          QUELDREX
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            textAlign: 'center',
            maxWidth: 900,
            marginBottom: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span>We build the tools</span>
          <span style={{ background: 'linear-gradient(130deg, #a78bfa, #38bdf8)', backgroundClip: 'text', color: 'transparent' }}>
            your team actually needs.
          </span>
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: 24,
            color: 'rgba(255,255,255,0.5)',
            textAlign: 'center',
            maxWidth: 700,
            lineHeight: 1.5,
            marginBottom: 40,
          }}
        >
          Security · DNS · Legal · Business Analytics
        </div>

        {/* Pills */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {['51 tools', 'Free to start', 'No account'].map(label => (
            <div
              key={label}
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 99,
                padding: '8px 18px',
                fontSize: 16,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.6)',
                letterSpacing: '0.03em',
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* URL */}
        <div style={{ position: 'absolute', bottom: 32, right: 40, fontSize: 18, color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>
          queldrex.com
        </div>
      </div>
    ),
    { ...size }
  )
}
