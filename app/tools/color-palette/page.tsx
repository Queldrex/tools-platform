'use client'

import { useState, useCallback } from 'react'
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

function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5
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

  const palette = generatePalette(baseColor)
  const [h, s, l] = hexToHsl(baseColor)

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

  const ACCENT = '#06d6ff'

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
            Free Tool · Design
          </div>
          <h1 className="text-3xl font-black text-white mb-1">Color Palette Generator</h1>
          <p className="text-white/40 text-sm">Enter any base color and instantly generate monochromatic, complementary, analogous, and triadic palettes. Click any swatch to copy the hex code.</p>
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

        {/* CSS Export */}
        <div className="rounded-xl border overflow-hidden mt-2" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/6">
            <span className="text-xs font-bold text-white/25 uppercase tracking-widest">CSS Variables (Shades)</span>
            <button onClick={copyCss}
              className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
              style={{ background: copiedCss ? 'rgba(74,222,128,0.12)' : 'rgba(6,182,212,0.1)', color: copiedCss ? '#4ade80' : '#06d6ff', border: `1px solid ${copiedCss ? 'rgba(74,222,128,0.25)' : 'rgba(6,182,212,0.25)'}` }}>
              {copiedCss ? 'Copied!' : 'Copy CSS'}
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-white/50 overflow-auto">{`:root {\n${cssVars}\n}`}</pre>
        </div>

        <p className="text-xs text-white/15 mt-4 text-center">
          All color math runs in your browser. Click any swatch to copy its hex code.
        </p>

        {/* How It Works */}
        <div className="mt-14 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-xl font-black text-white mb-1">How It Works</h2>
          <p className="text-white/35 text-sm mb-8">Generates harmonious color palettes using HSL color theory — all in your browser.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { n: '01', title: 'Pick a base color', body: 'Enter any hex code or use the color picker. Use your brand primary color, logo color, or any starting point.' },
              { n: '02', title: 'Color math in HSL', body: 'Hex is converted to HSL. Complementary = +180° hue. Analogous = ±30°. Triadic = ±120°. Shades vary L% only.' },
              { n: '03', title: 'Copy as CSS', body: 'Click any swatch to copy the hex code. Or export the full palette as CSS custom properties with one click.' },
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
      </main>
      <Footer />
    </div>
  )
}
