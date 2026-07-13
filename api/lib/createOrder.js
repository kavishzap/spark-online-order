import { normalizePhone } from '../../src/utils/phone.js'

export function parseCityFromAddress(address) {
  const parts = address
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  if (parts.length >= 2) return parts[1]
  return 'Mauritius'
}

function buildLineItems(items, { deliveryFee = 0, discountAmount = 0 } = {}) {
  const lines = items.map((item, index) => {
    const colorSuffix = item.color ? ` (${item.color})` : ''
    const productName = `${item.name}${colorSuffix}`
    const unitPrice = Number(item.price)
    const quantity = Number(item.quantity)

    return {
      item_id: item.productId ?? null,
      product_name: productName,
      quantity,
      unit_price: unitPrice,
      line_total: unitPrice * quantity,
      sort_order: index,
    }
  })

  if (deliveryFee > 0) {
    lines.push({
      product_name: 'Delivery fee',
      quantity: 1,
      unit_price: Number(deliveryFee),
      line_total: Number(deliveryFee),
      sort_order: lines.length,
    })
  }

  if (discountAmount > 0) {
    lines.push({
      product_name: 'Gift card discount',
      quantity: 1,
      unit_price: -Number(discountAmount),
      line_total: -Number(discountAmount),
      sort_order: lines.length,
    })
  }

  return lines
}

async function callOrdersEdge(payload, { supabaseUrl, serviceKey }) {
  const response = await fetch(`${supabaseUrl}/functions/v1/whatsapp-bot-orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const body = await response.json().catch(() => ({}))

  if (!response.ok || !body.success) {
    throw new Error(body.error || body.message || `Order API failed (${response.status})`)
  }

  return body.data
}

/**
 * Create a completed order via whatsapp-bot-orders edge function (SM-xxx ref).
 */
export async function createOrderInDb(
  { customer, items, total, deliveryFee, discountAmount },
  { supabaseUrl, serviceKey },
) {
  if (!customer?.fullName?.trim()) {
    throw new Error('Customer name is required')
  }
  if (!customer?.phone?.trim()) {
    throw new Error('Phone number is required')
  }
  if (!customer?.address?.trim()) {
    throw new Error('Address is required')
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('At least one order item is required')
  }

  const city = parseCityFromAddress(customer.address)
  const address = customer.address.trim()

  const lineItems = buildLineItems(items, { deliveryFee, discountAmount })

  const order = await callOrdersEdge(
    {
      company: 'spark',
      source: 'whatsapp',
      status: 'completed',
      customer_name: customer.fullName.trim(),
      customer_phone_number: normalizePhone(customer.phone),
      city,
      address,
      total: Number(total),
      items: lineItems,
    },
    { supabaseUrl, serviceKey },
  )

  return {
    id: order.id,
    order_ref: order.order_ref,
  }
}
