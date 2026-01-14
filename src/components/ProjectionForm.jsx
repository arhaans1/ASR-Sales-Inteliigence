import { getOptimizationEvents } from '../lib/funnelConfigs'

export default function ProjectionForm({ prospect, projections, onChange, onCalculate }) {
  const optimizationEvents = getOptimizationEvents(prospect.funnel_type)

  const handleChange = (field, value) => {
    const numValue = value === '' ? null : parseFloat(value)
    onChange({ ...projections, [field]: numValue })
  }

  const handleTextChange = (field, value) => {
    onChange({ ...projections, [field]: value })
  }

  const handleCheckboxChange = (field, checked) => {
    onChange({ ...projections, [field]: checked })
  }

  return (
    <div className="space-y-6">
      {/* Target Spend */}
      <div className="p-4 bg-gray-50 rounded-lg space-y-4">
        <h4 className="font-medium text-gray-900">Target Ad Spend</h4>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Daily Spend
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
            <input
              type="number"
              value={projections.projected_daily_spend || ''}
              onChange={(e) => handleChange('projected_daily_spend', e.target.value)}
              placeholder="50000"
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected CPA at Scale
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
            <input
              type="number"
              value={projections.projected_cpa_stage1 || ''}
              onChange={(e) => handleChange('projected_cpa_stage1', e.target.value)}
              placeholder={prospect.current_cpa_stage1 || '2000'}
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Current: {prospect.current_cpa_stage1 ? `₹${prospect.current_cpa_stage1}` : 'Not set'}
          </p>
        </div>
      </div>

      {/* Deep Event Optimization */}
      <div className="p-4 bg-blue-50 rounded-lg space-y-4">
        <h4 className="font-medium text-blue-900">Deep Event Optimization</h4>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Optimize for Event
          </label>
          <select
            value={projections.optimization_event || ''}
            onChange={(e) => handleTextChange('optimization_event', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select event...</option>
            {optimizationEvents.map(event => (
              <option key={event} value={event}>{event}</option>
            ))}
          </select>
        </div>

        {/* Expected Rates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected {prospect.stage2_name || 'Attendance'} Rate
            </label>
            <div className="relative">
              <input
                type="number"
                value={projections.projected_stage2_rate ?? prospect.current_stage2_rate ?? ''}
                onChange={(e) => handleChange('projected_stage2_rate', e.target.value)}
                placeholder={prospect.current_stage2_rate || '70'}
                className="w-full pr-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>

          {prospect.stage3_enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected {prospect.stage3_name || 'Call Booking'} Rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={projections.projected_stage3_rate ?? prospect.current_stage3_rate ?? ''}
                  onChange={(e) => handleChange('projected_stage3_rate', e.target.value)}
                  placeholder={prospect.current_stage3_rate || '20'}
                  className="w-full pr-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>
          )}

          {prospect.stage4_enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected {prospect.stage4_name || 'Call Attendance'} Rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={projections.projected_stage4_rate ?? prospect.current_stage4_rate ?? ''}
                  onChange={(e) => handleChange('projected_stage4_rate', e.target.value)}
                  placeholder={prospect.current_stage4_rate || '80'}
                  className="w-full pr-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Close Rate
            </label>
            <div className="relative">
              <input
                type="number"
                value={projections.projected_conversion_rate ?? prospect.current_conversion_rate ?? ''}
                onChange={(e) => handleChange('projected_conversion_rate', e.target.value)}
                placeholder={prospect.current_conversion_rate || '30'}
                className="w-full pr-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            High Ticket Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
            <input
              type="number"
              value={projections.projected_high_ticket_price || prospect.high_ticket_price || ''}
              onChange={(e) => handleChange('projected_high_ticket_price', e.target.value)}
              placeholder={prospect.high_ticket_price || '89000'}
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* 4-Layer Ad System */}
      <div className="p-4 bg-purple-50 rounded-lg space-y-4">
        <h4 className="font-medium text-purple-900">4-Layer Ad System</h4>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Layer 1 Creatives
          </label>
          <input
            type="text"
            value={projections.layer1_creatives || '10-12'}
            onChange={(e) => handleTextChange('layer1_creatives', e.target.value)}
            placeholder="10-12"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={projections.layer2_enabled ?? true}
              onChange={(e) => handleCheckboxChange('layer2_enabled', e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">Layer 2 Education Ads</span>
          </label>
        </div>

        {(projections.layer2_enabled ?? true) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Layer 2 Creatives
            </label>
            <input
              type="text"
              value={projections.layer2_creatives || '18-20'}
              onChange={(e) => handleTextChange('layer2_creatives', e.target.value)}
              placeholder="18-20"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        )}
      </div>

      {/* Scaling Settings */}
      <div className="p-4 bg-green-50 rounded-lg space-y-4">
        <h4 className="font-medium text-green-900">Scaling Settings</h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Increment
            </label>
            <div className="relative">
              <input
                type="number"
                value={projections.scaling_increment_percent || 20}
                onChange={(e) => handleChange('scaling_increment_percent', e.target.value)}
                placeholder="20"
                className="w-full pr-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency
            </label>
            <div className="relative">
              <input
                type="number"
                value={projections.scaling_frequency_days || 3}
                onChange={(e) => handleChange('scaling_frequency_days', e.target.value)}
                placeholder="3"
                className="w-full pr-12 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calculate Button */}
      <button
        type="button"
        onClick={onCalculate}
        className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
      >
        Calculate Projections
      </button>
    </div>
  )
}
