import { NextRequest } from 'next/server'
import { getDfyApplications, updateDfyApplication } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const secret = request.headers.get('x-admin-secret')
  if (!secret || secret !== process.env.ADMIN_SECRET)
    return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const apps = await getDfyApplications(100)
  return Response.json({ applications: apps })
}

const ALLOWED_STATUSES = ['new', 'contacted', 'payment_sent', 'paid', 'rejected'] as const

export async function PATCH(request: NextRequest) {
  const secret = request.headers.get('x-admin-secret')
  if (!secret || secret !== process.env.ADMIN_SECRET)
    return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as { id?: string; status?: string; implemented?: boolean }
  const { id, status, implemented } = body
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  const updates: Record<string, unknown> = {}
  if (status !== undefined) {
    if (!ALLOWED_STATUSES.includes(status as typeof ALLOWED_STATUSES[number])) {
      return Response.json({ error: 'Invalid status' }, { status: 400 })
    }
    updates.status = status
  }
  if (implemented !== undefined) updates.implemented = implemented

  if (Object.keys(updates).length === 0) return Response.json({ error: 'Nothing to update' }, { status: 400 })

  await updateDfyApplication(id, updates as Parameters<typeof updateDfyApplication>[1])
  return Response.json({ ok: true })
}
