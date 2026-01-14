// Currency formatter for Indian Rupees
export function formatCurrency(amount, options = {}) {
  const {
    compact = false,
    showSymbol = true
  } = options

  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? '₹0' : '0'
  }

  const symbol = showSymbol ? '₹' : ''

  if (compact) {
    if (amount >= 10000000) {
      return `${symbol}${(amount / 10000000).toFixed(1)}Cr`
    }
    if (amount >= 100000) {
      return `${symbol}${(amount / 100000).toFixed(1)}L`
    }
    if (amount >= 1000) {
      return `${symbol}${(amount / 1000).toFixed(1)}K`
    }
  }

  // Format with Indian number system (lakhs, crores)
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(amount)

  return `${symbol}${formatted}`
}

// Percentage formatter
export function formatPercentage(value, decimals = 0) {
  if (value === null || value === undefined || isNaN(value)) {
    return '—'
  }
  return `${value.toFixed(decimals)}%`
}

// ROI formatter
export function formatROI(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '—'
  }
  return `${value.toFixed(2)}x`
}

// Number formatter
export function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined || isNaN(value)) {
    return '—'
  }
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: decimals
  }).format(value)
}

// Relative time formatter
export function formatRelativeTime(dateString) {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) {
    return 'Just now'
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  }
  if (diffDays === 1) {
    return 'Yesterday'
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`
  }

  // Format as date
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

// Date formatter
export function formatDate(dateString, options = {}) {
  if (!dateString) return ''

  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options
  })
}

// DateTime formatter
export function formatDateTime(dateString) {
  if (!dateString) return ''

  const date = new Date(dateString)
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}
