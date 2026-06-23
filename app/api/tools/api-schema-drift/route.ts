import { NextRequest } from 'next/server'
import { hasFreeOrProAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'

interface OpenApiSpec {
  paths?: Record<string, Record<string, {
    operationId?: string
    description?: string
    parameters?: Array<{ name: string; in: string; required?: boolean; schema?: { type?: string } }>
    security?: unknown[]
    responses?: Record<string, { content?: Record<string, { schema?: { type?: string; format?: string; properties?: Record<string, { type?: string; format?: string; properties?: Record<string, unknown> }>; required?: string[] } }> }>
  }>>
  components?: { schemas?: Record<string, unknown> }
  info?: { title?: string; version?: string }
}

interface DriftItem {
  type: string
  path: string
  method?: string
  detail: string
  severity: 'critical' | 'high' | 'medium' | 'info'
  consumerImpact?: string
}

function detectAiSmells(spec: OpenApiSpec): string[] {
  const smells: string[] = []
  const dateNames = ['date', 'time', 'timestamp', 'created_at', 'updated_at', 'createdat', 'updatedat', 'createtime', 'updatetime']
  const allPropNames: string[] = []
  const operationIds: string[] = []
  let endpointCount = 0
  let withDescription = 0

  for (const [, methods] of Object.entries(spec.paths || {})) {
    for (const [method, op] of Object.entries(methods || {})) {
      if (!['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method.toLowerCase())) continue
      endpointCount++
      if (op.description) withDescription++
      if (op.operationId) {
        if (operationIds.includes(op.operationId)) {
          if (!smells.includes('Duplicate operationId found')) smells.push('Duplicate operationId found')
        } else {
          operationIds.push(op.operationId)
        }
      }
      for (const resp of Object.values(op.responses || {})) {
        for (const mediaType of Object.values(resp.content || {})) {
          const props = mediaType.schema?.properties || {}
          for (const [propName, propDef] of Object.entries(props)) {
            allPropNames.push(propName)
            if (dateNames.some(d => propName.toLowerCase().includes(d)) && propDef.type === 'string' && !propDef.format) {
              if (!smells.includes("Missing date format on date fields (AI often forgets `format: date-time`)")) {
                smells.push("Missing date format on date fields (AI often forgets `format: date-time`)")
              }
            }
            if (propDef.type === 'object' && (!propDef.properties || Object.keys(propDef.properties).length === 0)) {
              if (!smells.includes('Object schemas with no properties (AI placeholder type)')) {
                smells.push('Object schemas with no properties (AI placeholder type)')
              }
            }
          }
        }
      }
    }
  }

  const hasCamel = allPropNames.some(n => /[a-z][A-Z]/.test(n))
  const hasSnake = allPropNames.some(n => n.includes('_'))
  if (hasCamel && hasSnake) smells.push('Inconsistent property naming: both camelCase and snake_case used')
  if (endpointCount > 2 && withDescription / endpointCount < 0.5) smells.push('Most endpoints lack descriptions (AI skeleton pattern)')

  return smells
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
  const access = await hasFreeOrProAccess(request, 'api-schema-drift', 1)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

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
  const migrationChecklist: string[] = []
  let unchanged = 0

  for (const [key] of endpointsA) {
    if (!endpointsB.has(key)) {
      const [method, ...pathParts] = key.split(' ')
      const path = pathParts.join(' ')
      breaking.push({ type: 'endpoint_removed', path, method, detail: `Endpoint ${key} was removed`, severity: 'critical', consumerImpact: 'Any callers will receive 404. Remove from all SDKs and integrations.' })
      if (migrationChecklist.length < 20) migrationChecklist.push(`[ ] Remove callers of ${method} ${path} — endpoint removed`)
    }
  }

  for (const [key] of endpointsB) {
    if (!endpointsA.has(key)) {
      const [method, ...pathParts] = key.split(' ')
      additive.push({ type: 'endpoint_added', path: pathParts.join(' '), method, detail: `New endpoint ${key} added`, severity: 'info' })
    }
  }

  for (const [key, opA] of endpointsA) {
    const opB = endpointsB.get(key)
    if (!opB) continue

    const [method, ...pathParts] = key.split(' ')
    const path = pathParts.join(' ')
    let changed = false

    for (const paramB of opB.parameters) {
      const paramA = opA.parameters.find(p => p.name === paramB.name)
      if (paramB.required && !paramA) {
        breaking.push({ type: 'required_param_added', path, method, detail: `Required parameter '${paramB.name}' added — existing clients won't send it`, severity: 'critical', consumerImpact: 'All existing API calls missing this parameter will receive 400 Bad Request.' })
        if (migrationChecklist.length < 20) migrationChecklist.push(`[ ] Add required '${paramB.name}' parameter to all ${method} ${path} requests`)
        changed = true
      } else if (paramA && !paramA.required && paramB.required) {
        breaking.push({ type: 'param_made_required', path, method, detail: `Parameter '${paramB.name}' changed from optional to required`, severity: 'high', consumerImpact: 'All existing API calls not sending this parameter will receive 400 Bad Request.' })
        if (migrationChecklist.length < 20) migrationChecklist.push(`[ ] Add now-required '${paramB.name}' parameter to all ${method} ${path} requests`)
        changed = true
      }
    }

    for (const paramB of opB.parameters) {
      const paramA = opA.parameters.find(p => p.name === paramB.name)
      if (paramA && paramB.type && paramA.type && paramA.type !== paramB.type) {
        breaking.push({ type: 'param_type_changed', path, method, detail: `Parameter '${paramB.name}' type changed from '${paramA.type}' to '${paramB.type}'`, severity: 'high', consumerImpact: 'All typed SDK clients will fail type checks.' })
        if (migrationChecklist.length < 20) migrationChecklist.push(`[ ] Handle type change: '${paramB.name}' changed from ${paramA.type} to ${paramB.type} in ${method} ${path}`)
        changed = true
      }
    }

    for (const paramA of opA.parameters) {
      const paramB = opB.parameters.find(p => p.name === paramA.name)
      if (!paramB && paramA.required) {
        breaking.push({ type: 'required_param_removed', path, method, detail: `Required parameter '${paramA.name}' removed`, severity: 'medium' })
        changed = true
      } else if (!paramB && !paramA.required) {
        additive.push({ type: 'optional_param_removed', path, detail: `Optional parameter '${paramA.name}' removed from ${method} ${path}`, severity: 'info' })
        changed = true
      }
    }

    for (const field of opA.responseFields) {
      if (!opB.responseFields.has(field)) {
        breaking.push({ type: 'response_field_removed', path, method, detail: `Response field '${field}' removed — clients depending on it will break`, severity: 'critical', consumerImpact: 'Python: KeyError on access. JavaScript: undefined (silent). Java/Go: deserialization error.' })
        if (migrationChecklist.length < 20) migrationChecklist.push(`[ ] Update callers of ${method} ${path} — field '${field}' removed from response`)
        changed = true
      }
    }

    for (const field of opB.responseFields) {
      if (!opA.responseFields.has(field)) {
        additive.push({ type: 'response_field_added', path, detail: `New response field '${field}' added to ${method} ${path}`, severity: 'info' })
        changed = true
      }
    }

    if (!opA.hasSecurity && opB.hasSecurity) {
      breaking.push({ type: 'auth_added', path, method, detail: `Authentication requirement added — unauthenticated clients will get 401`, severity: 'high', consumerImpact: 'All existing unauthenticated API calls will receive 401 Unauthorized.' })
      if (migrationChecklist.length < 20) migrationChecklist.push(`[ ] Add auth headers to all ${method} ${path} requests — now requires authentication`)
      changed = true
    }

    if (!changed) unchanged++
  }

  const hasHighSeverity = breaking.some(b => b.severity === 'critical' || b.severity === 'high')
  const semver = breaking.length > 0
    ? hasHighSeverity
      ? { bump: 'major', reason: 'Breaking changes require a major version bump' }
      : { bump: 'minor', reason: 'Medium-severity changes — consider a minor version bump with clear communication' }
    : additive.length > 0
      ? { bump: 'minor', reason: 'Non-breaking additions require a minor version bump' }
      : { bump: 'none', reason: 'No changes detected' }

  const aiSmells = [...new Set([...detectAiSmells(specA), ...detectAiSmells(specB)])]

  const versionA = specA.info?.version || '1.0.0'
  const versionB = specB.info?.version || '2.0.0'
  const removedEndpoints = breaking.filter(b => b.type === 'endpoint_removed').map(b => `${b.method} ${b.path}`)
  const addedEndpoints = additive.filter(a => a.type === 'endpoint_added').map(a => `${a.method} ${a.path}`)
  const removedFields = breaking.filter(b => b.type === 'response_field_removed')
  const addedRequiredParams = breaking.filter(b => b.type === 'required_param_added' || b.type === 'param_made_required')

  const parts: string[] = []
  if (removedEndpoints.length > 0) parts.push(`removes the ${removedEndpoints.join(', ')} endpoint${removedEndpoints.length > 1 ? 's' : ''}`)
  if (addedRequiredParams.length > 0) parts.push(`adds ${addedRequiredParams.length} new required parameter${addedRequiredParams.length > 1 ? 's' : ''}`)
  if (removedFields.length > 0) parts.push(`removes ${removedFields.length} response field${removedFields.length > 1 ? 's' : ''}`)
  if (addedEndpoints.length > 0) parts.push(`adds ${addedEndpoints.length} new endpoint${addedEndpoints.length > 1 ? 's' : ''}`)

  const changelogText = parts.length === 0
    ? `Version ${versionB} contains no changes compared to ${versionA}.`
    : `Version ${versionB} ${parts.join(' and ')}. ${breaking.length > 0 ? `These are breaking changes${hasHighSeverity ? ' requiring a major version bump' : ''}.` : 'These are non-breaking additions.'}`

  return Response.json({
    breaking,
    additive,
    unchanged,
    summary: { breakingCount: breaking.length, additiveCount: additive.length, unchangedCount: unchanged },
    semver,
    aiSmells,
    migrationChecklist,
    changelogText,
  })
}
