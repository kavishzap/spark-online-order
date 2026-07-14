import { toImageSrc } from '../utils/format'

const imageSrcCache = new Map()
const inflight = new Map()

/** Max parallel image requests (each image is large base64). */
const MAX_CONCURRENT = 3

const queue = []
let active = 0

function cacheImage(productId, imageBase64) {
  if (!imageBase64) return null
  const src = toImageSrc(imageBase64)
  if (src) imageSrcCache.set(productId, src)
  return src
}

export function getCachedProductImageSrc(productId) {
  return imageSrcCache.get(productId) ?? null
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

function pumpQueue() {
  while (active < MAX_CONCURRENT && queue.length > 0) {
    const job = queue.shift()
    active += 1

    const run = fetchProductImageViaApi(job.productId)
      .then((imageBase64) => {
        const src = cacheImage(job.productId, imageBase64)
        job.resolve(src)
        return src
      })
      .catch(() => {
        job.resolve(null)
        return null
      })
      .finally(() => {
        inflight.delete(job.productId)
        active -= 1
        pumpQueue()
      })

    inflight.set(job.productId, run)
  }
}

/**
 * Prefetch images with a concurrency limit (avoids huge batch payloads).
 */
export function prefetchProductImages(productIds) {
  const ids = [...new Set((productIds || []).filter(Boolean))]
  return Promise.all(ids.map((id) => loadProductImage(id)))
}

/** Load and cache a product image by id (queued, concurrency-limited). */
export function loadProductImage(productId) {
  if (!productId) return Promise.resolve(null)

  if (imageSrcCache.has(productId)) {
    return Promise.resolve(imageSrcCache.get(productId))
  }

  if (inflight.has(productId)) {
    return inflight.get(productId)
  }

  const promise = new Promise((resolve) => {
    queue.push({ productId, resolve })
    pumpQueue()
  })

  // Placeholder so duplicate calls wait on the same result once queued
  inflight.set(
    productId,
    promise.then((src) => src),
  )

  return promise
}
