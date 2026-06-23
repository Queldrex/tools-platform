import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Color Palette Generator â€” Queldrex',
  description: 'Generate, browse, and copy color palettes for your UI or brand. Pick any hue and get a full palette with hex codes, shades, and tints ready to use.',
  alternates: { canonical: 'https://queldrex.com/tools/color-palette' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
