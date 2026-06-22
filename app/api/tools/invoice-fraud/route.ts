import { NextRequest } from 'next/server'
import { hasFreeOrProAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'

interface InvoiceData {
  vendorName?: string
  invoiceNumber?: string
  amount?: number
  date?: string
  paymentTerms?: string
  bankAccount?: string
  email?: string
  phone?: string
  address?: string
  description?: string
}

interface FraudFlag {
  severity: 'critical' | 'high' | 'medium' | 'low'
  type: string
  detail: string
  recommendation: string
}

// Common legitimate business suffixes
const LEGITIMATE_SUFFIXES = /\b(llc|inc|corp|ltd|co|company|group|services|solutions|consulting|technologies|tech|systems|partners|associates|enterprises|industries)\b/i

// Suspicious TLDs for email domains
const SUSPICIOUS_TLDS = /\.(ru|cn|tk|ml|ga|cf|gq|xyz|top|click|link|loan|work|accountant|download)\b/i

// Free email providers (legitimate businesses rarely invoice from these)
const FREE_EMAIL_PROVIDERS = /\b(gmail|yahoo|hotmail|outlook|aol|icloud|protonmail|yandex|mail\.com|live\.com)\./i

function detectFraud(invoice: InvoiceData): FraudFlag[] {
  const flags: FraudFlag[] = []
  const amount = invoice.amount ?? 0

  // Round number manipulation
  if (amount > 0 && amount % 1000 === 0 && amount >= 1000) {
    flags.push({ severity: 'medium', type: 'Round Number', detail: `Invoice amount is exactly $${amount.toLocaleString()} — perfectly round numbers are statistically unusual and a common fraud signal.`, recommendation: 'Request itemized breakdown. Legitimate invoices rarely end in exactly $X,000.' })
  }
  if (amount > 0 && amount % 100 === 0 && amount >= 500 && amount % 1000 !== 0) {
    flags.push({ severity: 'low', type: 'Round Hundred', detail: `Amount ends in exactly $${amount % 1000} with no cents — common in manually-inflated invoices.`, recommendation: 'Compare with contract scope. Request line-item breakdown.' })
  }

  // Free email provider
  if (invoice.email && FREE_EMAIL_PROVIDERS.test(invoice.email)) {
    flags.push({ severity: 'high', type: 'Consumer Email Address', detail: `Vendor email "${invoice.email}" uses a free consumer email provider. Legitimate businesses invoice from business domains.`, recommendation: 'Verify vendor identity via phone or their official website. Do not pay until verified.' })
  }

  // Suspicious email TLD
  if (invoice.email && SUSPICIOUS_TLDS.test(invoice.email)) {
    flags.push({ severity: 'critical', type: 'Suspicious Email Domain', detail: `Email domain uses a high-risk TLD associated with fraud and phishing. This is a major red flag.`, recommendation: 'Do not pay. Contact the supposed vendor through a known contact to verify.' })
  }

  // No vendor suffix (no LLC, Inc, etc.)
  if (invoice.vendorName && invoice.vendorName.length > 2 && !LEGITIMATE_SUFFIXES.test(invoice.vendorName)) {
    flags.push({ severity: 'low', type: 'Missing Business Designation', detail: `"${invoice.vendorName}" has no LLC/Inc/Corp designation. Legitimate business invoices typically include legal entity type.`, recommendation: 'Verify vendor registration. Search state business registry.' })
  }

  // Invoice number patterns
  if (invoice.invoiceNumber) {
    const num = invoice.invoiceNumber.replace(/\D/g, '')
    // Very low invoice numbers suggest new or fake vendor
    if (num && parseInt(num) <= 5) {
      flags.push({ severity: 'medium', type: 'Very Low Invoice Number', detail: `Invoice #${invoice.invoiceNumber} — very low numbers suggest this is a new vendor with no history, or an attempt to appear professional.`, recommendation: 'Request references and verify vendor history before payment.' })
    }
    // Sequential simple numbers (001, 002)
    if (/^0*[1-9]$/.test(num)) {
      flags.push({ severity: 'medium', type: 'Suspiciously Simple Invoice Number', detail: `Invoice number "${invoice.invoiceNumber}" is extremely simple. Real invoicing systems generate sequential or time-based IDs.`, recommendation: 'Ask vendor for previous invoices to other clients or proof of established business.' })
    }
  }

  // Urgent payment terms
  if (invoice.paymentTerms) {
    const terms = invoice.paymentTerms.toLowerCase()
    if (terms.includes('immediate') || terms.includes('same day') || terms.includes('due on receipt') || /net\s*[1-3]\b/.test(terms)) {
      flags.push({ severity: 'high', type: 'Urgency Pressure', detail: `Payment terms "${invoice.paymentTerms}" create artificial urgency — a classic social engineering tactic to prevent scrutiny.`, recommendation: 'Any vendor demanding same-day payment without prior agreement is suspicious. Standard terms are Net 30.' })
    }
  }

  // Changed bank account (detected by description mention)
  if (invoice.description || invoice.bankAccount) {
    const combined = ((invoice.description ?? '') + ' ' + (invoice.bankAccount ?? '')).toLowerCase()
    if (combined.includes('new bank') || combined.includes('new account') || combined.includes('changed account') || combined.includes('please update') || combined.includes('new payment')) {
      flags.push({ severity: 'critical', type: 'Bank Account Change Request', detail: 'Invoice or notes mention a new or changed bank account. This is the #1 Business Email Compromise (BEC) fraud tactic.', recommendation: 'STOP. Call the vendor directly using a known phone number (not one from this invoice) to verify. Never update payment details via email.' })
    }
  }

  // Very high amount
  if (amount > 50000) {
    flags.push({ severity: 'high', type: 'High-Value Invoice', detail: `Invoice is for $${amount.toLocaleString()} — high-value invoices warrant enhanced verification regardless of other risk factors.`, recommendation: 'Require secondary approval. Verify via phone with a known contact at the vendor. Confirm bank details through established records.' })
  }

  // No address
  if (!invoice.address && invoice.vendorName) {
    flags.push({ severity: 'low', type: 'No Business Address', detail: 'No physical address on the invoice. Legitimate businesses are required to include address information on invoices in most jurisdictions.', recommendation: 'Request a complete invoice with business address. Verify the address is real.' })
  }

  return flags
}

export async function POST(request: NextRequest) {
  const access = await hasFreeOrProAccess(request, 'invoice-fraud', 2)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  let body: { invoice?: InvoiceData; rawText?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const invoice = body.invoice || {}
  const rawText = (body.rawText || '').trim()

  if (!invoice.vendorName && !invoice.amount && !rawText) {
    return Response.json({ error: 'Invoice data required' }, { status: 400 })
  }

  // Parse raw text if provided
  if (rawText && !invoice.amount) {
    const amtMatch = rawText.match(/\$?([\d,]+\.?\d*)/g)
    if (amtMatch) {
      const amounts = amtMatch.map(m => parseFloat(m.replace(/[$,]/g, ''))).filter(n => n > 0 && n < 10000000)
      if (amounts.length > 0) invoice.amount = Math.max(...amounts)
    }
    if (!invoice.email) {
      const emailMatch = rawText.match(/[\w._%+-]+@[\w.-]+\.[a-z]{2,}/i)
      if (emailMatch) invoice.email = emailMatch[0]
    }
    if (!invoice.invoiceNumber) {
      const invMatch = rawText.match(/(?:invoice|inv|#)\s*[:#]?\s*([A-Z0-9-]{1,20})/i)
      if (invMatch) invoice.invoiceNumber = invMatch[1]
    }
    if (!invoice.vendorName) {
      const lines = rawText.split('\n').filter(l => l.trim().length > 2)
      if (lines[0]) invoice.vendorName = lines[0].trim().slice(0, 80)
    }
    if (!invoice.description) invoice.description = rawText
  }

  const flags = detectFraud(invoice)

  const critical = flags.filter(f => f.severity === 'critical').length
  const high = flags.filter(f => f.severity === 'high').length
  const medium = flags.filter(f => f.severity === 'medium').length
  const low = flags.filter(f => f.severity === 'low').length

  let riskLevel: 'clear' | 'low' | 'medium' | 'high' | 'critical'
  if (critical > 0) riskLevel = 'critical'
  else if (high > 0) riskLevel = 'high'
  else if (medium > 1) riskLevel = 'medium'
  else if (medium > 0 || low > 1) riskLevel = 'low'
  else riskLevel = 'clear'

  const verdict = critical > 0
    ? 'DO NOT PAY — Critical fraud indicators present. Verify vendor identity before proceeding.'
    : high > 0
    ? 'HIGH RISK — Verify vendor through independent contact before payment.'
    : medium > 0
    ? 'CAUTION — Multiple risk signals. Request additional documentation.'
    : low > 0
    ? 'LOW RISK — Minor irregularities. Standard verification recommended.'
    : 'CLEAR — No fraud indicators detected. Standard approval process applies.'

  return Response.json({
    riskLevel,
    verdict,
    flags,
    summary: { critical, high, medium, low, total: flags.length },
    invoice: { vendorName: invoice.vendorName, invoiceNumber: invoice.invoiceNumber, amount: invoice.amount, email: invoice.email },
    analyzedAt: new Date().toISOString(),
  })
}
