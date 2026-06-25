import { NextRequest } from 'next/server'
import { hasFreeOrProAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'

interface MigrationCheck {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  name: string
  pattern: RegExp
  message: string
  lockType?: string
  lockDurationHint?: string
  rollbackSql?: string
  expandContract?: string[]
}

interface Finding {
  id: string
  severity: string
  name: string
  message: string
  line: number
  lockType?: string
  lockDurationHint?: string
  rollbackSql?: string
  expandContract?: string[]
  dialectNote?: string
}

const CHECKS: MigrationCheck[] = [
  {
    id: 'drop-table',
    severity: 'critical',
    name: 'DROP TABLE',
    pattern: /DROP\s+TABLE/gi,
    message: 'Drops entire table — ensure data is backed up and this is intentional.',
    lockType: 'ACCESS EXCLUSIVE',
    lockDurationHint: 'instant but irreversible',
    rollbackSql: '-- No automatic rollback: DROP TABLE is irreversible. Restore from backup.',
  },
  {
    id: 'drop-column',
    severity: 'critical',
    name: 'DROP COLUMN',
    pattern: /DROP\s+COLUMN/gi,
    message: 'Permanently removes column — back up data first, check for application references.',
    lockType: 'ACCESS EXCLUSIVE',
    lockDurationHint: 'instant',
    rollbackSql: '-- Reverse: ALTER TABLE <table> ADD COLUMN <col> <type>;\n-- Note: original data is lost. Restore from backup if needed.',
  },
  {
    id: 'truncate',
    severity: 'critical',
    name: 'TRUNCATE',
    pattern: /\bTRUNCATE\b/gi,
    message: 'Deletes all rows instantly — cannot be rolled back in some databases.',
    lockType: 'ACCESS EXCLUSIVE',
    lockDurationHint: 'instant but irreversible',
    rollbackSql: '-- TRUNCATE cannot be auto-rolled back. Backup required before running.',
  },
  {
    id: 'delete-no-where',
    severity: 'critical',
    name: 'DELETE without WHERE',
    pattern: /DELETE\s+FROM\s+\w+\s*;/gi,
    message: 'DELETE with no WHERE clause will remove ALL rows.',
    lockType: 'ROW EXCLUSIVE',
    rollbackSql: '-- No automatic rollback: back up data before running.',
  },
  {
    id: 'add-not-null-no-default',
    severity: 'critical',
    name: 'NOT NULL Column — No DEFAULT',
    pattern: /ADD\s+COLUMN\s+\w+\s+(?:VARCHAR|TEXT|INT|INTEGER|BIGINT|BOOLEAN|BOOL|UUID|TIMESTAMP|NUMERIC|DECIMAL)[^;]*NOT\s+NULL(?![^;]*DEFAULT)/gi,
    message: 'Adding NOT NULL column without DEFAULT will fail immediately on any non-empty table.',
    lockType: 'ACCESS EXCLUSIVE',
    lockDurationHint: 'will fail if table has rows — no lock, just an error',
    rollbackSql: '-- Reverse: ALTER TABLE <table> DROP COLUMN <col>;',
    expandContract: [
      'Step 1: Add nullable column (safe, deploy immediately)',
      'Step 2: Backfill existing rows in batches (background job)',
      'Step 3: Add NOT NULL constraint with VALIDATE CONSTRAINT',
      'Step 4: Remove old column in a later deploy',
    ],
  },
  {
    id: 'lock-table',
    severity: 'high',
    name: 'Explicit Table Lock',
    pattern: /LOCK\s+TABLE/gi,
    message: 'Explicit lock will block all reads/writes during migration.',
    lockType: 'explicit lock (blocking)',
  },
  {
    id: 'update-no-where',
    severity: 'high',
    name: 'UPDATE without WHERE',
    pattern: /UPDATE\s+\w+\s+SET[^;]+;/gi,
    message: 'UPDATE with no WHERE clause will modify ALL rows.',
    lockDurationHint: 'rewrites every row — minutes on large tables',
    rollbackSql: '-- No automatic rollback: back up table before running.',
  },
  {
    id: 'add-not-null',
    severity: 'high',
    name: 'ADD NOT NULL column without DEFAULT',
    pattern: /ADD\s+COLUMN\s+\w+\s+\w+\s+NOT\s+NULL(?!\s+DEFAULT)/gi,
    message: 'Adding NOT NULL column without DEFAULT will fail on non-empty tables.',
    lockType: 'ACCESS EXCLUSIVE',
    lockDurationHint: 'full table scan — ~100K rows/sec; 10M rows ≈ 100 seconds',
    rollbackSql: '-- Reverse: ALTER TABLE <table> DROP COLUMN <col>;',
    expandContract: [
      'Step 1: Add nullable column (safe, deploy immediately)',
      'Step 2: Backfill rows in batches (background job)',
      'Step 3: Add NOT NULL constraint with VALIDATE CONSTRAINT',
      'Step 4: Remove old column in a later deploy',
    ],
  },
  {
    id: 'alter-type',
    severity: 'high',
    name: 'Column Type Change',
    pattern: /ALTER\s+COLUMN\s+\w+\s+(?:TYPE|SET\s+DATA\s+TYPE)/gi,
    message: 'Changing a column type acquires ACCESS EXCLUSIVE lock and rewrites every row. For large tables this causes extended downtime.',
    lockType: 'ACCESS EXCLUSIVE',
    lockDurationHint: 'full table rewrite — ~50K rows/sec; 1M rows ≈ 20 seconds',
    expandContract: [
      'Step 1: Add new column with desired type',
      'Step 2: Backfill new column from old column',
      'Step 3: Update application to write both columns',
      'Step 4: Migrate reads to new column',
      'Step 5: Drop old column',
    ],
  },
  {
    id: 'add-foreign-key',
    severity: 'high',
    name: 'Foreign Key without NOT VALID',
    pattern: /ADD\s+(?:CONSTRAINT\s+\w+\s+)?FOREIGN\s+KEY/gi,
    message: 'Adding a foreign key scans the entire child table to validate existing rows. Use NOT VALID to skip validation, then VALIDATE CONSTRAINT in a separate migration.',
    lockType: 'SHARE ROW EXCLUSIVE',
    lockDurationHint: 'full table scan if validating',
    rollbackSql: '-- Reverse: ALTER TABLE <table> DROP CONSTRAINT <constraint_name>;',
    expandContract: [
      'Step 1: Add FK with NOT VALID (skips row validation — fast)',
      'Step 2: In a separate migration: ALTER TABLE t VALIDATE CONSTRAINT fk_name;',
    ],
  },
  {
    id: 'rename-column',
    severity: 'high',
    name: 'Column Rename',
    pattern: /RENAME\s+COLUMN/gi,
    message: 'Renaming a column will break all code using the old column name. Use expand-contract pattern.',
    lockType: 'ACCESS EXCLUSIVE',
    lockDurationHint: 'instant',
    expandContract: [
      'Step 1: Add new column with desired name',
      'Step 2: Dual-write to both old and new columns',
      'Step 3: Migrate reads to new column name',
      'Step 4: Drop old column in a later deploy',
    ],
  },
  {
    id: 'rename-table',
    severity: 'medium',
    name: 'RENAME TABLE',
    pattern: /RENAME\s+(TABLE|TO)/gi,
    message: 'Table rename will break any code still using the old name.',
    lockType: 'ACCESS EXCLUSIVE',
    lockDurationHint: 'instant',
    expandContract: [
      'Step 1: Create new table with desired name',
      'Step 2: Dual-write to both tables',
      'Step 3: Migrate reads to new table name',
      'Step 4: Drop old table in a later deploy',
    ],
  },
  {
    id: 'index-no-concurrent',
    severity: 'low',
    name: 'Index without CONCURRENTLY',
    pattern: /CREATE\s+INDEX(?!\s+CONCURRENTLY)/gi,
    message: 'Creating index without CONCURRENTLY will lock the table (PostgreSQL tip).',
    lockType: 'SHARE (blocks writes)',
    lockDurationHint: 'duration of full index build',
    rollbackSql: '-- Reverse: DROP INDEX <index_name>;',
  },
]

const DIALECT_NOTES: Record<string, Record<string, string>> = {
  mysql: {
    'add-not-null': 'MySQL copies the entire table for most ALTER TABLE operations. Consider using pt-online-schema-change or gh-ost.',
    'index-no-concurrent': 'MySQL: Use ALTER TABLE ... ADD INDEX which can be online in InnoDB, or use pt-online-schema-change.',
    'drop-column': 'MySQL: ALTER TABLE DROP COLUMN rewrites the full table. Very slow on large tables.',
    'alter-type': 'MySQL: ALTER TABLE rewrites the entire table. Use gh-ost or pt-online-schema-change for large tables.',
  },
  sqlite: {
    'rename-column': 'SQLite: RENAME COLUMN requires SQLite 3.25+ (2018). Verify your SQLite version.',
    'drop-column': 'SQLite: DROP COLUMN requires SQLite 3.35+ (2021). Not available in older versions.',
    'add-foreign-key': 'SQLite: Foreign keys are disabled by default. Run PRAGMA foreign_keys = ON; to enable.',
  },
}

export async function POST(request: NextRequest) {
  const access = await hasFreeOrProAccess(request, 'database-migration', 2)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  let body: { sql?: string; dialect?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const sql = (body.sql || '').slice(0, 50000).trim()
  const dialect = (body.dialect || 'postgresql').toLowerCase()
  if (!sql) return Response.json({ error: 'No SQL provided' }, { status: 400 })

  const lines = sql.split('\n')
  const findings: Finding[] = []

  for (const check of CHECKS) {
    const re = new RegExp(check.pattern.source, check.pattern.flags)
    let match: RegExpExecArray | null
    while ((match = re.exec(sql)) !== null) {
      const lineNum = sql.slice(0, match.index).split('\n').length
      const alreadyFound = findings.some(f => f.id === check.id && f.line === lineNum)
      if (!alreadyFound) {
        const finding: Finding = {
          id: check.id,
          severity: check.severity,
          name: check.name,
          message: check.message,
          line: lineNum,
          lockType: check.lockType,
          lockDurationHint: check.lockDurationHint,
          rollbackSql: check.rollbackSql,
          expandContract: check.expandContract,
        }
        const dialectNote = DIALECT_NOTES[dialect]?.[check.id]
        if (dialectNote) finding.dialectNote = dialectNote
        findings.push(finding)
      }
    }
  }

  if (!/BEGIN|START\s+TRANSACTION/i.test(sql)) {
    findings.push({ id: 'no-rollback', severity: 'medium', name: 'No Transaction / Rollback', message: 'No transaction detected — wrap in BEGIN/COMMIT with a rollback migration.', line: 1 })
  }

  const hasAlterOrIndex = /ALTER\s+TABLE|CREATE\s+INDEX/i.test(sql)
  const hasLockTimeout = /lock_timeout/i.test(sql)
  if (hasAlterOrIndex && !hasLockTimeout) {
    findings.push({ id: 'ai-no-lock-timeout', severity: 'low', name: 'Missing lock_timeout', message: 'No lock_timeout set before DDL. If a long-running query holds a lock, your migration will block indefinitely. Add: SET lock_timeout = \'5s\';', line: 1 })
  }

  const positives: string[] = []
  if (/BEGIN|START\s+TRANSACTION/i.test(sql)) positives.push('Uses transaction (BEGIN/COMMIT) — changes can be rolled back on failure')
  if (/ROLLBACK|DOWN\s+MIGRATION/i.test(sql)) positives.push('Rollback migration detected — safe to undo')
  if (/IF\s+EXISTS|IF\s+NOT\s+EXISTS/i.test(sql)) positives.push('Uses IF EXISTS / IF NOT EXISTS — idempotent migration')
  if (/--[^\n]+/g.test(sql)) positives.push('SQL comments present — intent is documented')
  if (/CREATE\s+INDEX\s+CONCURRENTLY/i.test(sql)) positives.push('Uses CREATE INDEX CONCURRENTLY — index builds without locking table')
  if (/lock_timeout/i.test(sql)) positives.push('lock_timeout set — migration will fail fast instead of blocking indefinitely')
  if (/NOT\s+VALID/i.test(sql)) positives.push('Foreign key uses NOT VALID — skips expensive full-table validation')

  const aiSmells: string[] = []
  if (/DELETE\s+FROM\s+\w+\s*;/i.test(sql)) aiSmells.push('AI often generates DELETE without WHERE (full-table delete)')
  if (/UPDATE\s+\w+\s+SET[^;]+;/i.test(sql)) aiSmells.push('AI often generates UPDATE without WHERE (full-table write)')
  if (/CREATE\s+INDEX(?!\s+CONCURRENTLY)/i.test(sql)) aiSmells.push('AI generators skip CONCURRENTLY on index creation — use CREATE INDEX CONCURRENTLY')
  if (hasAlterOrIndex && !hasLockTimeout) aiSmells.push('No lock_timeout — AI skips this safety guard')
  const alterCount = (sql.match(/ALTER\s+TABLE/gi) || []).length
  if (alterCount >= 3) aiSmells.push('Multiple ALTER TABLE statements — AI often batches these; consider running separately to reduce lock duration')

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

  const hasAccessExclusive = findings.some(f => f.lockType?.includes('ACCESS EXCLUSIVE'))
  let zeroDowntimeVerdict: 'safe' | 'maintenance-window' | 'caution'
  if (hasAccessExclusive || riskLevel === 'critical') zeroDowntimeVerdict = 'maintenance-window'
  else if (findings.length > 0) zeroDowntimeVerdict = 'caution'
  else zeroDowntimeVerdict = 'safe'

  return Response.json({ findings, positives, riskLevel, recommendation: rec[riskLevel], linesScanned: lines.length, aiSmells, zeroDowntimeVerdict })
}
