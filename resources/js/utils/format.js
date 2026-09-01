// Small shared formatting helpers.

export function formatCurrency(value) {
  const n = Number(value || 0)
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

// Product images are served same-origin by Laravel from /public/images, so
// storefront-relative paths (e.g. /images/x.webp) are used as-is.
export function resolveImage(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  return path
}
