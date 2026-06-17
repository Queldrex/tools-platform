'use client'

interface BlurredPreviewProps {
  llmsTxtSnippet: string
  jsonLdSnippet: string
  topRecommendation: string
  onUnlock: () => void
  loading: boolean
}

export default function BlurredPreview({
  llmsTxtSnippet,
  jsonLdSnippet,
  topRecommendation,
  onUnlock,
  loading,
}: BlurredPreviewProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
        <h3 className="font-semibold text-slate-900">Generated Fix Package</h3>
        <p className="text-sm text-slate-500 mt-0.5">Your ready-to-use compliance assets — unlock to download</p>
      </div>

      <div className="relative">
        {/* Preview tabs */}
        <div className="divide-y divide-slate-100">
          {/* llms.txt preview */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">llms.txt</span>
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">Generated for your site</span>
            </div>
            <div className="relative rounded-xl bg-slate-900 overflow-hidden">
              <pre className="text-green-400 text-xs p-4 leading-relaxed select-none overflow-hidden max-h-28 blur-sm">
                {llmsTxtSnippet || `# Your Business Name\n\n> Your business description here...\n\n## About\nYour business is located at yourdomain.com.\n\n## Pages\n- [Home](https://yourdomain.com/): Home page content\n- [Services](https://yourdomain.com/services): Services information\n- [Contact](https://yourdomain.com/contact): Contact information`}
              </pre>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/60 to-slate-900/90" />
            </div>
          </div>

          {/* JSON-LD preview */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">JSON-LD Schema</span>
              <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">LocalBusiness + WebSite</span>
            </div>
            <div className="relative rounded-xl bg-slate-900 overflow-hidden">
              <pre className="text-blue-300 text-xs p-4 leading-relaxed select-none overflow-hidden max-h-28 blur-sm">
                {jsonLdSnippet || `{\n  "@context": "https://schema.org",\n  "@graph": [\n    {\n      "@type": "LocalBusiness",\n      "@id": "https://yourdomain.com/#business",\n      "name": "Your Business Name",\n      "url": "https://yourdomain.com"\n    }\n  ]\n}`}
              </pre>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/60 to-slate-900/90" />
            </div>
          </div>

          {/* Top recommendation preview */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Recommendations</span>
              <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-medium">Prioritised fix list</span>
            </div>
            <div className="space-y-3">
              {/* First recommendation — visible as teaser */}
              {topRecommendation && (
                <div className="rounded-xl border-l-4 border-red-500 bg-red-50 p-4">
                  <div className="text-xs font-bold uppercase text-red-600 mb-1">High Priority</div>
                  <div className="text-sm font-semibold text-slate-900">{topRecommendation}</div>
                </div>
              )}
              {/* Remaining recommendations — blurred */}
              {[1, 2].map(i => (
                <div key={i} className="rounded-xl border-l-4 border-slate-300 bg-slate-50 p-4 blur-sm select-none">
                  <div className="text-xs font-bold uppercase text-slate-400 mb-1">████ Priority</div>
                  <div className="text-sm font-semibold text-slate-400">████████████████████████████████████</div>
                  <div className="text-sm text-slate-300 mt-1">███████████████████████████████████████████</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Paywall overlay */}
        <div className="border-t border-slate-200 bg-gradient-to-b from-white/80 to-white p-8 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium px-4 py-2 rounded-full mb-5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Your fix package is ready — locked until payment
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-2">Unlock Your Complete AI Visibility Package</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
            Get the generated llms.txt, JSON-LD schema, full HTML report, and step-by-step fix instructions — sent to your inbox instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5">
            {['llms.txt file', 'JSON-LD schema', 'HTML report', 'Fix checklist'].map(item => (
              <div key={item} className="flex items-center gap-1.5 text-sm text-slate-600">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </div>
            ))}
          </div>

          <button
            onClick={onUnlock}
            disabled={loading}
            className="inline-flex items-center gap-3 bg-slate-900 hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-lg px-8 py-4 rounded-xl transition-colors shadow-lg shadow-slate-900/20"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Redirecting to payment...
              </>
            ) : (
              <>
                Unlock Full Report
                <span className="bg-white/20 px-3 py-1 rounded-lg text-base font-bold">$149</span>
              </>
            )}
          </button>
          <p className="text-xs text-slate-400 mt-3">Secure checkout via Stripe · Instant delivery · One-time payment</p>
        </div>
      </div>
    </div>
  )
}
