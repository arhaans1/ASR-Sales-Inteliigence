/**
 * Business Profitability Simulator — Calculation Engine
 *
 * Supports 5 funnel types:
 * 1. call_booking          - Direct call booking from ads
 * 2. free_webinar_direct   - Free webinar → direct sale on webinar
 * 3. paid_webinar_direct   - Paid webinar → direct sale on webinar
 * 4. free_webinar_call     - Free webinar → book call → sale
 * 5. paid_webinar_call     - Paid webinar → book call → sale
 *
 * All monetary values are in INR.
 */

export const FUNNEL_TYPES = {
  CALL_BOOKING: 'call_booking',
  FREE_WEBINAR_DIRECT: 'free_webinar_direct',
  PAID_WEBINAR_DIRECT: 'paid_webinar_direct',
  FREE_WEBINAR_CALL: 'free_webinar_call',
  PAID_WEBINAR_CALL: 'paid_webinar_call',
}

export const FUNNEL_LABELS = {
  [FUNNEL_TYPES.CALL_BOOKING]: 'Call Booking Funnel',
  [FUNNEL_TYPES.FREE_WEBINAR_DIRECT]: 'Free Webinar → Direct Sales',
  [FUNNEL_TYPES.PAID_WEBINAR_DIRECT]: 'Paid Webinar → Direct Sales',
  [FUNNEL_TYPES.FREE_WEBINAR_CALL]: 'Free Webinar → Call Booking',
  [FUNNEL_TYPES.PAID_WEBINAR_CALL]: 'Paid Webinar → Call Booking',
}

// ═══════════════════════════════════════════════════════════════════
// CALL BOOKING FUNNEL
// ═══════════════════════════════════════════════════════════════════
function calculateCallBooking(inputs) {
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
  const safeNumClosers = Math.max(Number(numClosers) || 1, 1)
  const safeMaxCalls = Math.max(Number(maxCallsPerCloserPerDay) || 1, 1)

  // Monthly Capacity
  const monthlyCapacity = safeNumClosers * safeMaxCalls * 30

  // Simulation Mode: +5% cost per call per 50 calls
  let effectiveCostPerCall = Number(costPerQualifiedCall) || 0
  if (simulateAdCostIncrease && monthlyCapacity > 0) {
    const batches = Math.floor(monthlyCapacity / 50)
    effectiveCostPerCall = effectiveCostPerCall * (1 + batches * 0.05)
  }

  // CAC = (Calls to Close × Cost Per Call) × (1 + GST%)
  const gstMultiplier = 1 + (Number(gstOnAdSpendPct) || 0) / 100
  const cac = safeCallsToClose * effectiveCostPerCall * gstMultiplier

  // Commission per Sale
  const commissionPerSale = (Number(avgSaleValue) || 0) * ((Number(teamCommissionPct) || 0) / 100)

  // Contribution Margin per Sale
  const marginPerSale = (Number(avgSaleValue) || 0) - commissionPerSale - cac

  // Required Sales
  const fixedExp = Number(fixedMonthlyExpense) || 0
  const desiredProfit = Number(desiredMonthlyProfit) || 0
  const requiredSales = marginPerSale > 0 ? (fixedExp + desiredProfit) / marginPerSale : Infinity

  // Actual Sales at Full Capacity
  const actualSalesAtCapacity = monthlyCapacity / safeCallsToClose

  // Profit at Full Capacity
  const profitAtCapacity = actualSalesAtCapacity * marginPerSale - fixedExp

  // Revenue Metrics
  const totalRevenueNeeded = isFinite(requiredSales) ? requiredSales * (Number(avgSaleValue) || 0) : 0
  const revenueAtCapacity = actualSalesAtCapacity * (Number(avgSaleValue) || 0)

  // Ad Spend
  const monthlyAdSpend = monthlyCapacity * effectiveCostPerCall * gstMultiplier
  const dailyAdSpend = monthlyAdSpend / 30

  // Reverse calculation: calls/registrations needed for desired profit
  const callsNeededForProfit = isFinite(requiredSales) ? Math.ceil(requiredSales * safeCallsToClose) : Infinity
  const adSpendForProfit = isFinite(requiredSales) ? callsNeededForProfit * effectiveCostPerCall * gstMultiplier : Infinity

  // Status Flags
  const hasNegativeMargin = marginPerSale <= 0
  const isFeasible = isFinite(requiredSales) && actualSalesAtCapacity >= requiredSales && !hasNegativeMargin
  const isProfit = profitAtCapacity > 0

  return {
    funnelType: FUNNEL_TYPES.CALL_BOOKING,
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
    // Reverse calculation results
    callsNeededForProfit,
    adSpendForProfit,
    dailyAdSpendForProfit: adSpendForProfit / 30,
  }
}

