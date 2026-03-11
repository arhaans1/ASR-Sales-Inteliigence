import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { formatNumber } from '../lib/formatters'
import { FUNNEL_TYPES } from '../lib/calculations'

export default function FeasibilityBanner({ results, funnelType }) {
  const {
    isFeasible,
    hasNegativeMargin,
    requiredSales,
    actualSalesAtCapacity,
    capacityGap,
    registrationsNeeded,
    attendeesNeeded,
  } = results

  const isWebinarDirect = funnelType === FUNNEL_TYPES.FREE_WEBINAR_DIRECT || funnelType === FUNNEL_TYPES.PAID_WEBINAR_DIRECT

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

  // For webinar direct sales, there's no team capacity limit
  if (isWebinarDirect) {
    if (!isFinite(requiredSales)) {
      return (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-700">Check Your Numbers</p>
            <p className="text-xs text-amber-600 mt-0.5">
              The current inputs result in an impossible scenario. Review your conversion rates and costs.
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-green-700">Webinar Funnel is Profitable</p>
          <p className="text-xs text-green-600 mt-0.5">
            You need <strong>{formatNumber(registrationsNeeded)} registrations</strong> →
            <strong> {formatNumber(attendeesNeeded)} attendees</strong> →
            <strong> {formatNumber(requiredSales)} sales</strong> to hit your profit target. Scale as needed!
          </p>
        </div>
      </div>
    )
  }

  // For funnels with team capacity (call booking, webinar to call)
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
