import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Changelog — Queldrex',
  description: 'Recent updates, new tools, and improvements to Queldrex.',
  alternates: { canonical: 'https://queldrex.com/changelog' },
}

const MONTHS = [
  {
    month: 'June 2026',
    color: '#06d6ff',
    entries: [
      { emoji: '🚀', text: 'Launched one-time per-tool purchasing — pay once, use forever (no subscription required)' },
      { emoji: '🛠', text: 'Added HTTP Header Inspector, OG Tag Previewer, and Webhook Tester' },
      { emoji: '💰', text: 'Repriced all tools based on market research ($15 / $29 / $49 one-time per tool)' },
      { emoji: '🔐', text: 'Lifetime access cookies (10-year expiry) — buy once, never lose access' },
    ],
  },
  {
    month: 'May 2026',
    color: '#a78bfa',
    entries: [
      { emoji: '🚀', text: 'Launched 12 new tools: Business Name Checker, SaaS Metrics, Break-Even, ROI Calculator, Cash Flow Forecaster, NDA Generator, Terms of Service, Refund Policy, Ad Copy Grader, Subject Line Tester, Job Description Writer, SaaS Spend Optimizer' },
      { emoji: '🤖', text: 'Switched AI backend to Groq (llama-3.3-70b) — faster, 14k requests/day free tier' },
      { emoji: '📊', text: 'Added "Who This Is For" section to all tool pages' },
    ],
  },
  {
    month: 'April 2026',
    color: '#f59e0b',
    entries: [
      { emoji: '🚀', text: 'Launched Invoice Fraud Detector, Contract Risk Scanner, Agency Report Generator, and Proposal Generator' },
      { emoji: '🔒', text: 'Added Dependency CVE Scanner with live CVE data from Google OSV' },
      { emoji: '🌐', text: 'Launched DNS Health Checker and Email Deliverability Suite' },
    ],
  },
  {
    month: 'March 2026',
    color: '#4ade80',
    entries: [
      { emoji: '🚀', text: 'Launched AI Visibility Scanner — 14-signal scan showing how AI tools like ChatGPT see your brand' },
      { emoji: '🛡', text: 'Added Vibe Security Shield, API Schema Drift Scanner, and Database Migration Checker' },
      { emoji: '📦', text: 'Launched Hallucinated Package Detector — catches AI-generated fake npm/PyPI packages before they ship' },
    ],
  },
  {
    month: 'February 2026',
    color: '#f87171',
    entries: [
      { emoji: '🎉', text: 'Queldrex launched with 15 core tools' },
      { emoji: '🔧', text: 'Security tools: SSL Inspector, Breach Lookup, Password Generator, Hash Generator' },
      { emoji: '📝', text: 'Developer tools: JSON Formatter, JWT Decoder, Base64, Cron Builder' },
    ],
  },
]

export default function ChangelogPage() {
  return (
    <div className="min-h-screen" style={{ background: '#09090B' }}>
      <Header />

      {/* Hero */}
      <section className="max-w-2xl mx-auto px-6 pt-20 pb-14 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Queldrex · Changelog
        </p>
        <h1 className="text-4xl font-black mb-4" style={{ color: '#FAFAFA', letterSpacing: '-0.02em' }}>
          What&apos;s new.
        </h1>
        <p className="text-base" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Recent updates, launches, and improvements. Follow <a href="https://x.com/queldrex" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white underline transition-colors">@queldrex</a> for real-time announcements.
        </p>
      </section>

      {/* Timeline */}
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-[7px] top-2 bottom-2 w-px"
            style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0.02))' }}
          />

          <div className="space-y-12">
            {MONTHS.map((section) => (
              <div key={section.month} className="relative pl-10">
                {/* Month dot */}
                <div
                  className="absolute left-0 top-1 w-4 h-4 rounded-full border-2"
                  style={{
                    background: '#09090B',
                    borderColor: section.color,
                    boxShadow: `0 0 8px ${section.color}60`,
                  }}
                />

                {/* Month label */}
                <p
                  className="text-[11px] font-black uppercase tracking-[0.18em] mb-4"
                  style={{ color: section.color }}
                >
                  {section.month}
                </p>

                {/* Entries */}
                <div className="space-y-3">
                  {section.entries.map((entry, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="text-base leading-snug flex-shrink-0 mt-0.5">{entry.emoji}</span>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        {entry.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
