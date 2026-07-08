import { formatPrice } from './format'
import { WHATSAPP_NUMBER } from '../config/social'

/**
 * Short message sent back to the bot to resume checkout.
 */
export function buildContinueMessage(orderRef) {
  return `My order ${orderRef}`
}

export function buildContinueOnWhatsAppUrl(orderRef) {
  const encoded = encodeURIComponent(buildContinueMessage(orderRef))
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`
}

/**
 * Build the full order summary message for WhatsApp (legacy).
 */
export function buildOrderMessage({
  customer,
  items,
  giftCardCode,
  refillGiftCardCode,
  subtotal,
  discount,
  deliveryFee,
  total,
  orderRef,
}) {
  const lines = []

  if (orderRef) {
    lines.push(`Order ref: ${orderRef}`, '')
  }

  lines.push(
    `Customer: ${customer.fullName}`,
    `Phone: ${customer.phone}`,
    `Address: ${customer.address}`,
  )

  if (customer.notes?.trim()) {
    lines.push(`Notes: ${customer.notes.trim()}`)
  }

  lines.push('', 'Items:')

  items.forEach((item) => {
    const lineTotal = item.price * item.quantity
    const colorSuffix = item.color ? ` (${item.color})` : ''
    const label = item.isGiftRefill
      ? `${item.quantity} x ${item.name} - Free (gift card)`
      : `${item.quantity} x ${item.name}${colorSuffix} - ${formatPrice(lineTotal)}`
    lines.push(label)
  })

  lines.push('')

  if (refillGiftCardCode) {
    lines.push(`Refill Gift Card: ${refillGiftCardCode}`)
  }

  if (giftCardCode) {
    lines.push(`Discount Gift Card: ${giftCardCode}`)
  }

  if (giftCardCode || deliveryFee > 0) {
    lines.push(`Subtotal: ${formatPrice(subtotal)}`)
  }

  if (discount > 0) {
    lines.push(`Discount: -${formatPrice(discount)}`)
  }

  if (deliveryFee > 0) {
    lines.push(`Delivery fee: ${formatPrice(deliveryFee)}`)
  }

  lines.push(`Total: ${formatPrice(total)}`)

  return lines.join('\n')
}

/**
 * Open WhatsApp with a pre-filled message.
 */
export function redirectToWhatsApp(message) {
  const encoded = encodeURIComponent(message)
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

/**
 * Open WhatsApp with the order ref pre-filled so the bot can resume checkout.
 * Uses same-window navigation for reliable mobile deep linking.
 */
export function redirectToWhatsAppWithOrderRef(orderRef) {
  window.location.href = buildContinueOnWhatsAppUrl(orderRef)
}
