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

  const { id, status } = await request.json()
  if (!id || !status) return Response.json({ error: 'id and status required' }, { status: 400 })
  if (!ALLOWED_STATUSES.includes(status)) return Response.json({ error: 'Invalid status' }, { status: 400 })

  await updateDfyApplication(id, { status })
  return Response.json({ ok: true })
}
