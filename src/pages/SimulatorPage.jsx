import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Save, Trash2, Edit2, Check, X, ToggleLeft, ToggleRight, TrendingUp, TrendingDown, Target, Users, Video, Phone } from 'lucide-react'
import Layout from '../components/Layout'
import InputField from '../components/InputField'
import ResultCard from '../components/ResultCard'
import FeasibilityBanner from '../components/FeasibilityBanner'
import { useClient } from '../hooks/useClients'
import { updateClient, deleteClient } from '../lib/supabase'
import { calculate, FUNNEL_TYPES, FUNNEL_LABELS } from '../lib/calculations'
import { formatINR, formatNumber } from '../lib/formatters'

// ── DB <-> State mappers ──────────────────────────────────────
function dbToInputs(c) {
  return {
    funnelType: c.funnel_type || FUNNEL_TYPES.CALL_BOOKING,
    // Common
    fixedMonthlyExpense: Number(c.fixed_monthly_expense) ?? 0,
    avgSaleValue: Number(c.avg_sale_value) ?? 0,
    teamCommissionPct: Number(c.team_commission_pct) ?? 0,
    gstOnAdSpendPct: Number(c.gst_on_ad_spend_pct) ?? 18,
    desiredMonthlyProfit: Number(c.desired_monthly_profit) ?? 0,
    // Call Booking
    costPerQualifiedCall: Number(c.cost_per_qualified_call) ?? 0,
    callsToClose: Number(c.calls_to_close) ?? 1,
    numClosers: Number(c.num_closers) ?? 1,
    maxCallsPerCloserPerDay: Number(c.max_calls_per_closer_per_day) ?? 8,
    simulateAdCostIncrease: Boolean(c.simulate_ad_cost_increase),
    // Webinar
    costPerRegistration: Number(c.cost_per_registration) ?? 200,
    webinarTicketPrice: Number(c.webinar_ticket_price) ?? 0,
    registrationToAttendeePct: Number(c.registration_to_attendee_pct) ?? 40,
    attendeeToSalePct: Number(c.attendee_to_sale_pct) ?? 5,
    // Webinar to Call
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
    // Common
    fixed_monthly_expense: inputs.fixedMonthlyExpense,
    avg_sale_value: inputs.avgSaleValue,
    team_commission_pct: inputs.teamCommissionPct,
    gst_on_ad_spend_pct: inputs.gstOnAdSpendPct,
    desired_monthly_profit: inputs.desiredMonthlyProfit,
    // Call Booking
    cost_per_qualified_call: inputs.costPerQualifiedCall,
    calls_to_close: inputs.callsToClose,
    num_closers: inputs.numClosers,
    max_calls_per_closer_per_day: inputs.maxCallsPerCloserPerDay,
    simulate_ad_cost_increase: inputs.simulateAdCostIncrease,
    // Webinar
    cost_per_registration: inputs.costPerRegistration,
    webinar_ticket_price: inputs.webinarTicketPrice,
    registration_to_attendee_pct: inputs.registrationToAttendeePct,
    attendee_to_sale_pct: inputs.attendeeToSalePct,
    // Webinar to Call
    attendee_to_call_pct: inputs.attendeeToCallPct,
    call_show_up_pct: inputs.callShowUpPct,
    calls_to_close_webinar: inputs.callsToCloseWebinar,
    cost_per_call_webinar: inputs.costPerCallWebinar,
    num_closers_webinar: inputs.numClosersWebinar,
    max_calls_per_closer_webinar: inputs.maxCallsPerCloserWebinar,
  }
}

