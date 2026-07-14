import {
  PRODUCT_COMPANY_FILTER,
  PRODUCT_IMAGE_SELECT,
  PRODUCT_LIST_ORDER,
  PRODUCT_LIST_SELECT,
} from '../../lib/catalogSelect.js'
import { resolveSupabaseEnv } from '../../api/lib/env.js'

function parseIds(searchParams) {
  const ids = searchParams.get('ids')
  if (ids) {
    return ids
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
  }
  const id = searchParams.get('id')
  return id ? [id] : []
}

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  })
}

export default async (req) => {
  if (req.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const { supabaseUrl, serviceKey } = resolveSupabaseEnv(process.env)

  if (!supabaseUrl || !serviceKey) {
    return json(
      {
        error:
          'Server misconfigured. Add VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your hosting environment.',
      },
      500,
    )
  }

  const requestUrl = new URL(req.url)
  const fields = requestUrl.searchParams.get('fields')
  const productIds = parseIds(requestUrl.searchParams)
  const hasIdsParam = Boolean(requestUrl.searchParams.get('ids'))

  try {
    if (fields === 'image' && productIds.length > 0) {
      const encodedIds = productIds.map((id) => encodeURIComponent(id)).join(',')
      const url =
        `${supabaseUrl}/rest/v1/whatsapp_bot_items` +
        `?select=${encodeURIComponent(`id,${PRODUCT_IMAGE_SELECT}`)}` +
        `&id=in.(${encodedIds})` +
        `&${PRODUCT_COMPANY_FILTER}`

      const response = await fetch(url, {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Supabase error ${response.status}`)
      }

      const rows = await response.json()
      const cacheHeaders = {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      }

      if (!hasIdsParam && productIds.length === 1) {
        return json({ image_base64: rows?.[0]?.image_base64 ?? null }, 200, cacheHeaders)
      }

      return json(
        (rows ?? []).map((row) => ({
          id: row.id,
          image_base64: row.image_base64 ?? null,
        })),
        200,
        cacheHeaders,
      )
    }

    const url =
      `${supabaseUrl}/rest/v1/whatsapp_bot_items` +
      `?select=${encodeURIComponent(PRODUCT_LIST_SELECT)}` +
      `&${PRODUCT_COMPANY_FILTER}` +
      `&order=${PRODUCT_LIST_ORDER}`

    const response = await fetch(url, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || `Supabase error ${response.status}`)
    }

    const data = await response.json()
    return json(data ?? [], 200, {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    })
  } catch (err) {
    return json({ error: err.message || 'Failed to fetch products' }, 500)
  }
}
