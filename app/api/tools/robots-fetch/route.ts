import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { hasFreeOrProAccess } = await import('@/lib/tool-access')
  const access = await hasFreeOrProAccess(request, 'robots-fetch', 20)
  if (!access.allowed) return NextResponse.json({ error: 'upgrade' }, { status: 402 })

  const { url } = await request.json()
  if (!url || typeof url !== 'string') return NextResponse.json({ error: 'URL required' }, { status: 400 })

  try {
    const base = url.startsWith('http') ? url : `https://${url}`
    const robotsUrl = new URL('/robots.txt', base).toString()
    const res = await fetch(robotsUrl, {
      headers: { 'User-Agent': 'Queldrex-Bot/1.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return NextResponse.json({ error: `Could not fetch (${res.status})` }, { status: 400 })
    const text = await res.text()
    return NextResponse.json({ text })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch robots.txt' }, { status: 400 })
  }
}
