'use client'

import { useState } from 'react'
import GoProButton from '@/components/GoProButton'
import BundleButton from '@/components/BundleButton'

interface PaywallCardProps {
  toolId: string
  toolName: string
  oneTimePrice: number  // 0 = no per-tool purchase, show Pro only
  freeLimit: number
  accent?: string
  isDocumentTool?: boolean
}

export default function PaywallCard({ toolId, toolName, oneTimePrice, freeLimit, accent = '#06d6ff', isDocumentTool = false }: PaywallCardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const buyTool = async () => {
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
      else setError('Could not start checkout. Please try again.')
    } catch {
      setError('Could not start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const hasPurchaseOption = oneTimePrice > 0

  return (
    <div className="rounded-2xl border p-8" style={{ background: 'rgba(6,214,255,0.03)', borderColor: 'rgba(6,214,255,0.15)' }}>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}>
          <svg className="w-6 h-6" fill="none" stroke={accent} strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
        </div>
        <h3 className="text-xl font-black text-white mb-1">
          {isDocumentTool ? 'Your document is ready — unlock it' : 'Free limit reached'}
        </h3>
        <p className="text-white/45 text-sm">
          {isDocumentTool
            ? 'You\'ve used your free preview. To see the full document and download as PDF, pick a plan below.'
            : `${freeLimit} free ${freeLimit === 1 ? 'use' : 'uses'}/day included — upgrade for unlimited access`}
        </p>
      </div>

      <div className={`grid grid-cols-1 ${hasPurchaseOption ? 'sm:grid-cols-3' : ''} gap-4`}>
        {/* Individual tool — only shown when purchasable */}
        {hasPurchaseOption && (
          <div className="rounded-xl border p-5 flex flex-col" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Just this tool</div>
            <div className="text-3xl font-black text-white mb-0.5">${oneTimePrice}<span className="text-base font-normal text-white/40"> one-time</span></div>
            {isDocumentTool ? (
              <ul className="space-y-1.5 mb-4 flex-1">
                {[
                  'Full document — no blur, no truncation',
                  'Download as PDF, ready to send',
                  'Unlimited uses on this tool',
                  'Yours forever — pay once',
                ].map(b => (
                  <li key={b} className="flex items-start gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <span style={{ color: '#4ade80', flexShrink: 0 }}>✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-white/45 mb-4 flex-1">Lifetime access to <span className="text-white/70 font-bold">{toolName}</span>. Pay once, use forever.</p>
            )}
            <button
              onClick={buyTool}
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-black text-white transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: `linear-gradient(135deg,${accent},${accent}bb)`, boxShadow: `0 0 16px ${accent}40` }}>
              {loading ? 'Redirecting…' : `Buy once — $${oneTimePrice}`}
            </button>
            {error && <p className="text-xs text-red-400 mt-2 text-center">{error}</p>}
          </div>
        )}

        {/* Bundle — only show when hasPurchaseOption */}
        {hasPurchaseOption && (
          <div className="rounded-xl border p-5 flex flex-col relative overflow-hidden" style={{ background: 'rgba(167,139,250,0.04)', borderColor: 'rgba(167,139,250,0.2)' }}>
            <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(167,139,250,0.7)' }}>All tools — forever</div>
            <div className="text-3xl font-black text-white mb-0.5">$149<span className="text-base font-normal text-white/40"> one-time</span></div>
            <ul className="space-y-1.5 mb-4 flex-1">
              {['Every paid tool — 17 tools', 'Buy once, no subscription', 'PDF export on all document tools', 'No daily limits, ever'].map(b => (
                <li key={b} className="flex items-start gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <span style={{ color: '#a78bfa', flexShrink: 0 }}>✓</span>
                  {b}
                </li>
              ))}
            </ul>
            <BundleButton
              className="w-full py-2.5 rounded-lg text-sm font-black text-white transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', boxShadow: '0 0 16px rgba(124,58,237,0.25)' }}>
              All tools — $149
            </BundleButton>
          </div>
        )}

        {/* Pro */}
        <div className="rounded-xl border p-5 flex flex-col relative overflow-hidden" style={{ background: 'rgba(251,191,36,0.04)', borderColor: 'rgba(251,191,36,0.25)' }}>
          <div className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-black" style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}>Best Value</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-yellow-400/70 mb-2">All 51 tools</div>
          <div className="text-3xl font-black text-white mb-0.5">$79<span className="text-base font-normal text-white/40">/mo</span></div>
          <ul className="space-y-1.5 mb-4 flex-1">
            {[
              'Every tool on Queldrex — all 51',
              'Unlimited uses on everything',
              'PDF + export on all document tools',
              'AI visibility monitoring included',
              'Every new tool auto-unlocked',
            ].map(b => (
              <li key={b} className="flex items-start gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <span style={{ color: '#fbbf24', flexShrink: 0 }}>✓</span>
                {b}
              </li>
            ))}
          </ul>
          <GoProButton
            returnTo={typeof window !== 'undefined' ? window.location.pathname : '/tools'}
            className="w-full py-2.5 rounded-lg text-sm font-black text-black transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', boxShadow: '0 0 16px rgba(251,191,36,0.3)' }}>
            Go Pro — $79/mo
          </GoProButton>
        </div>
      </div>

      <p className="text-center text-[11px] text-white/25 mt-4">Stripe checkout · pay once, access forever · hello@queldrex.com</p>
      <p className="text-center text-[11px] mt-2" style={{ color: 'rgba(255,255,255,0.18)' }}>
        Already purchased?{' '}
        <a href="/restore-access" className="underline hover:text-white/40 transition-colors">Restore access</a>
      </p>
    </div>
  )
}
