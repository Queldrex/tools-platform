import { NextRequest } from 'next/server'
import { hasFreeOrProAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'

interface OsvVuln {
  id: string
  summary?: string
  severity?: Array<{ type: string; score: string }>
  database_specific?: { severity?: string; cvss_score?: number }
  affected?: Array<{ ranges?: Array<{ type: string; events?: Array<{ introduced?: string; fixed?: string }> }> }>
  aliases?: string[]
  references?: Array<{ url: string }>
}

interface OsvResult { vulns?: OsvVuln[] }

function stripVersion(v: string): string {
  return v.replace(/^[\^~>=<!\s]+/, '').replace(/,.*$/, '').trim().split(' ')[0] || ''
}

function parseNpm(content: string): Array<{ name: string; version: string }> {
  let parsed: Record<string, unknown>
  try { parsed = JSON.parse(content) } catch { return [] }
  const deps: Array<{ name: string; version: string }> = []
  for (const key of ['dependencies', 'devDependencies', 'peerDependencies']) {
    const section = parsed[key] as Record<string, string> | undefined
    if (!section) continue
    for (const [name, ver] of Object.entries(section)) {
      const v = stripVersion(String(ver))
      if (name && v) deps.push({ name, version: v })
    }
  }
  return deps
}

function parsePython(content: string): Array<{ name: string; version: string }> {
  const deps: Array<{ name: string; version: string }> = []
  for (const raw of content.split('\n')) {
    const line = raw.split('#')[0].trim()
    if (!line || line.startsWith('-') || line.startsWith('http')) continue
    const match = line.match(/^([A-Za-z0-9_.\-]+)\s*([=><~!].+)?$/)
    if (!match) continue
    const name = match[1]
    const version = match[2] ? stripVersion(match[2]) : ''
    if (name) deps.push({ name, version })
  }
  return deps
}

function cvssScore(vuln: OsvVuln): number {
  if (vuln.database_specific?.cvss_score) return Number(vuln.database_specific.cvss_score)
  for (const s of vuln.severity ?? []) {
    if (s.type === 'CVSS_V3' || s.type === 'CVSS_V4') {
      const m = s.score.match(/(\d+\.\d+)$/)
      if (m) return parseFloat(m[1])
    }
  }
  const sev = vuln.database_specific?.severity?.toLowerCase()
  if (sev === 'critical') return 9.5
  if (sev === 'high') return 8.0
  if (sev === 'medium') return 5.5
  if (sev === 'low') return 2.0
  return 0
}

function scoreSeverity(score: number): 'critical' | 'high' | 'medium' | 'low' {
  if (score >= 9.0) return 'critical'
  if (score >= 7.0) return 'high'
  if (score >= 4.0) return 'medium'
  return 'low'
}

function fixedVersion(vuln: OsvVuln): string {
  for (const aff of vuln.affected ?? []) {
    for (const range of aff.ranges ?? []) {
      const events = range.events ?? []
      for (let i = 0; i < events.length; i++) {
        if (events[i].fixed) return events[i].fixed!
      }
    }
  }
  return ''
}

function vulnUrl(vuln: OsvVuln): string {
  const ghsa = (vuln.aliases ?? []).find(a => a.startsWith('GHSA-'))
  if (ghsa) return `https://github.com/advisories/${ghsa}`
  if (vuln.references?.[0]?.url) return vuln.references[0].url
  return `https://osv.dev/vulnerability/${vuln.id}`
}

export async function POST(request: NextRequest) {
  let body: { content?: string; ecosystem?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const content = (body.content || '').trim()
  if (!content) return Response.json({ error: 'Paste your package.json or requirements.txt content' }, { status: 400 })

  const access = await hasFreeOrProAccess(request, 'dep-scanner', 2)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  let ecosystem = (body.ecosystem || 'auto').toLowerCase()
  let packages: Array<{ name: string; version: string }> = []

  if (ecosystem === 'npm' || (ecosystem === 'auto' && content.trim().startsWith('{'))) {
    packages = parseNpm(content)
    ecosystem = 'npm'
  } else {
    packages = parsePython(content)
    ecosystem = 'python'
  }

  if (packages.length === 0) {
    return Response.json({ error: 'No packages found. Make sure you paste a valid package.json or requirements.txt.' }, { status: 400 })
  }

  packages = packages.slice(0, 100)
  const osvEcosystem = ecosystem === 'npm' ? 'npm' : 'PyPI'

  const queries = packages.map(p => ({
    package: { name: p.name, ecosystem: osvEcosystem },
    ...(p.version ? { version: p.version } : {}),
  }))

  let osvData: { results: OsvResult[] }
  try {
    const res = await fetch('https://api.osv.dev/v1/querybatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queries }),
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) throw new Error(`OSV API ${res.status}`)
    osvData = await res.json()
  } catch {
    return Response.json({ error: 'Could not reach vulnerability database. Please try again.' }, { status: 503 })
  }

  const results = packages.map((pkg, i) => {
    const vulns = (osvData.results[i]?.vulns ?? []).map(v => {
      const score = cvssScore(v)
      return {
        id: v.id,
        summary: v.summary ?? 'No description available',
        severity: scoreSeverity(score),
        cvssScore: score > 0 ? score : null,
        fixedIn: fixedVersion(v),
        url: vulnUrl(v),
      }
    }).sort((a, b) => (b.cvssScore ?? 0) - (a.cvssScore ?? 0))

    return { name: pkg.name, version: pkg.version, vulns, isVulnerable: vulns.length > 0 }
  })

  results.sort((a, b) => {
    if (a.isVulnerable && !b.isVulnerable) return -1
    if (!a.isVulnerable && b.isVulnerable) return 1
    const aMax = a.vulns[0]?.cvssScore ?? 0
    const bMax = b.vulns[0]?.cvssScore ?? 0
    return bMax - aMax
  })

  const vulnerable = results.filter(r => r.isVulnerable)
  const allVulns = vulnerable.flatMap(r => r.vulns)
  const summary = {
    total: results.length,
    vulnerable: vulnerable.length,
    clean: results.length - vulnerable.length,
    critical: allVulns.filter(v => v.severity === 'critical').length,
    high: allVulns.filter(v => v.severity === 'high').length,
    medium: allVulns.filter(v => v.severity === 'medium').length,
    low: allVulns.filter(v => v.severity === 'low').length,
  }

  return Response.json({ packages: results, summary, ecosystem, scannedAt: new Date().toISOString() })
}
