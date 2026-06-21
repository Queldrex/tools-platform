import { NextRequest } from 'next/server'
import { hasFreeOrProAccess } from '@/lib/tool-access'
import { connect as tlsConnect, TLSSocket } from 'node:tls'
import https from 'node:https'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

function cleanDomain(input: string): string {
  return input.trim().toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '')
}

function parseSans(subjectaltname: string): string[] {
  if (!subjectaltname) return []
  return subjectaltname.split(',').map(s => s.trim().replace(/^DNS:/, '').replace(/^IP Address:/, 'IP:'))
}

function daysUntil(dateStr: string): number {
  return Math.floor((new Date(dateStr).getTime() - Date.now()) / 86400000)
}

function getTlsInfo(domain: string): Promise<{
  cert: Record<string, unknown>
  protocol: string
  cipher: { name: string; standardName?: string; version?: string }
  authorized: boolean
  authError: string | null
}> {
  return new Promise((resolve, reject) => {
    const socket = tlsConnect({
      host: domain, port: 443, servername: domain,
      rejectUnauthorized: false,
      timeout: 12000,
    })
    socket.once('secureConnect', () => {
      const cert = socket.getPeerCertificate(true) as unknown as Record<string, unknown>
      const protocol = socket.getProtocol() ?? 'unknown'
      const cipher = socket.getCipher() as { name: string; standardName?: string; version?: string }
      const authorized = socket.authorized
      const authError = (socket as TLSSocket & { authorizationError?: string }).authorizationError ?? null
      socket.destroy()
      resolve({ cert, protocol, cipher, authorized, authError })
    })
    socket.once('error', reject)
    socket.setTimeout(12000, () => { socket.destroy(); reject(new Error('Connection timed out')) })
  })
}

function getHeaders(domain: string): Promise<Record<string, string>> {
  return new Promise((resolve) => {
    const keys = ['strict-transport-security', 'content-security-policy', 'x-frame-options', 'x-content-type-options', 'referrer-policy', 'permissions-policy']
    const req = https.request({ hostname: domain, port: 443, path: '/', method: 'HEAD', rejectUnauthorized: false, timeout: 8000 }, (res) => {
      const headers: Record<string, string> = {}
      for (const k of keys) { if (res.headers[k]) headers[k] = String(res.headers[k]) }
      res.destroy()
      resolve(headers)
    })
    req.on('error', () => resolve({}))
    req.setTimeout(8000, () => { req.destroy(); resolve({}) })
    req.end()
  })
}

export async function POST(request: NextRequest) {
  let body: { domain?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const domain = cleanDomain(body.domain || '')
  if (!domain || !/^[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?(\.[a-z]{2,})+$/.test(domain)) {
    return Response.json({ error: 'Enter a valid domain (e.g. example.com)' }, { status: 400 })
  }

  const access = await hasFreeOrProAccess(request, 'ssl-inspector', 3)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  let tlsInfo: Awaited<ReturnType<typeof getTlsInfo>>
  try { tlsInfo = await getTlsInfo(domain) } catch (e) {
    const msg = e instanceof Error ? e.message : 'Connection failed'
    return Response.json({ error: `Could not connect to ${domain}:443 — ${msg}` }, { status: 400 })
  }

  const headers = await getHeaders(domain)
  const cert = tlsInfo.cert

  const subject = cert.subject as Record<string, string> | undefined
  const issuer = cert.issuer as Record<string, string> | undefined
  const validFrom = String(cert.valid_from ?? '')
  const validTo = String(cert.valid_to ?? '')
  const days = daysUntil(validTo)
  const selfSigned = subject?.CN === issuer?.CN && subject?.O === issuer?.O
  const sans = parseSans(String(cert.subjectaltname ?? ''))

  const issues: string[] = []
  let grade = 'A+'

  const proto = tlsInfo.protocol
  if (proto === 'TLSv1' || proto === 'TLSv1.1') { grade = 'F'; issues.push(`${proto} is deprecated and insecure. Upgrade to TLS 1.2 or 1.3.`) }
  else if (proto === 'TLSv1.2') { if (grade === 'A+') grade = 'B'; issues.push('TLS 1.2 is acceptable but TLS 1.3 is preferred for better security and performance.') }

  if (days < 0) { grade = 'F'; issues.push(`Certificate expired ${Math.abs(days)} days ago.`) }
  else if (days < 30) {
    if (grade === 'A+') grade = 'A'; else if (grade === 'A') grade = 'B'
    issues.push(`Certificate expires in ${days} days. Renew immediately.`)
  }

  if (selfSigned) { grade = grade === 'A+' || grade === 'A' ? 'C' : grade; issues.push('Self-signed certificate — browsers will show a security warning.') }
  if (!tlsInfo.authorized && !selfSigned) { grade = grade === 'A+' || grade === 'A' ? 'C' : grade; issues.push(`Certificate chain error: ${tlsInfo.authError}`) }

  if (!headers['strict-transport-security']) {
    const grades: Record<string, string> = { 'A+': 'A', 'A': 'B', 'B': 'C' }
    grade = grades[grade] ?? grade
    issues.push('Missing HSTS header. Add Strict-Transport-Security to enforce HTTPS.')
  }
  if (!headers['x-content-type-options']) issues.push('Missing X-Content-Type-Options header.')
  if (!headers['x-frame-options'] && !headers['content-security-policy']?.includes('frame-ancestors')) issues.push('Missing X-Frame-Options or CSP frame-ancestors — site may be clickjackable.')

  return Response.json({
    domain,
    grade,
    certificate: {
      subject: subject?.CN ?? subject?.O ?? domain,
      issuerOrg: issuer?.O ?? issuer?.CN ?? 'Unknown',
      issuerCN: issuer?.CN ?? '',
      validFrom,
      validTo,
      daysUntilExpiry: days,
      fingerprint256: String(cert.fingerprint256 ?? ''),
      sans,
      selfSigned,
      authorized: tlsInfo.authorized,
    },
    tls: {
      protocol: proto,
      cipher: tlsInfo.cipher?.name ?? tlsInfo.cipher?.standardName ?? 'unknown',
      isSecure: proto === 'TLSv1.2' || proto === 'TLSv1.3',
    },
    headers: {
      hsts: headers['strict-transport-security'] ?? null,
      csp: headers['content-security-policy'] ?? null,
      xFrameOptions: headers['x-frame-options'] ?? null,
      xContentTypeOptions: headers['x-content-type-options'] ?? null,
      referrerPolicy: headers['referrer-policy'] ?? null,
      permissionsPolicy: headers['permissions-policy'] ?? null,
    },
    issues,
    checkedAt: new Date().toISOString(),
  })
}
