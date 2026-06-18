'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import QueldrexLogo from './Logo'

const TOOLS = [
  {
    name: 'AI Visibility Scanner',
    desc: 'Find out if AI can discover your business',
    price: '$149',
    href: '/scanner',
    live: true,
  },
  { name: 'API Schema Drift Scanner', desc: 'Detect breaking changes in live APIs', price: '$249', href: null, live: false },
  { name: 'Database Migration Middleware', desc: 'Zero-downtime schema migrations', price: '$199', href: null, live: false },
  { name: 'Vibe Coding Security Shield', desc: 'Scan AI-generated code for vulnerabilities', price: '$149', href: null, live: false },
  { name: 'High-Speed Directory Extractor', desc: 'Extract and export directory listings at scale', price: '$99', href: null, live: false },
]

export default function Header() {
  const pathname = usePathname()
  const [toolsOpen, setToolsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/6" style={{ background: '#070b14' }}>
      <div className="max-w-7xl mx-auto px-6 h-28 grid grid-cols-[auto_1fr_auto] items-center gap-8">
        <Link href="/" className="flex-shrink-0" onClick={() => setToolsOpen(false)}>
          <QueldrexLogo size="lg" />
        </Link>

        <nav className="hidden lg:flex items-center justify-center gap-8 text-sm text-white/55 font-medium">
          <Link href="/" className={`hover:text-white transition-colors ${pathname === '/' ? 'text-white' : ''}`} onClick={() => setToolsOpen(false)}>
            Company
          </Link>

          {/* Tools dropdown */}
          <div className="relative" onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
            <button
              className={`flex items-center gap-1.5 hover:text-white transition-colors ${pathname === '/scanner' ? 'text-white' : ''}`}
              onClick={() => setToolsOpen(v => !v)}
            >
              Tools
              <svg className={`w-3.5 h-3.5 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            {toolsOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-80" style={{ zIndex: 100 }}>
                <div className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl" style={{ background: '#0f1729', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
                  <div className="px-4 py-3 border-b border-white/6">
                    <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/25">Our Tool Suite</p>
                  </div>
                  <div className="p-2">
                    {TOOLS.map((tool) =>
                      tool.live ? (
                        <Link
                          key={tool.name}
                          href={tool.href!}
                          onClick={() => setToolsOpen(false)}
                          className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors group"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-bold text-white">{tool.name}</span>
                              <span className="text-[10px] font-black uppercase tracking-wider text-black px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Live</span>
                            </div>
                            <p className="text-xs text-white/55 truncate">{tool.desc}</p>
                          </div>
                          <span className="text-sm font-bold text-white/60 flex-shrink-0">{tool.price}</span>
                        </Link>
                      ) : (
                        <div key={tool.name} className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl opacity-50 cursor-default">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-medium text-white/50">{tool.name}</span>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-white/35 border border-white/15 px-1.5 py-0.5 rounded-full flex-shrink-0">Soon</span>
                            </div>
                            <p className="text-xs text-white/40 truncate">{tool.desc}</p>
                          </div>
                          <span className="text-sm font-bold text-white/35 flex-shrink-0">{tool.price}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link href="/#pricing" className="hover:text-white transition-colors" onClick={() => setToolsOpen(false)}>
            Pricing
          </Link>
          <a href="mailto:hello@queldrex.com" className="hover:text-white transition-colors" onClick={() => setToolsOpen(false)}>
            Contact
          </a>
        </nav>

        <Link href="/scanner" className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-lg text-black transition-all hover:scale-105 flex-shrink-0" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 20px rgba(6,182,212,0.3)' }}>
          Run Free Scan
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
        </Link>
      </div>
    </header>
  )
}
