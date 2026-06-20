import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const scoreStr = searchParams.get('score') ?? '0'
  const domain = searchParams.get('domain') ?? 'your-site.com'
  const score = Math.max(0, Math.min(100, parseInt(scoreStr, 10) || 0))

  const grade = score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : score >= 35 ? 'D' : 'F'
  const scoreColor = score >= 65 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'
  const gradeLabel = score >= 80 ? 'STRONG' : score >= 65 ? 'GOOD' : score >= 50 ? 'NEEDS WORK' : score >= 35 ? 'WEAK' : 'CRITICAL'

  try {
    return new ImageResponse(
      (
        <div
          style={{
            width: 1200,
            height: 630,
            background: '#070b14',
            display: 'flex',
            flexDirection: 'column',
            padding: '52px 64px',
            fontFamily: 'sans-serif',
            position: 'relative',
          }}
        >
          {/* Background glow */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 300,
              background: `radial-gradient(ellipse 60% 50% at 50% -10%, ${scoreColor}18 0%, transparent 70%)`,
              display: 'flex',
            }}
          />

          {/* Top bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 56 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  background: '#06d6ff',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ width: 18, height: 18, background: '#000', borderRadius: 3, display: 'flex' }} />
              </div>
              <span style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px' }}>QUELDREX</span>
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#06d6ff',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                background: 'rgba(6,214,255,0.08)',
                border: '1px solid rgba(6,214,255,0.2)',
                padding: '6px 16px',
                borderRadius: 40,
                display: 'flex',
              }}
            >
              AI Visibility Score
            </div>
          </div>

          {/* Main content */}
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: 64 }}>
            {/* Score block */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', lineHeight: 1, marginBottom: 16 }}>
                <span style={{ fontSize: 160, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score}</span>
                <span style={{ fontSize: 52, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: 20, marginLeft: 6 }}>/100</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 900,
                    letterSpacing: '0.16em',
                    color: scoreColor,
                    background: `${scoreColor}15`,
                    border: `1px solid ${scoreColor}40`,
                    padding: '5px 14px',
                    borderRadius: 40,
                    display: 'flex',
                  }}
                >
                  {gradeLabel}
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: '#ffffff',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {grade}
                </div>
              </div>
              <div style={{ fontSize: 22, color: '#06d6ff', fontWeight: 700, marginBottom: 6, display: 'flex' }}>
                {domain}
              </div>
              <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', display: 'flex' }}>
                ChatGPT · Claude · Perplexity visibility check
              </div>
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 220, background: 'rgba(255,255,255,0.08)', display: 'flex' }} />

            {/* Signal indicators */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 200 }}>
              {[
                'llms.txt',
                'LocalBusiness Schema',
                'JSON-LD',
                'Sitemap',
                'Open Graph',
                'HTTPS',
                'Canonical URL',
                'Robots.txt',
              ].map((signal, i) => {
                const pass = i < Math.round((score / 100) * 8)
                return (
                  <div key={signal} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        background: pass ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.12)',
                        border: `1.5px solid ${pass ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.3)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          background: pass ? '#22c55e' : 'rgba(239,68,68,0.5)',
                          display: 'flex',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 13, color: pass ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                      {signal}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bottom bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 36,
              paddingTop: 24,
              borderTop: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', display: 'flex' }}>
              Find out your score free →
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#06d6ff', display: 'flex' }}>queldrex.com/scanner</span>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  } catch {
    return new Response('Failed to generate image', { status: 500 })
  }
}
