export function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value ?? 0)
}

export function timeAgo(date) {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
  if (!Number.isFinite(days) || days < 1) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
