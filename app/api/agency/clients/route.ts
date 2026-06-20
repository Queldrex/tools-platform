import { NextRequest } from 'next/server'
import { getAgency, updateAgency } from '@/lib/store/redis'
import type { AgencyClient } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const agencyId = request.nextUrl.searchParams.get('agencyId')
  if (!agencyId) return Response.json({ error: 'agencyId required' }, { status: 400 })
  const agency = await getAgency(agencyId)
  if (!agency) return Response.json({ error: 'Agency not found' }, { status: 404 })
  return Response.json({ clients: agency.clients })
}

export async function POST(request: NextRequest) {
  let body: { agencyId?: string; domain?: string; label?: string; contactEmail?: string }
  try { body = await request.json() } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { agencyId, domain, label, contactEmail } = body
  if (!agencyId || !domain) {
    return Response.json({ error: 'agencyId and domain required' }, { status: 400 })
  }

  const agency = await getAgency(agencyId)
  if (!agency) return Response.json({ error: 'Agency not found' }, { status: 404 })
  if (agency.status !== 'active') return Response.json({ error: 'Agency subscription not active' }, { status: 403 })
  if (agency.scansUsedThisMonth >= agency.scansLimit) {
    return Response.json({ error: 'Monthly scan limit reached. Contact us for a custom plan.' }, { status: 429 })
  }

  const normalized = domain.trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/.*$/, '')
    .toLowerCase()

  const already = agency.clients.find(c => c.domain === normalized)
  if (already) return Response.json({ error: 'Client already added' }, { status: 409 })

  const newClient: AgencyClient = {
    id: crypto.randomUUID(),
    domain: normalized,
    label: label?.trim() || undefined,
    contactEmail: contactEmail?.trim() || undefined,
    addedAt: new Date().toISOString(),
  }

  const updated = [...agency.clients, newClient]
  await updateAgency(agencyId, { clients: updated })
  return Response.json({ clients: updated })
}

export async function DELETE(request: NextRequest) {
  const agencyId = request.nextUrl.searchParams.get('agencyId')
  const clientId = request.nextUrl.searchParams.get('clientId')
  if (!agencyId || !clientId) {
    return Response.json({ error: 'agencyId and clientId required' }, { status: 400 })
  }

  const agency = await getAgency(agencyId)
  if (!agency) return Response.json({ error: 'Agency not found' }, { status: 404 })

  const updated = agency.clients.filter(c => c.id !== clientId)
  await updateAgency(agencyId, { clients: updated })
  return Response.json({ clients: updated })
}
