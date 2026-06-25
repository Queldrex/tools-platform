'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360
  s = Math.max(0, Math.min(100, s))
  l = Math.max(0, Math.min(100, l))
  const sl = s / 100, ll = l / 100
  const c = (1 - Math.abs(2 * ll - 1)) * sl
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = ll - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x } else if (h < 120) { r = x; g = c } else if (h < 180) { g = c; b = x }
  else if (h < 240) { g = x; b = c } else if (h < 300) { r = x; b = c } else { r = c; b = x }
  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const toLinear = (c: number) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1)
  const l2 = relativeLuminance(hex2)
  const lighter = Math.max(l1, l2), darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function wcagLabel(ratio: number): { level: string; color: string } {
  if (ratio >= 7) return { level: 'AAA', color: '#34d399' }
  if (ratio >= 4.5) return { level: 'AA', color: '#34d399' }
  if (ratio >= 3) return { level: 'AA Large', color: 'rgb(251,191,36)' }
  return { level: 'Fail', color: '#f87171' }
}

function generatePalette(baseHex: string) {
  const [h, s, l] = hexToHsl(baseHex)
  return {
    monochromatic: [100, 80, 65, 50, 35].map(lightness => ({ hex: hslToHex(h, s, lightness), name: `L${lightness}` })),
    complementary: [
      { hex: baseHex, name: 'Base' },
      { hex: hslToHex(h, s, Math.max(20, l - 20)), name: 'Dark' },
      { hex: hslToHex(h, s, Math.min(90, l + 20)), name: 'Light' },
      { hex: hslToHex(h + 180, s, l), name: 'Complement' },
      { hex: hslToHex(h + 180, s, Math.max(20, l - 10)), name: 'Comp Dark' },
    ],
    analogous: [-30, -15, 0, 15, 30].map(offset => ({ hex: hslToHex(h + offset, s, l), name: `${offset > 0 ? '+' : ''}${offset}°` })),
    triadic: [0, 120, 240].flatMap((offset, i) => [
      { hex: hslToHex(h + offset, s, l), name: `T${i + 1}` },
      { hex: hslToHex(h + offset, Math.max(20, s - 20), Math.min(80, l + 15)), name: `T${i + 1} Light` },
    ]).slice(0, 5),
    shades: [95, 80, 65, 45, 25].map(lightness => ({ hex: hslToHex(h, Math.max(5, s - 20 + (lightness > 60 ? 10 : 0)), lightness), name: `S${lightness}` })),
  }
}

const EXAMPLE_COLORS = [
  { hex: '#06d6ff', label: 'Cyan' },
  { hex: '#6366f1', label: 'Indigo' },
  { hex: '#f87171', label: 'Red' },
  { hex: '#34d399', label: 'Green' },
  { hex: '#fbbf24', label: 'Amber' },
  { hex: '#a78bfa', label: 'Purple' },
]

function ColorSwatch({ hex, name }: { hex: string; name: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(hex)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy} className="flex flex-col items-center gap-1 group" title={`Copy ${hex}`}>
      <div className="w-full h-14 rounded-lg transition-transform group-hover:scale-105 group-hover:shadow-lg"
        style={{ background: hex }} />
      <span className="text-[10px] font-mono text-white/40 group-hover:text-white/70 transition-colors">
        {copied ? 'Copied!' : hex}
      </span>
      <span className="text-[9px] text-white/25">{name}</span>
    </button>
  )
}

