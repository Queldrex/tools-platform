import { NextRequest } from 'next/server'
import { hasFreeOrProAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

interface PackageResult {
  name: string
  version: string
  exists: boolean
  ageInDays: number | null
  suspicious: boolean
  suspicionLevel: 'none' | 'new' | 'very-new' | 'not-found'
  reason: string
  registryUrl: string
}

function parseNpmPackages(content: string): Array<{ name: string; version: string }> {
  try {
    const parsed = JSON.parse(content)
    const deps = {
      ...(parsed.dependencies ?? {}),
      ...(parsed.devDependencies ?? {}),
      ...(parsed.peerDependencies ?? {}),
    }
    return Object.entries(deps).map(([name, version]) => ({ name, version: String(version) }))
  } catch {
    return []
  }
}

function parsePythonPackages(content: string): Array<{ name: string; version: string }> {
  const lines = content.split('\n')
  const results: Array<{ name: string; version: string }> = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-r') || trimmed.startsWith('--')) continue
    // Strip extras, environment markers, URLs
    const clean = trimmed.split(';')[0].split('@')[0].trim()
    const match = clean.match(/^([A-Za-z0-9_.-]+)\s*([>=<!~^].*)?$/)
    if (match) results.push({ name: match[1].toLowerCase().replace(/_/g, '-'), version: (match[2] ?? '').trim() })
  }
  return results
}

async function checkNpm(pkg: { name: string; version: string }): Promise<PackageResult> {
  const url = `https://registry.npmjs.org/${encodeURIComponent(pkg.name)}`
  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'Queldrex-PackageCheck/1.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (res.status === 404) {
      return {
        name: pkg.name, version: pkg.version, exists: false,
        ageInDays: null, suspicious: true, suspicionLevel: 'not-found',
        reason: 'Package not found in npm registry — likely hallucinated',
        registryUrl: `https://www.npmjs.com/package/${pkg.name}`,
      }
    }
    const data = await res.json()
    const created = data.time?.created
    const ageInDays = created ? Math.floor((Date.now() - new Date(created).getTime()) / 86400000) : null
    const suspicionLevel = ageInDays === null ? 'none' : ageInDays < 7 ? 'very-new' : ageInDays < 30 ? 'new' : 'none'
    const suspicious = suspicionLevel !== 'none'
    const reason = suspicious
      ? `Package is only ${ageInDays} days old — created ${new Date(created).toLocaleDateString()}. Newly registered packages have higher supply chain risk.`
      : `Verified on npm. Created ${created ? new Date(created).toLocaleDateString() : 'unknown'}.`
    return { name: pkg.name, version: pkg.version, exists: true, ageInDays, suspicious, suspicionLevel, reason, registryUrl: `https://www.npmjs.com/package/${pkg.name}` }
  } catch {
    return { name: pkg.name, version: pkg.version, exists: false, ageInDays: null, suspicious: true, suspicionLevel: 'not-found', reason: 'Registry lookup failed or timed out', registryUrl: `https://www.npmjs.com/package/${pkg.name}` }
  }
}

async function checkPypi(pkg: { name: string; version: string }): Promise<PackageResult> {
  const url = `https://pypi.org/pypi/${encodeURIComponent(pkg.name)}/json`
  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'Queldrex-PackageCheck/1.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (res.status === 404) {
      return {
        name: pkg.name, version: pkg.version, exists: false,
        ageInDays: null, suspicious: true, suspicionLevel: 'not-found',
        reason: 'Package not found on PyPI — likely hallucinated',
        registryUrl: `https://pypi.org/project/${pkg.name}/`,
      }
    }
    const data = await res.json()
    // Find earliest release date
    let earliestDate: string | null = null
    const releases = data.releases ?? {}
    for (const relFiles of Object.values(releases) as Array<Array<{ upload_time: string }>>) {
      for (const f of relFiles) {
        if (!earliestDate || f.upload_time < earliestDate) earliestDate = f.upload_time
      }
    }
    const ageInDays = earliestDate ? Math.floor((Date.now() - new Date(earliestDate).getTime()) / 86400000) : null
    const suspicionLevel = ageInDays === null ? 'none' : ageInDays < 7 ? 'very-new' : ageInDays < 30 ? 'new' : 'none'
    const suspicious = suspicionLevel !== 'none'
    const reason = suspicious
      ? `Package is only ${ageInDays} days old — first uploaded ${earliestDate ? new Date(earliestDate).toLocaleDateString() : 'unknown'}. Newly registered packages have higher supply chain risk.`
      : `Verified on PyPI. First release ${earliestDate ? new Date(earliestDate).toLocaleDateString() : 'unknown'}.`
    return { name: pkg.name, version: pkg.version, exists: true, ageInDays, suspicious, suspicionLevel, reason, registryUrl: `https://pypi.org/project/${pkg.name}/` }
  } catch {
    return { name: pkg.name, version: pkg.version, exists: false, ageInDays: null, suspicious: true, suspicionLevel: 'not-found', reason: 'Registry lookup failed or timed out', registryUrl: `https://pypi.org/project/${pkg.name}/` }
  }
}

async function checkBatch<T>(items: T[], fn: (item: T) => Promise<PackageResult>, concurrency = 5): Promise<PackageResult[]> {
  const results: PackageResult[] = []
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency)
    const batchResults = await Promise.all(batch.map(fn))
    results.push(...batchResults)
  }
  return results
}

export async function POST(request: NextRequest) {
  let body: { content?: string; type?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const content = (body.content || '').trim()
  const type = body.type === 'python' ? 'python' : 'npm'

  if (!content) return Response.json({ error: 'Content is required' }, { status: 400 })

  const access = await hasFreeOrProAccess(request, 'package-hallucination', 2)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  let packages = type === 'python' ? parsePythonPackages(content) : parseNpmPackages(content)
  if (packages.length === 0) {
    return Response.json({ error: type === 'python' ? 'No packages found — paste a valid requirements.txt' : 'No packages found — paste a valid package.json' }, { status: 400 })
  }

  // Cap at 50 packages
  const truncated = packages.length > 50
  packages = packages.slice(0, 50)

  const checkFn = type === 'python' ? checkPypi : checkNpm
  const results = await checkBatch(packages, checkFn)

  const notFound = results.filter(r => r.suspicionLevel === 'not-found')
  const veryNew = results.filter(r => r.suspicionLevel === 'very-new')
  const newPkg = results.filter(r => r.suspicionLevel === 'new')
  const clean = results.filter(r => !r.suspicious)

  let riskLevel: 'clean' | 'low' | 'medium' | 'critical'
  if (notFound.length > 0) riskLevel = 'critical'
  else if (veryNew.length > 0) riskLevel = 'medium'
  else if (newPkg.length > 0) riskLevel = 'low'
  else riskLevel = 'clean'

  return Response.json({
    type,
    totalChecked: results.length,
    truncated,
    results,
    summary: { notFound: notFound.length, veryNew: veryNew.length, new: newPkg.length, clean: clean.length },
    riskLevel,
    checkedAt: new Date().toISOString(),
  })
}
