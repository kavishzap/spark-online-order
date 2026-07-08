import {
  PRODUCT_COMPANY_FILTER,
  PRODUCT_IMAGE_SELECT,
  PRODUCT_LIST_ORDER,
  PRODUCT_LIST_SELECT,
} from '../lib/catalogSelect.js'

/**
 * Production API route (Vercel serverless).
 * GET /api/products — catalog list (no images)
 * GET /api/products?id=<uuid>&fields=image — single product image
 */
import { resolveSupabaseEnv } from './lib/env.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { supabaseUrl, serviceKey } = resolveSupabaseEnv()

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({
      error:
        'Server misconfigured. Add Supabase URL and service role key (SUPABASE_SERVICE_ROLE_KEY or SERVICE_ROLE_KEY) to your hosting environment, or run supabase/setup_rls.sql in Supabase.',
    })
  }

  const productId = req.query?.id
  const fields = req.query?.fields

  try {
    if (productId && fields === 'image') {
      const url =
        `${supabaseUrl}/rest/v1/whatsapp_bot_items` +
        `?select=${encodeURIComponent(PRODUCT_IMAGE_SELECT)}` +
        `&id=eq.${encodeURIComponent(productId)}` +
        `&${PRODUCT_COMPANY_FILTER}` +
        `&limit=1`

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

      const [row] = await response.json()
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
      return res.status(200).json({ image_base64: row?.image_base64 ?? null })
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

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return res.status(200).json(data ?? [])
  } catch (err) {
    return res.status(500).json({
      error: err.message || 'Failed to fetch products',
    })
  }
}
