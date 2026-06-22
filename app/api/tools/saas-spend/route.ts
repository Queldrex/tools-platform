import { NextRequest } from 'next/server'
import { hasFreeOrProAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'

// Known SaaS vendors — pattern matched against transaction descriptions
const SAAS_PATTERNS: Array<{ name: string; category: string; patterns: RegExp[] }> = [
  { name: 'Slack', category: 'Communication', patterns: [/\bslack\b/i] },
  { name: 'Zoom', category: 'Communication', patterns: [/\bzoom\b/i] },
  { name: 'Microsoft 365', category: 'Productivity', patterns: [/microsoft 365|msft|microsoft office|office 365/i] },
  { name: 'Google Workspace', category: 'Productivity', patterns: [/google workspace|gsuite|g suite/i] },
  { name: 'Notion', category: 'Productivity', patterns: [/\bnotion\b/i] },
  { name: 'Asana', category: 'Project Management', patterns: [/\basana\b/i] },
  { name: 'Monday.com', category: 'Project Management', patterns: [/monday\.com|monday com/i] },
  { name: 'Jira / Atlassian', category: 'Project Management', patterns: [/atlassian|jira|confluence|bitbucket/i] },
  { name: 'Linear', category: 'Project Management', patterns: [/\blinear\b/i] },
  { name: 'GitHub', category: 'Developer', patterns: [/\bgithub\b/i] },
  { name: 'GitLab', category: 'Developer', patterns: [/\bgitlab\b/i] },
  { name: 'Vercel', category: 'Developer', patterns: [/\bvercel\b/i] },
  { name: 'Heroku', category: 'Developer', patterns: [/\bheroku\b/i] },
  { name: 'AWS', category: 'Cloud', patterns: [/amazon web services|aws\.amazon|\baws\b/i] },
  { name: 'Azure', category: 'Cloud', patterns: [/microsoft azure|\bazure\b/i] },
  { name: 'Google Cloud', category: 'Cloud', patterns: [/google cloud|gcp/i] },
  { name: 'Cloudflare', category: 'Cloud', patterns: [/\bcloudflare\b/i] },
  { name: 'Figma', category: 'Design', patterns: [/\bfigma\b/i] },
  { name: 'Adobe Creative Cloud', category: 'Design', patterns: [/adobe/i] },
  { name: 'HubSpot', category: 'Marketing / CRM', patterns: [/hubspot/i] },
  { name: 'Salesforce', category: 'Marketing / CRM', patterns: [/salesforce/i] },
  { name: 'Mailchimp', category: 'Marketing / CRM', patterns: [/mailchimp/i] },
  { name: 'ActiveCampaign', category: 'Marketing / CRM', patterns: [/activecampaign/i] },
  { name: 'Intercom', category: 'Customer Success', patterns: [/\bintercom\b/i] },
  { name: 'Zendesk', category: 'Customer Success', patterns: [/\bzendesk\b/i] },
  { name: 'Freshdesk', category: 'Customer Success', patterns: [/freshdesk|freshworks/i] },
  { name: 'Stripe', category: 'Payments', patterns: [/\bstripe\b/i] },
  { name: 'Shopify', category: 'E-commerce', patterns: [/\bshopify\b/i] },
  { name: 'Dropbox', category: 'Storage', patterns: [/\bdropbox\b/i] },
  { name: 'Box', category: 'Storage', patterns: [/box\.com|\bbox\b/i] },
  { name: 'DocuSign', category: 'Legal', patterns: [/docusign/i] },
  { name: 'PandaDoc', category: 'Legal', patterns: [/pandadoc/i] },
  { name: 'QuickBooks', category: 'Finance', patterns: [/quickbooks|intuit/i] },
  { name: 'Xero', category: 'Finance', patterns: [/\bxero\b/i] },
  { name: 'Gusto', category: 'HR', patterns: [/\bgusto\b/i] },
  { name: 'Rippling', category: 'HR', patterns: [/\brippling\b/i] },
  { name: 'BambooHR', category: 'HR', patterns: [/bamboohr|bamboo hr/i] },
  { name: 'Loom', category: 'Productivity', patterns: [/\bloom\b/i] },
  { name: 'Calendly', category: 'Scheduling', patterns: [/\bcalendly\b/i] },
  { name: 'Typeform', category: 'Forms', patterns: [/\btypeform\b/i] },
  { name: 'Webflow', category: 'Website', patterns: [/\bwebflow\b/i] },
  { name: 'Framer', category: 'Website', patterns: [/\bframer\b/i] },
  { name: 'Wix', category: 'Website', patterns: [/\bwix\b/i] },
  { name: 'Squarespace', category: 'Website', patterns: [/squarespace/i] },
  { name: 'Twilio', category: 'Developer', patterns: [/\btwilio\b/i] },
  { name: 'SendGrid', category: 'Developer', patterns: [/sendgrid/i] },
  { name: 'Resend', category: 'Developer', patterns: [/\bresend\b/i] },
  { name: 'Upstash', category: 'Developer', patterns: [/\bupstash\b/i] },
  { name: 'PlanetScale', category: 'Developer', patterns: [/planetscale/i] },
  { name: 'Supabase', category: 'Developer', patterns: [/\bsupabase\b/i] },
  { name: 'OpenAI', category: 'AI', patterns: [/openai/i] },
  { name: 'Anthropic', category: 'AI', patterns: [/anthropic/i] },
  { name: 'Midjourney', category: 'AI', patterns: [/midjourney/i] },
  { name: 'Grammarly', category: 'Productivity', patterns: [/grammarly/i] },
  { name: 'LastPass / 1Password', category: 'Security', patterns: [/lastpass|1password/i] },
  { name: 'Okta', category: 'Security', patterns: [/\bokta\b/i] },
  { name: 'Datadog', category: 'Monitoring', patterns: [/datadog/i] },
  { name: 'New Relic', category: 'Monitoring', patterns: [/new relic/i] },
  { name: 'Sentry', category: 'Monitoring', patterns: [/\bsentry\b/i] },
  { name: 'PagerDuty', category: 'Monitoring', patterns: [/pagerduty/i] },
  { name: 'Segment', category: 'Analytics', patterns: [/\bsegment\b/i] },
  { name: 'Mixpanel', category: 'Analytics', patterns: [/mixpanel/i] },
  { name: 'Amplitude', category: 'Analytics', patterns: [/amplitude/i] },
  { name: 'Hotjar', category: 'Analytics', patterns: [/hotjar/i] },
]

interface Transaction {
  date: string
  description: string
  amount: number
  matched?: string
  category?: string
}

function parseTransactions(content: string): Transaction[] {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean)
  const transactions: Transaction[] = []

  for (const line of lines) {
    if (line.toLowerCase().includes('date') && line.toLowerCase().includes('amount')) continue
    const parts = line.split(/[,\t|]+/).map(p => p.trim())
    if (parts.length < 2) continue

    let date = '', description = '', amount = 0
    for (const part of parts) {
      if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(part) || /^\d{4}-\d{2}-\d{2}/.test(part)) {
        date = part
      } else if (/^-?[\$£€]?[\d,]+\.?\d*$/.test(part.replace(/\s/g, ''))) {
        const num = parseFloat(part.replace(/[$£€,\s]/g, ''))
        if (!isNaN(num)) amount = Math.abs(num)
      } else if (part.length > 2 && !date) {
        description = description || part
      } else if (part.length > 2) {
        description = description || part
      }
    }

    if (description && amount > 0) {
      transactions.push({ date, description, amount })
    }
  }

  return transactions
}

