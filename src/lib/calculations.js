// Calculate current funnel metrics from entered data
export function calculateCurrentMetrics(prospect) {
  const {
    current_daily_spend,
    current_cpa_stage1,
    stage1_price = 0,
    stage2_price = 0,
    stage3_price = 0,
    current_stage2_rate = 0,
    current_stage3_rate = 0,
    current_stage4_rate = 0,
    current_conversion_rate = 0,
    high_ticket_price = 0,
    stage3_enabled = false,
    stage4_enabled = false
  } = prospect

  // Early return if required fields are missing
  if (!current_daily_spend || !current_cpa_stage1) {
    return null
  }

  const monthly_spend = current_daily_spend * 30
  const stage1_volume = monthly_spend / current_cpa_stage1

  // Build conversion chain
  let volumes = [stage1_volume]
  let cpas = [current_cpa_stage1]
  let stageNames = [prospect.stage1_name || 'Registration']

  // Stage 2
  if (current_stage2_rate > 0) {
    const s2_vol = stage1_volume * (current_stage2_rate / 100)
    const s2_cpa = current_cpa_stage1 / (current_stage2_rate / 100)
    volumes.push(s2_vol)
    cpas.push(s2_cpa)
    stageNames.push(prospect.stage2_name || 'Attendance')
  }

  // Stage 3
  if (stage3_enabled && current_stage3_rate > 0 && volumes.length > 1) {
    const prevVol = volumes[volumes.length - 1]
    const prevCpa = cpas[cpas.length - 1]
    const s3_vol = prevVol * (current_stage3_rate / 100)
    const s3_cpa = prevCpa / (current_stage3_rate / 100)
    volumes.push(s3_vol)
    cpas.push(s3_cpa)
    stageNames.push(prospect.stage3_name || 'Call Booking')
  }

  // Stage 4
  if (stage4_enabled && current_stage4_rate > 0 && volumes.length > 2) {
    const prevVol = volumes[volumes.length - 1]
    const prevCpa = cpas[cpas.length - 1]
    const s4_vol = prevVol * (current_stage4_rate / 100)
    const s4_cpa = prevCpa / (current_stage4_rate / 100)
    volumes.push(s4_vol)
    cpas.push(s4_cpa)
    stageNames.push(prospect.stage4_name || 'Call Attendance')
  }

  // Final conversion
  const lastVol = volumes[volumes.length - 1]
  const lastCpa = cpas[cpas.length - 1]
  const sales = current_conversion_rate > 0 ? lastVol * (current_conversion_rate / 100) : 0
  const cpa_customer = current_conversion_rate > 0 ? lastCpa / (current_conversion_rate / 100) : 0

  // Revenue calculation
  let revenue = sales * (high_ticket_price || 0)
  if (stage1_price > 0) revenue += stage1_volume * stage1_price
  if (stage2_price > 0 && volumes.length > 1) revenue += volumes[1] * stage2_price
  if (stage3_enabled && stage3_price > 0 && volumes.length > 2) revenue += volumes[2] * stage3_price

  const roi = monthly_spend > 0 ? revenue / monthly_spend : 0
  const profit = revenue - monthly_spend

  // Calculate rates
  const rates = [null] // Stage 1 has no rate
  if (current_stage2_rate > 0) rates.push(current_stage2_rate)
  if (stage3_enabled && current_stage3_rate > 0) rates.push(current_stage3_rate)
  if (stage4_enabled && current_stage4_rate > 0) rates.push(current_stage4_rate)

  // Stage prices
  const prices = [stage1_price]
  if (volumes.length > 1) prices.push(stage2_price)
  if (stage3_enabled && volumes.length > 2) prices.push(stage3_price)
  if (stage4_enabled && volumes.length > 3) prices.push(0)

  // Overall conversion rate (stage 1 to customer)
  const overall_conversion_rate = stage1_volume > 0 ? (sales / stage1_volume) * 100 : 0

  return {
    monthly_spend,
    volumes: volumes.map(v => Math.round(v * 10) / 10),
    cpas: cpas.map(c => Math.round(c)),
    rates,
    prices,
    stageNames,
    sales: Math.round(sales * 10) / 10,
    cpa_customer: Math.round(cpa_customer),
    revenue: Math.round(revenue),
    profit: Math.round(profit),
    roi: Math.round(roi * 100) / 100,
    overall_conversion_rate: Math.round(overall_conversion_rate * 100) / 100,
    is_profitable: profit > 0,
    roi_status: roi >= 2 ? 'healthy' : roi >= 1 ? 'break_even' : 'losing'
  }
}

