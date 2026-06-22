import { NextRequest } from 'next/server'
import { getRedis } from '@/lib/store/redis'
import { randomUUID } from 'crypto'
import { adminAuthCheck } from '@/lib/admin-auth'
import { sendSmsAlert } from '@/lib/sms/twilio'

export const dynamic = 'force-dynamic'

export interface ToolRequest {
  id: string
  name: string
  email: string
  toolName: string
  description: string
  useCase?: string
  category?: string
  status: 'new' | 'reviewing' | 'planned' | 'building' | 'live' | 'declined'
  createdAt: string
}

const TR_KEY = 'toolrequests'
const trEntryKey = (id: string) => `toolrequest:entry:${id}`

export async function POST(request: NextRequest) {
  let body: { name?: string; email?: string; toolName?: string; description?: string; useCase?: string; category?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, email, toolName, description, useCase, category } = body
  if (!name || !email || !toolName || !description) {
    return Response.json({ error: 'name, email, toolName, description are required' }, { status: 400 })
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Invalid email' }, { status: 400 })
  }

  const entry: ToolRequest = {
    id: randomUUID(),
    name: name.trim().slice(0, 100),
    email: email.trim().toLowerCase().slice(0, 200),
    toolName: toolName.trim().slice(0, 150),
    description: description.trim().slice(0, 2000),
    useCase: useCase?.trim().slice(0, 1000),
    category: category?.trim().slice(0, 100),
    status: 'new',
    createdAt: new Date().toISOString(),
  }

  const redis = getRedis()
  await Promise.all([
    redis.zadd(TR_KEY, { score: Date.now(), member: entry.id }),
    redis.set(trEntryKey(entry.id), JSON.stringify(entry)),
  ])

  // Notify admin — non-fatal
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY!.replace(/^﻿/, '').trim())
    resend.emails.send({
      from: 'Queldrex System <reports@queldrex.com>',
      to: process.env.ADMIN_EMAIL || 'hello@queldrex.com',
      subject: `💡 New Tool Request — ${entry.toolName}`,
      html: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#f8fafc;padding:32px;">
<div style="max-width:520px;margin:0 auto;background:#0f172a;padding:28px;border-radius:12px;">
  <div style="font-size:11px;color:#22d3ee;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:12px;">Queldrex · Tool Request</div>
  <div style="font-size:20px;font-weight:800;color:white;margin-bottom:4px;">${entry.toolName}</div>
  <div style="font-size:13px;color:#94a3b8;margin-bottom:20px;">${entry.category || 'Uncategorized'}</div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
    <tr><td style="font-size:12px;color:#64748b;padding:5px 0;">From</td><td style="font-size:13px;color:white;text-align:right;">${entry.name} &lt;${entry.email}&gt;</td></tr>
  </table>
  <div style="background:#1e293b;border-radius:8px;padding:14px;margin-bottom:12px;">
    <div style="font-size:10px;color:#475569;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">Description</div>
    <div style="font-size:13px;color:#cbd5e1;line-height:1.6;">${entry.description}</div>
  </div>
  ${entry.useCase ? `<div style="background:#1e293b;border-radius:8px;padding:14px;">
    <div style="font-size:10px;color:#475569;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">Use Case</div>
    <div style="font-size:13px;color:#94a3b8;line-height:1.6;">${entry.useCase}</div>
  </div>` : ''}
</div>
</body></html>`,
    }).catch(() => {})
  } catch { /* email is non-fatal */ }

  sendSmsAlert(`[Queldrex] New tool request: "${entry.toolName}" from ${entry.name}. Check admin.`).catch(() => {})

  return Response.json({ ok: true, id: entry.id })
}

// Admin only — get all tool requests
export async function GET(request: NextRequest) {
  if (!await adminAuthCheck(request)) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const redis = getRedis()
  const ids = await redis.zrange(TR_KEY, 0, 199, { rev: true }) as string[]
  if (ids.length === 0) return Response.json({ requests: [], total: 0 })
  const raws = await Promise.all(ids.map(id => redis.get<string>(trEntryKey(id))))
  const requests = raws.map(r => {
    if (!r) return null
    try { return typeof r === 'string' ? JSON.parse(r) : r } catch { return null }
  }).filter(Boolean)
  return Response.json({ requests, total: requests.length })
}

// Admin only — update status
export async function PATCH(request: NextRequest) {
  if (!await adminAuthCheck(request)) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, status } = await request.json().catch(() => ({}))
  if (!id || !status) return Response.json({ error: 'id and status required' }, { status: 400 })
  const redis = getRedis()
  const raw = await redis.get<string>(trEntryKey(id))
  if (!raw) return Response.json({ error: 'Not found' }, { status: 404 })
  const entry = typeof raw === 'string' ? JSON.parse(raw) : raw
  await redis.set(trEntryKey(id), JSON.stringify({ ...entry, status }))
  return Response.json({ ok: true })
}
