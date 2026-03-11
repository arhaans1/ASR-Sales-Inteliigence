/**
 * Business Profitability Simulator — Calculation Engine
 *
 * Takes user inputs and returns all derived financial metrics.
 * All monetary values are in INR.
 */

export function calculate(inputs) {
  const {
    fixedMonthlyExpense = 0,
    costPerQualifiedCall = 0,
    callsToClose = 1,
    avgSaleValue = 0,
    teamCommissionPct = 0,
    gstOnAdSpendPct = 18,
    desiredMonthlyProfit = 0,
    numClosers = 1,
    maxCallsPerCloserPerDay = 8,
    simulateAdCostIncrease = false,
  } = inputs

  const safeCallsToClose = Math.max(Number(callsToClose) || 1, 1)
  const safeNumClosers   = Math.max(Number(numClosers) || 1, 1)
  const safeMaxCalls     = Math.max(Number(maxCallsPerCloserPerDay) || 1, 1)

  // ── Monthly Capacity (total calls team can handle) ──────────
  const monthlyCapacity = safeNumClosers * safeMaxCalls * 30

  // ── Simulation Mode: +5% cost per call per 50 calls ─────────
  let effectiveCostPerCall = Number(costPerQualifiedCall) || 0
  if (simulateAdCostIncrease && monthlyCapacity > 0) {
    const batches = Math.floor(monthlyCapacity / 50)
    effectiveCostPerCall = effectiveCostPerCall * (1 + batches * 0.05)
  }

  // ── CAC = (Calls to Close × Cost Per Call) × (1 + GST%) ─────
  const gstMultiplier = 1 + (Number(gstOnAdSpendPct) || 0) / 100
  const cac = safeCallsToClose * effectiveCostPerCall * gstMultiplier

  // ── Commission per Sale ──────────────────────────────────────
  const commissionPerSale =
    (Number(avgSaleValue) || 0) * ((Number(teamCommissionPct) || 0) / 100)

  // ── Contribution Margin per Sale = Revenue − Commission − CAC
  const marginPerSale = (Number(avgSaleValue) || 0) - commissionPerSale - cac

  // ── Required Sales = (Fixed Expense + Desired Profit) / Margin
  const fixedExp = Number(fixedMonthlyExpense) || 0
  const desiredProfit = Number(desiredMonthlyProfit) || 0
  const requiredSales =
    marginPerSale > 0 ? (fixedExp + desiredProfit) / marginPerSale : Infinity

  // ── Actual Sales at Full Capacity ────────────────────────────
  const actualSalesAtCapacity = monthlyCapacity / safeCallsToClose

  // ── Current Profit at Full Capacity ─────────────────────────
  const profitAtCapacity = actualSalesAtCapacity * marginPerSale - fixedExp

  // ── Revenue Metrics ──────────────────────────────────────────
  const totalRevenueNeeded = isFinite(requiredSales)
    ? requiredSales * (Number(avgSaleValue) || 0)
    : 0
  const revenueAtCapacity =
    actualSalesAtCapacity * (Number(avgSaleValue) || 0)

  // ── Ad Spend Metrics ─────────────────────────────────────────
  const monthlyAdSpend = monthlyCapacity * effectiveCostPerCall * gstMultiplier
  const dailyAdSpend   = monthlyAdSpend / 30

  // ── Status Flags ─────────────────────────────────────────────
  const hasNegativeMargin = marginPerSale <= 0
  const isFeasible =
    isFinite(requiredSales) &&
    actualSalesAtCapacity >= requiredSales &&
    !hasNegativeMargin
  const isProfit = profitAtCapacity > 0

  return {
    cac,
    commissionPerSale,
    marginPerSale,
    effectiveCostPerCall,

    monthlyCapacity,
    actualSalesAtCapacity,

    requiredSales,
    totalRevenueNeeded,
    revenueAtCapacity,

    profitAtCapacity,
    monthlyAdSpend,
    dailyAdSpend,

    isFeasible,
    isProfit,
    hasNegativeMargin,
    capacityGap: requiredSales - actualSalesAtCapacity,
  }
}
