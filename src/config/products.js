/** Delivery fee for gift-card refill redemptions (Rs) */
export const GIFT_REFILL_DELIVERY_FEE = 150

/** Delivery fee for a single-bottle order (Rs) */
export const SINGLE_BOTTLE_DELIVERY_FEE = 125

/** Bottles at or above this count qualify for free delivery */
export const FREE_BOTTLE_DELIVERY_MIN = 2

export const BOTTLE_FREE_DELIVERY_MESSAGE = 'Free delivery on 2 bottles or more.'

/**
 * Find the product used for gift-card refill redemption.
 * Uses the first product whose name contains "refill" (case-insensitive).
 * When you add a separate gift-refill SKU in Supabase, set its id here.
 */
export const GIFT_REFILL_PRODUCT_ID = null

export function isRefillProduct(product) {
  return product.name.toLowerCase().includes('refill')
}

/** Monin-style bottles and similar SKUs (e.g. 700ml, 1L). */
export function isBottleProduct(itemOrProduct) {
  const name = String(itemOrProduct?.name ?? itemOrProduct?.product_name ?? '').toLowerCase()
  if (!name) return false
  if (name.includes('monin')) return true
  return /\d+\s*(ml|cl|l|ltr|liter|litre)\b/.test(name)
}

export function countBottles(items) {
  return items
    .filter((item) => !item.isGiftRefill && isBottleProduct(item))
    .reduce((sum, item) => sum + item.quantity, 0)
}

export function hasBottleProducts(items) {
  return countBottles(items) > 0
}

/** Show bottle delivery promo only when the cart contains bottles and nothing else. */
export function shouldShowBottleDeliveryNote(items) {
  const orderItems = items.filter((item) => !item.isGiftRefill)
  if (orderItems.length === 0) return false
  return orderItems.every((item) => isBottleProduct(item))
}

export function calculateDeliveryFee(items, hasGiftRefill) {
  if (hasGiftRefill) return GIFT_REFILL_DELIVERY_FEE

  const bottleCount = countBottles(items)
  const isSingleBottleOnlyOrder =
    items.length === 1 &&
    items[0].quantity === 1 &&
    !items[0].isGiftRefill &&
    isBottleProduct(items[0])

  if (isSingleBottleOnlyOrder && bottleCount === 1) {
    return SINGLE_BOTTLE_DELIVERY_FEE
  }

  return 0
}

export function getGiftRefillProduct(products) {
  if (GIFT_REFILL_PRODUCT_ID) {
    return products.find((p) => p.id === GIFT_REFILL_PRODUCT_ID)
  }
  return products.find((p) => isRefillProduct(p))
}

/** Cart line id for a gift-card refill (separate from paid refill line). */
export function giftRefillLineId(productId) {
  return `${productId}::gift-refill`
}

export function isGiftRefillLineId(lineId) {
  return String(lineId).endsWith('::gift-refill')
}

/** Build a unique cart line id (supports color variants). */
export function buildCartLineId(productId, { isGiftRefill = false, color = null } = {}) {
  if (isGiftRefill) return giftRefillLineId(productId)
  if (color) return `${productId}::color::${encodeURIComponent(color)}`
  return String(productId)
}

export function getColorFromLineId(lineId) {
  const str = String(lineId)
  const marker = '::color::'
  if (!str.includes(marker)) return null
  return decodeURIComponent(str.split(marker)[1])
}
