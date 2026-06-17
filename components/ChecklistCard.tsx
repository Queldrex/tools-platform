'use client'

import type { ScanChecks } from '@/lib/framework/types'

interface ChecklistCardProps {
  checks: ScanChecks
}

const SIGNALS = [
  { key: 'llmsTxt',            label: 'llms.txt',               points: 25, detail: 'Tells AI assistants exactly what your business does' },
  { key: 'jsonLd',             label: 'JSON-LD Structured Data', points: 20, detail: 'Machine-readable identity for search engines and AI' },
  { key: 'localBusinessSchema',label: 'LocalBusiness Schema',    points: 15, detail: 'Tells AI your business category, location, and contact info' },
  { key: 'sitemapXml',         label: 'sitemap.xml',             points: 15, detail: 'Allows AI crawlers to discover all your pages' },
  { key: 'openGraph',          label: 'Open Graph Tags',         points: 15, detail: 'Controls how your site appears when shared or previewed' },
  { key: 'robotsTxt',          label: 'robots.txt',              points: 10, detail: 'Grants AI crawlers permission to index your site' },
] as const

export default function ChecklistCard({ checks }: ChecklistCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
        <h3 className="font-semibold text-slate-900">AI Signal Checklist</h3>
        <p className="text-sm text-slate-500 mt-0.5">6 signals AI systems look for on your website</p>
      </div>
      <ul className="divide-y divide-slate-100">
        {SIGNALS.map(({ key, label, points, detail }) => {
          const passed = checks[key as keyof ScanChecks]
          return (
            <li key={key} className="flex items-start gap-4 px-6 py-4">
              <div className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {passed ? '✓' : '✗'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-medium ${passed ? 'text-slate-900' : 'text-slate-700'}`}>{label}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${passed ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                    {passed ? `+${points} pts` : `0 / ${points}`}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{detail}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