// ═══════════════════════════════════════════════════════════════════
// WEBINAR DIRECT SALES (Free & Paid)
// ═══════════════════════════════════════════════════════════════════
function calculateWebinarDirect(inputs, isPaid = false) {
  const {
    fixedMonthlyExpense = 0,
    avgSaleValue = 0,
    teamCommissionPct = 0,
    gstOnAdSpendPct = 18,
    desiredMonthlyProfit = 0,
    costPerRegistration = 200,
    webinarTicketPrice = 0,
    registrationToAttendeePct = 40,
    attendeeToSalePct = 5,
  } = inputs

  const gstMultiplier = 1 + (Number(gstOnAdSpendPct) || 0) / 100
  const costPerReg = (Number(costPerRegistration) || 0) * gstMultiplier
  const ticketPrice = isPaid ? Number(webinarTicketPrice) || 0 : 0
  const attendeeRate = (Number(registrationToAttendeePct) || 1) / 100
  const saleRate = (Number(attendeeToSalePct) || 1) / 100

  // Conversion from registration to sale
  const regToSaleRate = attendeeRate * saleRate
  const registrationsPerSale = regToSaleRate > 0 ? 1 / regToSaleRate : Infinity

  // Net cost per registration (tickets offset ad cost)
  const ticketRevenuePerReg = ticketPrice * attendeeRate  // only attendees pay
  const netCostPerReg = costPerReg - ticketRevenuePerReg

  // CAC = net cost to acquire 1 customer
  const cac = isFinite(registrationsPerSale) ? registrationsPerSale * netCostPerReg : Infinity

  // Commission per Sale
  const commissionPerSale = (Number(avgSaleValue) || 0) * ((Number(teamCommissionPct) || 0) / 100)

  // Margin per Sale
  const marginPerSale = (Number(avgSaleValue) || 0) - commissionPerSale - Math.max(cac, 0)

  // Required Sales
  const fixedExp = Number(fixedMonthlyExpense) || 0
  const desiredProfit = Number(desiredMonthlyProfit) || 0
  const requiredSales = marginPerSale > 0 ? (fixedExp + desiredProfit) / marginPerSale : Infinity

  // Revenue needed
  const totalRevenueNeeded = isFinite(requiredSales) ? requiredSales * (Number(avgSaleValue) || 0) : 0

  // Registrations needed for profit target
  const registrationsNeeded = isFinite(requiredSales) ? Math.ceil(requiredSales * registrationsPerSale) : Infinity
  const attendeesNeeded = isFinite(registrationsNeeded) ? Math.ceil(registrationsNeeded * attendeeRate) : Infinity

  // Ad spend for profit target
  const grossAdSpend = isFinite(registrationsNeeded) ? registrationsNeeded * costPerReg : Infinity
  const ticketRevenue = isFinite(registrationsNeeded) ? registrationsNeeded * ticketRevenuePerReg : 0
  const netAdSpend = grossAdSpend - ticketRevenue

  // Profit at current metrics (assuming we hit required sales)
  const profitAtTarget = isFinite(requiredSales) ? requiredSales * marginPerSale - fixedExp : 0

  // Status Flags
  const hasNegativeMargin = marginPerSale <= 0
  const isFeasible = isFinite(requiredSales) && !hasNegativeMargin
  const isProfit = marginPerSale > 0

  return {
    funnelType: isPaid ? FUNNEL_TYPES.PAID_WEBINAR_DIRECT : FUNNEL_TYPES.FREE_WEBINAR_DIRECT,
    cac: Math.max(cac, 0),
    commissionPerSale,
    marginPerSale,
    registrationsPerSale,
    attendeeRate: attendeeRate * 100,
    saleRate: saleRate * 100,
    regToSaleRate: regToSaleRate * 100,
    costPerReg,
    netCostPerReg,
    ticketRevenuePerReg,
    requiredSales,
    totalRevenueNeeded,
    // Reverse calculations
    registrationsNeeded,
    attendeesNeeded,
    grossAdSpend,
    ticketRevenue,
    netAdSpend,
    dailyAdSpend: netAdSpend / 30,
    monthlyAdSpend: netAdSpend,
    profitAtCapacity: profitAtTarget,
    isFeasible,
    isProfit,
    hasNegativeMargin,
    capacityGap: 0, // No capacity limit for webinars
  }
}

