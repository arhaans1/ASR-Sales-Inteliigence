import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import FunnelTypeSelector from '../components/FunnelTypeSelector'
import DynamicFunnelForm from '../components/DynamicFunnelForm'
import { useProspects } from '../hooks/useProspects'
import { funnelTypes, getDefaultStageNames } from '../lib/funnelConfigs'

export default function CreateProspect() {
  const navigate = useNavigate()
  const { createProspect, loading } = useProspects()

  const [formData, setFormData] = useState({
    name: '',
    business_name: '',
    email: '',
    phone: '',
    website: '',
    status: 'new',
    funnel_type: 'webinar',
    // Stage 1
    stage1_name: 'Registration',
    stage1_price: 0,
    stage1_is_paid: false,
    current_daily_spend: null,
    current_cpa_stage1: null,
    // Stage 2
    stage2_name: 'Attendance',
    stage2_price: 0,
    stage2_is_paid: false,
    current_stage2_rate: 70,
    // Stage 3
    stage3_enabled: false,
    stage3_name: '',
    stage3_price: 0,
    stage3_is_paid: false,
    current_stage3_rate: null,
    // Stage 4
    stage4_enabled: false,
    stage4_name: '',
    current_stage4_rate: null,
    // High Ticket
    high_ticket_price: null,
    current_conversion_rate: 30
  })

  const [error, setError] = useState('')

  const handleFunnelTypeChange = (funnelType) => {
    const config = funnelTypes[funnelType]
    const defaultNames = getDefaultStageNames(funnelType)

    setFormData(prev => ({
      ...prev,
      funnel_type: funnelType,
      stage3_enabled: config.stage3_enabled,
      stage4_enabled: config.stage4_enabled,
      ...defaultNames
    }))
  }

  const handleBasicInfoChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFunnelFormChange = (data) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required')
      return
    }
    if (!formData.business_name.trim()) {
      setError('Business name is required')
      return
    }

    const prospect = await createProspect(formData)
    if (prospect) {
      navigate(`/prospect/${prospect.id}`)
    } else {
      setError('Failed to create prospect. Please try again.')
    }
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Link to="/" className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">New Prospect</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleBasicInfoChange('name', e.target.value)}
                    placeholder="Shraddha"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.business_name}
                    onChange={(e) => handleBasicInfoChange('business_name', e.target.value)}
                    placeholder="Fertility Coaching"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleBasicInfoChange('email', e.target.value)}
                    placeholder="shraddha@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleBasicInfoChange('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleBasicInfoChange('website', e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Funnel Type Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <FunnelTypeSelector
              value={formData.funnel_type}
              onChange={handleFunnelTypeChange}
            />
          </div>

          {/* Dynamic Funnel Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current State</h3>
            <DynamicFunnelForm
              funnelType={formData.funnel_type}
              formData={formData}
              onChange={handleFunnelFormChange}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              to="/"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Prospect'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
