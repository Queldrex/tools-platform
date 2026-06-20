import { NextRequest } from 'next/server'
import { getDfyApplication, updateDfyApplication, deleteDfyCredentials, getDfySession, logSecurityEvent } from '@/lib/store/redis'
import { adminAuthCheck } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!await adminAuthCheck(request)) {
    logSecurityEvent({ ip, path: '/api/admin/complete-dfy', method: 'POST', success: false }).catch(() => {})
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { applicationId } = await request.json()
  if (!applicationId) return Response.json({ error: 'applicationId required' }, { status: 400 })

  const app = await getDfyApplication(applicationId)
  if (!app) return Response.json({ error: 'Application not found' }, { status: 404 })
  if (!app.dfyToken) return Response.json({ error: 'No dfyToken on this application' }, { status: 400 })

  // Get platform from the DFY session (stored when credentials were submitted)
  const session = await getDfySession(app.dfyToken)
  let platform = session?.credentialsPlatform || app.platform || 'unknown'

  // Delete credentials and record timestamp
  const deletedAt = await deleteDfyCredentials(app.dfyToken, platform)

  // Mark application complete
  await updateDfyApplication(applicationId, { status: 'complete', implemented: true })

  // Email client
  const { sendCredentialsDeletionEmail } = await import('@/lib/email/resend')
  await sendCredentialsDeletionEmail({
    to: app.email,
    name: app.name,
    domain: app.url,
    platform,
    deletedAt,
    referenceId: app.dfyToken.slice(0, 8),
  })

  return Response.json({ ok: true, deletedAt })
}
