import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

// Sets a short-lived session cookie after verifying ADMIN_SECRET.
// This lets middleware block /admin entirely for unauthenticated requests.
export async function POST(request: NextRequest) {
  let body: { secret?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid body' }, { status: 400 })
  }

  const adminSecret = (process.env.ADMIN_SECRET || '').replace(/^﻿/, '').trim()
  if (!adminSecret || body.secret !== adminSecret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const response = Response.json({ ok: true })
  // HttpOnly, Secure, SameSite=Strict — not readable by JS
  response.headers.set(
    'Set-Cookie',
    `admin_session=${adminSecret.slice(-16)}; HttpOnly; Secure; SameSite=Strict; Path=/admin; Max-Age=28800`
  )
  return response
}
