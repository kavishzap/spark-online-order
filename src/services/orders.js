/**
 * Create an order via /api/orders (dev Vite proxy or production serverless).
 */
export async function createOrder({ customer, items, total, deliveryFee, discountAmount }) {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer, items, total, deliveryFee, discountAmount }),
  })

  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(body.error || 'Failed to place order. Please try again.')
  }

  return body
}
