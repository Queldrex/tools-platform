import { NextRequest } from 'next/server'
import { getRedis } from '@/lib/store/redis'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let body: Record<string, string>
  try {
    const ct = request.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      body = await request.json()
    } else {
      const fd = await request.formData()
      body = Object.fromEntries([...fd.entries()].map(([k, v]) => [k, String(v)]))
    }
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { name, email, company, serviceType, description, budget, timeline } = body
  if (!name || !email || !serviceType || !description) {
    return Response.redirect(new URL('/services?error=missing', request.url))
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.redirect(new URL('/services?error=email', request.url))
  }

  const id = randomUUID()
  const entry = {
    id,
    name: name.trim().slice(0, 100),
    email: email.trim().toLowerCase(),
    company: company?.trim().slice(0, 200),
    serviceType,
    description: description.trim().slice(0, 3000),
    budget,
    timeline,
    status: 'new',
    createdAt: new Date().toISOString(),
  }

  const redis = getRedis()
  await Promise.all([
    redis.zadd('buildrequests', { score: Date.now(), member: id }),
    redis.set(`buildrequest:${id}`, JSON.stringify(entry)),
  ])

  // Email admin
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY!.replace(/^﻿/, '').trim())
    resend.emails.send({
      from: 'Queldrex System <reports@queldrex.com>',
      to: process.env.ADMIN_EMAIL || 'janitor.clean.base@gmail.com',
      subject: `🔨 New Build Request — ${serviceType} from ${name}`,
      html: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#f8fafc;padding:32px;">
<div style="max-width:540px;margin:0 auto;background:#0f172a;padding:28px;border-radius:12px;">
  <div style="font-size:11px;color:#22d3ee;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:12px;">Queldrex · Build Request</div>
  <div style="font-size:20px;font-weight:800;color:white;margin-bottom:16px;">${serviceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
    <tr><td style="font-size:12px;color:#64748b;padding:5px 0;width:110px;">Name</td><td style="font-size:13px;color:white;">${name}</td></tr>
    <tr><td style="font-size:12px;color:#64748b;padding:5px 0;">Email</td><td style="font-size:13px;color:#22d3ee;">${email}</td></tr>
    ${company ? `<tr><td style="font-size:12px;color:#64748b;padding:5px 0;">Company</td><td style="font-size:13px;color:white;">${company}</td></tr>` : ''}
    ${budget ? `<tr><td style="font-size:12px;color:#64748b;padding:5px 0;">Budget</td><td style="font-size:13px;color:white;">${budget}</td></tr>` : ''}
    ${timeline ? `<tr><td style="font-size:12px;color:#64748b;padding:5px 0;">Timeline</td><td style="font-size:13px;color:white;">${timeline}</td></tr>` : ''}
  </table>
  <div style="background:#1e293b;border-radius:8px;padding:14px;">
    <div style="font-size:10px;color:#475569;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">What They Need</div>
    <div style="font-size:13px;color:#cbd5e1;line-height:1.7;white-space:pre-wrap;">${description}</div>
  </div>
  <div style="margin-top:16px;padding-top:16px;border-top:1px solid #1e293b;">
    <a href="mailto:${email}?subject=Re: Your Queldrex build request" style="display:inline-block;background:linear-gradient(135deg,#06d6ff,#0891b2);color:#000;font-weight:700;font-size:13px;padding:10px 20px;border-radius:8px;text-decoration:none;">Reply to ${name}</a>
  </div>
</div>
</body></html>`,
    }).catch(() => {})
  } catch { /* email non-fatal */ }

  return Response.redirect(new URL('/services/thanks', request.url))
}

export async function GET(request: NextRequest) {
  const secret = request.headers.get('x-admin-secret')
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const redis = getRedis()
  const ids = await redis.zrange('buildrequests', 0, 199, { rev: true }) as string[]
  if (!ids.length) return Response.json({ requests: [], total: 0 })
  const raws = await Promise.all(ids.map(id => redis.get<string>(`buildrequest:${id}`)))
  const requests = raws.map(r => { try { return r ? (typeof r === 'string' ? JSON.parse(r) : r) : null } catch { return null } }).filter(Boolean)
  return Response.json({ requests, total: requests.length })
}

export async function PATCH(request: NextRequest) {
  const secret = request.headers.get('x-admin-secret')
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id, status } = await request.json().catch(() => ({}))
  if (!id || !status) return Response.json({ error: 'id and status required' }, { status: 400 })
  const redis = getRedis()
  const raw = await redis.get<string>(`buildrequest:${id}`)
  if (!raw) return Response.json({ error: 'Not found' }, { status: 404 })
  const entry = typeof raw === 'string' ? JSON.parse(raw) : raw
  await redis.set(`buildrequest:${id}`, JSON.stringify({ ...entry, status }))
  return Response.json({ ok: true })
}
