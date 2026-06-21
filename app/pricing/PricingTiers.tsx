'use client'

import { useState } from 'react'
import Link from 'next/link'
import GoProButton from '@/components/GoProButton'

const FREE_FEATURES = [
  'AI Visibility Scan: 1 free scan per day',
  'Vibe Security Shield: 1 free scan per day',
  'API Schema Drift Scanner: 1 free scan per day',
  'DB Migration Checker: 2 free checks per day',
  'Tech Stack Detector: 5 free lookups per day',
  'Breach Lookup, Threat Feed, dev tools: unlimited',
]

const FREE_LOCKED = [
  'Unlimited uses per day',
  'All 48 tools',
  'Priority support',
]

const PRO_FEATURES = [
  'Every tool, unlimited',
  'AI Visibility Monitor: monthly rescan + drop alerts',
  'Vibe Security Shield: unlimited',
  'API Schema Drift Scanner: unlimited',
  'DB Migration Checker: unlimited',
  'NDA, ToS, and legal document generators: unlimited',
  'Contract Risk Scanner: unlimited',
  'Hallucinated Package Detector: unlimited',
  'Every tool we ship in the future: included',
  'Cancel anytime from Stripe portal',
]

const AGENCY_FEATURES = [
  'Everything in Pro',
  '50 client AI visibility scans per month',
  'White-label PDF reports with your branding',
  'Bulk client dashboard: all scores in one view',
  'Monthly auto-reports emailed to each client',
  'Priority email support',
  'Custom integrations on request',
]

const LockIcon = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)

export default function PricingTiers() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')

  const proMonthly = billing === 'annual' ? 66 : 79
  const proBilled = billing === 'annual' ? '($790/yr)' : null

  return (
    <section className="max-w-5xl mx-auto px-6 py-8">
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <button
          onClick={() => setBilling('monthly')}
          className="text-sm font-bold px-4 py-2 rounded-lg transition-all"
          style={billing === 'monthly'
            ? { background: '#7C3AED', color: 'white' }
            : { background: 'transparent', color: '#A1A1AA', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          Monthly
        </button>
        <button
          onClick={() => setBilling('annual')}
          className="text-sm font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2"
          style={billing === 'annual'
            ? { background: '#7C3AED', color: 'white' }
            : { background: 'transparent', color: '#A1A1AA', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          Annual
          <span
            className="text-xs font-black px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}
          >
            Save 17%
          </span>
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-5 items-start">

        {/* FREE */}
        <div className="rounded-2xl border p-7 flex flex-col gap-5" style={{ background: '#111318', borderColor: 'rgba(255,255,255,0.07)' }}>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#A1A1AA' }}>Free</div>
            <div className="text-4xl font-black" style={{ color: '#FAFAFA' }}>$0</div>
            <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>No credit card needed</div>
          </div>
          <ul className="space-y-3 flex-1">
            {FREE_FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: '#A1A1AA' }}>
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {f}
              </li>
            ))}
            {FREE_LOCKED.map(f => (
              <li key={f} className="flex items-start gap-2 text-xs opacity-40">
                <LockIcon />
                <span className="line-through" style={{ color: '#A1A1AA' }}>{f}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/tools"
            className="block text-center py-3 rounded-xl text-sm font-bold transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Browse Free Tools
          </Link>
        </div>

        {/* PRO */}
        <div
          className="rounded-2xl border p-7 flex flex-col gap-5 relative"
          style={{
            background: 'linear-gradient(160deg, rgba(109,40,217,0.1) 0%, rgba(109,40,217,0.04) 100%)',
            borderColor: 'rgba(124,58,237,0.4)',
            boxShadow: '0 0 48px rgba(109,40,217,0.12)',
          }}
        >
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}
          >
            Most Popular
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Pro</div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black" style={{ color: '#FAFAFA' }}>${proMonthly}</span>
              <span className="text-sm mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>/mo</span>
              {billing === 'annual' && (
                <span className="text-sm mb-1.5 line-through" style={{ color: 'rgba(255,255,255,0.25)' }}>$79</span>
              )}
            </div>
            {billing === 'annual' ? (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{proBilled}</span>
                <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}>
                  Save $158/yr
                </span>
              </div>
            ) : (
              <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Cancel anytime</div>
            )}
          </div>
          <ul className="space-y-3 flex-1">
            {PRO_FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-purple-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
          <GoProButton
            returnTo="/tools"
            className="block w-full text-center py-3.5 rounded-xl text-sm font-black text-white transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 24px rgba(109,40,217,0.35)' }}
          >
            {billing === 'annual' ? 'Start Pro · $790/yr' : 'Start Pro · $79/mo'}
          </GoProButton>
          <p className="text-center text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Already subscribed?{' '}
            <a href="/restore-access" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline' }}>Restore access</a>
          </p>
        </div>

        {/* AGENCY */}
        <div className="rounded-2xl border p-7 flex flex-col gap-5" style={{ background: '#111318', borderColor: 'rgba(255,255,255,0.07)' }}>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#A1A1AA' }}>Agency</div>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-black" style={{ color: '#FAFAFA' }}>$299</span>
              <span className="text-sm mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>/month</span>
            </div>
            <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Cancel anytime</div>
          </div>
          <ul className="space-y-3 flex-1">
            {AGENCY_FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: '#A1A1AA' }}>
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/agency"
            className="block text-center py-3 rounded-xl text-sm font-bold transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.14)' }}
          >
            Start Agency Plan
          </Link>
        </div>
      </div>
    </section>
  )
}
