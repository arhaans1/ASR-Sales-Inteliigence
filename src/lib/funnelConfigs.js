// Funnel type configurations
export const funnelTypes = {
  webinar: {
    id: 'webinar',
    name: 'Webinar Funnel',
    description: 'Registration → Attendance → Sale',
    stages: [
      { key: 'stage1', name: 'Registration', defaultName: 'Registration', canBePaid: true },
      { key: 'stage2', name: 'Attendance', defaultName: 'Attendance', canBePaid: false }
    ],
    stage3_enabled: false,
    stage4_enabled: false
  },
  webinar_to_call: {
    id: 'webinar_to_call',
    name: 'Webinar-to-Call Funnel',
    description: 'Registration → Attendance → Call Booking → Call Attendance → Sale',
    stages: [
      { key: 'stage1', name: 'Registration', defaultName: 'Webinar Registration', canBePaid: true },
      { key: 'stage2', name: 'Attendance', defaultName: 'Webinar Attendance', canBePaid: false },
      { key: 'stage3', name: 'Call Booking', defaultName: '1-1 Call Booking', canBePaid: true },
      { key: 'stage4', name: 'Call Attendance', defaultName: 'Call Attendance', canBePaid: false }
    ],
    stage3_enabled: true,
    stage4_enabled: true
  },
  direct_call: {
    id: 'direct_call',
    name: 'Direct Call Funnel',
    description: 'Opt-In → Call Booking → Call Attendance → Sale',
    stages: [
      { key: 'stage1', name: 'Opt-In', defaultName: 'Opt-In', canBePaid: true },
      { key: 'stage2', name: 'Call Booking', defaultName: 'Call Booking', canBePaid: true },
      { key: 'stage3', name: 'Call Attendance', defaultName: 'Call Attendance', canBePaid: false }
    ],
    stage3_enabled: true,
    stage4_enabled: false
  }
}

// Status configurations
export const statusConfig = {
  new: { label: 'New', color: 'gray', bgClass: 'bg-gray-100 text-gray-800', icon: '⚪' },
  contacted: { label: 'Contacted', color: 'blue', bgClass: 'bg-blue-100 text-blue-800', icon: '🔵' },
  call_scheduled: { label: 'Call Scheduled', color: 'yellow', bgClass: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
  call_completed: { label: 'Call Done', color: 'purple', bgClass: 'bg-purple-100 text-purple-800', icon: '🟣' },
  proposal_sent: { label: 'Proposal Sent', color: 'orange', bgClass: 'bg-orange-100 text-orange-800', icon: '🟠' },
  won: { label: 'Won', color: 'green', bgClass: 'bg-green-100 text-green-800', icon: '🟢' },
  lost: { label: 'Lost', color: 'red', bgClass: 'bg-red-100 text-red-800', icon: '🔴' }
}

// Note type configurations
export const noteTypes = {
  general: { label: 'General', icon: '📝', bgClass: 'bg-gray-100 text-gray-800' },
  call_notes: { label: 'Call Notes', icon: '📞', bgClass: 'bg-blue-100 text-blue-800' },
  objection: { label: 'Objection', icon: '⚠️', bgClass: 'bg-yellow-100 text-yellow-800' },
  action_item: { label: 'Action Item', icon: '✅', bgClass: 'bg-green-100 text-green-800' },
  follow_up: { label: 'Follow Up', icon: '🔄', bgClass: 'bg-purple-100 text-purple-800' }
}

// Optimization event options based on funnel type
export const getOptimizationEvents = (funnelType) => {
  const baseEvents = ['Registration', 'Purchase']

  switch (funnelType) {
    case 'webinar':
      return ['Registration', 'Attendance', 'Purchase']
    case 'webinar_to_call':
      return ['Registration', 'Attendance', 'Call Booking', 'Call Attendance', 'Purchase']
    case 'direct_call':
      return ['Opt-In', 'Call Booking', 'Call Attendance', 'Purchase']
    default:
      return baseEvents
  }
}

// Get default stage names based on funnel type
export function getDefaultStageNames(funnelType) {
  const config = funnelTypes[funnelType]
  if (!config) return {}

  return config.stages.reduce((acc, stage) => {
    acc[`${stage.key}_name`] = stage.defaultName
    return acc
  }, {})
}

// Get funnel stages for a prospect
export function getFunnelStages(prospect) {
  const config = funnelTypes[prospect.funnel_type]
  if (!config) return []

  return config.stages.filter((stage, index) => {
    if (stage.key === 'stage3' && !prospect.stage3_enabled) return false
    if (stage.key === 'stage4' && !prospect.stage4_enabled) return false
    return true
  }).map(stage => ({
    ...stage,
    name: prospect[`${stage.key}_name`] || stage.defaultName
  }))
}