// Calculate projections with new inputs
export function calculateProjections(prospect, projectedInputs = {}) {
  const merged = { ...prospect, ...projectedInputs }

  const {
    projected_daily_spend,
    projected_cpa_stage1,
    stage1_price = 0,
    stage2_price = 0,
    stage3_price = 0,
    projected_stage2_rate,
    projected_stage3_rate,
    projected_stage4_rate,
    projected_conversion_rate,
    projected_high_ticket_price,
    stage3_enabled = false,
    stage4_enabled = false
  } = merged

  // Use projected values or fall back to current values
  const dailySpend = projected_daily_spend || prospect.current_daily_spend
  const cpaStage1 = projected_cpa_stage1 || prospect.current_cpa_stage1
  const stage2Rate = projected_stage2_rate ?? prospect.current_stage2_rate
  const stage3Rate = projected_stage3_rate ?? prospect.current_stage3_rate
  const stage4Rate = projected_stage4_rate ?? prospect.current_stage4_rate
  const conversionRate = projected_conversion_rate ?? prospect.current_conversion_rate
  const ticketPrice = projected_high_ticket_price || prospect.high_ticket_price

  if (!dailySpend || !cpaStage1) {
    return null
  }

  const monthly_spend = dailySpend * 30
  const stage1_volume = monthly_spend / cpaStage1

  // Build conversion chain
  let volumes = [stage1_volume]
  let cpas = [cpaStage1]

  // Stage 2
  if (stage2Rate > 0) {
    const s2_vol = stage1_volume * (stage2Rate / 100)
    const s2_cpa = cpaStage1 / (stage2Rate / 100)
    volumes.push(s2_vol)
    cpas.push(s2_cpa)
  }

  // Stage 3
  if (stage3_enabled && stage3Rate > 0 && volumes.length > 1) {
    const prevVol = volumes[volumes.length - 1]
    const prevCpa = cpas[cpas.length - 1]
    const s3_vol = prevVol * (stage3Rate / 100)
    const s3_cpa = prevCpa / (stage3Rate / 100)
    volumes.push(s3_vol)
    cpas.push(s3_cpa)
  }

  // Stage 4
  if (stage4_enabled && stage4Rate > 0 && volumes.length > 2) {
    const prevVol = volumes[volumes.length - 1]
    const prevCpa = cpas[cpas.length - 1]
    const s4_vol = prevVol * (stage4Rate / 100)
    const s4_cpa = prevCpa / (stage4Rate / 100)
    volumes.push(s4_vol)
    cpas.push(s4_cpa)
  }

  // Final conversion
  const lastVol = volumes[volumes.length - 1]
  const lastCpa = cpas[cpas.length - 1]
  const sales = conversionRate > 0 ? lastVol * (conversionRate / 100) : 0
  const cpa_customer = conversionRate > 0 ? lastCpa / (conversionRate / 100) : 0

  // Revenue calculation
  let revenue = sales * (ticketPrice || 0)
  if (stage1_price > 0) revenue += stage1_volume * stage1_price
  if (stage2_price > 0 && volumes.length > 1) revenue += volumes[1] * stage2_price
  if (stage3_enabled && stage3_price > 0 && volumes.length > 2) revenue += volumes[2] * stage3_price

  const roi = monthly_spend > 0 ? revenue / monthly_spend : 0
  const profit = revenue - monthly_spend

  // Calculate improvement from current metrics
  const currentMetrics = calculateCurrentMetrics(prospect)

  let salesIncrease = 0
  let revenueIncrease = 0
  let roiChange = 0

  if (currentMetrics) {
    salesIncrease = currentMetrics.sales > 0
      ? Math.round(((sales / currentMetrics.sales) - 1) * 100)
      : 0
    revenueIncrease = currentMetrics.revenue > 0
      ? Math.round(((revenue / currentMetrics.revenue) - 1) * 100)
      : 0
    roiChange = Math.round((roi - currentMetrics.roi) * 100) / 100
  }

  return {
    monthly_spend,
    daily_spend: dailySpend,
    volumes: volumes.map(v => Math.round(v * 10) / 10),
    cpas: cpas.map(c => Math.round(c)),
    sales: Math.round(sales * 10) / 10,
    cpa_customer: Math.round(cpa_customer),
    revenue: Math.round(revenue),
    profit: Math.round(profit),
    roi: Math.round(roi * 100) / 100,
    is_profitable: profit > 0,

    // Improvements
    sales_increase: salesIncrease,
    revenue_increase: revenueIncrease,
    roi_change: roiChange
  }
}

// Scaling timeline calculation
export function calculateScalingTimeline(currentSpend, targetSpend, incrementPercent = 20, frequencyDays = 3) {
  if (!currentSpend || !targetSpend || currentSpend >= targetSpend) {
    return { steps: [], totalSteps: 0, totalDays: 0, totalWeeks: 0 }
  }

  const steps = []
  let current = currentSpend
  let step = 0
  let day = 0

  while (current < targetSpend) {
    steps.push({
      step,
      budget: Math.round(current),
      day
    })
    current *= (1 + incrementPercent / 100)
    step++
    day += frequencyDays
  }

  steps.push({
    step,
    budget: Math.round(current),
    day,
    isTarget: true
  })

  return {
    steps,
    totalSteps: step,
    totalDays: day,
    totalWeeks: Math.ceil(day / 7)
  }
}
