/**
 * Normalize Mauritius mobile numbers to WhatsApp format (230XXXXXXXX).
 */
export function normalizePhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('230')) return digits
  if (digits.startsWith('0')) return `230${digits.slice(1)}`
  return `230${digits}`
}

export function formatPhoneForDisplay(phone) {
  const normalized = normalizePhone(phone)
  if (!normalized.startsWith('230') || normalized.length < 11) return phone
  return `+230 ${normalized.slice(3)}`
}
