import { NextRequest } from 'next/server'
import { hasFreeOrProAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'

type Grade = 'Excellent' | 'Good' | 'Concerning' | 'Critical'

function grade(value: number, thresholds: { excellent: number; good: number; concerning: number }, lowerIsBetter = false): Grade {
  if (lowerIsBetter) {
    if (value <= thresholds.excellent) return 'Excellent'
    if (value <= thresholds.good) return 'Good'
    if (value <= thresholds.concerning) return 'Concerning'
    return 'Critical'
  }
  if (value >= thresholds.excellent) return 'Excellent'
  if (value >= thresholds.good) return 'Good'
  if (value >= thresholds.concerning) return 'Concerning'
  return 'Critical'
}

function fmt(n: number, decimals = 2): string {
  return n.toFixed(decimals)
}

function fmtPct(n: number): string {
  return `${fmt(n, 1)}%`
}

function fmtMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${fmt(n, 0)}`
}

export async function POST(request: NextRequest) {
  let body: {
    mrr?: number; newMrr?: number; churnedMrr?: number
    customers?: number; newCustomers?: number; lostCustomers?: number
    cac?: number; arpu?: number
  }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const mrr = Number(body.mrr) || 0
  const newMrr = Number(body.newMrr) || 0
  const churnedMrr = Number(body.churnedMrr) || 0
  const customers = Number(body.customers) || 0
  const newCustomers = Number(body.newCustomers) || 0
  const lostCustomers = Number(body.lostCustomers) || 0
  const cac = Number(body.cac) || 0

  if (mrr <= 0) return Response.json({ error: 'MRR must be greater than 0' }, { status: 400 })
  if (customers <= 0) return Response.json({ error: 'Customer count must be greater than 0' }, { status: 400 })

  const access = await hasFreeOrProAccess(request, 'saas-metrics', 10)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  const arr = mrr * 12
  const arpu = body.arpu ? Number(body.arpu) : mrr / customers

  const churnRate = lostCustomers > 0
    ? (lostCustomers / (customers + lostCustomers)) * 100
    : 0

  const mrrChurnRate = churnedMrr > 0
    ? (churnedMrr / (mrr + churnedMrr - newMrr)) * 100
    : 0

  const prevMrr = mrr - newMrr + churnedMrr
  const netMrrGrowth = prevMrr > 0 ? ((newMrr - churnedMrr) / prevMrr) * 100 : 0

  const ltv = churnRate > 0 ? arpu / (churnRate / 100) : null
  const ltvCacRatio = ltv && cac > 0 ? ltv / cac : null
  const cacPayback = cac > 0 && arpu > 0 ? cac / arpu : null
  const quickRatio = churnedMrr > 0 ? newMrr / churnedMrr : null
  const nrr = prevMrr > 0 ? (mrr / prevMrr) * 100 : null

  const churnGrade = grade(churnRate, { excellent: 2, good: 5, concerning: 10 }, true)
  const ltvCacGrade = ltvCacRatio ? grade(ltvCacRatio, { excellent: 3, good: 2, concerning: 1 }) : null
  const cacPaybackGrade = cacPayback ? grade(cacPayback, { excellent: 12, good: 18, concerning: 24 }, true) : null
  const quickRatioGrade = quickRatio ? grade(quickRatio, { excellent: 4, good: 2, concerning: 1 }) : null

  return Response.json({
    inputs: { mrr, newMrr, churnedMrr, customers, newCustomers, lostCustomers, cac, arpu },
    metrics: {
      mrr: { value: mrr, formatted: fmtMoney(mrr), label: 'MRR', description: 'Monthly Recurring Revenue' },
      arr: { value: arr, formatted: fmtMoney(arr), label: 'ARR', description: 'Annual Recurring Revenue (MRR × 12)' },
      arpu: { value: arpu, formatted: fmtMoney(arpu), label: 'ARPU', description: 'Average Revenue Per User per month' },
      churnRate: { value: churnRate, formatted: fmtPct(churnRate), grade: churnGrade, label: 'Churn Rate', description: 'Percentage of customers lost this month' },
      mrrChurnRate: { value: mrrChurnRate, formatted: fmtPct(mrrChurnRate), label: 'MRR Churn Rate', description: 'Percentage of MRR lost this month' },
      netMrrGrowth: { value: netMrrGrowth, formatted: fmtPct(netMrrGrowth), label: 'Net MRR Growth', description: 'Net new MRR as % of prior MRR' },
      ltv: { value: ltv, formatted: ltv ? fmtMoney(ltv) : '∞ (no churn!)', label: 'LTV', description: 'Customer Lifetime Value — avg revenue before churn' },
      ltvCacRatio: { value: ltvCacRatio, formatted: ltvCacRatio ? `${fmt(ltvCacRatio, 1)}x` : 'N/A', grade: ltvCacGrade, label: 'LTV:CAC', description: 'Revenue earned per $1 spent on acquisition. Healthy = 3x+' },
      cacPayback: { value: cacPayback, formatted: cacPayback ? `${fmt(cacPayback, 1)} months` : 'N/A', grade: cacPaybackGrade, label: 'CAC Payback', description: 'Months to recoup acquisition cost. Healthy = under 12 months' },
      quickRatio: { value: quickRatio, formatted: quickRatio ? `${fmt(quickRatio, 1)}x` : 'N/A', grade: quickRatioGrade, label: 'Quick Ratio', description: 'New MRR / Churned MRR. Healthy = 4x+' },
      nrr: { value: nrr, formatted: nrr ? fmtPct(nrr) : 'N/A', label: 'NRR', description: 'Net Revenue Retention. Above 100% = expansion beats churn' },
    },
    calculatedAt: new Date().toISOString(),
  })
}
