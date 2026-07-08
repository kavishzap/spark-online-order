/** Percentage discount gift cards (applied at checkout on full cart). */
export const PERCENT_GIFT_CARDS = {
  WELCOME10: { discount: 10, label: '10% off' },
  SODAMAX20: { discount: 20, label: '20% off' },
  VIP50: { discount: 50, label: '50% off' },
}

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
 * Validate a percentage discount gift card (checkout).
 */
export function validatePercentGiftCard(code) {
  const normalized = code.trim().toUpperCase()
  const card = PERCENT_GIFT_CARDS[normalized]

  if (!card) {
    return { valid: false }
  }

  return {
    valid: true,
    type: 'percent',
    code: normalized,
    discount: card.discount,
    label: card.label,
  }
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

/** @deprecated Use validatePercentGiftCard */
export function validateGiftCard(code) {
  return validatePercentGiftCard(code)
}
