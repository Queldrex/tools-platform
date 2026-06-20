import { NextRequest } from 'next/server'
import { getDfyApplications, updateDfyApplication, logSecurityEvent } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const secret = request.headers.get('x-admin-secret')
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    logSecurityEvent({ ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown', path: new URL(request.url).pathname, method: request.method, success: false }).catch(() => {})
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apps = await getDfyApplications(100)
  return Response.json({ applications: apps })
}

const ALLOWED_STATUSES = ['new', 'contacted', 'payment_sent', 'paid', 'rejected'] as const

const ALLOWED_PRIORITIES = ['critical', 'high', 'medium', 'low'] as const

export async function PATCH(request: NextRequest) {
  const secret = request.headers.get('x-admin-secret')
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    logSecurityEvent({ ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown', path: new URL(request.url).pathname, method: request.method, success: false }).catch(() => {})
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as { id?: string; status?: string; implemented?: boolean; priority?: string; notes?: string; statusHistory?: Array<{ status: string; at: string }> }
  const { id, status, implemented, priority, notes, statusHistory } = body
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  const updates: Record<string, unknown> = {}
  if (status !== undefined) {
    if (!ALLOWED_STATUSES.includes(status as typeof ALLOWED_STATUSES[number])) {
      return Response.json({ error: 'Invalid status' }, { status: 400 })
    }
    updates.status = status
  }
  if (implemented !== undefined) updates.implemented = implemented
  if (priority !== undefined) {
    if (!ALLOWED_PRIORITIES.includes(priority as typeof ALLOWED_PRIORITIES[number])) {
      return Response.json({ error: 'Invalid priority' }, { status: 400 })
    }
    updates.priority = priority
  }
  if (notes !== undefined) updates.notes = notes
  if (statusHistory !== undefined) updates.statusHistory = statusHistory

  if (Object.keys(updates).length === 0) return Response.json({ error: 'Nothing to update' }, { status: 400 })

  await updateDfyApplication(id, updates as Parameters<typeof updateDfyApplication>[1])
  return Response.json({ ok: true })
}
