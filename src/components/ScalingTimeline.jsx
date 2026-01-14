import { formatCurrency } from '../lib/formatters'
import { calculateScalingTimeline } from '../lib/calculations'

export default function ScalingTimeline({ currentSpend, targetSpend, incrementPercent = 20, frequencyDays = 3 }) {
  const timeline = calculateScalingTimeline(currentSpend, targetSpend, incrementPercent, frequencyDays)

  if (!timeline.steps.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        Enter target spend to see scaling timeline
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h4 className="font-medium text-gray-900">
          Scaling Timeline: {formatCurrency(currentSpend)} → {formatCurrency(targetSpend)}
        </h4>
        <p className="text-sm text-gray-500 mt-1">
          {timeline.totalSteps} steps over {timeline.totalDays} days ({timeline.totalWeeks} weeks)
        </p>
      </div>

      <div className="p-4">
        {/* Progress visualization */}
        <div className="relative mb-6">
          <div className="h-2 bg-gray-200 rounded-full">
            <div className="h-2 bg-indigo-600 rounded-full" style={{ width: '100%' }}></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Day 0</span>
            <span>Day {timeline.totalDays}</span>
          </div>
        </div>

        {/* Steps table */}
        <div className="max-h-64 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Step</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Day</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Daily Budget</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {timeline.steps.map((step) => (
                <tr
                  key={step.step}
                  className={step.isTarget ? 'bg-green-50' : ''}
                >
                  <td className="px-3 py-2 text-sm text-gray-900">
                    {step.isTarget ? (
                      <span className="flex items-center">
                        <span className="text-green-600 mr-1">✓</span>
                        Step {step.step}
                      </span>
                    ) : (
                      `Step ${step.step}`
                    )}
                  </td>
                  <td className="px-3 py-2 text-sm text-right text-gray-600">
                    Day {step.day}
                  </td>
                  <td className={`px-3 py-2 text-sm text-right ${
                    step.isTarget ? 'font-medium text-green-700' : 'text-gray-600'
                  }`}>
                    {formatCurrency(step.budget)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{timeline.totalSteps}</div>
            <div className="text-sm text-gray-500">Total Steps</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{timeline.totalDays}</div>
            <div className="text-sm text-gray-500">Days</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{timeline.totalWeeks}</div>
            <div className="text-sm text-gray-500">Weeks</div>
          </div>
        </div>
      </div>
    </div>
  )
}
