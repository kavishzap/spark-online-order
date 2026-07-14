import { supabase } from './supabase'
import { toImageSrc } from '../utils/format'

const imageSrcCache = new Map()
const missingCache = new Set()
const inflight = new Map()

const BATCH_WAIT_MS = 40
const BATCH_CHUNK_SIZE = 12

let pendingIds = new Set()
let flushTimer = null
const waiters = new Map() // id -> Array<(src: string|null) => void>

function cacheImage(productId, imageBase64) {
  if (!imageBase64) {
    missingCache.add(productId)
    return null
  }
  missingCache.delete(productId)
  const src = toImageSrc(imageBase64)
  if (src) imageSrcCache.set(productId, src)
  return src
}

function resolveWaiters(productId, src) {
  const resolvers = waiters.get(productId)
  waiters.delete(productId)
  if (!resolvers) return
  resolvers.forEach((resolve) => resolve(src))
}

function addWaiter(productId, resolve) {
  if (!waiters.has(productId)) waiters.set(productId, [])
  waiters.get(productId).push(resolve)
}

export function getCachedProductImageSrc(productId) {
  return imageSrcCache.get(productId) ?? null
}

async function fetchImagesDirect(productIds) {
  const { data, error } = await supabase
    .from('whatsapp_bot_items')
    .select('id,image_base64')
    .in('id', productIds)
    .eq('company', 'spark')
    .eq('is_website', true)

  if (error) throw new Error(error.message)
  return data ?? []
}

async function fetchImagesViaApi(productIds) {
  const params = new URLSearchParams({
    fields: 'image',
    ids: productIds.join(','),
  })
  const response = await fetch(`/api/products?${params}`)

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || 'Failed to load product images')
  }

  const data = await response.json()
  return Array.isArray(data) ? data : []
}

async function fetchImagesBatch(productIds) {
  if (productIds.length === 0) return []

  try {
    const rows = await fetchImagesDirect(productIds)
    const found = new Set(rows.map((row) => row.id).filter(Boolean))
    const missing = productIds.filter((id) => !found.has(id))

    if (rows.length === 0 || missing.length > 0) {
      try {
        const viaApi = await fetchImagesViaApi(missing.length > 0 ? missing : productIds)
        const byId = new Map(rows.map((row) => [row.id, row]))
        for (const row of viaApi) {
          if (row?.id) byId.set(row.id, row)
        }
        return [...byId.values()]
      } catch {
        return rows
      }
    }

    return rows
  } catch {
    return fetchImagesViaApi(productIds)
  }
}

async function fetchChunk(chunk) {
  const promise = fetchImagesBatch(chunk)
    .then((rows) => {
      const byId = new Map(rows.map((row) => [row.id, row.image_base64 ?? null]))
      for (const id of chunk) {
        const src = cacheImage(id, byId.get(id) ?? null)
        resolveWaiters(id, src)
      }
    })
    .catch(() => {
      for (const id of chunk) {
        missingCache.add(id)
        resolveWaiters(id, null)
      }
    })
    .finally(() => {
      for (const id of chunk) {
        // Late waiters attached while this request was in flight
        resolveWaiters(id, getCachedProductImageSrc(id))
        inflight.delete(id)
      }
    })

  for (const id of chunk) {
    inflight.set(id, promise)
  }

  await promise
}

async function flushPendingImages() {
  flushTimer = null
  const ids = [...pendingIds]
  pendingIds = new Set()

  const toFetch = ids.filter((id) => {
    if (imageSrcCache.has(id) || missingCache.has(id)) {
      resolveWaiters(id, getCachedProductImageSrc(id))
      return false
    }
    if (inflight.has(id)) {
      // Already fetching — waiters stay attached and resolve with that request
      return false
    }
    return true
  })

  if (toFetch.length === 0) return

  const chunks = []
  for (let i = 0; i < toFetch.length; i += BATCH_CHUNK_SIZE) {
    chunks.push(toFetch.slice(i, i + BATCH_CHUNK_SIZE))
  }

  await Promise.all(chunks.map((chunk) => fetchChunk(chunk)))
}

function scheduleFlush() {
  if (flushTimer != null) return
  flushTimer = setTimeout(() => {
    flushPendingImages()
  }, BATCH_WAIT_MS)
}

/**
 * Prefetch many product images in one (or few) batched requests.
 */
export function prefetchProductImages(productIds) {
  const ids = [...new Set((productIds || []).filter(Boolean))].filter(
    (id) => !imageSrcCache.has(id) && !missingCache.has(id) && !inflight.has(id),
  )
  if (ids.length === 0) return Promise.resolve()

  ids.forEach((id) => pendingIds.add(id))
  if (flushTimer != null) {
    clearTimeout(flushTimer)
    flushTimer = null
  }
  return flushPendingImages()
}

/** Load and cache a product image by id (coalesced into batched requests). */
export function loadProductImage(productId) {
  if (!productId) return Promise.resolve(null)

  if (imageSrcCache.has(productId)) {
    return Promise.resolve(imageSrcCache.get(productId))
  }

  if (missingCache.has(productId)) {
    return Promise.resolve(null)
  }

  return new Promise((resolve) => {
    addWaiter(productId, resolve)

    if (inflight.has(productId)) {
      return
    }

    pendingIds.add(productId)
    scheduleFlush()
  })
}
