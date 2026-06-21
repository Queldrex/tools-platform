'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import QueldrexLogo from './Logo'

const CATEGORIES = [
  {
    label: 'Security',
    icon: '🔒',
    count: 12,
    desc: 'CVE scanning, SSL inspection, fraud detection & more',
    href: '/tools#security',
    color: '#f87171',
  },
  {
    label: 'Developer',
    icon: '🛠',
    count: 10,
    desc: 'DNS health, JSON, JWT, cron builder & more',
    href: '/tools#developer',
    color: '#06b6d4',
  },
  {
    label: 'Business',
    icon: '💼',
    count: 21,
    desc: 'Finance, legal docs, marketing & more',
    href: '/tools#business',
    color: '#4ade80',
  },
  {
    label: 'AI Visibility',
    icon: '🤖',
    count: 4,
    desc: 'Schema markup, robots.txt, structured data & more',
    href: '/tools#ai-visibility',
    color: '#a78bfa',
  },
]

export default function Header() {
  const pathname = usePathname()
  const [toolsOpen, setToolsOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMobileOpen(false); setToolsOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!toolsOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setToolsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [toolsOpen])

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      onClick={() => setToolsOpen(false)}
      className={`text-sm font-medium transition-colors hover:text-white ${pathname === href ? 'text-white' : 'text-white/55'}`}
    >
      {label}
    </Link>
  )

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b transition-shadow"
        style={{
          background: isScrolled ? 'rgba(7,11,20,0.85)' : '#070b14',
          backdropFilter: isScrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: isScrolled ? 'blur(20px)' : 'none',
          borderColor: isScrolled ? 'rgba(255,255,255,0.06)' : 'transparent',
          boxShadow: isScrolled ? '0 4px 30px rgba(0,0,0,0.5)' : 'none',
          transition: 'background 0.3s ease, backdrop-filter 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0" onClick={() => { setToolsOpen(false); setMobileOpen(false) }}>
            <QueldrexLogo size="md" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {/* Tools dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setToolsOpen(v => !v)}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-white ${toolsOpen ? 'text-white' : 'text-white/55'}`}
              >
                Tools
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              {toolsOpen && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 rounded-2xl border shadow-2xl"
                  style={{
                    background: '#0a0f1a',
                    borderColor: 'rgba(255,255,255,0.1)',
                    minWidth: 480,
                    boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
                    zIndex: 100,
                  }}
                >
                  <div className="p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25 mb-3 px-1">Browse by category</p>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.map(cat => (
                        <Link
                          key={cat.label}
                          href={cat.href}
                          onClick={() => setToolsOpen(false)}
                          className="group rounded-xl p-4 transition-all hover:scale-[1.02]"
                          style={{
                            background: '#0d1117',
                            border: '1px solid rgba(255,255,255,0.08)',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)')}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-lg leading-none">{cat.icon}</span>
                            <span className="text-sm font-bold text-white">{cat.label}</span>
                          </div>
                          <p className="text-[11px] font-black mb-1" style={{ color: cat.color }}>
                            {cat.count} tools
                          </p>
                          <p className="text-[11px] text-white/40 leading-relaxed">{cat.desc}</p>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <Link
                        href="/tools"
                        onClick={() => setToolsOpen(false)}
                        className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-bold text-white/50 hover:text-white transition-colors hover:bg-white/5"
                      >
                        View all 47 tools — most are free
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {navLink('/pricing', 'Pricing')}
            {navLink('/blog', 'Blog')}
            {navLink('/request-tool', 'Request a Tool')}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className="hidden lg:inline-flex items-center gap-2 text-sm font-black text-white px-5 py-2.5 rounded-xl transition-all hover:scale-105 flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg,#6d28d9,#7c3aed)',
                boxShadow: '0 0 20px rgba(124,58,237,0.35)',
              }}
            >
              Go Pro $79/mo
            </Link>

            {/* Hamburger */}
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed top-16 inset-x-0 bottom-0 z-40 lg:hidden overflow-y-auto" style={{ background: '#070b14' }}>
          <nav className="p-5 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25 px-4 pb-2">Tools by category</p>
            {CATEGORIES.map(cat => (
              <Link
                key={cat.label}
                href={cat.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <span className="text-xl">{cat.icon}</span>
                <div>
                  <div className="text-sm font-bold text-white">{cat.label}</div>
                  <div className="text-[11px] font-black" style={{ color: cat.color }}>{cat.count} tools</div>
                </div>
              </Link>
            ))}
            <Link href="/tools" onClick={() => setMobileOpen(false)} className="flex items-center px-4 py-3 rounded-xl text-sm font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-colors">
              View all 48 tools →
            </Link>

            <div className="h-px my-3" style={{ background: 'rgba(255,255,255,0.06)' }} />

            <Link href="/pricing" onClick={() => setMobileOpen(false)} className="flex items-center px-4 py-3.5 rounded-xl text-sm font-semibold text-white/65 hover:text-white hover:bg-white/5 transition-colors">Pricing</Link>
            <Link href="/blog" onClick={() => setMobileOpen(false)} className="flex items-center px-4 py-3.5 rounded-xl text-sm font-semibold text-white/65 hover:text-white hover:bg-white/5 transition-colors">Blog</Link>
            <Link href="/request-tool" onClick={() => setMobileOpen(false)} className="flex items-center px-4 py-3.5 rounded-xl text-sm font-semibold text-white/65 hover:text-white hover:bg-white/5 transition-colors">Request a Tool</Link>
          </nav>

          <div className="p-5 pt-0">
            <Link
              href="/pricing"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full text-sm font-black text-white py-4 rounded-xl"
              style={{ background: 'linear-gradient(135deg,#6d28d9,#7c3aed)', boxShadow: '0 0 24px rgba(124,58,237,0.35)' }}
            >
              Go Pro $79/mo
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
