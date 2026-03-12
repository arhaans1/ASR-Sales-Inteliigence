import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Save, Trash2, Edit2, Check, X, ToggleLeft, ToggleRight, Target, Maximize2, Users, Video, Phone } from 'lucide-react'
import Layout from '../components/Layout'
import InputField from '../components/InputField'
import { useClient } from '../hooks/useClients'
import { updateClient, deleteClient } from '../lib/supabase'
import { calculate, FUNNEL_TYPES, FUNNEL_LABELS } from '../lib/calculations'
import { formatINR, formatNumber } from '../lib/formatters'

// ── DB <-> State mappers ──────────────────────────────────────
function dbToInputs(c) {
  return {
    funnelType: c.funnel_type || FUNNEL_TYPES.CALL_BOOKING,
    fixedMonthlyExpense: Number(c.fixed_monthly_expense) ?? 0,
    avgSaleValue: Number(c.avg_sale_value) ?? 0,
    teamCommissionPct: Number(c.team_commission_pct) ?? 0,
    gstOnAdSpendPct: Number(c.gst_on_ad_spend_pct) ?? 18,
    desiredMonthlyProfit: Number(c.desired_monthly_profit) ?? 0,
    costPerQualifiedCall: Number(c.cost_per_qualified_call) ?? 0,
    callsToClose: Number(c.calls_to_close) ?? 1,
    numClosers: Number(c.num_closers) ?? 1,
    maxCallsPerCloserPerDay: Number(c.max_calls_per_closer_per_day) ?? 8,
    simulateAdCostIncrease: Boolean(c.simulate_ad_cost_increase),
    costPerRegistration: Number(c.cost_per_registration) ?? 200,
    webinarTicketPrice: Number(c.webinar_ticket_price) ?? 0,
    registrationToAttendeePct: Number(c.registration_to_attendee_pct) ?? 40,
    attendeeToSalePct: Number(c.attendee_to_sale_pct) ?? 5,
    attendeeToCallPct: Number(c.attendee_to_call_pct) ?? 15,
    callShowUpPct: Number(c.call_show_up_pct) ?? 70,
    callsToCloseWebinar: Number(c.calls_to_close_webinar) ?? 3,
    costPerCallWebinar: Number(c.cost_per_call_webinar) ?? 0,
    numClosersWebinar: Number(c.num_closers_webinar) ?? 2,
    maxCallsPerCloserWebinar: Number(c.max_calls_per_closer_webinar) ?? 6,
  }
}

function inputsToDb(inputs) {
  return {
    funnel_type: inputs.funnelType,
    fixed_monthly_expense: inputs.fixedMonthlyExpense,
    avg_sale_value: inputs.avgSaleValue,
    team_commission_pct: inputs.teamCommissionPct,
    gst_on_ad_spend_pct: inputs.gstOnAdSpendPct,
    desired_monthly_profit: inputs.desiredMonthlyProfit,
    cost_per_qualified_call: inputs.costPerQualifiedCall,
    calls_to_close: inputs.callsToClose,
    num_closers: inputs.numClosers,
    max_calls_per_closer_per_day: inputs.maxCallsPerCloserPerDay,
    simulate_ad_cost_increase: inputs.simulateAdCostIncrease,
    cost_per_registration: inputs.costPerRegistration,
    webinar_ticket_price: inputs.webinarTicketPrice,
    registration_to_attendee_pct: inputs.registrationToAttendeePct,
    attendee_to_sale_pct: inputs.attendeeToSalePct,
    attendee_to_call_pct: inputs.attendeeToCallPct,
    call_show_up_pct: inputs.callShowUpPct,
    calls_to_close_webinar: inputs.callsToCloseWebinar,
    cost_per_call_webinar: inputs.costPerCallWebinar,
    num_closers_webinar: inputs.numClosersWebinar,
    max_calls_per_closer_webinar: inputs.maxCallsPerCloserWebinar,
  }
}

