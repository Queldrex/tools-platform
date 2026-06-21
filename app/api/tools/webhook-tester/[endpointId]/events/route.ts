import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(_request: NextRequest, { params }: { params: { endpointId: string } }) {
  const { endpointId } = params

  if (!endpointId || !/^[a-f0-9-]{20,40}$/.test(endpointId)) {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 })
  }

  try {
    const redis = getRedis()
    const listKey = `webhook:list:${endpointId}`
    const ids = await redis.lrange(listKey, 0, 19)

    if (!ids || ids.length === 0) return NextResponse.json({ events: [] })

    const events = await Promise.all(
      ids.map(async (id) => {
        const raw = await redis.get<string>(`webhook:event:${endpointId}:${id}`)
        if (!raw) return null
        try { return typeof raw === 'string' ? JSON.parse(raw) : raw } catch { return null }
      })
    )

    return NextResponse.json({ events: events.filter(Boolean) })
  } catch {
    return NextResponse.json({ events: [] })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { endpointId: string } }) {
  const { endpointId } = params

  if (!endpointId || !/^[a-f0-9-]{20,40}$/.test(endpointId)) {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 })
  }

  try {
    const redis = getRedis()
    const listKey = `webhook:list:${endpointId}`
    const ids = await redis.lrange(listKey, 0, 99)

    const keysToDelete = [listKey, ...ids.map((id: string) => `webhook:event:${endpointId}:${id}`)]
    await redis.del(...keysToDelete)
  } catch { /* ignore */ }

  return NextResponse.json({ cleared: true })
}
