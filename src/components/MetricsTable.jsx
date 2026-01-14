import { formatCurrency, formatPercentage } from '../lib/formatters'

export default function MetricsTable({ metrics, prospect }) {
  if (!metrics) {
    return (
      <div className="text-center py-8 text-gray-500">
        Enter funnel data to see calculated metrics
      </div>
    )
  }

  const { volumes, cpas, rates, prices, stageNames } = metrics

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stage
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Volume
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rate
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              CPA
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {stageNames.map((name, index) => (
            <tr key={index}>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                {name}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">
                {volumes[index]?.toFixed(1)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">
                {rates[index] !== null ? formatPercentage(rates[index]) : '—'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">
                {formatCurrency(cpas[index])}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">
                {prices[index] > 0 ? formatCurrency(prices[index]) : '—'}
              </td>
            </tr>
          ))}

          {/* High Ticket Row */}
          <tr className="bg-indigo-50">
            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-indigo-900">
              High Ticket
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-indigo-700">
              {metrics.sales}
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-indigo-700">
              {formatPercentage(prospect.current_conversion_rate)}
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-indigo-700">
              {formatCurrency(metrics.cpa_customer)}
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-indigo-700">
              {formatCurrency(prospect.high_ticket_price)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
