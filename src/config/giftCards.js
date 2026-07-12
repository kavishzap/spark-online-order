/**
 * One-time free refill gift cards.
 * Refill is free; delivery fee applies (see GIFT_REFILL_DELIVERY_FEE).
 */
export const REFILL_GIFT_CARDS = {
  REFILLGIFT: { label: 'Free Soda Max refill' },
  SODAMAXGIFT: { label: 'Free Soda Max refill' },
  SODAMAXREFILL: { label: 'Free Soda Max refill' },
}

/**
 * Validate a free-refill gift card (store banner).
 */
export function validateRefillGiftCard(code) {
  const normalized = code.trim().toUpperCase()
  const card = REFILL_GIFT_CARDS[normalized]

  if (!card) {
    return { valid: false }
  }

  return {
    valid: true,
    type: 'free_refill',
    code: normalized,
    label: card.label,
  }
}
