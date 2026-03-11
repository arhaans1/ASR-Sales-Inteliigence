// Format as Indian Rupee currency
export function formatINR(amount) {
  if (!isFinite(amount) || isNaN(amount)) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format a plain number (Indian system)
export function formatNumber(n) {
  if (!isFinite(n) || isNaN(n)) return '—'
  return new Intl.NumberFormat('en-IN').format(Math.round(n))
}

// Format as percentage
export function formatPercent(n, decimals = 1) {
  if (!isFinite(n) || isNaN(n)) return '—'
  return `${Number(n).toFixed(decimals)}%`
}

// Format date string
export function formatDate(dateString) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
