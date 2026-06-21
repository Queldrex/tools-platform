import { NextRequest } from 'next/server'
import { getRedis, checkProSession } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'

interface OpenApiSpec {
  paths?: Record<string, Record<string, { parameters?: Array<{ name: string; in: string; required?: boolean; schema?: { type?: string } }>; security?: unknown[]; responses?: Record<string, { content?: Record<string, { schema?: { properties?: Record<string, unknown>; required?: string[] } }> }> }>>
  components?: { schemas?: Record<string, unknown> }
  info?: { title?: string; version?: string }
}

interface DriftItem {
  type: string
  path: string
  method?: string
  detail: string
}

function extractEndpoints(spec: OpenApiSpec): Map<string, { parameters: Array<{ name: string; required: boolean; type?: string }>; hasSecurity: boolean; responseFields: Set<string> }> {
  const map = new Map<string, { parameters: Array<{ name: string; required: boolean; type?: string }>; hasSecurity: boolean; responseFields: Set<string> }>()
  for (const [path, methods] of Object.entries(spec.paths || {})) {
    for (const [method, op] of Object.entries(methods || {})) {
      if (['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method.toLowerCase())) {
        const key = `${method.toUpperCase()} ${path}`
        const params = (op.parameters || []).map(p => ({ name: p.name, required: p.required ?? false, type: p.schema?.type }))
        const hasSecurity = Array.isArray(op.security) ? op.security.length > 0 : false
        const responseFields = new Set<string>()
        for (const resp of Object.values(op.responses || {})) {
          for (const mediaType of Object.values(resp.content || {})) {
            for (const field of Object.keys(mediaType.schema?.properties || {})) responseFields.add(field)
          }
        }
        map.set(key, { parameters: params, hasSecurity, responseFields })
      }
    }
  }
  return map
}

export async function POST(request: NextRequest) {
  const proSessionId = request.cookies.get('queldrex_pro')?.value ?? ''
  const isPro = proSessionId ? await checkProSession(proSessionId) : false

  if (!isPro) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const redis = getRedis()
    const uses = await redis.incr(`drift_uses:${ip}`)
    if (uses === 1) await redis.expire(`drift_uses:${ip}`, 60 * 60 * 24)
    if (uses > 1) return Response.json({ paywall: true }, { status: 402 })
  }

  let body: { specA?: string; specB?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  let specA: OpenApiSpec, specB: OpenApiSpec
  try { specA = JSON.parse(body.specA || '') } catch { return Response.json({ error: 'Spec A is not valid JSON' }, { status: 400 }) }
  try { specB = JSON.parse(body.specB || '') } catch { return Response.json({ error: 'Spec B is not valid JSON' }, { status: 400 }) }

  if (!specA.paths && !specA.components) return Response.json({ error: 'Spec A does not appear to be an OpenAPI spec (no paths or components)' }, { status: 400 })
  if (!specB.paths && !specB.components) return Response.json({ error: 'Spec B does not appear to be an OpenAPI spec (no paths or components)' }, { status: 400 })

  const endpointsA = extractEndpoints(specA)
  const endpointsB = extractEndpoints(specB)

  const breaking: DriftItem[] = []
  const additive: DriftItem[] = []
  let unchanged = 0

  // Check removed endpoints
  for (const [key] of endpointsA) {
    if (!endpointsB.has(key)) {
      const [method, ...pathParts] = key.split(' ')
      breaking.push({ type: 'endpoint_removed', path: pathParts.join(' '), method, detail: `Endpoint ${key} was removed` })
    }
  }

  // Check added endpoints
  for (const [key] of endpointsB) {
    if (!endpointsA.has(key)) {
      const [method, ...pathParts] = key.split(' ')
      additive.push({ type: 'endpoint_added', path: pathParts.join(' '), method, detail: `New endpoint ${key} added` })
    }
  }

  // Check changed endpoints
  for (const [key, opA] of endpointsA) {
    const opB = endpointsB.get(key)
    if (!opB) continue

    const [method, ...pathParts] = key.split(' ')
    const path = pathParts.join(' ')
    let changed = false

    // Required param added
    for (const paramB of opB.parameters) {
      if (!paramB.required) continue
      const paramA = opA.parameters.find(p => p.name === paramB.name)
      if (!paramA) {
        breaking.push({ type: 'required_param_added', path, method, detail: `Required parameter '${paramB.name}' added — existing clients won't send it` })
        changed = true
      }
    }

    // Param type changed
    for (const paramB of opB.parameters) {
      const paramA = opA.parameters.find(p => p.name === paramB.name)
      if (paramA && paramB.type && paramA.type && paramA.type !== paramB.type) {
        breaking.push({ type: 'param_type_changed', path, method, detail: `Parameter '${paramB.name}' type changed from '${paramA.type}' to '${paramB.type}'` })
        changed = true
      }
    }

    // Param removed
    for (const paramA of opA.parameters) {
      const paramB = opB.parameters.find(p => p.name === paramA.name)
      if (!paramB && paramA.required) {
        breaking.push({ type: 'required_param_removed', path, method, detail: `Required parameter '${paramA.name}' removed` })
        changed = true
      } else if (!paramB && !paramA.required) {
        additive.push({ type: 'optional_param_removed', path, detail: `Optional parameter '${paramA.name}' removed from ${method} ${path}` })
        changed = true
      }
    }

    // Response field removed
    for (const field of opA.responseFields) {
      if (!opB.responseFields.has(field)) {
        breaking.push({ type: 'response_field_removed', path, method, detail: `Response field '${field}' removed — clients depending on it will break` })
        changed = true
      }
    }

    // Response field added
    for (const field of opB.responseFields) {
      if (!opA.responseFields.has(field)) {
        additive.push({ type: 'response_field_added', path, detail: `New response field '${field}' added to ${method} ${path}` })
        changed = true
      }
    }

    // Security added
    if (!opA.hasSecurity && opB.hasSecurity) {
      breaking.push({ type: 'auth_added', path, method, detail: `Authentication requirement added — unauthenticated clients will get 401` })
      changed = true
    }

    if (!changed) unchanged++
  }

  return Response.json({
    breaking,
    additive,
    unchanged,
    summary: { breakingCount: breaking.length, additiveCount: additive.length, unchangedCount: unchanged },
  })
}
