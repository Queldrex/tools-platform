import { NextRequest } from 'next/server'
import { hasFreeOrProAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'

interface PlannedExpense { month: number; amount: number; description: string }

interface CashFlowInput {
  startingCash: number
  monthlyRevenue: number
  revenueGrowthRate: number
  monthlyFixedCosts: number
  variableCostPct: number
  plannedExpenses?: PlannedExpense[]
  months?: number
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getMonthLabel(offset: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() + offset)
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
}

export async function POST(request: NextRequest) {
  const access = await hasFreeOrProAccess(request, 'cashflow', 5)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  let body: CashFlowInput
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { startingCash, monthlyRevenue, revenueGrowthRate, monthlyFixedCosts, variableCostPct, plannedExpenses = [], months: rawMonths } = body

  if (isNaN(startingCash) || isNaN(monthlyRevenue) || isNaN(monthlyFixedCosts)) {
    return Response.json({ error: 'startingCash, monthlyRevenue, and monthlyFixedCosts are required numbers' }, { status: 400 })
  }

  const horizonMonths = Math.min(24, Math.max(1, Number(rawMonths) || 12))
  const growthRate = (Number(revenueGrowthRate) || 0) / 100
  const varPct = Math.min(100, Math.max(0, Number(variableCostPct) || 0)) / 100
  const fixedCosts = Math.max(0, Number(monthlyFixedCosts))

  const expenseMap = new Map<number, { amount: number; description: string }[]>()
  for (const e of plannedExpenses) {
    if (e.month >= 1 && e.month <= horizonMonths && e.amount > 0) {
      const existing = expenseMap.get(e.month) ?? []
      existing.push({ amount: e.amount, description: e.description })
      expenseMap.set(e.month, existing)
    }
  }

  const rows = []
  let cashBalance = startingCash
  let revenue = monthlyRevenue
  let runway: number | null = null
  let breakEvenMonth: number | null = null
  let cumulativeProfit = startingCash > 0 ? startingCash : 0
  let peakCash = cashBalance
  let peakCashMonth = 0
  let lowestCash = cashBalance
  let lowestCashMonth = 0
  let totalRevenue = 0
  let totalCosts = 0

  for (let m = 1; m <= horizonMonths; m++) {
    if (m > 1) revenue = revenue * (1 + growthRate)
    const variableCosts = revenue * varPct
    const plannedThisMonth = (expenseMap.get(m) ?? []).reduce((s, e) => s + e.amount, 0)
    const plannedDetails = expenseMap.get(m) ?? []
    const totalCost = fixedCosts + variableCosts + plannedThisMonth
    const netCashFlow = revenue - totalCost
    cashBalance = cashBalance + netCashFlow
    cumulativeProfit += netCashFlow

    totalRevenue += revenue
    totalCosts += totalCost

    if (cashBalance > peakCash) { peakCash = cashBalance; peakCashMonth = m }
    if (cashBalance < lowestCash) { lowestCash = cashBalance; lowestCashMonth = m }
    if (cashBalance <= 0 && runway === null) runway = m - 1
    if (cumulativeProfit >= 0 && breakEvenMonth === null && m > 0) breakEvenMonth = m

    rows.push({
      month: m,
      label: getMonthLabel(m - 1),
      revenue: Math.round(revenue),
      variableCosts: Math.round(variableCosts),
      fixedCosts: Math.round(fixedCosts),
      plannedExpense: Math.round(plannedThisMonth),
      plannedDetails,
      totalCosts: Math.round(totalCost),
      netCashFlow: Math.round(netCashFlow),
      cashBalance: Math.round(cashBalance),
      profitable: netCashFlow >= 0,
    })
  }

  const alerts: string[] = []
  const threeMonthsCosts = fixedCosts * 3
  const lowCashMonths = rows.filter(r => r.cashBalance < threeMonthsCosts && r.cashBalance > 0)
  if (lowCashMonths.length > 0) alerts.push(`Cash drops below 3 months of fixed costs in ${lowCashMonths[0].label} — consider raising revenue or cutting costs`)
  if (runway !== null && runway <= 6) alerts.push(`⚠ Cash runs out in ${runway} month${runway === 1 ? '' : 's'} — immediate action needed`)
  if (growthRate === 0 && monthlyRevenue < fixedCosts / (1 - varPct)) alerts.push('Current revenue does not cover costs at this expense level — not yet profitable')
  const negativeMonths = rows.filter(r => r.netCashFlow < 0).length
  if (negativeMonths > horizonMonths / 2) alerts.push(`${negativeMonths} of ${horizonMonths} months are cash-flow negative — review expense structure`)

  return Response.json({
    months: rows,
    summary: {
      startingCash: Math.round(startingCash),
      endingCash: Math.round(cashBalance),
      totalRevenue: Math.round(totalRevenue),
      totalCosts: Math.round(totalCosts),
      netProfit: Math.round(totalRevenue - totalCosts),
      runway,
      breakEvenMonth,
      peakCash: Math.round(peakCash),
      peakCashMonth,
      lowestCash: Math.round(lowestCash),
      lowestCashMonth,
      averageMonthlyProfit: Math.round((totalRevenue - totalCosts) / horizonMonths),
    },
    alerts,
    horizonMonths,
  })
}
