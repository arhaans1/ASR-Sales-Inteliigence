import { useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import SearchBar from '../components/SearchBar'
import ProspectList from '../components/ProspectList'
import { useProspects } from '../hooks/useProspects'

export default function Dashboard() {
  const { prospects, loading, error, loadProspects, searchProspects, deleteProspect } = useProspects()

  useEffect(() => {
    loadProspects()
  }, [loadProspects])

  const handleSearch = useCallback((query, status) => {
    if (query || (status && status !== 'all')) {
      searchProspects(query, status)
    } else {
      loadProspects()
    }
  }, [searchProspects, loadProspects])

  const handleDelete = useCallback(async (id) => {
    await deleteProspect(id)
  }, [deleteProspect])

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prospects</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your sales prospects and track funnel metrics
            </p>
          </div>
          <Link
            to="/prospect/new"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Prospect
          </Link>
        </div>

        {/* Search and Filter */}
        <SearchBar onSearch={handleSearch} />

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Prospect List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <ProspectList
            prospects={prospects}
            loading={loading}
            onDelete={handleDelete}
          />
        </div>

        {/* Legend */}
        {prospects.length > 0 && (
          <div className="text-sm text-gray-500 flex items-center space-x-4">
            <span>Legend:</span>
            <span><span className="mr-1">🟢</span>Won</span>
            <span><span className="mr-1">🟡</span>In Progress</span>
            <span><span className="mr-1">🔵</span>Contacted</span>
            <span><span className="mr-1">⚪</span>New</span>
            <span><span className="mr-1">🔴</span>Lost</span>
          </div>
        )}
      </div>
    </Layout>
  )
}
