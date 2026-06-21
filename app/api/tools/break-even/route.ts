import { NextRequest } from 'next/server'
import { hasFreeOrProAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let body: {
    fixedCosts?: number
    variableCostPerUnit?: number
    pricePerUnit?: number
    currentUnits?: number
  }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const fixedCosts = Number(body.fixedCosts) || 0
  const variableCostPerUnit = Number(body.variableCostPerUnit) || 0
  const pricePerUnit = Number(body.pricePerUnit) || 0
  const currentUnits = body.currentUnits != null ? Number(body.currentUnits) : null

  if (fixedCosts <= 0) return Response.json({ error: 'Fixed costs must be greater than 0' }, { status: 400 })
  if (pricePerUnit <= 0) return Response.json({ error: 'Price per unit must be greater than 0' }, { status: 400 })
  if (variableCostPerUnit >= pricePerUnit) return Response.json({ error: 'Variable cost per unit must be less than price per unit — otherwise you lose money on every sale' }, { status: 400 })

  const access = await hasFreeOrProAccess(request, 'break-even', 10)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  const contributionMargin = pricePerUnit - variableCostPerUnit
  const contributionMarginPct = (contributionMargin / pricePerUnit) * 100
  const breakEvenUnits = Math.ceil(fixedCosts / contributionMargin)
  const breakEvenRevenue = breakEvenUnits * pricePerUnit

  let marginOfSafety: number | null = null
  let marginOfSafetyPct: number | null = null
  let currentProfit: number | null = null
  let currentRevenue: number | null = null
  let operatingLeverage: number | null = null

  if (currentUnits !== null && currentUnits > 0) {
    currentRevenue = currentUnits * pricePerUnit
    const totalVariableCosts = currentUnits * variableCostPerUnit
    const totalContributionMargin = currentUnits * contributionMargin
    currentProfit = totalContributionMargin - fixedCosts
    marginOfSafety = currentUnits - breakEvenUnits
    marginOfSafetyPct = (marginOfSafety / currentUnits) * 100
    if (totalContributionMargin > fixedCosts) {
      operatingLeverage = totalContributionMargin / (totalContributionMargin - fixedCosts)
    }
  }

  // Profit targets: units needed for various profit goals
  const profitTargets = [1000, 5000, 10000, 25000, 50000, 100000].map(target => ({
    targetProfit: target,
    unitsNeeded: Math.ceil((fixedCosts + target) / contributionMargin),
    revenueNeeded: Math.ceil((fixedCosts + target) / contributionMargin) * pricePerUnit,
  }))

  // Scenarios for chart data
  const scenarios = [
    { units: 0, revenue: 0, variableCosts: 0, totalCosts: fixedCosts, profit: -fixedCosts },
    { units: Math.floor(breakEvenUnits * 0.25), revenue: Math.floor(breakEvenUnits * 0.25) * pricePerUnit, variableCosts: Math.floor(breakEvenUnits * 0.25) * variableCostPerUnit, totalCosts: fixedCosts + Math.floor(breakEvenUnits * 0.25) * variableCostPerUnit, profit: Math.floor(breakEvenUnits * 0.25) * contributionMargin - fixedCosts },
    { units: Math.floor(breakEvenUnits * 0.5), revenue: Math.floor(breakEvenUnits * 0.5) * pricePerUnit, variableCosts: Math.floor(breakEvenUnits * 0.5) * variableCostPerUnit, totalCosts: fixedCosts + Math.floor(breakEvenUnits * 0.5) * variableCostPerUnit, profit: Math.floor(breakEvenUnits * 0.5) * contributionMargin - fixedCosts },
    { units: breakEvenUnits, revenue: breakEvenRevenue, variableCosts: breakEvenUnits * variableCostPerUnit, totalCosts: breakEvenRevenue, profit: 0 },
    { units: Math.ceil(breakEvenUnits * 1.5), revenue: Math.ceil(breakEvenUnits * 1.5) * pricePerUnit, variableCosts: Math.ceil(breakEvenUnits * 1.5) * variableCostPerUnit, totalCosts: fixedCosts + Math.ceil(breakEvenUnits * 1.5) * variableCostPerUnit, profit: Math.ceil(breakEvenUnits * 1.5) * contributionMargin - fixedCosts },
    { units: breakEvenUnits * 2, revenue: breakEvenUnits * 2 * pricePerUnit, variableCosts: breakEvenUnits * 2 * variableCostPerUnit, totalCosts: fixedCosts + breakEvenUnits * 2 * variableCostPerUnit, profit: breakEvenUnits * 2 * contributionMargin - fixedCosts },
    { units: breakEvenUnits * 3, revenue: breakEvenUnits * 3 * pricePerUnit, variableCosts: breakEvenUnits * 3 * variableCostPerUnit, totalCosts: fixedCosts + breakEvenUnits * 3 * variableCostPerUnit, profit: breakEvenUnits * 3 * contributionMargin - fixedCosts },
  ]

  const isAlreadyProfitable = currentUnits !== null && currentProfit !== null && currentProfit > 0
  const explanation = currentUnits !== null
    ? isAlreadyProfitable
      ? `You are already profitable — selling ${marginOfSafety! > 0 ? marginOfSafety : 0} units above break-even. Current monthly profit: $${currentProfit!.toFixed(0)}.`
      : `You need to sell ${Math.abs(marginOfSafety!)} more units to break even. At your current price, that's $${(Math.abs(marginOfSafety!) * pricePerUnit).toFixed(0)} more in revenue.`
    : `Sell ${breakEvenUnits} units at $${pricePerUnit}/unit to cover your $${fixedCosts}/month in fixed costs.`

  return Response.json({
    inputs: { fixedCosts, variableCostPerUnit, pricePerUnit, currentUnits },
    results: {
      contributionMargin,
      contributionMarginPct,
      breakEvenUnits,
      breakEvenRevenue,
      currentRevenue,
      currentProfit,
      marginOfSafety,
      marginOfSafetyPct,
      operatingLeverage,
    },
    profitTargets,
    scenarios,
    explanation,
    isAlreadyProfitable: isAlreadyProfitable ?? false,
    calculatedAt: new Date().toISOString(),
  })
}