// ── Metric Row Component ──────────────────────────────────────
function MetricRow({ label, value, highlight, bold }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span
        className={`text-sm ${bold ? 'font-bold' : 'font-semibold'} ${
          highlight === 'green' ? 'text-green-600' : highlight === 'red' ? 'text-red-600' : 'text-gray-900'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

// ── Results Section Component ─────────────────────────────────
function ResultsSection({ title, icon: Icon, color, data, funnelType, inputs }) {
  const isCallBooking = funnelType === FUNNEL_TYPES.CALL_BOOKING
  const isWebinarDirect = funnelType === FUNNEL_TYPES.FREE_WEBINAR_DIRECT || funnelType === FUNNEL_TYPES.PAID_WEBINAR_DIRECT
  const isWebinarCall = funnelType === FUNNEL_TYPES.FREE_WEBINAR_CALL || funnelType === FUNNEL_TYPES.PAID_WEBINAR_CALL

  const bgColor = color === 'indigo' ? 'bg-indigo-50 border-indigo-200' : 'bg-emerald-50 border-emerald-200'
  const headerBg = color === 'indigo' ? 'bg-indigo-600' : 'bg-emerald-600'
  const iconColor = color === 'indigo' ? 'text-indigo-600' : 'text-emerald-600'

  return (
    <div className={`rounded-xl border overflow-hidden ${bgColor}`}>
      {/* Header */}
      <div className={`${headerBg} px-5 py-3 flex items-center gap-2`}>
        <Icon size={18} className="text-white" />
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>

      {/* Content */}
      <div className="bg-white p-5">
        {/* Ad Spend Section */}
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ad Spend</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Per Day</p>
              <p className="text-lg font-bold text-gray-900">{formatINR(data.dailyAdSpend)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Per Month</p>
              <p className="text-lg font-bold text-gray-900">{formatINR(data.monthlyAdSpend)}</p>
            </div>
          </div>
        </div>

        {/* Activity Section */}
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            {isWebinarDirect ? 'Webinar Activity' : 'Call Activity'}
          </p>
          <div className="grid grid-cols-2 gap-4">
            {isCallBooking && (
              <>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Calls / Day</p>
                  <p className="text-lg font-bold text-gray-900">{formatNumber(data.callsPerDay)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Calls / Month</p>
                  <p className="text-lg font-bold text-gray-900">{formatNumber(data.callsPerMonth)}</p>
                </div>
              </>
            )}
            {isWebinarDirect && (
              <>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Registrations</p>
                  <p className="text-lg font-bold text-gray-900">{formatNumber(data.registrations)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Attendees</p>
                  <p className="text-lg font-bold text-gray-900">{formatNumber(data.attendees)}</p>
                </div>
              </>
            )}
            {isWebinarCall && (
              <>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Registrations</p>
                  <p className="text-lg font-bold text-gray-900">{formatNumber(data.registrations)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Calls / Month</p>
                  <p className="text-lg font-bold text-gray-900">{formatNumber(data.callsPerMonth)}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sales & Revenue */}
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sales & Revenue</p>
          <MetricRow label="Closes / Month" value={formatNumber(data.salesPerMonth)} />
          <MetricRow label="Revenue" value={formatINR(data.revenue)} />
        </div>

        {/* Unit Economics */}
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Unit Economics (per sale)</p>
          <MetricRow label="Customer Acquisition Cost (CAC)" value={formatINR(data.cac)} />
          <MetricRow label="Commission" value={formatINR(data.commission)} />
        </div>

        {/* Margin Breakdown */}
        <div className="mb-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Margin Breakdown</p>
          <MetricRow label="Total Revenue" value={formatINR(data.revenue)} />
          <MetricRow label="− Total CAC" value={formatINR(data.totalCac)} highlight="red" />
          <MetricRow label="− Total Commission" value={formatINR(data.totalCommission)} highlight="red" />
          <div className="border-t border-gray-200 mt-2 pt-2">
            <MetricRow
              label="= CM1 (Gross Margin)"
              value={formatINR(data.cm1)}
              highlight={data.cm1 > 0 ? 'green' : 'red'}
              bold
            />
          </div>
          <MetricRow label={`− Fixed Expenses`} value={formatINR(inputs.fixedMonthlyExpense)} highlight="red" />
          <div className="border-t border-gray-200 mt-2 pt-2">
            <MetricRow
              label="= CM2 (Operating Margin)"
              value={formatINR(data.cm2)}
              highlight={data.cm2 > 0 ? 'green' : 'red'}
              bold
            />
          </div>
        </div>

        {/* Final Profit/Loss */}
        <div className={`mt-4 p-4 rounded-lg ${data.profit >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-semibold ${data.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {data.profit >= 0 ? 'Net Profit' : 'Net Loss'}
            </span>
            <span className={`text-xl font-bold ${data.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.profit >= 0 ? '' : '−'}{formatINR(Math.abs(data.profit))}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Funnel Type Badge ─────────────────────────────────────────
const funnelBadgeStyles = {
  [FUNNEL_TYPES.CALL_BOOKING]: 'bg-indigo-100 text-indigo-700',
  [FUNNEL_TYPES.FREE_WEBINAR_DIRECT]: 'bg-green-100 text-green-700',
  [FUNNEL_TYPES.PAID_WEBINAR_DIRECT]: 'bg-purple-100 text-purple-700',
  [FUNNEL_TYPES.FREE_WEBINAR_CALL]: 'bg-blue-100 text-blue-700',
  [FUNNEL_TYPES.PAID_WEBINAR_CALL]: 'bg-amber-100 text-amber-700',
}

// ── Main page ─────────────────────────────────────────────────
export default function SimulatorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { client, setClient, loading, error } = useClient(id)

  const [inputs, setInputs] = useState(null)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (client && inputs === null) {
      setInputs(dbToInputs(client))
      setNameInput(client.name)
    }
  }, [client, inputs])

  useEffect(() => {
    if (client) {
      setInputs(null)
      setNameInput(client.name)
    }
  }, [id])

  const results = useMemo(() => (inputs ? calculate(inputs) : null), [inputs])

  // Compute display data for both sections
  const displayData = useMemo(() => {
    if (!inputs || !results) return null

    const funnelType = inputs.funnelType
    const isCallBooking = funnelType === FUNNEL_TYPES.CALL_BOOKING
    const isWebinarDirect = funnelType === FUNNEL_TYPES.FREE_WEBINAR_DIRECT || funnelType === FUNNEL_TYPES.PAID_WEBINAR_DIRECT
    const isWebinarCall = funnelType === FUNNEL_TYPES.FREE_WEBINAR_CALL || funnelType === FUNNEL_TYPES.PAID_WEBINAR_CALL

    const avgSale = inputs.avgSaleValue
    const fixedExp = inputs.fixedMonthlyExpense

    // For Profit Target
    let targetData = {}
    // For Full Capacity
    let capacityData = {}

    if (isCallBooking) {
      const targetSales = Math.ceil(results.requiredSales) || 0
      const targetCalls = results.callsNeededForProfit || 0
      const capacitySales = Math.floor(results.actualSalesAtCapacity) || 0
      const capacityCalls = results.monthlyCapacity || 0

      targetData = {
        dailyAdSpend: results.dailyAdSpendForProfit || 0,
        monthlyAdSpend: results.adSpendForProfit || 0,
        callsPerDay: Math.ceil(targetCalls / 30),
        callsPerMonth: targetCalls,
        salesPerMonth: targetSales,
        revenue: targetSales * avgSale,
        cac: results.cac,
        commission: results.commissionPerSale,
        totalCac: targetSales * results.cac,
        totalCommission: targetSales * results.commissionPerSale,
        cm1: targetSales * results.marginPerSale,
        cm2: targetSales * results.marginPerSale - fixedExp,
        profit: inputs.desiredMonthlyProfit,
      }

      capacityData = {
        dailyAdSpend: results.dailyAdSpend,
        monthlyAdSpend: results.monthlyAdSpend,
        callsPerDay: Math.ceil(capacityCalls / 30),
        callsPerMonth: capacityCalls,
        salesPerMonth: capacitySales,
        revenue: results.revenueAtCapacity,
        cac: results.cac,
        commission: results.commissionPerSale,
        totalCac: capacitySales * results.cac,
        totalCommission: capacitySales * results.commissionPerSale,
        cm1: capacitySales * results.marginPerSale,
        cm2: capacitySales * results.marginPerSale - fixedExp,
        profit: results.profitAtCapacity,
      }
    } else if (isWebinarDirect) {
      const targetSales = Math.ceil(results.requiredSales) || 0
      const targetRegs = Math.ceil(results.registrationsNeeded) || 0
      const targetAttendees = Math.ceil(results.attendeesNeeded) || 0

      // For webinar direct, capacity = target (no team limit)
      targetData = {
        dailyAdSpend: results.dailyAdSpend || 0,
        monthlyAdSpend: results.netAdSpend || 0,
        registrations: targetRegs,
        attendees: targetAttendees,
        salesPerMonth: targetSales,
        revenue: targetSales * avgSale,
        cac: results.cac,
        commission: results.commissionPerSale,
        totalCac: targetSales * results.cac,
        totalCommission: targetSales * results.commissionPerSale,
        cm1: targetSales * results.marginPerSale,
        cm2: targetSales * results.marginPerSale - fixedExp,
        profit: inputs.desiredMonthlyProfit,
      }

      capacityData = { ...targetData, profit: targetData.cm2 }
    } else if (isWebinarCall) {
      const targetSales = Math.ceil(results.requiredSales) || 0
      const targetRegs = Math.ceil(results.registrationsNeeded) || 0
      const targetCalls = Math.ceil(results.callsNeeded) || 0
      const capacitySales = Math.floor(results.actualSalesAtCapacity) || 0
      const capacityCalls = results.monthlyCallCapacity || 0

      // Reverse calculate registrations for capacity
      const regToCallRate = (results.regToAttendedCallRate || 1) / 100
      const capacityRegs = regToCallRate > 0 ? Math.ceil(capacityCalls / regToCallRate) : 0

      targetData = {
        dailyAdSpend: results.dailyAdSpendForProfit || 0,
        monthlyAdSpend: results.adSpendForProfit || 0,
        registrations: targetRegs,
        callsPerMonth: targetCalls,
        salesPerMonth: targetSales,
        revenue: targetSales * avgSale,
        cac: results.cac,
        commission: results.commissionPerSale,
        totalCac: targetSales * results.cac,
        totalCommission: targetSales * results.commissionPerSale,
        cm1: targetSales * results.marginPerSale,
        cm2: targetSales * results.marginPerSale - fixedExp,
        profit: inputs.desiredMonthlyProfit,
      }

      capacityData = {
        dailyAdSpend: results.dailyAdSpend,
        monthlyAdSpend: results.monthlyAdSpend,
        registrations: capacityRegs,
        callsPerMonth: capacityCalls,
        salesPerMonth: capacitySales,
        revenue: results.revenueAtCapacity,
        cac: results.cac,
        commission: results.commissionPerSale,
        totalCac: capacitySales * results.cac,
        totalCommission: capacitySales * results.commissionPerSale,
        cm1: capacitySales * results.marginPerSale,
        cm2: capacitySales * results.marginPerSale - fixedExp,
        profit: results.profitAtCapacity,
      }
    }

    return { targetData, capacityData }
  }, [inputs, results])

  const set = (key, value) => setInputs((prev) => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    setSaveMsg(null)
    try {
      const updated = await updateClient(id, { ...inputsToDb(inputs), name: nameInput })
      setClient(updated)
      setSaveMsg({ type: 'ok', text: 'Saved!' })
    } catch (err) {
      setSaveMsg({ type: 'err', text: err.message })
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(null), 3000)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteClient(id)
      navigate('/')
    } catch (err) {
      setSaveMsg({ type: 'err', text: err.message })
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-center text-center p-8">
          <div>
            <p className="text-red-500 mb-3">{error}</p>
            <Link to="/" className="text-indigo-600 text-sm">Back to Dashboard</Link>
          </div>
        </div>
      </Layout>
    )
  }

  if (!client || !inputs || !results || !displayData) return <Layout><div /></Layout>

  const funnelType = inputs.funnelType
  const isCallBooking = funnelType === FUNNEL_TYPES.CALL_BOOKING
  const isWebinarDirect = funnelType === FUNNEL_TYPES.FREE_WEBINAR_DIRECT || funnelType === FUNNEL_TYPES.PAID_WEBINAR_DIRECT
  const isWebinarCall = funnelType === FUNNEL_TYPES.FREE_WEBINAR_CALL || funnelType === FUNNEL_TYPES.PAID_WEBINAR_CALL
  const isPaidWebinar = funnelType === FUNNEL_TYPES.PAID_WEBINAR_DIRECT || funnelType === FUNNEL_TYPES.PAID_WEBINAR_CALL

  return (
    <Layout>
      <div className="h-full flex flex-col overflow-hidden">
        {/* ── Header ── */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {editingName ? (
              <>
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="text-lg font-semibold text-gray-900 border-b-2 border-indigo-400 outline-none bg-transparent min-w-0 w-64"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
                />
                <button onClick={() => setEditingName(false)} className="text-green-500 hover:text-green-600 p-1">
                  <Check size={16} />
                </button>
                <button onClick={() => { setNameInput(client.name); setEditingName(false) }} className="text-gray-400 hover:text-gray-500 p-1">
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <h1 className="text-lg font-semibold text-gray-900 truncate">{nameInput}</h1>
                <button onClick={() => setEditingName(true)} className="text-gray-300 hover:text-gray-500 p-1">
                  <Edit2 size={14} />
                </button>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${funnelBadgeStyles[funnelType]}`}>
                  {FUNNEL_LABELS[funnelType]}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {saveMsg && (
              <span className={`text-xs font-medium ${saveMsg.type === 'ok' ? 'text-green-600' : 'text-red-500'}`}>
                {saveMsg.text}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              <Save size={14} />
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete client"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* ── Simulation mode toggle (Call Booking only) ── */}
        {isCallBooking && (
          <div
            className={`border-b px-6 py-2.5 flex items-center justify-between flex-shrink-0 transition-colors ${
              inputs.simulateAdCostIncrease ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div>
              <span className="text-sm font-semibold text-gray-700">Ad Cost Simulation</span>
              <span className="text-xs text-gray-400 ml-2">+5% cost per call for every 50 calls in monthly capacity</span>
            </div>
            <button onClick={() => set('simulateAdCostIncrease', !inputs.simulateAdCostIncrease)} className="flex items-center gap-1.5">
              {inputs.simulateAdCostIncrease ? (
                <ToggleRight size={26} className="text-amber-500" />
              ) : (
                <ToggleLeft size={26} className="text-gray-300" />
              )}
              <span className={`text-xs font-semibold ${inputs.simulateAdCostIncrease ? 'text-amber-600' : 'text-gray-400'}`}>
                {inputs.simulateAdCostIncrease ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        )}

        {/* ── Two-column body ── */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left — Inputs */}
          <div className="w-[360px] xl:w-[400px] flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-6">

            {/* ═══ COMMON INPUTS ═══ */}
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Common Settings</p>

            <InputField
              label="Fixed Monthly Expense"
              value={inputs.fixedMonthlyExpense}
              onChange={(v) => set('fixedMonthlyExpense', v)}
              min={0} max={5000000} step={5000} prefix="₹"
            />
            <InputField
              label="Average Sale Value"
              value={inputs.avgSaleValue}
              onChange={(v) => set('avgSaleValue', v)}
              min={0} max={2000000} step={1000} prefix="₹"
            />
            <InputField
              label="Team Commission"
              value={inputs.teamCommissionPct}
              onChange={(v) => set('teamCommissionPct', v)}
              min={0} max={60} step={1} suffix="%"
            />
            <InputField
              label="GST on Ad Spend"
              value={inputs.gstOnAdSpendPct}
              onChange={(v) => set('gstOnAdSpendPct', v)}
              min={0} max={30} step={1} suffix="%"
            />
            <InputField
              label="Target Monthly Profit"
              value={inputs.desiredMonthlyProfit}
              onChange={(v) => set('desiredMonthlyProfit', v)}
              min={0} max={10000000} step={10000} prefix="₹"
              hint="Your profit goal"
            />

            {/* ═══ CALL BOOKING INPUTS ═══ */}
            {isCallBooking && (
              <>
                <div className="border-t border-gray-100 pt-5 mt-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <Phone size={14} /> Call Metrics
                  </p>
                  <InputField
                    label="Cost Per Qualified Call"
                    value={inputs.costPerQualifiedCall}
                    onChange={(v) => set('costPerQualifiedCall', v)}
                    min={0} max={10000} step={50} prefix="₹"
                    hint={inputs.simulateAdCostIncrease ? `Simulated: ₹${Math.round(results.effectiveCostPerCall).toLocaleString('en-IN')}` : null}
                  />
                  <InputField
                    label="Calls to Close 1 Sale"
                    value={inputs.callsToClose}
                    onChange={(v) => set('callsToClose', v)}
                    min={1} max={50} step={1} suffix=" calls"
                  />
                </div>
                <div className="border-t border-gray-100 pt-5 mt-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <Users size={14} /> Team Capacity
                  </p>
                  <InputField
                    label="Number of Closers"
                    value={inputs.numClosers}
                    onChange={(v) => set('numClosers', v)}
                    min={1} max={30} step={1} suffix=" people"
                  />
                  <InputField
                    label="Max Calls Per Closer / Day"
                    value={inputs.maxCallsPerCloserPerDay}
                    onChange={(v) => set('maxCallsPerCloserPerDay', v)}
                    min={1} max={30} step={1} suffix=" calls"
                  />
                </div>
              </>
            )}

            {/* ═══ WEBINAR DIRECT SALES ═══ */}
            {isWebinarDirect && (
              <div className="border-t border-gray-100 pt-5 mt-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <Video size={14} /> Webinar Metrics
                </p>
                <InputField
                  label="Cost Per Registration"
                  value={inputs.costPerRegistration}
                  onChange={(v) => set('costPerRegistration', v)}
                  min={0} max={5000} step={10} prefix="₹"
                />
                {isPaidWebinar && (
                  <InputField
                    label="Webinar Ticket Price"
                    value={inputs.webinarTicketPrice}
                    onChange={(v) => set('webinarTicketPrice', v)}
                    min={0} max={50000} step={99} prefix="₹"
                  />
                )}
                <InputField
                  label="Registration → Attendee %"
                  value={inputs.registrationToAttendeePct}
                  onChange={(v) => set('registrationToAttendeePct', v)}
                  min={1} max={100} step={1} suffix="%"
                />
                <InputField
                  label="Attendee → Sale %"
                  value={inputs.attendeeToSalePct}
                  onChange={(v) => set('attendeeToSalePct', v)}
                  min={0.1} max={50} step={0.5} suffix="%"
                />
              </div>
            )}

            {/* ═══ WEBINAR TO CALL ═══ */}
            {isWebinarCall && (
              <>
                <div className="border-t border-gray-100 pt-5 mt-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <Video size={14} /> Webinar Metrics
                  </p>
                  <InputField
                    label="Cost Per Registration"
                    value={inputs.costPerRegistration}
                    onChange={(v) => set('costPerRegistration', v)}
                    min={0} max={5000} step={10} prefix="₹"
                  />
                  {isPaidWebinar && (
                    <InputField
                      label="Webinar Ticket Price"
                      value={inputs.webinarTicketPrice}
                      onChange={(v) => set('webinarTicketPrice', v)}
                      min={0} max={50000} step={99} prefix="₹"
                    />
                  )}
                  <InputField
                    label="Registration → Attendee %"
                    value={inputs.registrationToAttendeePct}
                    onChange={(v) => set('registrationToAttendeePct', v)}
                    min={1} max={100} step={1} suffix="%"
                  />
                  <InputField
                    label="Attendee → Call Booking %"
                    value={inputs.attendeeToCallPct}
                    onChange={(v) => set('attendeeToCallPct', v)}
                    min={1} max={100} step={1} suffix="%"
                  />
                </div>
                <div className="border-t border-gray-100 pt-5 mt-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <Phone size={14} /> Call Metrics
                  </p>
                  <InputField
                    label="Call Show-up Rate"
                    value={inputs.callShowUpPct}
                    onChange={(v) => set('callShowUpPct', v)}
                    min={1} max={100} step={1} suffix="%"
                  />
                  <InputField
                    label="Calls to Close 1 Sale"
                    value={inputs.callsToCloseWebinar}
                    onChange={(v) => set('callsToCloseWebinar', v)}
                    min={1} max={20} step={1} suffix=" calls"
                  />
                  <InputField
                    label="Extra Cost Per Call"
                    value={inputs.costPerCallWebinar}
                    onChange={(v) => set('costPerCallWebinar', v)}
                    min={0} max={5000} step={50} prefix="₹"
                  />
                </div>
                <div className="border-t border-gray-100 pt-5 mt-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <Users size={14} /> Team Capacity
                  </p>
                  <InputField
                    label="Number of Closers"
                    value={inputs.numClosersWebinar}
                    onChange={(v) => set('numClosersWebinar', v)}
                    min={1} max={30} step={1} suffix=" people"
                  />
                  <InputField
                    label="Max Calls Per Closer / Day"
                    value={inputs.maxCallsPerCloserWebinar}
                    onChange={(v) => set('maxCallsPerCloserWebinar', v)}
                    min={1} max={20} step={1} suffix=" calls"
                  />
                </div>
              </>
            )}
          </div>

          {/* Right — Results */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Results</p>

            {/* Two Section Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Section 1: To Hit Profit Target */}
              <ResultsSection
                title={`To Hit ₹${(inputs.desiredMonthlyProfit / 100000).toFixed(1)}L Profit`}
                icon={Target}
                color="indigo"
                data={displayData.targetData}
                funnelType={funnelType}
                inputs={inputs}
              />

              {/* Section 2: At Full Capacity */}
              {!isWebinarDirect && (
                <ResultsSection
                  title="At Full Team Capacity"
                  icon={Maximize2}
                  color="emerald"
                  data={displayData.capacityData}
                  funnelType={funnelType}
                  inputs={inputs}
                />
              )}
            </div>

            {/* Feasibility Note */}
            {!isWebinarDirect && (
              <div className={`mt-6 p-4 rounded-xl ${results.isFeasible ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                <p className={`text-sm font-semibold ${results.isFeasible ? 'text-green-700' : 'text-amber-700'}`}>
                  {results.isFeasible
                    ? 'Your team capacity can achieve the profit target!'
                    : `Gap: You need ${Math.ceil(results.capacityGap)} more sales than your team can handle`
                  }
                </p>
                {!results.isFeasible && (
                  <p className="text-xs text-amber-600 mt-1">
                    Add more closers or increase calls per day to close the gap.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Delete modal ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete client?</h3>
            <p className="text-sm text-gray-500 mb-5">
              All data for <strong>"{client.name}"</strong> will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
