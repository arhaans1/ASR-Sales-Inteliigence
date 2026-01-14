import { funnelTypes } from '../lib/funnelConfigs'

export default function FunnelTypeSelector({ value, onChange, disabled }) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Select Funnel Type
      </label>
      <div className="space-y-3">
        {Object.values(funnelTypes).map((funnel) => (
          <label
            key={funnel.id}
            className={`relative flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
              value === funnel.id
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <input
              type="radio"
              name="funnel_type"
              value={funnel.id}
              checked={value === funnel.id}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className="h-4 w-4 mt-0.5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
            />
            <div className="ml-3">
              <span className={`block text-sm font-medium ${
                value === funnel.id ? 'text-indigo-900' : 'text-gray-900'
              }`}>
                {funnel.name}
              </span>
              <span className="block text-sm text-gray-500 mt-1">
                {funnel.description}
              </span>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}
