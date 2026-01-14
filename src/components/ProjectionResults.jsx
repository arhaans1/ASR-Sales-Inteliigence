import { formatCurrency, formatROI } from '../lib/formatters'
import { calculateCurrentMetrics } from '../lib/calculations'

export default function ProjectionResults({ prospect, projectedMetrics }) {
  const currentMetrics = calculateCurrentMetrics(prospect)

  if (!projectedMetrics) {
    return (
      <div className="text-center py-8 text-gray-500">
        Enter projection values and click "Calculate Projections" to see results
      </div>
    )
  }

  const comparisons = [
    {
      label: 'Daily Spend',
      current: prospect.current_daily_spend,
      projected: projectedMetrics.daily_spend,
      format: (v) => formatCurrency(v),
    },
    {
      label: 'Monthly Spend',
      current: currentMetrics?.monthly_spend,
      projected: projectedMetrics.monthly_spend,
      format: (v) => formatCurrency(v, { compact: true }),
    },
    {
      label: 'Monthly Sales',
      current: currentMetrics?.sales,
      projected: projectedMetrics.sales,
      format: (v) => v?.toFixed(1),
    },
    {
      label: 'Monthly Revenue',
      current: currentMetrics?.revenue,
      projected: projectedMetrics.revenue,
      format: (v) => formatCurrency(v, { compact: true }),
    },
    {
      label: 'ROI',
      current: currentMetrics?.roi,
      projected: projectedMetrics.roi,
      format: (v) => formatROI(v),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Comparison Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-3 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-500">
          <div>Metric</div>
          <div className="text-center">Current</div>
          <div className="text-center">Projected</div>
        </div>
        <div className="divide-y divide-gray-200">
          {comparisons.map((item, index) => (
            <div key={index} className="grid grid-cols-3 px-4 py-3">
              <div className="text-sm font-medium text-gray-900">{item.label}</div>
              <div className="text-sm text-center text-gray-600">
                {item.current !== null && item.current !== undefined ? item.format(item.current) : '—'}
              </div>
              <div className="text-sm text-center font-medium text-indigo-600">
                {item.projected !== null && item.projected !== undefined ? item.format(item.projected) : '—'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
          <div className="text-2xl font-bold text-green-700">
            {projectedMetrics.sales_increase > 0 ? '+' : ''}{projectedMetrics.sales_increase}%
          </div>
          <div className="text-sm text-green-600 mt-1">Sales Increase</div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">
            {projectedMetrics.revenue_increase > 0 ? '+' : ''}{projectedMetrics.revenue_increase}%
          </div>
          <div className="text-sm text-blue-600 mt-1">Revenue Increase</div>
        </div>

        <div className={`rounded-lg p-4 text-center border ${
          projectedMetrics.roi_change >= 0
            ? 'bg-indigo-50 border-indigo-200'
            : 'bg-orange-50 border-orange-200'
        }`}>
          <div className={`text-2xl font-bold ${
            projectedMetrics.roi_change >= 0 ? 'text-indigo-700' : 'text-orange-700'
          }`}>
            {projectedMetrics.roi_change >= 0 ? '+' : ''}{projectedMetrics.roi_change}x
          </div>
          <div className={`text-sm mt-1 ${
            projectedMetrics.roi_change >= 0 ? 'text-indigo-600' : 'text-orange-600'
          }`}>
            ROI Change
          </div>
        </div>
      </div>

      {/* Projected Funnel Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">
            Projected Funnel at {formatCurrency(projectedMetrics.daily_spend)}/day
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Volume</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">CPA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projectedMetrics.volumes.map((volume, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    Stage {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                    {volume?.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                    {formatCurrency(projectedMetrics.cpas[index])}
                  </td>
                </tr>
              ))}
              <tr className="bg-indigo-50">
                <td className="px-4 py-3 text-sm font-medium text-indigo-900">
                  Sales
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium text-indigo-700">
                  {projectedMetrics.sales}
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium text-indigo-700">
                  {formatCurrency(projectedMetrics.cpa_customer)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Row */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Total Revenue: <span className="font-medium text-gray-900">
                {formatCurrency(projectedMetrics.revenue, { compact: true })}
              </span>
            </span>
            <span className="text-gray-600">
              ROI: <span className={`font-medium ${
                projectedMetrics.is_profitable ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatROI(projectedMetrics.roi)}
              </span>
            </span>
            <span className="text-gray-600">
              Profit: <span className={`font-medium ${
                projectedMetrics.profit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(projectedMetrics.profit, { compact: true })}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
