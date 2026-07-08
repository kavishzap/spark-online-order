import { createOrderInDb } from './lib/createOrder.js'
import { resolveSupabaseEnv } from './lib/env.js'

/**
 * Production API route (Vercel serverless).
 * Creates whatsapp_bot_orders + whatsapp_bot_orders_items via service role.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { supabaseUrl, serviceKey } = resolveSupabaseEnv()

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({
      error:
        'Server misconfigured. Add Supabase URL and service role key (SUPABASE_SERVICE_ROLE_KEY or SERVICE_ROLE_KEY) to your hosting environment.',
    })
  }

  try {
    const { customer, items, total, deliveryFee, discountAmount } = req.body ?? {}

    const order = await createOrderInDb(
      { customer, items, total, deliveryFee, discountAmount },
      { supabaseUrl, serviceKey },
    )

    return res.status(201).json(order)
  } catch (err) {
    return res.status(400).json({
      error: err.message || 'Failed to create order',
    })
  }
}