function matchSaaS(description: string): { name: string; category: string } | null {
  for (const vendor of SAAS_PATTERNS) {
    for (const pattern of vendor.patterns) {
      if (pattern.test(description)) return { name: vendor.name, category: vendor.category }
    }
  }
  return null
}

export async function POST(request: NextRequest) {
  const access = await hasFreeOrProAccess(request, 'saas-spend', 1)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  let body: { content?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const content = (body.content || '').trim()
  if (!content) return Response.json({ error: 'Transaction data is required' }, { status: 400 })
  if (content.length < 20) return Response.json({ error: 'Paste your bank/card export (CSV or text)' }, { status: 400 })

  const transactions = parseTransactions(content)
  if (transactions.length === 0) {
    return Response.json({ error: 'No transactions found. Paste CSV or tab-separated data with date, description, and amount columns.' }, { status: 400 })
  }

  // Match SaaS vendors
  const matched: Array<Transaction & { vendor: string; category: string }> = []
  const unmatched: Transaction[] = []

  for (const tx of transactions) {
    const vendor = matchSaaS(tx.description)
    if (vendor) {
      matched.push({ ...tx, vendor: vendor.name, category: vendor.category })
    } else {
      unmatched.push(tx)
    }
  }

  // Group by vendor and sum
  const vendorMap = new Map<string, { name: string; category: string; totalSpend: number; transactions: number; amounts: number[] }>()
  for (const tx of matched) {
    const existing = vendorMap.get(tx.vendor)
    if (existing) {
      existing.totalSpend += tx.amount
      existing.transactions++
      existing.amounts.push(tx.amount)
    } else {
      vendorMap.set(tx.vendor, { name: tx.vendor, category: tx.category, totalSpend: tx.amount, transactions: 1, amounts: [tx.amount] })
    }
  }

  // Category totals
  const categoryMap = new Map<string, number>()
  for (const v of vendorMap.values()) {
    categoryMap.set(v.category, (categoryMap.get(v.category) ?? 0) + v.totalSpend)
  }

  // Detect potential issues
  const flags: string[] = []
  const vendors = Array.from(vendorMap.values())

  // Duplicate amounts across different vendors
  const allAmounts = matched.map(t => t.amount)
  const amountCounts = new Map<number, number>()
  for (const a of allAmounts) amountCounts.set(a, (amountCounts.get(a) ?? 0) + 1)
  const duplicateAmounts = Array.from(amountCounts.entries()).filter(([, count]) => count > 1).map(([amt]) => amt)
  if (duplicateAmounts.length > 0) {
    flags.push(`${duplicateAmounts.length} duplicate charge amount(s) found across different vendors — verify these aren't double-billed`)
  }

  // High spend categories
  const highestCategory = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1])[0]
  if (highestCategory && highestCategory[1] > 500) {
    flags.push(`${highestCategory[0]} is your highest SaaS category at $${highestCategory[1].toFixed(2)} — review for redundancy`)
  }

  // Redundant tools (same category, multiple vendors)
  const byCat = new Map<string, string[]>()
  for (const v of vendors) byCat.set(v.category, [...(byCat.get(v.category) ?? []), v.name])
  for (const [cat, names] of byCat.entries()) {
    if (names.length > 1) flags.push(`${names.length} tools in ${cat}: ${names.join(', ')} — consolidation opportunity`)
  }

  const totalSaasSpend = vendors.reduce((sum, v) => sum + v.totalSpend, 0)
  const annualProjection = totalSaasSpend * 12

  return Response.json({
    totalTransactions: transactions.length,
    saasTransactions: matched.length,
    matchRate: Math.round((matched.length / transactions.length) * 100),
    totalSaasSpend,
    annualProjection,
    vendors: vendors.sort((a, b) => b.totalSpend - a.totalSpend),
    byCategory: Object.fromEntries(Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1])),
    flags,
    potentialSavings: totalSaasSpend * 0.25,
    analyzedAt: new Date().toISOString(),
  })
}
