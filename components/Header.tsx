'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import QueldrexLogo from './Logo'

const TOOLS = [
  { name: 'AI Visibility Scanner', desc: 'Find out if AI can discover your business', price: '$149', href: '/scanner', live: true },
  { name: 'Threat Intelligence Feed', desc: 'Live stream of global cyber threat indicators', price: 'Free', href: '/tools/threat-feed', live: true },
  { name: 'Breach Lookup', desc: 'Check if your email or domain has been breached', price: 'Free', href: '/tools/breach-lookup', live: true },
  { name: 'Vibe Coding Security Shield', desc: 'Scan AI-generated code for vulnerabilities', price: 'Pro', href: '/tools/vibe-security', live: true },
  { name: 'API Schema Drift Scanner', desc: 'Detect breaking changes in live APIs', price: 'Pro', href: '/tools/api-schema-drift', live: true },
  { name: 'Database Migration Safety Checker', desc: 'Catch dangerous SQL migration patterns', price: 'Pro', href: '/tools/database-migration', live: true },
  { name: 'Directory Extractor', desc: 'Map site structure and export as CSV', price: 'Free', href: '/tools/directory-extractor', live: true },
  { name: 'AI Citation Tracker', desc: 'Does ChatGPT mention your business?', price: 'Pro', href: '/tools/citation-tracker', live: true },
]

export default function Header() {
  const pathname = usePathname()
  const [toolsOpen, setToolsOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/6" style={{ background: '#070b14' }}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
          <Link href="/" className="flex-shrink-0" onClick={() => { setToolsOpen(false); setMobileOpen(false) }}>
            <QueldrexLogo size="md" />
          </Link>

          <nav className="hidden lg:flex items-center justify-center gap-8 text-sm text-white/55 font-medium">
            <Link href="/" className={`hover:text-white transition-colors ${pathname === '/' ? 'text-white' : ''}`}>
              Home
            </Link>

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
                    <div className="px-4 py-3 border-b border-white/6 flex items-center justify-between">
                      <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/25">Our Tool Suite</p>
                      <Link href="/tools" onClick={() => setToolsOpen(false)} className="text-[10px] font-bold text-white/30 hover:text-cyan-400 transition-colors">View all →</Link>
                    </div>
                    <div className="p-2">
                      {TOOLS.map((tool) =>
                        tool.live ? (
                          <Link key={tool.name} href={tool.href!} onClick={() => setToolsOpen(false)}
                            className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors">
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
                          <Link key={tool.name} href={tool.href!} onClick={() => setToolsOpen(false)}
                            className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl hover:bg-white/4 transition-colors opacity-60 hover:opacity-80">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-sm font-medium text-white/70">{tool.name}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-white/35 border border-white/15 px-1.5 py-0.5 rounded-full flex-shrink-0">Soon</span>
                              </div>
                              <p className="text-xs text-white/45 truncate">{tool.desc}</p>
                            </div>
                            <span className="text-sm font-bold text-white/35 flex-shrink-0">{tool.price}</span>
                          </Link>
                        )
                      )}
                    </div>
                    <div className="px-2 py-2 border-t border-white/6">
                      <Link href="/request-tool" onClick={() => setToolsOpen(false)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                        <span className="text-xs font-semibold text-white/40">Request a tool</span>
                        <svg className="w-3 h-3 text-white/25" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link href="/services" className="hover:text-white transition-colors" onClick={() => setToolsOpen(false)}>Build for Me</Link>
            <Link href="/agency" className="hover:text-white transition-colors" onClick={() => setToolsOpen(false)}>Agency</Link>
            <Link href="/pricing" className="hover:text-white transition-colors" onClick={() => setToolsOpen(false)}>Pricing</Link>
            <Link href="/about" className="hover:text-white transition-colors" onClick={() => setToolsOpen(false)}>About</Link>
            <Link href="/portfolio" className="hover:text-white transition-colors" onClick={() => setToolsOpen(false)}>Portfolio</Link>
            <Link href="/blog" className="hover:text-white transition-colors" onClick={() => setToolsOpen(false)}>Blog</Link>
            <Link href="/feedback" className="hover:text-white transition-colors" onClick={() => setToolsOpen(false)}>Feedback</Link>
            <Link href="/contact" className="hover:text-white transition-colors" onClick={() => setToolsOpen(false)}>Contact</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/scanner" className="hidden lg:flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-lg text-black transition-all hover:scale-105 flex-shrink-0" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 20px rgba(6,182,212,0.3)' }}>
              Scan Your Site Free
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </Link>

            <button
              className="lg:hidden p-2 text-white/60 hover:text-white transition-colors"
              onClick={() => setMobileOpen(v => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen
                ? <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                : <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
              }
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed top-[81px] inset-x-0 bottom-0 z-40 lg:hidden overflow-y-auto" style={{ background: '#070b14' }}>
          <nav className="p-6 space-y-1 border-b border-white/6">
            <Link href="/" className="flex items-center px-4 py-3.5 rounded-xl text-sm font-semibold text-white/65 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link href="/scanner" className="flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold text-white hover:bg-white/5 transition-colors" onClick={() => setMobileOpen(false)}>
              <span>AI Visibility Scanner</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-black px-2 py-0.5 rounded-full" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Live</span>
            </Link>
            <Link href="/services" className="flex items-center px-4 py-3.5 rounded-xl text-sm font-semibold text-white/65 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setMobileOpen(false)}>Build for Me</Link>
            <Link href="/agency" className="flex items-center px-4 py-3.5 rounded-xl text-sm font-semibold text-white/65 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setMobileOpen(false)}>Agency</Link>
            <Link href="/pricing" className="flex items-center px-4 py-3.5 rounded-xl text-sm font-semibold text-white/65 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setMobileOpen(false)}>Pricing</Link>
            <Link href="/about" className="flex items-center px-4 py-3.5 rounded-xl text-sm font-semibold text-white/65 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setMobileOpen(false)}>About</Link>
            <Link href="/portfolio" className="flex items-center px-4 py-3.5 rounded-xl text-sm font-semibold text-white/65 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setMobileOpen(false)}>Portfolio</Link>
            <Link href="/blog" className="flex items-center px-4 py-3.5 rounded-xl text-sm font-semibold text-white/65 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setMobileOpen(false)}>Blog</Link>
            <Link href="/roadmap" className="flex items-center px-4 py-3.5 rounded-xl text-sm font-semibold text-white/65 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setMobileOpen(false)}>Roadmap</Link>
            <Link href="/feedback" className="flex items-center px-4 py-3.5 rounded-xl text-sm font-semibold text-white/65 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setMobileOpen(false)}>Feedback</Link>
            <Link href="/contact" className="flex items-center px-4 py-3.5 rounded-xl text-sm font-semibold text-white/65 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setMobileOpen(false)}>Contact</Link>
          </nav>
          <div className="p-6">
            <Link href="/scanner" className="flex items-center justify-center gap-2 w-full text-sm font-black text-black py-4 rounded-xl" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 24px rgba(6,182,212,0.35)' }} onClick={() => setMobileOpen(false)}>
              Scan Your Site Free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
