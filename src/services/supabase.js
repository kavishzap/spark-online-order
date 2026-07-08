import { createClient } from '@supabase/supabase-js'
import { resolveSupabaseClientEnv } from '../../api/lib/env.js'
import { normalizeColorRows } from '../utils/colors'
import {
  PRODUCT_IMAGE_SELECT,
  PRODUCT_LIST_SELECT,
} from '../../lib/catalogSelect.js'

const { supabaseUrl, supabaseAnonKey } = resolveSupabaseClientEnv()

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase URL or anon key. Set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (or NEXT_PUBLIC_* equivalents) in .env',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const SETUP_HINT =
  'Run supabase/setup_rls.sql in Supabase Dashboard → SQL Editor to allow public product reads.'

function parseItemPrice(value) {
  if (value == null || value === '') return 0
  const parsed = Number(String(value).replace(/[^\d.-]/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

/** Flatten whatsapp_bot_items row into app product shape. */
export function normalizeProduct(row) {
  const colors = normalizeColorRows(row.whatsapp_bot_item_colors)
  const {
    whatsapp_bot_item_colors: _colors,
    product_name,
    price,
    ...rest
  } = row

  return {
    ...rest,
    name: product_name?.trim() || 'Unnamed product',
    price: parseItemPrice(price),
    colors,
    image_base64: row.image_base64 ?? null,
  }
}

/**
 * Fetch product list without images (fast initial load).
 */
async function fetchProductsDirect() {
  const { data, error } = await supabase
    .from('whatsapp_bot_items')
    .select(PRODUCT_LIST_SELECT)
    .eq('company', 'spark')
    .order('sort_order', { ascending: true })
    .order('product_name', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map(normalizeProduct)
}

/**
 * Fetch products via /api/products (dev Vite proxy or production serverless).
 */
async function fetchProductsViaApi() {
  const response = await fetch('/api/products')

  if (response.status === 404) {
    throw new Error(SETUP_HINT)
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || SETUP_HINT)
  }

  const data = await response.json()
  return (data ?? []).map(normalizeProduct)
}

/**
 * Fetch catalog metadata only — images load lazily per product.
 */
export async function fetchProducts() {
  try {
    const direct = await fetchProductsDirect()
    if (direct.length > 0) {
      return direct
    }
  } catch (err) {
    console.warn('Direct Supabase fetch failed:', err.message)
  }

  try {
    const viaApi = await fetchProductsViaApi()
    if (viaApi.length > 0) {
      return viaApi
    }
  } catch (err) {
    throw new Error(err.message || SETUP_HINT)
  }

  throw new Error(SETUP_HINT)
}

/** Fetch a single product image (lazy load). */
export async function fetchProductImageBase64(productId) {
  const { data, error } = await supabase
    .from('whatsapp_bot_items')
    .select(PRODUCT_IMAGE_SELECT)
    .eq('id', productId)
    .eq('company', 'spark')
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data?.image_base64 ?? null
}