function MetricRow({ label, value, highlight, subtext }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <div>
        <span className="text-sm text-gray-500">{label}</span>
        {subtext && <span className="text-xs text-gray-400 ml-2">{subtext}</span>}
      </div>
      <span
        className={`text-sm font-semibold ${
          highlight === 'green' ? 'text-green-600' : highlight === 'red' ? 'text-red-600' : 'text-gray-900'
        }`}
      >
        {value}
      </span>
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

  if (!client || !inputs || !results) return <Layout><div /></Layout>

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
          <div className="w-[380px] xl:w-[420px] flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-6">

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
              label="Desired Monthly Net Profit"
              value={inputs.desiredMonthlyProfit}
              onChange={(v) => set('desiredMonthlyProfit', v)}
              min={0} max={10000000} step={10000} prefix="₹"
              hint="Set your target and see what's needed to hit it"
            />

            {/* ═══ CALL BOOKING INPUTS ═══ */}
            {isCallBooking && (
              <>
                <div className="border-t border-gray-100 pt-5 mt-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <Phone size={14} /> Call Booking Metrics
                  </p>
                  <InputField
                    label="Cost Per Qualified Call"
                    value={inputs.costPerQualifiedCall}
                    onChange={(v) => set('costPerQualifiedCall', v)}
                    min={0} max={10000} step={50} prefix="₹"
                    hint={
                      inputs.simulateAdCostIncrease
                        ? `Simulated: ₹${Math.round(results.effectiveCostPerCall).toLocaleString('en-IN')}`
                        : null
                    }
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
                    label="Max Calls Per Closer Per Day"
                    value={inputs.maxCallsPerCloserPerDay}
                    onChange={(v) => set('maxCallsPerCloserPerDay', v)}
                    min={1} max={30} step={1} suffix=" calls/day"
                  />
                </div>
              </>
            )}

            {/* ═══ WEBINAR INPUTS (Direct Sales) ═══ */}
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
                  hint="Ad cost to acquire one registration"
                />
                {isPaidWebinar && (
                  <InputField
                    label="Webinar Ticket Price"
                    value={inputs.webinarTicketPrice}
                    onChange={(v) => set('webinarTicketPrice', v)}
                    min={0} max={50000} step={99} prefix="₹"
                    hint="Revenue per attendee (offsets ad cost)"
                  />
                )}
                <InputField
                  label="Registration to Attendee Rate"
                  value={inputs.registrationToAttendeePct}
                  onChange={(v) => set('registrationToAttendeePct', v)}
                  min={1} max={100} step={1} suffix="%"
                  hint="% of registrants who actually attend"
                />
                <InputField
                  label="Attendee to Sale Rate"
                  value={inputs.attendeeToSalePct}
                  onChange={(v) => set('attendeeToSalePct', v)}
                  min={0.1} max={50} step={0.5} suffix="%"
                  hint="% of attendees who buy on the webinar"
                />
              </div>
            )}

            {/* ═══ WEBINAR TO CALL INPUTS ═══ */}
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
                    label="Registration to Attendee Rate"
                    value={inputs.registrationToAttendeePct}
                    onChange={(v) => set('registrationToAttendeePct', v)}
                    min={1} max={100} step={1} suffix="%"
                  />
                  <InputField
                    label="Attendee to Call Booking Rate"
                    value={inputs.attendeeToCallPct}
                    onChange={(v) => set('attendeeToCallPct', v)}
                    min={1} max={100} step={1} suffix="%"
                    hint="% of attendees who book a call"
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
                    hint="% of booked calls that actually happen"
                  />
                  <InputField
                    label="Calls to Close 1 Sale"
                    value={inputs.callsToCloseWebinar}
                    onChange={(v) => set('callsToCloseWebinar', v)}
                    min={1} max={20} step={1} suffix=" calls"
                  />
                  <InputField
                    label="Additional Cost Per Call"
                    value={inputs.costPerCallWebinar}
                    onChange={(v) => set('costPerCallWebinar', v)}
                    min={0} max={5000} step={50} prefix="₹"
                    hint="Extra cost per call (e.g., Zoom, tools)"
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
                    label="Max Calls Per Closer Per Day"
                    value={inputs.maxCallsPerCloserWebinar}
                    onChange={(v) => set('maxCallsPerCloserWebinar', v)}
                    min={1} max={20} step={1} suffix=" calls/day"
                  />
                </div>
              </>
            )}
          </div>

          {/* Right — Results */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Live Results</p>

            {/* Key metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              <ResultCard
                label="Total Revenue Needed"
                value={formatINR(results.totalRevenueNeeded)}
                subtext={
                  isFinite(results.requiredSales)
                    ? `${Math.ceil(results.requiredSales)} sales required`
                    : 'Margin is negative'
                }
                color="indigo"
                icon={TrendingUp}
              />
              <ResultCard
                label="Daily Ad Spend"
                value={formatINR(results.dailyAdSpend || results.dailyAdSpendForProfit || 0)}
                subtext={`${formatINR(results.monthlyAdSpend || results.adSpendForProfit || 0)}/month`}
                color="purple"
              />
              <ResultCard
                label="Net Profit at Capacity"
                value={formatINR(results.profitAtCapacity)}
                subtext={results.isProfit ? 'At full capacity' : 'Net loss'}
                color={results.isProfit ? 'green' : 'red'}
                icon={results.isProfit ? TrendingUp : TrendingDown}
              />
            </div>

            {/* Reverse Calculation Card - "What You Need" */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-5 mb-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Target size={18} />
                <h3 className="font-semibold">To Hit ₹{(inputs.desiredMonthlyProfit / 100000).toFixed(1)}L Profit</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                {isCallBooking && (
                  <>
                    <div>
                      <p className="text-indigo-200 text-xs">Sales Needed</p>
                      <p className="font-bold text-lg">{isFinite(results.requiredSales) ? Math.ceil(results.requiredSales) : '∞'}</p>
                    </div>
                    <div>
                      <p className="text-indigo-200 text-xs">Calls Needed</p>
                      <p className="font-bold text-lg">{isFinite(results.callsNeededForProfit) ? results.callsNeededForProfit : '∞'}</p>
                    </div>
                    <div>
                      <p className="text-indigo-200 text-xs">Monthly Ad Spend</p>
                      <p className="font-bold text-lg">{formatINR(results.adSpendForProfit)}</p>
                    </div>
                    <div>
                      <p className="text-indigo-200 text-xs">Daily Ad Spend</p>
                      <p className="font-bold text-lg">{formatINR(results.dailyAdSpendForProfit)}</p>
                    </div>
                  </>
                )}
                {isWebinarDirect && (
                  <>
                    <div>
                      <p className="text-indigo-200 text-xs">Sales Needed</p>
                      <p className="font-bold text-lg">{isFinite(results.requiredSales) ? Math.ceil(results.requiredSales) : '∞'}</p>
                    </div>
                    <div>
                      <p className="text-indigo-200 text-xs">Registrations</p>
                      <p className="font-bold text-lg">{isFinite(results.registrationsNeeded) ? Math.ceil(results.registrationsNeeded) : '∞'}</p>
                    </div>
                    <div>
                      <p className="text-indigo-200 text-xs">Attendees</p>
                      <p className="font-bold text-lg">{isFinite(results.attendeesNeeded) ? Math.ceil(results.attendeesNeeded) : '∞'}</p>
                    </div>
                    <div>
                      <p className="text-indigo-200 text-xs">Net Ad Spend</p>
                      <p className="font-bold text-lg">{formatINR(results.netAdSpend)}</p>
                    </div>
                  </>
                )}
                {isWebinarCall && (
                  <>
                    <div>
                      <p className="text-indigo-200 text-xs">Registrations</p>
                      <p className="font-bold text-lg">{isFinite(results.registrationsNeeded) ? Math.ceil(results.registrationsNeeded) : '∞'}</p>
                    </div>
                    <div>
                      <p className="text-indigo-200 text-xs">Booked Calls</p>
                      <p className="font-bold text-lg">{isFinite(results.bookedCallsNeeded) ? Math.ceil(results.bookedCallsNeeded) : '∞'}</p>
                    </div>
                    <div>
                      <p className="text-indigo-200 text-xs">Attended Calls</p>
                      <p className="font-bold text-lg">{isFinite(results.callsNeeded) ? Math.ceil(results.callsNeeded) : '∞'}</p>
                    </div>
                    <div>
                      <p className="text-indigo-200 text-xs">Net Ad Spend</p>
                      <p className="font-bold text-lg">{formatINR(results.adSpendForProfit)}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Feasibility */}
            <FeasibilityBanner results={results} funnelType={funnelType} />

            {/* Breakdown table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-5">
              <div className="px-5 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">Metric Breakdown</h3>
              </div>
              <div className="divide-y divide-gray-50">
                <MetricRow label="Customer Acquisition Cost (CAC)" value={formatINR(results.cac)} />
                <MetricRow label="Commission per Sale" value={formatINR(results.commissionPerSale)} />
                <MetricRow
                  label="Contribution Margin per Sale"
                  value={formatINR(results.marginPerSale)}
                  highlight={results.hasNegativeMargin ? 'red' : 'green'}
                />
                <MetricRow
                  label="Required Sales (profit target)"
                  value={isFinite(results.requiredSales) ? Math.ceil(results.requiredSales) : '∞'}
                />

                {/* Call Booking specific */}
                {isCallBooking && (
                  <>
                    <MetricRow label="Monthly Call Capacity" value={`${results.monthlyCapacity} calls`} />
                    <MetricRow label="Sales at Full Capacity" value={formatNumber(results.actualSalesAtCapacity)} />
                  </>
                )}

                {/* Webinar Direct specific */}
                {isWebinarDirect && (
                  <>
                    <MetricRow
                      label="Cost per Registration (incl. GST)"
                      value={formatINR(results.costPerReg)}
                    />
                    {isPaidWebinar && (
                      <MetricRow
                        label="Ticket Revenue per Reg"
                        value={formatINR(results.ticketRevenuePerReg)}
                        highlight="green"
                      />
                    )}
                    <MetricRow
                      label="Net Cost per Registration"
                      value={formatINR(results.netCostPerReg)}
                    />
                    <MetricRow
                      label="Registrations per Sale"
                      value={isFinite(results.registrationsPerSale) ? Math.round(results.registrationsPerSale) : '∞'}
                    />
                    <MetricRow
                      label="Full Funnel Conversion"
                      value={`${results.regToSaleRate?.toFixed(2)}%`}
                      subtext="Reg → Attend → Sale"
                    />
                  </>
                )}

                {/* Webinar to Call specific */}
                {isWebinarCall && (
                  <>
                    <MetricRow
                      label="Cost per Attended Call"
                      value={formatINR(results.costPerAttendedCall)}
                    />
                    <MetricRow
                      label="Registrations per Attended Call"
                      value={isFinite(results.registrationsPerCall) ? Math.round(results.registrationsPerCall) : '∞'}
                    />
                    <MetricRow
                      label="Full Funnel Conversion"
                      value={`${results.regToSaleRate?.toFixed(2)}%`}
                      subtext="Reg → Attend → Book → Show → Sale"
                    />
                    <MetricRow label="Monthly Call Capacity" value={`${results.monthlyCallCapacity} calls`} />
                    <MetricRow label="Sales at Full Capacity" value={formatNumber(results.actualSalesAtCapacity)} />
                  </>
                )}

                <MetricRow
                  label="Revenue at Full Capacity"
                  value={formatINR(results.revenueAtCapacity || results.totalRevenueNeeded)}
                />
              </div>
            </div>
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
