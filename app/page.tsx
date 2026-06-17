'use client'

import { useState } from 'react'
import ScanForm from '@/components/ScanForm'
import ScoreGauge from '@/components/ScoreGauge'
import ChecklistCard from '@/components/ChecklistCard'
import BlurredPreview from '@/components/BlurredPreview'
import type { ScanChecks } from '@/lib/framework/types'

type PageState = 'idle' | 'scanning' | 'results' | 'error'

interface ScanData {
  scanId: string
  score: number
  checks: ScanChecks
  businessName: string
  domain: string
  topRecommendation: string
}

export default function HomePage() {
  const [state, setState] = useState<PageState>('idle')
  const [scanData, setScanData] = useState<ScanData | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [scannedDomain, setScannedDomain] = useState('')

  async function handleScan(url: string, email: string) {
    setState('scanning')
    setScannedDomain(url.replace(/^https?:\/\//, '').replace(/\/$/, ''))

    try {
      const scanRes = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, email }),
      })
      const scanJson = await scanRes.json()

      if (!scanRes.ok || scanJson.status === 'ERROR') {
        throw new Error(scanJson.error || 'Scan failed. Please check the URL and try again.')
      }

      const statusRes = await fetch(`/api/scan/${scanJson.scanId}`)
      const statusJson = await statusRes.json()

      if (!statusRes.ok) throw new Error('Failed to retrieve scan results.')

      setScanData({
        scanId: scanJson.scanId,
        score: statusJson.score,
        checks: statusJson.checks,
        businessName: statusJson.businessInfo?.name || '',
        domain: statusJson.businessInfo?.domain || '',
        topRecommendation: statusJson.recommendations?.[0]?.title || '',
      })
      setState('results')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setState('error')
    }
  }

  async function handleUnlock() {
    if (!scanData) return
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanId: scanData.scanId }),
      })
      const json = await res.json()
      if (!res.ok || !json.checkoutUrl) throw new Error(json.error || 'Could not start checkout.')
      window.location.href = json.checkoutUrl
    } catch (err) {
      setCheckoutLoading(false)
      alert(err instanceof Error ? err.message : 'Checkout failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
              <div className="w-3.5 h-3.5 bg-slate-900 rounded-sm" />
            </div>
            <span className="font-bold tracking-tight">Queldrex</span>
          </div>
          <span className="text-slate-400 text-sm hidden sm:block">AI Visibility Scanner</span>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-slate-900 text-white pb-16 pt-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
            844,000+ sites now have llms.txt — does yours?
          </div>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4">
            Is your business invisible<br className="hidden sm:block" /> to AI search?
          </h1>
          <p className="text-slate-300 text-lg mb-2 max-w-2xl mx-auto">
            ChatGPT, Perplexity, and Google AI recommend businesses to millions of users every day.
            Most local businesses are completely missing — not because they are bad, but because
            their websites speak the wrong language.
          </p>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Enter your URL and get your AI Visibility Score in seconds. Free.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-8 pb-20">

        {/* Scan form */}
        {(state === 'idle' || state === 'error') && (
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200 p-8 mb-8">
            <ScanForm onScan={handleScan} loading={false} />
            {state === 'error' && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {errorMsg}
              </div>
            )}
          </div>
        )}

        {/* Scanning */}
        {state === 'scanning' && (
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200 p-12 mb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-700 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Scanning {scannedDomain}...</h2>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              Checking 6 AI visibility signals and generating your personalised fix package. This takes 5–10 seconds.
            </p>
            <div className="mt-6 flex flex-col gap-2 max-w-xs mx-auto text-left">
              {[
                'Fetching homepage content',
                'Checking llms.txt',
                'Detecting JSON-LD schema',
                'Analysing Open Graph tags',
                'Verifying sitemap & robots.txt',
                'Generating compliance assets',
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-500">
                  <div className="w-4 h-4 rounded-full bg-slate-200 animate-pulse flex-shrink-0" />
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {state === 'results' && scanData && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">
                    {scanData.businessName || scanData.domain}
                  </h2>
                  <p className="text-sm text-slate-500">{scanData.domain}</p>
                </div>
                <button
                  onClick={() => { setState('idle'); setScanData(null) }}
                  className="text-sm text-slate-400 hover:text-slate-600 transition"
                >
                  Scan another →
                </button>
              </div>
              <div className="p-6">
                <ScoreGauge score={scanData.score} />
              </div>
            </div>

            <ChecklistCard checks={scanData.checks} />

            <BlurredPreview
              llmsTxtSnippet=""
              jsonLdSnippet=""
              topRecommendation={scanData.topRecommendation}
              onUnlock={handleUnlock}
              loading={checkoutLoading}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-400 mb-4">
            {[
              '✓ Secure payment via Stripe',
              '✓ Instant delivery to your inbox',
              '✓ One-time payment — no subscription',
              '✓ Ready-to-use files included',
            ].map(item => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Queldrex · AI Visibility Scanner
          </p>
        </div>
      </footer>
    </div>
  )
}
