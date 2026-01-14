import { statusConfig } from '../lib/funnelConfigs'

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.new

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgClass}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  )
}
