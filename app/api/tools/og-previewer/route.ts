import { NextRequest, NextResponse } from 'next/server'
import { hasFreeOrProAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 15

function getMeta(html: string, name: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]*(?:name|property)=["']${name}["'][^>]*content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*(?:name|property)=["']${name}["']`, 'i'),
  ]
  for (const p of patterns) {
    const m = html.match(p)
    if (m?.[1]) return m[1]
  }
  return null
}

export async function POST(request: NextRequest) {
  const access = await hasFreeOrProAccess(request, 'og-previewer', 5)
  if (!access.allowed) return NextResponse.json({ paywall: true }, { status: 402 })

  try {
    const { url } = await request.json()
    if (!url || typeof url !== 'string') return NextResponse.json({ error: 'URL required' }, { status: 400 })

    let fetchUrl = url.trim()
    if (!/^https?:\/\//i.test(fetchUrl)) fetchUrl = 'https://' + fetchUrl

    const res = await fetch(fetchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; QueldrexBot/1.0; +https://queldrex.com)' },
      signal: AbortSignal.timeout(8000),
      redirect: 'follow',
    })

    if (!res.ok) return NextResponse.json({ error: `Fetch failed: ${res.status} ${res.statusText}` }, { status: 422 })

    const html = await res.text()

    const title = getMeta(html, 'og:title') || html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || null
    const description = getMeta(html, 'og:description') || getMeta(html, 'description') || null
    const image = getMeta(html, 'og:image') || null
    const siteName = getMeta(html, 'og:site_name') || null
    const twitterCard = getMeta(html, 'twitter:card') || null
    const twitterTitle = getMeta(html, 'twitter:title') || title
    const twitterDescription = getMeta(html, 'twitter:description') || description
    const twitterImage = getMeta(html, 'twitter:image') || image
    const canonical = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] || fetchUrl
    const type = getMeta(html, 'og:type') || 'website'
    const themeColor = getMeta(html, 'theme-color') || null

    // Collect all raw meta tags
    const rawTags: { name: string; content: string }[] = []
    const metaRe = /<meta[^>]*(name|property)=["']([^"']+)["'][^>]*content=["']([^"']+)["'][^>]*/gi
    let match
    while ((match = metaRe.exec(html)) !== null) {
      rawTags.push({ name: match[2], content: match[3] })
    }

    return NextResponse.json({
      url: fetchUrl,
      title,
      description,
      image,
      siteName,
      type,
      twitterCard,
      twitterTitle,
      twitterDescription,
      twitterImage,
      canonical,
      themeColor,
      rawTags: rawTags.slice(0, 30),
      remaining: access.remaining,
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to fetch URL' }, { status: 500 })
  }
}
