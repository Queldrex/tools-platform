import { NextRequest } from 'next/server'
import { validateAdminSession } from '@/lib/store/redis'

export async function adminAuthCheck(request: NextRequest): Promise<boolean> {
  const secret = request.headers.get('x-admin-secret')
  const adminSecret = (process.env.ADMIN_SECRET || '').replace(/^﻿/, '').trim()
  if (secret && adminSecret && secret === adminSecret) return true
  const sessionToken = request.headers.get('x-session-token')
  if (sessionToken) return validateAdminSession(sessionToken)
  return false
}
