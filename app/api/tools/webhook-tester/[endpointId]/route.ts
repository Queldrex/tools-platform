import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const TTL = 3600 // 1 hour
const MAX_EVENTS = 20

export async function GET(request: NextRequest, { params }: { params: { endpointId: string } }) {
  return handleWebhook(request, params.endpointId)
}
export async function POST(request: NextRequest, { params }: { params: { endpointId: string } }) {
  return handleWebhook(request, params.endpointId)
}
export async function PUT(request: NextRequest, { params }: { params: { endpointId: string } }) {
  return handleWebhook(request, params.endpointId)
}
export async function PATCH(request: NextRequest, { params }: { params: { endpointId: string } }) {
  return handleWebhook(request, params.endpointId)
}
export async function DELETE(request: NextRequest, { params }: { params: { endpointId: string } }) {
  return handleWebhook(request, params.endpointId)
}

async function handleWebhook(request: NextRequest, endpointId: string) {
  // Validate endpointId to be a UUID-like string
  if (!endpointId || !/^[a-f0-9-]{20,40}$/.test(endpointId)) {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 })
  }

  let body = ''
  try { body = await request.text() } catch { /* ignore */ }

  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    // Skip internal/sensitive headers
    if (!['cookie', 'authorization', 'x-vercel-signature'].includes(key.toLowerCase())) {
      headers[key] = value
    }
  })

  const event = {
    id: Date.now().toString(),
    method: request.method,
    headers,
    body,
    timestamp: new Date().toISOString(),
    contentType: request.headers.get('content-type') || null,
    query: Object.fromEntries(new URL(request.url).searchParams),
  }

  try {
    const redis = getRedis()
    const listKey = `webhook:list:${endpointId}`
    const eventKey = `webhook:event:${endpointId}:${event.id}`

    await redis.set(eventKey, JSON.stringify(event), { ex: TTL })
    await redis.lpush(listKey, event.id)
    await redis.ltrim(listKey, 0, MAX_EVENTS - 1)
    await redis.expire(listKey, TTL)
  } catch {
    // Don't fail the webhook sender if Redis is down
  }

  return NextResponse.json({ received: true, id: event.id }, { status: 200 })
}
