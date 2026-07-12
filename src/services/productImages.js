import { supabase } from './supabase'
import { toImageSrc } from '../utils/format'

const imageBase64Cache = new Map()
const imageSrcCache = new Map()
const inflight = new Map()

function cacheImage(productId, imageBase64) {
  if (!imageBase64) return null
  imageBase64Cache.set(productId, imageBase64)
  const src = toImageSrc(imageBase64)
  if (src) imageSrcCache.set(productId, src)
  return src
}

export function getCachedProductImageSrc(productId) {
  return imageSrcCache.get(productId) ?? null
}

export function getCachedProductImageBase64(productId) {
  return imageBase64Cache.get(productId) ?? null
}

async function fetchProductImageDirect(productId) {
  const { data, error } = await supabase
    .from('whatsapp_bot_items')
    .select('image_base64')
    .eq('id', productId)
    .eq('company', 'spark')
    .eq('is_website', true)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data?.image_base64 ?? null
}

async function fetchProductImageViaApi(productId) {
  const response = await fetch(
    `/api/products?id=${encodeURIComponent(productId)}&fields=image`,
  )

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || 'Failed to load product image')
  }

  const data = await response.json()
  return data?.image_base64 ?? null
}

async function fetchProductImageBase64(productId) {
  try {
    return await fetchProductImageDirect(productId)
  } catch {
    return fetchProductImageViaApi(productId)
  }
}

/** Load and cache a product image by id (deduped in-flight requests). */
export async function loadProductImage(productId) {
  if (!productId) return null

  if (imageSrcCache.has(productId)) {
    return imageSrcCache.get(productId)
  }

  if (inflight.has(productId)) {
    return inflight.get(productId)
  }

  const promise = fetchProductImageBase64(productId)
    .then((imageBase64) => cacheImage(productId, imageBase64))
    .finally(() => {
      inflight.delete(productId)
    })

  inflight.set(productId, promise)
  return promise
}
