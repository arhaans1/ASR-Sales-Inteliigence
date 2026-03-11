import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Phone, Video, CreditCard } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { createClient } from '../lib/supabase'
import { FUNNEL_TYPES, FUNNEL_LABELS } from '../lib/calculations'

const FUNNEL_OPTIONS = [
  {
    value: FUNNEL_TYPES.CALL_BOOKING,
    label: 'Call Booking Funnel',
    description: 'Ads → Direct call booking → Sale',
    icon: Phone,
    color: 'indigo',
  },
  {
    value: FUNNEL_TYPES.FREE_WEBINAR_DIRECT,
    label: 'Free Webinar → Direct Sales',
    description: 'Free webinar → Sell directly on webinar',
    icon: Video,
    color: 'green',
  },
  {
    value: FUNNEL_TYPES.PAID_WEBINAR_DIRECT,
    label: 'Paid Webinar → Direct Sales',
    description: 'Paid ticket webinar → Sell on webinar',
    icon: CreditCard,
    color: 'purple',
  },
  {
    value: FUNNEL_TYPES.FREE_WEBINAR_CALL,
    label: 'Free Webinar → Call Booking',
    description: 'Free webinar → Book calls → Sale',
    icon: Video,
    color: 'blue',
  },
  {
    value: FUNNEL_TYPES.PAID_WEBINAR_CALL,
    label: 'Paid Webinar → Call Booking',
    description: 'Paid webinar → Book calls → Sale',
    icon: CreditCard,
    color: 'amber',
  },
]

const colorStyles = {
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-500', ring: 'ring-indigo-500', icon: 'text-indigo-600' },
  green: { bg: 'bg-green-50', border: 'border-green-500', ring: 'ring-green-500', icon: 'text-green-600' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-500', ring: 'ring-purple-500', icon: 'text-purple-600' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-500', ring: 'ring-blue-500', icon: 'text-blue-600' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-500', ring: 'ring-amber-500', icon: 'text-amber-600' },
}

function getDefaultsForFunnel(funnelType) {
  const common = {
    fixed_monthly_expense: 100000,
    avg_sale_value: 50000,
    team_commission_pct: 10,
    gst_on_ad_spend_pct: 18,
    desired_monthly_profit: 200000,
  }

  switch (funnelType) {
    case FUNNEL_TYPES.CALL_BOOKING:
      return {
        ...common,
        cost_per_qualified_call: 500,
        calls_to_close: 5,
        num_closers: 2,
        max_calls_per_closer_per_day: 8,
        simulate_ad_cost_increase: false,
      }
    case FUNNEL_TYPES.FREE_WEBINAR_DIRECT:
      return {
        ...common,
        cost_per_registration: 200,
        webinar_ticket_price: 0,
        registration_to_attendee_pct: 40,
        attendee_to_sale_pct: 5,
      }
    case FUNNEL_TYPES.PAID_WEBINAR_DIRECT:
      return {
        ...common,
        cost_per_registration: 200,
        webinar_ticket_price: 499,
        registration_to_attendee_pct: 60, // Higher for paid
        attendee_to_sale_pct: 8,
      }
    case FUNNEL_TYPES.FREE_WEBINAR_CALL:
      return {
        ...common,
        cost_per_registration: 200,
        webinar_ticket_price: 0,
        registration_to_attendee_pct: 40,
        attendee_to_call_pct: 15,
        call_show_up_pct: 70,
        calls_to_close_webinar: 3,
        cost_per_call_webinar: 0,
        num_closers_webinar: 2,
        max_calls_per_closer_webinar: 6,
      }
    case FUNNEL_TYPES.PAID_WEBINAR_CALL:
      return {
        ...common,
        cost_per_registration: 200,
        webinar_ticket_price: 499,
        registration_to_attendee_pct: 60,
        attendee_to_call_pct: 20,
        call_show_up_pct: 80,
        calls_to_close_webinar: 2,
        cost_per_call_webinar: 0,
        num_closers_webinar: 2,
        max_calls_per_closer_webinar: 6,
      }
    default:
      return common
  }
}

export default function CreateClient() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [funnelType, setFunnelType] = useState(FUNNEL_TYPES.CALL_BOOKING)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    try {
      const defaults = getDefaultsForFunnel(funnelType)
      const client = await createClient({
        admin_id: user.id,
        name: name.trim(),
        description: description.trim(),
        funnel_type: funnelType,
        ...defaults,
      })
      navigate(`/clients/${client.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="h-full flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">New Client</h1>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Create a new client</h2>
              <p className="text-sm text-gray-400 mb-6">
                Choose your funnel type and we'll set up the right calculator fields.
              </p>

              <form onSubmit={handleCreate} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Client / Project Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Acme Corp, Q3 Campaign"
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description <span className="text-gray-300 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of this business scenario…"
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none"
                  />
                </div>

                {/* Funnel Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Funnel Type <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {FUNNEL_OPTIONS.map((option) => {
                      const isSelected = funnelType === option.value
                      const styles = colorStyles[option.color]
                      const Icon = option.icon

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFunnelType(option.value)}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? `${styles.bg} ${styles.border} ring-1 ${styles.ring}`
                              : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isSelected ? styles.bg : 'bg-gray-100'
                            }`}
                          >
                            <Icon
                              size={20}
                              className={isSelected ? styles.icon : 'text-gray-400'}
                            />
                          </div>
                          <div className="flex-1">
                            <p
                              className={`font-semibold text-sm ${
                                isSelected ? 'text-gray-900' : 'text-gray-700'
                              }`}
                            >
                              {option.label}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{option.description}</p>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? styles.border : 'border-gray-300'
                            }`}
                          >
                            {isSelected && (
                              <div className={`w-2.5 h-2.5 rounded-full ${styles.border.replace('border', 'bg')}`} />
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !name.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    <Plus size={15} />
                    {loading ? 'Creating…' : 'Create Client'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
