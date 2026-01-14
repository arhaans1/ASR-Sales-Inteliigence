import { useState, useEffect } from 'react'
import { statusConfig } from '../lib/funnelConfigs'

export default function SearchBar({ onSearch, onStatusFilter }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')

  useEffect(() => {
    const debounce = setTimeout(() => {
      onSearch(query, status)
    }, 300)

    return () => clearTimeout(debounce)
  }, [query, status, onSearch])

  const handleStatusChange = (e) => {
    setStatus(e.target.value)
    if (onStatusFilter) {
      onStatusFilter(e.target.value)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Search prospects..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <select
        value={status}
        onChange={handleStatusChange}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
      >
        <option value="all">All Status</option>
        {Object.entries(statusConfig).map(([key, config]) => (
          <option key={key} value={key}>
            {config.icon} {config.label}
          </option>
        ))}
      </select>
    </div>
  )
}
