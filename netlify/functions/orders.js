import { createOrderInDb } from '../../api/lib/createOrder.js'
import { resolveSupabaseEnv } from '../../api/lib/env.js'

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { supabaseUrl, serviceKey } = resolveSupabaseEnv(process.env)

  if (!supabaseUrl || !serviceKey) {
    return new Response(
      JSON.stringify({
        error:
          'Server misconfigured. Add VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your hosting environment.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  try {
    const body = await req.json()
    const order = await createOrderInDb(body, { supabaseUrl, serviceKey })

    return new Response(JSON.stringify(order), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to create order' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }
}
