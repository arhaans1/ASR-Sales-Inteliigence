import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { formatNumber } from '../lib/formatters'

export default function FeasibilityBanner({ results }) {
  const { isFeasible, hasNegativeMargin, requiredSales, actualSalesAtCapacity, capacityGap } = results

  if (hasNegativeMargin) {
    return (
      <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
        <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-700">Negative Margin — Unprofitable at any scale</p>
          <p className="text-xs text-red-500 mt-0.5">
            Your CAC + commission exceeds revenue per sale. Reduce acquisition cost, lower commission, or increase sale value.
          </p>
        </div>
      </div>
    )
  }

  if (!isFeasible) {
    const gap = Math.ceil(capacityGap)
    return (
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-700">Feasibility Warning</p>
          <p className="text-xs text-amber-600 mt-0.5">
            You need <strong>{formatNumber(requiredSales)} sales</strong> to hit your profit target, but your team can
            only close <strong>{formatNumber(actualSalesAtCapacity)} sales</strong> at full capacity.
            You are short by <strong>{gap} sales</strong>. Add closers or increase daily call volume.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
      <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-green-700">Scenario is Feasible</p>
        <p className="text-xs text-green-600 mt-0.5">
          Your team can close <strong>{formatNumber(actualSalesAtCapacity)} sales</strong> at capacity —
          enough to cover the <strong>{formatNumber(requiredSales)} sales</strong> needed to hit your profit target.
        </p>
      </div>
    </div>
  )
}
