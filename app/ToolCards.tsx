'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

const FEATURED_TOOLS = [
  { slug: 'dep-scanner', name: 'Dependency CVE Scanner', tagline: "Paste your package.json. Get live CVEs from Google's OSV database in seconds.", price: 'Pro', href: '/tools/dep-scanner', glow: 'rgba(248,113,113,0.18)' },
  { slug: 'ssl-inspector', name: 'SSL/TLS Inspector', tagline: 'Real TLS handshake analysis — cert expiry, cipher grade, and security headers.', price: 'Free', href: '/tools/ssl-inspector', glow: 'rgba(74,222,128,0.18)' },
  { slug: 'nda-generator', name: 'NDA Generator', tagline: 'Mutual or one-way NDAs with governing law, term, and scope — ready in under a minute.', price: 'Pro', href: '/tools/nda-generator', glow: 'rgba(167,139,250,0.18)' },
  { slug: 'break-even', name: 'Break-Even Calculator', tagline: 'Enter your costs and price. Know exactly how many units you need to sell.', price: 'Free', href: '/tools/break-even', glow: 'rgba(74,222,128,0.18)' },
  { slug: 'invoice-fraud', name: 'Invoice Fraud Detector', tagline: 'Flags BEC email patterns, round-number manipulation, and urgency pressure tactics.', price: 'Pro', href: '/tools/invoice-fraud', glow: 'rgba(251,146,60,0.18)' },
  { slug: 'dns-health', name: 'DNS Health Checker', tagline: 'Live DNS lookup across Cloudflare and Google resolvers — A, MX, TXT, NS, CAA records.', price: 'Free', href: '/tools/dns-health', glow: 'rgba(6,182,212,0.18)' },
]

export default function ToolCards() {
  const [hovered, setHovered] = useState<string | null>(null)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
      {FEATURED_TOOLS.map((tool) => (
        <Link key={tool.slug} href={tool.href}
          onMouseEnter={() => setHovered(tool.slug)}
          onMouseLeave={() => setHovered(null)}
          className="rounded-2xl border overflow-hidden block"
          style={{
            background: '#111318',
            borderColor: hovered === tool.slug ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)',
            transform: hovered === tool.slug ? 'translateY(-5px)' : 'translateY(0)',
            boxShadow: hovered === tool.slug ? `0 12px 40px ${tool.glow}` : '0 0 0 transparent',
            transition: 'all 0.22s ease',
          }}>
          <div className="relative h-40 overflow-hidden" style={{ background: '#09090B' }}>
            <Image src={`/tool-previews/${tool.slug}.png`} alt={tool.name} width={400} height={200}
              className="w-full h-full object-cover object-top"
              style={{ transform: hovered === tool.slug ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.3s ease' }} />
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <p className="text-sm font-black leading-snug" style={{ color: '#FAFAFA' }}>{tool.name}</p>
              <span className="flex-shrink-0 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={tool.price === 'Free'
                  ? { color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }
                  : { color: '#a78bfa', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)' }}>
                {tool.price}
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#A1A1AA' }}>{tool.tagline}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