function PaletteRow({ title, colors, accent }: { title: string; colors: { hex: string; name: string }[]; accent: string }) {
  const [copiedAll, setCopiedAll] = useState(false)
  function copyAll() {
    navigator.clipboard.writeText(colors.map(c => c.hex).join(', '))
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-black uppercase tracking-widest" style={{ color: accent }}>{title}</p>
        <button onClick={copyAll}
          className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all"
          style={{ background: copiedAll ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.05)', color: copiedAll ? '#4ade80' : 'rgba(255,255,255,0.3)' }}>
          {copiedAll ? 'All Copied!' : 'Copy All'}
        </button>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {colors.map(c => <ColorSwatch key={c.hex + c.name} hex={c.hex} name={c.name} />)}
      </div>
    </div>
  )
}

export default function ColorPalettePage() {
  const [baseColor, setBaseColor] = useState('#06d6ff')
  const [inputHex, setInputHex] = useState('#06d6ff')
  const [copiedCss, setCopiedCss] = useState(false)
  const [tailwindCopied, setTailwindCopied] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)
  const [contrastA, setContrastA] = useState(0)
  const [contrastB, setContrastB] = useState(4)

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (/^[0-9a-fA-F]{6}$/.test(hash)) {
      setBaseColor('#' + hash)
      setInputHex('#' + hash)
    }
  }, [])

  const palette = generatePalette(baseColor)
  const [h, s, l] = hexToHsl(baseColor)

  const allSwatchHexes = palette.shades.map(c => c.hex)

  function applyHex(val: string) {
    setInputHex(val)
    if (/^#[0-9a-fA-F]{6}$/.test(val)) setBaseColor(val)
  }

  const cssVars = Object.entries(palette.shades).map(([, c], i) =>
    `  --color-${100 + i * 100}: ${c.hex};`
  ).join('\n')

  function copyCss() {
    const css = `:root {\n${cssVars}\n}`
    navigator.clipboard.writeText(css)
    setCopiedCss(true)
    setTimeout(() => setCopiedCss(false), 2000)
  }

  function copyTailwindConfig() {
    const shadeKeys = [100, 300, 500, 700, 900]
    const entries = palette.shades.map((c, i) => `      ${shadeKeys[i]}: '${c.hex}'`).join(',\n')
    const config = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        primary: {\n${entries}\n        }\n      }\n    }\n  }\n}`
    navigator.clipboard.writeText(config)
    setTailwindCopied(true)
    setTimeout(() => setTailwindCopied(false), 2000)
  }

  function shareUrl() {
    const newUrl = window.location.pathname + '#' + baseColor.slice(1)
    window.history.pushState({}, '', newUrl)
    navigator.clipboard.writeText(window.location.origin + newUrl)
    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 2000)
  }

  const ACCENT = '#06d6ff'

  const hex1 = allSwatchHexes[contrastA] || '#000000'
  const hex2 = allSwatchHexes[contrastB] || '#ffffff'
  const ratio = contrastRatio(hex1, hex2)
  const { level, color: wcagColor } = wcagLabel(ratio)

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-10">

        <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/30 hover:text-white/60 transition-colors mb-8">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase mb-3"
            style={{ borderColor: 'rgba(6,182,212,0.25)', background: 'rgba(6,182,212,0.08)', color: '#06d6ff' }}>
            Free Tool · No Account · Browser Only
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Color Palette Generator</h1>
          <p className="text-white/40 text-sm mb-4">Generate color palettes from any base color with WCAG contrast checking, Tailwind CSS export, and shareable URLs. License from $29, or get all 51 tools from $149.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/pricing" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-black transition-all"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>
              Get this tool — $29 →
            </Link>
            <Link href="/pricing" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black border text-white/60 transition-all"
              style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
              All 51 tools — from $149 →
            </Link>
          </div>
        </div>

        {/* Color picker + hex input */}
        <div className="rounded-2xl border p-6 mb-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-4 mb-5">
            <label className="relative cursor-pointer">
              <div className="w-16 h-16 rounded-xl border-2 border-white/20 overflow-hidden"
                style={{ background: baseColor }}>
                <input type="color" value={baseColor}
                  onChange={e => { setBaseColor(e.target.value); setInputHex(e.target.value) }}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
              </div>
            </label>
            <div className="flex-1">
              <p className="text-xs text-white/30 mb-1">Hex color</p>
              <input value={inputHex} onChange={e => applyHex(e.target.value)}
                maxLength={7}
                className="w-full bg-transparent border rounded-lg px-3 py-2 text-white/80 font-mono text-sm outline-none"
                style={{ borderColor: 'rgba(255,255,255,0.12)' }} />
              <p className="text-xs text-white/20 mt-1">HSL: {h}° {s}% {l}%</p>
            </div>
            <button onClick={shareUrl}
              className="text-xs font-bold px-3 py-2 rounded-lg transition-all flex-shrink-0"
              style={{ background: shareCopied ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.05)', color: shareCopied ? '#4ade80' : 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {shareCopied ? 'Link Copied!' : '↗ Share'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <p className="w-full text-xs text-white/25 mb-1">Try a preset:</p>
            {EXAMPLE_COLORS.map(c => (
              <button key={c.hex} onClick={() => { setBaseColor(c.hex); setInputHex(c.hex) }}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                style={{ background: `${c.hex}18`, border: `1px solid ${c.hex}35`, color: c.hex }}>
                <span className="w-3 h-3 rounded-full" style={{ background: c.hex }} />
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Palettes */}
        <PaletteRow title="Monochromatic" colors={palette.monochromatic} accent={ACCENT} />
        <PaletteRow title="Complementary" colors={palette.complementary} accent={ACCENT} />
        <PaletteRow title="Analogous" colors={palette.analogous} accent={ACCENT} />
        <PaletteRow title="Triadic" colors={palette.triadic} accent={ACCENT} />
        <PaletteRow title="Shades" colors={palette.shades} accent={ACCENT} />

        {/* WCAG Contrast Checker */}
        <div className="mt-2 rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-3">WCAG Contrast Checker</p>
          <div className="flex gap-2 mb-3">
            {([contrastA, contrastB] as const).map((idx, i) => (
              <select key={i} value={i === 0 ? contrastA : contrastB}
                onChange={e => i === 0 ? setContrastA(Number(e.target.value)) : setContrastB(Number(e.target.value))}
                className="flex-1 text-xs bg-transparent border rounded px-2 py-1.5 text-white/60 outline-none"
                style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#0a0f1a' }}>
                {allSwatchHexes.map((hex, j) => (
                  <option key={j} value={j} style={{ background: '#0a0f1a' }}>{hex}</option>
                ))}
              </select>
            ))}
          </div>
          <div className="flex gap-3 items-center">
            <div className="flex-1 rounded-lg p-3 text-center font-black text-lg" style={{ background: hex2, color: hex1 }}>Aa</div>
            <div className="flex-1 rounded-lg p-3 text-center font-black text-lg" style={{ background: hex1, color: hex2 }}>Aa</div>
            <div className="text-center flex-shrink-0">
              <div className="text-xl font-black text-white">{ratio.toFixed(1)}:1</div>
              <div className="text-xs font-bold px-2 py-0.5 rounded mt-1" style={{ background: `${wcagColor}20`, color: wcagColor }}>{level}</div>
            </div>
          </div>
        </div>

        {/* CSS + Tailwind Export */}
        <div className="rounded-xl border overflow-hidden mt-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/6">
            <span className="text-xs font-bold text-white/25 uppercase tracking-widest">CSS Variables (Shades)</span>
            <div className="flex gap-2">
              <button onClick={copyTailwindConfig}
                className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                style={{ background: tailwindCopied ? 'rgba(74,222,128,0.12)' : 'rgba(99,102,241,0.1)', color: tailwindCopied ? '#4ade80' : '#818cf8', border: `1px solid ${tailwindCopied ? 'rgba(74,222,128,0.25)' : 'rgba(99,102,241,0.25)'}` }}>
                {tailwindCopied ? 'Copied!' : 'Tailwind Config'}
              </button>
              <button onClick={copyCss}
                className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                style={{ background: copiedCss ? 'rgba(74,222,128,0.12)' : 'rgba(6,182,212,0.1)', color: copiedCss ? '#4ade80' : '#06d6ff', border: `1px solid ${copiedCss ? 'rgba(74,222,128,0.25)' : 'rgba(6,182,212,0.25)'}` }}>
                {copiedCss ? 'Copied!' : 'Copy CSS'}
              </button>
            </div>
          </div>
          <pre className="p-4 text-xs font-mono text-white/50 overflow-auto">{`:root {\n${cssVars}\n}`}</pre>
        </div>

        <p className="text-xs text-white/15 mt-4 text-center">
          All color math runs in your browser. Click any swatch to copy its hex code.
        </p>

        {/* Who This Is For */}
        <div className="mt-10 rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-3">Who This Is For</p>
          <ul className="space-y-1.5">
            {[
              'UI designers building accessible color systems with WCAG compliance',
              'Frontend developers exporting palettes directly to Tailwind CSS config',
              'Brand teams generating on-brand color variations from a primary hex',
              'Indie makers who need a quick shareable color palette without an Adobe account',
            ].map(item => (
              <li key={item} className="text-xs text-white/50 flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5 flex-shrink-0">→</span>{item}
              </li>
            ))}
          </ul>
        </div>

        {/* How It Works */}
        <div className="mt-14 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-xl font-black text-white mb-1">How It Works</h2>
          <p className="text-white/35 text-sm mb-8">Generates harmonious color palettes using HSL color theory — all in your browser.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { n: '01', title: 'Pick a base color', body: 'Enter any hex code or use the color picker. Use your brand primary color, logo color, or any starting point.' },
              { n: '02', title: 'Color math in HSL', body: 'Hex is converted to HSL. Complementary = +180° hue. Analogous = ±30°. Triadic = ±120°. Shades vary L% only.' },
              { n: '03', title: 'Export + check WCAG', body: 'Copy any swatch, export CSS variables or Tailwind config, check WCAG contrast, and share a URL with your palette encoded.' },
            ].map(s => (
              <div key={s.n} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-xs font-black text-white/20 mb-2">{s.n}</div>
                <div className="text-sm font-black text-white mb-1">{s.title}</div>
                <div className="text-xs text-white/45 leading-relaxed">{s.body}</div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-4">Example — base color #06d6ff (Queldrex cyan)</p>
            <div className="space-y-3">
              {[
                { type: 'Complementary', colors: ['#06d6ff', '#ff7306'] },
                { type: 'Analogous', colors: ['#0641ff', '#06d6ff', '#06ffa5'] },
                { type: 'Triadic', colors: ['#06d6ff', '#ff0666', '#66ff06'] },
              ].map(r => (
                <div key={r.type} className="flex items-center gap-3">
                  <span className="text-xs text-white/35 w-28 flex-shrink-0">{r.type}</span>
                  <div className="flex gap-2">
                    {r.colors.map(c => (
                      <div key={c} className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-md flex-shrink-0" style={{ background: c }} />
                        <span className="text-xs font-mono text-white/40">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* License CTA */}
        <div className="mt-14 rounded-2xl border p-6 text-center" style={{ background: 'rgba(6,214,255,0.04)', borderColor: 'rgba(6,214,255,0.12)' }}>
          <p className="text-white font-black mb-1">Add color palette generation to your platform</p>
          <p className="text-white/40 text-sm mb-4">WCAG checker, Tailwind export, URL sharing. Client-side only, one-time license.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Get this tool — $29 →</Link>
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>All 51 tools — from $149 →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
