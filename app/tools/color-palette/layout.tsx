import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Color Palette Generator — Queldrex',
  description: 'Generate, browse, and copy color palettes for your UI or brand. Pick any hue and get a full palette with hex codes, shades, and tints ready to use.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