// ═══════════════════════════════════════════════════════════════════
// WEBINAR TO CALL BOOKING (Free & Paid)
// ═══════════════════════════════════════════════════════════════════
function calculateWebinarToCall(inputs, isPaid = false) {
  const {
    fixedMonthlyExpense = 0,
    avgSaleValue = 0,
    teamCommissionPct = 0,
    gstOnAdSpendPct = 18,
    desiredMonthlyProfit = 0,
    costPerRegistration = 200,
    webinarTicketPrice = 0,
    registrationToAttendeePct = 40,
    attendeeToCallPct = 15,
    callShowUpPct = 70,
    callsToCloseWebinar = 3,
    costPerCallWebinar = 0,
    numClosersWebinar = 2,
    maxCallsPerCloserWebinar = 6,
  } = inputs

  const gstMultiplier = 1 + (Number(gstOnAdSpendPct) || 0) / 100
  const costPerReg = (Number(costPerRegistration) || 0) * gstMultiplier
  const ticketPrice = isPaid ? Number(webinarTicketPrice) || 0 : 0
  const additionalCallCost = (Number(costPerCallWebinar) || 0) * gstMultiplier

  // Conversion rates
  const attendeeRate = (Number(registrationToAttendeePct) || 1) / 100
  const callBookingRate = (Number(attendeeToCallPct) || 1) / 100
  const showUpRate = (Number(callShowUpPct) || 1) / 100
  const callsToClose = Math.max(Number(callsToCloseWebinar) || 1, 1)

  // Full funnel conversion: registration → attended call
  const regToAttendedCallRate = attendeeRate * callBookingRate * showUpRate
  const regToSaleRate = regToAttendedCallRate / callsToClose

  const registrationsPerCall = regToAttendedCallRate > 0 ? 1 / regToAttendedCallRate : Infinity
  const registrationsPerSale = regToSaleRate > 0 ? 1 / regToSaleRate : Infinity

  // Net cost per registration
  const ticketRevenuePerReg = ticketPrice * attendeeRate
  const netCostPerReg = costPerReg - ticketRevenuePerReg

  // Cost per attended call (from registrations)
  const costPerAttendedCall = isFinite(registrationsPerCall)
    ? registrationsPerCall * netCostPerReg + additionalCallCost
    : Infinity

  // CAC = cost to acquire 1 customer
  const cac = isFinite(registrationsPerSale)
    ? registrationsPerSale * netCostPerReg + (callsToClose * additionalCallCost)
    : Infinity

  // Commission per Sale
  const commissionPerSale = (Number(avgSaleValue) || 0) * ((Number(teamCommissionPct) || 0) / 100)

  // Margin per Sale
  const marginPerSale = (Number(avgSaleValue) || 0) - commissionPerSale - Math.max(cac, 0)

  // Team Capacity
  const safeNumClosers = Math.max(Number(numClosersWebinar) || 1, 1)
  const safeMaxCalls = Math.max(Number(maxCallsPerCloserWebinar) || 1, 1)
  const monthlyCallCapacity = safeNumClosers * safeMaxCalls * 30
  const actualSalesAtCapacity = monthlyCallCapacity / callsToClose

  // Required Sales
  const fixedExp = Number(fixedMonthlyExpense) || 0
  const desiredProfit = Number(desiredMonthlyProfit) || 0
  const requiredSales = marginPerSale > 0 ? (fixedExp + desiredProfit) / marginPerSale : Infinity

  // Revenue needed
  const totalRevenueNeeded = isFinite(requiredSales) ? requiredSales * (Number(avgSaleValue) || 0) : 0
  const revenueAtCapacity = actualSalesAtCapacity * (Number(avgSaleValue) || 0)

  // Profit at capacity
  const profitAtCapacity = actualSalesAtCapacity * marginPerSale - fixedExp

  // Reverse calculations for profit target
  const callsNeeded = isFinite(requiredSales) ? Math.ceil(requiredSales * callsToClose) : Infinity
  const registrationsNeeded = isFinite(callsNeeded) ? Math.ceil(callsNeeded / regToAttendedCallRate) : Infinity
  const attendeesNeeded = isFinite(registrationsNeeded) ? Math.ceil(registrationsNeeded * attendeeRate) : Infinity
  const bookedCallsNeeded = isFinite(attendeesNeeded) ? Math.ceil(attendeesNeeded * callBookingRate) : Infinity

  // Ad spend calculations
  const grossAdSpend = isFinite(registrationsNeeded) ? registrationsNeeded * costPerReg : Infinity
  const ticketRevenue = isFinite(registrationsNeeded) ? registrationsNeeded * ticketRevenuePerReg : 0
  const netAdSpend = grossAdSpend - ticketRevenue + (callsNeeded * additionalCallCost)

  // Current monthly ad spend at capacity
  const regsNeededForCapacity = monthlyCallCapacity / regToAttendedCallRate
  const monthlyAdSpend = isFinite(regsNeededForCapacity)
    ? regsNeededForCapacity * costPerReg - (regsNeededForCapacity * ticketRevenuePerReg) + (monthlyCallCapacity * additionalCallCost)
    : 0

  // Status Flags
  const hasNegativeMargin = marginPerSale <= 0
  const isFeasible = isFinite(requiredSales) && actualSalesAtCapacity >= requiredSales && !hasNegativeMargin
  const isProfit = profitAtCapacity > 0

  return {
    funnelType: isPaid ? FUNNEL_TYPES.PAID_WEBINAR_CALL : FUNNEL_TYPES.FREE_WEBINAR_CALL,
    cac: Math.max(cac, 0),
    commissionPerSale,
    marginPerSale,
    // Conversion metrics
    attendeeRate: attendeeRate * 100,
    callBookingRate: callBookingRate * 100,
    showUpRate: showUpRate * 100,
    regToAttendedCallRate: regToAttendedCallRate * 100,
    regToSaleRate: regToSaleRate * 100,
    registrationsPerCall,
    registrationsPerSale,
    costPerAttendedCall,
    costPerReg,
    netCostPerReg,
    ticketRevenuePerReg,
    // Capacity metrics
    monthlyCallCapacity,
    actualSalesAtCapacity,
    requiredSales,
    totalRevenueNeeded,
    revenueAtCapacity,
    profitAtCapacity,
    monthlyAdSpend,
    dailyAdSpend: monthlyAdSpend / 30,
    // Reverse calculations
    callsNeeded,
    registrationsNeeded,
    attendeesNeeded,
    bookedCallsNeeded,
    grossAdSpend,
    ticketRevenue,
    netAdSpend,
    adSpendForProfit: netAdSpend,
    dailyAdSpendForProfit: netAdSpend / 30,
    isFeasible,
    isProfit,
    hasNegativeMargin,
    capacityGap: requiredSales - actualSalesAtCapacity,
  }
}

// ═══════════════════════════════════════════════════════════════════
// MAIN CALCULATE FUNCTION
// ═══════════════════════════════════════════════════════════════════
export function calculate(inputs) {
  const funnelType = inputs.funnelType || FUNNEL_TYPES.CALL_BOOKING

  switch (funnelType) {
    case FUNNEL_TYPES.CALL_BOOKING:
      return calculateCallBooking(inputs)
    case FUNNEL_TYPES.FREE_WEBINAR_DIRECT:
      return calculateWebinarDirect(inputs, false)
    case FUNNEL_TYPES.PAID_WEBINAR_DIRECT:
      return calculateWebinarDirect(inputs, true)
    case FUNNEL_TYPES.FREE_WEBINAR_CALL:
      return calculateWebinarToCall(inputs, false)
    case FUNNEL_TYPES.PAID_WEBINAR_CALL:
      return calculateWebinarToCall(inputs, true)
    default:
      return calculateCallBooking(inputs)
  }
}
