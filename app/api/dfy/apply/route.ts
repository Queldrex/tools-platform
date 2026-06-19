import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { saveDfyApplication, getScan } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, email, url, platform, message, scanId } = body

  if (!name || typeof name !== 'string' || name.trim().length < 1)
    return Response.json({ error: 'Name is required' }, { status: 400 })
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
    return Response.json({ error: 'Valid email is required' }, { status: 400 })
  if (!url || typeof url !== 'string' || url.trim().length < 3)
    return Response.json({ error: 'Website URL is required' }, { status: 400 })
  if (!message || typeof message !== 'string' || message.trim().length < 10)
    return Response.json({ error: 'Please tell us a bit about your business (min 10 chars)' }, { status: 400 })

  // Optionally pull score from existing scan
  let score: number | undefined
  if (scanId && typeof scanId === 'string') {
    const scan = await getScan(scanId).catch(() => null)
    if (scan) score = scan.score
  }

  await saveDfyApplication({
    id: uuidv4(),
    scanId: scanId || undefined,
    name: name.trim().slice(0, 100),
    email: email.trim().toLowerCase().slice(0, 200),
    url: url.trim().slice(0, 300),
    platform: typeof platform === 'string' ? platform.slice(0, 50) : 'Unknown',
    score,
    message: message.trim().slice(0, 2000),
    status: 'new',
    createdAt: new Date().toISOString(),
  })

  return Response.json({ ok: true })
}
