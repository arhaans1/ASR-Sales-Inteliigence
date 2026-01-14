import { formatCurrency, formatROI, formatPercentage } from '../lib/formatters'

export default function RevenueCards({ metrics }) {
  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-28"></div>
          </div>
        ))}
      </div>
    )
  }

  const cards = [
    {
      label: 'Monthly Spend',
      value: formatCurrency(metrics.monthly_spend, { compact: true }),
      subValue: formatCurrency(metrics.monthly_spend / 30) + '/day',
      color: 'gray'
    },
    {
      label: 'Monthly Revenue',
      value: formatCurrency(metrics.revenue, { compact: true }),
      subValue: metrics.is_profitable ? 'Profitable' : 'Needs improvement',
      color: metrics.is_profitable ? 'green' : 'red',
      icon: metrics.is_profitable ? '▲' : '▼'
    },
    {
      label: 'Monthly Profit',
      value: formatCurrency(Math.abs(metrics.profit), { compact: true }),
      subValue: metrics.profit >= 0 ? 'Net profit' : 'Net loss',
      color: metrics.profit >= 0 ? 'green' : 'red',
      prefix: metrics.profit >= 0 ? '+' : '-'
    },
    {
      label: 'ROI',
      value: formatROI(metrics.roi),
      subValue: metrics.roi_status === 'healthy' ? 'Healthy' :
                metrics.roi_status === 'break_even' ? 'Break-even' : 'Losing',
      color: metrics.roi_status === 'healthy' ? 'green' :
             metrics.roi_status === 'break_even' ? 'yellow' : 'red',
      icon: metrics.roi_status === 'healthy' ? '🟢' :
            metrics.roi_status === 'break_even' ? '🟡' : '🔴'
    }
  ]

  const colorClasses = {
    gray: 'bg-gray-50 border-gray-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    red: 'bg-red-50 border-red-200'
  }

  const textColorClasses = {
    gray: 'text-gray-900',
    green: 'text-green-900',
    yellow: 'text-yellow-900',
    red: 'text-red-900'
  }

  const subTextColorClasses = {
    gray: 'text-gray-600',
    green: 'text-green-700',
    yellow: 'text-yellow-700',
    red: 'text-red-700'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`rounded-lg p-4 border ${colorClasses[card.color]}`}
        >
          <p className="text-sm font-medium text-gray-500">{card.label}</p>
          <p className={`text-2xl font-bold mt-1 ${textColorClasses[card.color]}`}>
            {card.prefix || ''}{card.value}
          </p>
          <p className={`text-sm mt-1 flex items-center ${subTextColorClasses[card.color]}`}>
            {card.icon && <span className="mr-1">{card.icon}</span>}
            {card.subValue}
          </p>
        </div>
      ))}
    </div>
  )
}
