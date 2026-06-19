'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import QueldrexLogo from '@/components/Logo'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(10)
  const [redirecting, setRedirecting] = useState(true)

  // Poll for download URL (background — doesn't block redirect)
  useEffect(() => {
    if (!sessionId) return
    let attempts = 0
    const interval = setInterval(async () => {
      attempts++
      try {
        const res = await fetch(`/api/session/${sessionId}`)
        if (res.ok) {
          const json = await res.json()
          if (json.downloadUrl) {
            setDownloadUrl(json.downloadUrl)
            setRedirecting(false)
            clearInterval(interval)
          }
        }
      } catch { /* continue */ }
      if (attempts >= 20) clearInterval(interval)
    }, 2000)
    return () => clearInterval(interval)
  }, [sessionId])

  // Countdown redirect — pauses if download URL found
  useEffect(() => {
    if (!redirecting) return
    if (countdown === 0) { router.push('/scanner'); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, redirecting, router])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#070b14' }}>
      <header className="border-b border-white/5" style={{ background: '#070b14' }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center">
          <Link href="/"><QueldrexLogo size="sm" /></Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">

          <div className="w-16 h-16 mx-auto mb-6 bg-cyan-500/10 border border-cyan-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-black text-white mb-2">Payment confirmed!</h1>
          <p className="text-white/50 text-sm mb-6">
            Your report is on its way to your inbox. Check your email — it should arrive within 60 seconds.
          </p>

          {downloadUrl ? (
            <a
              href={downloadUrl}
              className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-3.5 rounded-xl transition-colors w-full justify-center mb-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Your Report
            </a>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/40 mb-4">
              Your receipt and download link are on their way to your inbox.
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-xs text-white/20 mb-3">Your package includes:</p>
            <div className="grid grid-cols-2 gap-2 text-xs mb-5">
              {['llms.txt file', 'JSON-LD schema', 'HTML report', 'Fix checklist', 'README'].map(item => (
                <div key={item} className="flex items-center gap-1.5 text-white/30">
                  <svg className="w-3 h-3 text-cyan-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>

            {redirecting ? (
              <div className="text-xs text-white/30">
                Returning to scanner in <span className="text-cyan-400 font-bold">{countdown}s</span>…&nbsp;
                <button
                  onClick={() => setRedirecting(false)}
                  className="underline hover:text-white/50 transition-colors"
                >
                  stay on this page
                </button>
              </div>
            ) : (
              <Link href="/scanner" className="block text-center text-xs text-white/30 hover:text-white/60 transition-colors">
                Scan another website →
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
