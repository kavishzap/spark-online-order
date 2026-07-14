/**
 * Format a numeric price as Mauritian Rupees.
 */
export function formatPrice(amount) {
  const value = Number(amount) || 0
  return `Rs ${value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

/**
 * Convert a base64 image string to a usable data URI.
 * Detects jpeg/png/webp/gif from the payload when no data: prefix is present.
 */
export function toImageSrc(imageBase64) {
  if (!imageBase64) return null
  if (imageBase64.startsWith('data:')) return imageBase64

  const raw = imageBase64.trim()
  let mime = 'image/jpeg'
  if (raw.startsWith('iVBOR')) mime = 'image/png'
  else if (raw.startsWith('R0lGOD')) mime = 'image/gif'
  else if (raw.startsWith('UklGR')) mime = 'image/webp'

  return `data:${mime};base64,${raw}`
}
