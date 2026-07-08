/**
 * Format a numeric price as Mauritian Rupees.
 */
export function formatPrice(amount) {
  const value = Number(amount) || 0
  return `Rs ${value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

/**
 * Convert a base64 image string to a usable data URI.
 */
export function toImageSrc(imageBase64) {
  if (!imageBase64) return null
  if (imageBase64.startsWith('data:')) return imageBase64
  return `data:image/jpeg;base64,${imageBase64}`
}
