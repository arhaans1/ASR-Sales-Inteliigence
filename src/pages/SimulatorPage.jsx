import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Save, Trash2, Edit2, Check, X, ToggleLeft, ToggleRight, TrendingUp, TrendingDown } from 'lucide-react'
import Layout from '../components/Layout'
import InputField from '../components/InputField'
import ResultCard from '../components/ResultCard'
import FeasibilityBanner from '../components/FeasibilityBanner'
import { useClient } from '../hooks/useClients'
import { updateClient, deleteClient } from '../lib/supabase'
import { calculate } from '../lib/calculations'
import { formatINR, formatNumber } from '../lib/formatters'

// ── Helpers ───────────────────────────────────────────────────
function dbToInputs(c) {
  return {
    fixedMonthlyExpense:      Number(c.fixed_monthly_expense)      ?? 0,
    costPerQualifiedCall:     Number(c.cost_per_qualified_call)     ?? 0,
    callsToClose:             Number(c.calls_to_close)             ?? 1,
    avgSaleValue:             Number(c.avg_sale_value)             ?? 0,
    teamCommissionPct:        Number(c.team_commission_pct)        ?? 0,
    gstOnAdSpendPct:          Number(c.gst_on_ad_spend_pct)        ?? 18,
    desiredMonthlyProfit:     Number(c.desired_monthly_profit)     ?? 0,
    numClosers:               Number(c.num_closers)               ?? 1,
    maxCallsPerCloserPerDay:  Number(c.max_calls_per_closer_per_day) ?? 8,
    simulateAdCostIncrease:   Boolean(c.simulate_ad_cost_increase),
  }
}

function inputsToDb(inputs) {
  return {
    fixed_monthly_expense:        inputs.fixedMonthlyExpense,
    cost_per_qualified_call:      inputs.costPerQualifiedCall,
    calls_to_close:               inputs.callsToClose,
    avg_sale_value:               inputs.avgSaleValue,
    team_commission_pct:          inputs.teamCommissionPct,
    gst_on_ad_spend_pct:          inputs.gstOnAdSpendPct,
    desired_monthly_profit:       inputs.desiredMonthlyProfit,
    num_closers:                  inputs.numClosers,
    max_calls_per_closer_per_day: inputs.maxCallsPerCloserPerDay,
    simulate_ad_cost_increase:    inputs.simulateAdCostIncrease,
  }
}

function MetricRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <span className="text-sm text-gray-500">{label}</span>
      <span
        className={`text-sm font-semibold ${
          highlight === 'green'
            ? 'text-green-600'
            : highlight === 'red'
            ? 'text-red-600'
            : 'text-gray-900'
        }`}
      >
        {value}
      </span>
    </div>
  )
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

  // Initialise local state once the client loads
  useEffect(() => {
    if (client && inputs === null) {
      setInputs(dbToInputs(client))
      setNameInput(client.name)
    }
  }, [client, inputs])

  // Keep name input in sync when navigating to a different client
  useEffect(() => {
    if (client) {
      setInputs(null) // trigger re-init on next render
      setNameInput(client.name)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // ── Loading / Error ─────────────────────────────────────────
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
            <Link to="/" className="text-indigo-600 text-sm">← Back to Dashboard</Link>
          </div>
        </div>
      </Layout>
    )
  }

  if (!client || !inputs || !results) return <Layout><div /></Layout>

  // ── Render ──────────────────────────────────────────────────
  return (
    <Layout>
      <div className="h-full flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
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
                <button
                  onClick={() => { setNameInput(client.name); setEditingName(false) }}
                  className="text-gray-400 hover:text-gray-500 p-1"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <h1 className="text-lg font-semibold text-gray-900 truncate">{nameInput}</h1>
                <button onClick={() => setEditingName(true)} className="text-gray-300 hover:text-gray-500 p-1">
                  <Edit2 size={14} />
                </button>
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

        {/* ── Simulation mode toggle ── */}
        <div
          className={`border-b px-6 py-2.5 flex items-center justify-between flex-shrink-0 transition-colors ${
            inputs.simulateAdCostIncrease ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div>
            <span className="text-sm font-semibold text-gray-700">Ad Cost Simulation</span>
            <span className="text-xs text-gray-400 ml-2">+5% cost per call for every 50 calls in monthly capacity</span>
          </div>
          <button
            onClick={() => set('simulateAdCostIncrease', !inputs.simulateAdCostIncrease)}
            className="flex items-center gap-1.5"
          >
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

        {/* ── Two-column body ── */}
        <div className="flex-1 flex overflow-hidden">

          {/* Left — Inputs */}
          <div className="w-[380px] xl:w-[420px] flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Input Variables</p>

            <InputField
              label="Fixed Monthly Expense"
              value={inputs.fixedMonthlyExpense}
              onChange={(v) => set('fixedMonthlyExpense', v)}
              min={0} max={5000000} step={5000} prefix="₹"
            />
            <InputField
              label="Cost Per Qualified Call"
              value={inputs.costPerQualifiedCall}
              onChange={(v) => set('costPerQualifiedCall', v)}
              min={0} max={10000} step={50} prefix="₹"
              hint={
                inputs.simulateAdCostIncrease
                  ? `Simulated effective cost: ₹${Math.round(results.effectiveCostPerCall).toLocaleString('en-IN')}`
                  : null
              }
            />
            <InputField
              label="Calls to Close 1 Sale"
              value={inputs.callsToClose}
              onChange={(v) => set('callsToClose', v)}
              min={1} max={50} step={1} suffix=" calls"
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
            />

            <div className="border-t border-gray-100 pt-5 mt-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Team Capacity</p>
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
                value={formatINR(results.dailyAdSpend)}
                subtext={`${formatINR(results.monthlyAdSpend)}/month`}
                color="purple"
              />
              <ResultCard
                label="Net Profit at Capacity"
                value={formatINR(results.profitAtCapacity)}
                subtext={results.isProfit ? 'At full team capacity' : 'Net loss at capacity'}
                color={results.isProfit ? 'green' : 'red'}
                icon={results.isProfit ? TrendingUp : TrendingDown}
              />
            </div>

            {/* Feasibility */}
            <FeasibilityBanner results={results} />

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
                <MetricRow
                  label="Sales at Full Capacity"
                  value={formatNumber(results.actualSalesAtCapacity)}
                />
                <MetricRow
                  label="Monthly Call Capacity"
                  value={`${results.monthlyCapacity} calls`}
                />
                <MetricRow
                  label="Revenue at Full Capacity"
                  value={formatINR(results.revenueAtCapacity)}
                />
                <MetricRow
                  label="Monthly Ad Spend (incl. GST)"
                  value={formatINR(results.monthlyAdSpend)}
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
              All data for <strong>"{client.name}"</strong> will be permanently deleted. This cannot be undone.
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
