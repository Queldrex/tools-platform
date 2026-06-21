import { NextRequest } from 'next/server'
import { hasFreeOrProAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'

interface MigrationCheck {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  name: string
  pattern: RegExp
  message: string
}

const CHECKS: MigrationCheck[] = [
  { id: 'drop-table', severity: 'critical', name: 'DROP TABLE', pattern: /DROP\s+TABLE/gi, message: 'Drops entire table — ensure data is backed up and this is intentional.' },
  { id: 'drop-column', severity: 'critical', name: 'DROP COLUMN', pattern: /DROP\s+COLUMN/gi, message: 'Permanently removes column — back up data first, check for application references.' },
  { id: 'truncate', severity: 'critical', name: 'TRUNCATE', pattern: /\bTRUNCATE\b/gi, message: 'Deletes all rows instantly — cannot be rolled back in some databases.' },
  { id: 'delete-no-where', severity: 'critical', name: 'DELETE without WHERE', pattern: /DELETE\s+FROM\s+\w+\s*;/gi, message: 'DELETE with no WHERE clause will remove ALL rows.' },
  { id: 'lock-table', severity: 'high', name: 'Explicit Table Lock', pattern: /LOCK\s+TABLE/gi, message: 'Explicit lock will block all reads/writes during migration.' },
  { id: 'update-no-where', severity: 'high', name: 'UPDATE without WHERE', pattern: /UPDATE\s+\w+\s+SET[^;]+;/gi, message: 'UPDATE with no WHERE clause will modify ALL rows.' },
  { id: 'add-not-null', severity: 'high', name: 'ADD NOT NULL column without DEFAULT', pattern: /ADD\s+COLUMN\s+\w+\s+\w+\s+NOT\s+NULL(?!\s+DEFAULT)/gi, message: 'Adding NOT NULL column without DEFAULT will fail on non-empty tables.' },
  { id: 'rename-table', severity: 'medium', name: 'RENAME TABLE', pattern: /RENAME\s+(TABLE|TO)/gi, message: 'Table rename will break any code still using the old name.' },
  // no-rollback handled separately below (avoids catastrophic backtracking)
  { id: 'index-no-concurrent', severity: 'low', name: 'Index without CONCURRENTLY', pattern: /CREATE\s+INDEX(?!\s+CONCURRENTLY)/gi, message: 'Creating index without CONCURRENTLY will lock the table (PostgreSQL tip).' },
]

export async function POST(request: NextRequest) {
  const access = await hasFreeOrProAccess(request, 'db-migration', 2)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  let body: { sql?: string; dialect?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const sql = (body.sql || '').slice(0, 50000).trim()
  if (!sql) return Response.json({ error: 'No SQL provided' }, { status: 400 })

  const lines = sql.split('\n')
  const findings: Array<{ id: string; severity: string; name: string; message: string; line: number }> = []

  for (const check of CHECKS) {
    const re = new RegExp(check.pattern.source, check.pattern.flags)
    let match: RegExpExecArray | null
    while ((match = re.exec(sql)) !== null) {
      const lineNum = sql.slice(0, match.index).split('\n').length
      const alreadyFound = findings.some(f => f.id === check.id && f.line === lineNum)
      if (!alreadyFound) findings.push({ id: check.id, severity: check.severity, name: check.name, message: check.message, line: lineNum })
    }
  }

  // Check for missing transaction — safe string search, no regex
  if (!/BEGIN|START\s+TRANSACTION/i.test(sql)) {
    findings.push({ id: 'no-rollback', severity: 'medium', name: 'No Transaction / Rollback', message: 'No transaction detected — wrap in BEGIN/COMMIT with a rollback migration.', line: 1 })
  }

  const positives: string[] = []
  if (/BEGIN|START\s+TRANSACTION/i.test(sql)) positives.push('Uses transaction (BEGIN/COMMIT) — changes can be rolled back on failure')
  if (/ROLLBACK|DOWN\s+MIGRATION/i.test(sql)) positives.push('Rollback migration detected — safe to undo')
  if (/IF\s+EXISTS|IF\s+NOT\s+EXISTS/i.test(sql)) positives.push('Uses IF EXISTS / IF NOT EXISTS — idempotent migration')
  if (/--[^\n]+/g.test(sql)) positives.push('SQL comments present — intent is documented')

  const criticalCount = findings.filter(f => f.severity === 'critical').length
  const highCount = findings.filter(f => f.severity === 'high').length

  let riskLevel: 'safe' | 'caution' | 'dangerous' | 'critical'
  if (criticalCount > 0) riskLevel = 'critical'
  else if (highCount > 0) riskLevel = 'dangerous'
  else if (findings.length > 0) riskLevel = 'caution'
  else riskLevel = 'safe'

  const rec: Record<string, string> = {
    safe: 'Migration looks safe. Review positives and test on staging before production.',
    caution: 'Low-severity issues found. Review and test on staging before running.',
    dangerous: 'High-risk patterns detected. Take a full backup before running this migration.',
    critical: 'Critical destructive operations detected. Backup first, verify intent, run in a transaction.',
  }

  return Response.json({ findings, positives, riskLevel, recommendation: rec[riskLevel], linesScanned: lines.length })
}
