import { NextRequest } from 'next/server'
import { hasFreeOrProAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const access = await hasFreeOrProAccess(request, 'roi-calculator', 10)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  let body: {
    investmentCost?: number; additionalCosts?: number; expectedRevenue?: number
    timeframeMonths?: number; riskLevel?: 'low' | 'medium' | 'high'
  }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const investmentCost = Number(body.investmentCost)
  const expectedRevenue = Number(body.expectedRevenue)
  const timeframeMonths = Math.max(1, Math.min(120, Number(body.timeframeMonths) || 12))
  const additionalCosts = Number(body.additionalCosts) || 0
  const riskLevel = body.riskLevel || 'medium'

  if (!investmentCost || investmentCost <= 0) return Response.json({ error: 'Investment cost must be greater than 0' }, { status: 400 })
  if (!expectedRevenue || expectedRevenue < 0) return Response.json({ error: 'Expected revenue is required' }, { status: 400 })

  const totalAdditionalCosts = additionalCosts * (timeframeMonths / 12)
  const netProfit = expectedRevenue - investmentCost - totalAdditionalCosts
  const roi = (netProfit / investmentCost) * 100
  const annualizedRoi = roi * (12 / timeframeMonths)
  const monthlyRevenue = expectedRevenue / timeframeMonths
  const paybackMonths = monthlyRevenue > 0 ? investmentCost / monthlyRevenue : Infinity
  const perDollarReturn = expectedRevenue / investmentCost

  const riskAdjustments = {
    low:    { conservative: -0.20, optimistic: +0.30 },
    medium: { conservative: -0.35, optimistic: +0.60 },
    high:   { conservative: -0.60, optimistic: +1.50 },
  }
  const adj = riskAdjustments[riskLevel]

  const calcScenario = (multiplier: number) => {
    const adjRevenue = expectedRevenue * (1 + multiplier)
    const adjProfit = adjRevenue - investmentCost - totalAdditionalCosts
    return { roi: (adjProfit / investmentCost) * 100, netProfit: adjProfit, revenue: adjRevenue }
  }

  const scenarios = {
    conservative: calcScenario(adj.conservative),
    base: { roi, netProfit, revenue: expectedRevenue },
    optimistic: calcScenario(adj.optimistic),
  }

  let rating: string
  if (roi > 200) rating = 'Excellent'
  else if (roi > 100) rating = 'Strong'
  else if (roi > 50) rating = 'Moderate'
  else if (roi > 0) rating = 'Marginal'
  else rating = 'Negative'

  const months = timeframeMonths === 1 ? '1 month' : `${timeframeMonths} months`
  const verdict = netProfit >= 0
    ? `For every $1 invested, you get back $${perDollarReturn.toFixed(2)} over ${months}.`
    : `This investment loses $${Math.abs(netProfit).toLocaleString('en-US', { maximumFractionDigits: 0 })} over ${months} under base assumptions.`

  return Response.json({
    roi: Math.round(roi * 100) / 100,
    annualizedRoi: Math.round(annualizedRoi * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    paybackMonths: isFinite(paybackMonths) ? Math.round(paybackMonths * 10) / 10 : null,
    perDollarReturn: Math.round(perDollarReturn * 100) / 100,
    rating,
    verdict,
    scenarios: {
      conservative: { roi: Math.round(scenarios.conservative.roi * 100) / 100, netProfit: Math.round(scenarios.conservative.netProfit * 100) / 100 },
      base: { roi: Math.round(roi * 100) / 100, netProfit: Math.round(netProfit * 100) / 100 },
      optimistic: { roi: Math.round(scenarios.optimistic.roi * 100) / 100, netProfit: Math.round(scenarios.optimistic.netProfit * 100) / 100 },
    },
    inputs: { investmentCost, expectedRevenue, timeframeMonths, additionalCosts, riskLevel },
  })
}
