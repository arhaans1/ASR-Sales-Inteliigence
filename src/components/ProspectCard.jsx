import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import { funnelTypes } from '../lib/funnelConfigs'
import { formatROI } from '../lib/formatters'
import { calculateCurrentMetrics } from '../lib/calculations'

export default function ProspectCard({ prospect, onDelete }) {
  const funnelConfig = funnelTypes[prospect.funnel_type]
  const metrics = calculateCurrentMetrics(prospect)

  const handleDelete = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this prospect?')) {
      onDelete(prospect.id)
    }
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <Link to={`/prospect/${prospect.id}`} className="block">
          <div className="font-medium text-gray-900">{prospect.name}</div>
        </Link>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-600">{prospect.business_name}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={prospect.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-600">
          {funnelConfig?.name || prospect.funnel_type}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`text-sm font-medium ${
          metrics?.roi_status === 'healthy' ? 'text-green-600' :
          metrics?.roi_status === 'break_even' ? 'text-yellow-600' :
          metrics?.roi_status === 'losing' ? 'text-red-600' :
          'text-gray-400'
        }`}>
          {metrics ? formatROI(metrics.roi) : '—'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end space-x-2">
          <Link
            to={`/prospect/${prospect.id}`}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            View
          </Link>
          <Link
            to={`/prospect/${prospect.id}/edit`}
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-900 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}
