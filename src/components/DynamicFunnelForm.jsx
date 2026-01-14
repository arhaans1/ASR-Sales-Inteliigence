import { funnelTypes } from '../lib/funnelConfigs'

export default function DynamicFunnelForm({ funnelType, formData, onChange }) {
  const config = funnelTypes[funnelType]
  if (!config) return null

  const handleChange = (field, value) => {
    onChange({ ...formData, [field]: value })
  }

  const handleNumberChange = (field, value) => {
    const numValue = value === '' ? null : parseFloat(value)
    onChange({ ...formData, [field]: numValue })
  }

  const handleCheckboxChange = (field, checked) => {
    onChange({ ...formData, [field]: checked })
  }

  return (
    <div className="space-y-6">
      {/* Daily Ad Spend */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Daily Ad Spend
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
          <input
            type="number"
            value={formData.current_daily_spend || ''}
            onChange={(e) => handleNumberChange('current_daily_spend', e.target.value)}
            placeholder="4000"
            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Stage 1 */}
      <div className="p-4 bg-gray-50 rounded-lg space-y-4">
        <h4 className="font-medium text-gray-900">
          Stage 1: {config.stages[0].defaultName}
        </h4>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stage Name
          </label>
          <input
            type="text"
            value={formData.stage1_name || ''}
            onChange={(e) => handleChange('stage1_name', e.target.value)}
            placeholder={config.stages[0].defaultName}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current CPA (Cost per {config.stages[0].defaultName})
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
            <input
              type="number"
              value={formData.current_cpa_stage1 || ''}
              onChange={(e) => handleNumberChange('current_cpa_stage1', e.target.value)}
              placeholder="600"
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {config.stages[0].canBePaid && (
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.stage1_is_paid || false}
                onChange={(e) => handleCheckboxChange('stage1_is_paid', e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Is Paid?</span>
            </label>
            {formData.stage1_is_paid && (
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  value={formData.stage1_price || ''}
                  onChange={(e) => handleNumberChange('stage1_price', e.target.value)}
                  placeholder="Price"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stage 2 */}
      <div className="p-4 bg-gray-50 rounded-lg space-y-4">
        <h4 className="font-medium text-gray-900">
          Stage 2: {config.stages[1]?.defaultName || 'Attendance'}
        </h4>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stage Name
          </label>
          <input
            type="text"
            value={formData.stage2_name || ''}
            onChange={(e) => handleChange('stage2_name', e.target.value)}
            placeholder={config.stages[1]?.defaultName || 'Attendance'}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conversion Rate (from Stage 1)
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.current_stage2_rate || ''}
              onChange={(e) => handleNumberChange('current_stage2_rate', e.target.value)}
              placeholder="70"
              className="w-full pr-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
        </div>

        {config.stages[1]?.canBePaid && (
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.stage2_is_paid || false}
                onChange={(e) => handleCheckboxChange('stage2_is_paid', e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Is Paid?</span>
            </label>
            {formData.stage2_is_paid && (
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  value={formData.stage2_price || ''}
                  onChange={(e) => handleNumberChange('stage2_price', e.target.value)}
                  placeholder="Price"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stage 3 (if enabled for this funnel type) */}
      {config.stage3_enabled && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <h4 className="font-medium text-gray-900">
            Stage 3: {config.stages[2]?.defaultName || 'Call Booking'}
          </h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stage Name
            </label>
            <input
              type="text"
              value={formData.stage3_name || ''}
              onChange={(e) => handleChange('stage3_name', e.target.value)}
              placeholder={config.stages[2]?.defaultName || 'Call Booking'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conversion Rate (from Stage 2)
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.current_stage3_rate || ''}
                onChange={(e) => handleNumberChange('current_stage3_rate', e.target.value)}
                placeholder="20"
                className="w-full pr-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>

          {config.stages[2]?.canBePaid && (
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.stage3_is_paid || false}
                  onChange={(e) => handleCheckboxChange('stage3_is_paid', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Is Paid?</span>
              </label>
              {formData.stage3_is_paid && (
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={formData.stage3_price || ''}
                    onChange={(e) => handleNumberChange('stage3_price', e.target.value)}
                    placeholder="Price"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Stage 4 (if enabled for this funnel type) */}
      {config.stage4_enabled && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <h4 className="font-medium text-gray-900">
            Stage 4: {config.stages[3]?.defaultName || 'Call Attendance'}
          </h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stage Name
            </label>
            <input
              type="text"
              value={formData.stage4_name || ''}
              onChange={(e) => handleChange('stage4_name', e.target.value)}
              placeholder={config.stages[3]?.defaultName || 'Call Attendance'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conversion Rate (from Stage 3)
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.current_stage4_rate || ''}
                onChange={(e) => handleNumberChange('current_stage4_rate', e.target.value)}
                placeholder="80"
                className="w-full pr-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>
        </div>
      )}

      {/* High Ticket */}
      <div className="p-4 bg-indigo-50 rounded-lg space-y-4">
        <h4 className="font-medium text-indigo-900">High Ticket Conversion</h4>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            High Ticket Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
            <input
              type="number"
              value={formData.high_ticket_price || ''}
              onChange={(e) => handleNumberChange('high_ticket_price', e.target.value)}
              placeholder="89000"
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Close Rate
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.current_conversion_rate || ''}
              onChange={(e) => handleNumberChange('current_conversion_rate', e.target.value)}
              placeholder="30"
              className="w-full pr-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
