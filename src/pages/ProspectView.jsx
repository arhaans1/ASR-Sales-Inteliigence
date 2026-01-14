import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import MetricsTable from '../components/MetricsTable'
import RevenueCards from '../components/RevenueCards'
import NotesList from '../components/NotesList'
import NoteEditor from '../components/NoteEditor'
import ProjectionForm from '../components/ProjectionForm'
import ProjectionResults from '../components/ProjectionResults'
import ScalingTimeline from '../components/ScalingTimeline'
import { useProspects } from '../hooks/useProspects'
import { useNotes } from '../hooks/useNotes'
import { calculateCurrentMetrics, calculateProjections } from '../lib/calculations'
import { funnelTypes, statusConfig } from '../lib/funnelConfigs'
import { formatDate, formatCurrency } from '../lib/formatters'

export default function ProspectView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('details')
  const [prospect, setProspect] = useState(null)
  const [projections, setProjections] = useState({})
  const [projectedMetrics, setProjectedMetrics] = useState(null)
  const [saving, setSaving] = useState(false)

  const { getProspect, updateProspect, deleteProspect, loading: prospectLoading } = useProspects()
  const { notes, loading: notesLoading, loadNotes, createNote, deleteNote, togglePin } = useNotes(id)

  useEffect(() => {
    const fetchProspect = async () => {
      const data = await getProspect(id)
      if (data) {
        setProspect(data)
        // Initialize projections with existing values
        setProjections({
          projected_daily_spend: data.projected_daily_spend,
          projected_cpa_stage1: data.projected_cpa_stage1,
          projected_stage2_rate: data.projected_stage2_rate,
          projected_stage3_rate: data.projected_stage3_rate,
          projected_stage4_rate: data.projected_stage4_rate,
          projected_conversion_rate: data.projected_conversion_rate,
          projected_high_ticket_price: data.projected_high_ticket_price,
          optimization_event: data.optimization_event,
          layer1_creatives: data.layer1_creatives,
          layer2_enabled: data.layer2_enabled,
          layer2_creatives: data.layer2_creatives,
          scaling_increment_percent: data.scaling_increment_percent,
          scaling_frequency_days: data.scaling_frequency_days
        })
      } else {
        navigate('/')
      }
    }
    fetchProspect()
  }, [id, getProspect, navigate])

  useEffect(() => {
    if (activeTab === 'notes') {
      loadNotes()
    }
  }, [activeTab, loadNotes])

  const metrics = prospect ? calculateCurrentMetrics(prospect) : null
  const funnelConfig = prospect ? funnelTypes[prospect.funnel_type] : null

  const handleStatusChange = async (newStatus) => {
    if (!prospect) return
    const updated = await updateProspect(id, { status: newStatus })
    if (updated) {
      setProspect(updated)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this prospect? This action cannot be undone.')) {
      const success = await deleteProspect(id)
      if (success) {
        navigate('/')
      }
    }
  }

  const handleSaveNote = async (noteData) => {
    const note = await createNote(noteData)
    return !!note
  }

  const handleCalculateProjections = () => {
    const results = calculateProjections(prospect, projections)
    setProjectedMetrics(results)
  }

  const handleSaveProjections = async () => {
    setSaving(true)
    const updated = await updateProspect(id, projections)
    if (updated) {
      setProspect(updated)
    }
    setSaving(false)
  }

  if (prospectLoading || !prospect) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    )
  }

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'notes', label: 'Notes' },
    { id: 'projections', label: 'Projections' }
  ]

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{prospect.name}</h1>
              <p className="text-gray-600">{prospect.business_name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to={`/prospect/${id}/edit`}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50 font-medium"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Status and Info Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Status:</span>
              <select
                value={prospect.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.icon} {config.label}
                  </option>
                ))}
              </select>
            </div>

            {prospect.call_date && (
              <div className="text-sm text-gray-600">
                Call Date: <span className="font-medium">{formatDate(prospect.call_date)}</span>
              </div>
            )}

            <div className="text-sm text-gray-600">
              Funnel: <span className="font-medium">{funnelConfig?.name}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'details' && (
            <>
              {/* Basic Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Name</span>
                    <p className="font-medium">{prospect.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Business</span>
                    <p className="font-medium">{prospect.business_name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Email</span>
                    <p className="font-medium">{prospect.email || '—'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Phone</span>
                    <p className="font-medium">{prospect.phone || '—'}</p>
                  </div>
                  {prospect.website && (
                    <div className="md:col-span-2">
                      <span className="text-sm text-gray-500">Website</span>
                      <p className="font-medium">
                        <a
                          href={prospect.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          {prospect.website}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Current Spend */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Current Ad Spend</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Daily Spend</span>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(prospect.current_daily_spend)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Monthly Spend</span>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(metrics?.monthly_spend, { compact: true })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Funnel Metrics */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Funnel Metrics</h3>
                <MetricsTable metrics={metrics} prospect={prospect} />
              </div>

              {/* Revenue & ROI */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue & ROI</h3>
                <RevenueCards metrics={metrics} />
              </div>
            </>
          )}

          {activeTab === 'notes' && (
            <>
              {/* Note Editor */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Note</h3>
                <NoteEditor onSave={handleSaveNote} loading={notesLoading} />
              </div>

              {/* Notes List */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">All Notes</h3>
                <NotesList
                  notes={notes}
                  onDelete={deleteNote}
                  onTogglePin={togglePin}
                />
              </div>
            </>
          )}

          {activeTab === 'projections' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Projection Form */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Projected Inputs</h3>
                <ProjectionForm
                  prospect={prospect}
                  projections={projections}
                  onChange={setProjections}
                  onCalculate={handleCalculateProjections}
                />
              </div>

              {/* Results */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Projected Results</h3>
                  <ProjectionResults
                    prospect={prospect}
                    projectedMetrics={projectedMetrics}
                  />
                </div>

                {projectedMetrics && (
                  <>
                    {/* Scaling Timeline */}
                    <ScalingTimeline
                      currentSpend={prospect.current_daily_spend}
                      targetSpend={projections.projected_daily_spend}
                      incrementPercent={projections.scaling_increment_percent || 20}
                      frequencyDays={projections.scaling_frequency_days || 3}
                    />

                    {/* Save Button */}
                    <button
                      onClick={handleSaveProjections}
                      disabled={saving}
                      className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Projections'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
