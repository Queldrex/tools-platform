'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) { setLoading(false); return }
    // Poll for download token — webhook may take a few seconds
    let attempts = 0
    const interval = setInterval(async () => {
      attempts++
      try {
        const res = await fetch(`/api/session/${sessionId}`)
        if (res.ok) {
          const json = await res.json()
          if (json.downloadUrl) {
            setDownloadUrl(json.downloadUrl)
            setLoading(false)
            clearInterval(interval)
          }
        }
      } catch { /* continue polling */ }
      if (attempts >= 15) { setLoading(false); clearInterval(interval) }
    }, 2000)
    return () => clearInterval(interval)
  }, [sessionId])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-2">
          <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
            <div className="w-3.5 h-3.5 bg-slate-900 rounded-sm" />
          </div>
          <span className="font-bold tracking-tight">Queldrex</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-black text-slate-900 mb-2">Payment confirmed!</h1>
          <p className="text-slate-500 mb-6">
            Your AI Visibility Report is on its way to your inbox. Check your email — it should arrive within 60 seconds.
          </p>

          {loading ? (
            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm py-4">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Preparing your download...
            </div>
          ) : downloadUrl ? (
            <a
              href={downloadUrl}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors w-full justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Your Report
            </a>
          ) : (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
              Your report is being prepared. Check your email — it will be delivered within a few minutes.
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 mb-4">Your package includes:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {['llms.txt file', 'JSON-LD schema', 'HTML report', 'Fix checklist'].map(item => (
                <div key={item} className="flex items-center gap-1.5 text-slate-600">
                  <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>
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
