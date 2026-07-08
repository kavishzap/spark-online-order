import { useEffect, useRef, useState } from 'react'
import { toImageSrc } from '../utils/format'
import {
  getCachedProductImageSrc,
  loadProductImage,
} from '../services/productImages'

export default function ProductImage({
  productId,
  imageBase64 = null,
  className = '',
  skeletonClassName = 'product-image__skeleton',
  eager = false,
}) {
  const containerRef = useRef(null)
  const [src, setSrc] = useState(() => {
    if (imageBase64) return toImageSrc(imageBase64)
    return getCachedProductImageSrc(productId)
  })
  const [isLoading, setIsLoading] = useState(!src)

  useEffect(() => {
    if (src || !productId) return undefined

    let cancelled = false

    const loadImage = () => {
      loadProductImage(productId)
        .then((nextSrc) => {
          if (cancelled) return
          if (nextSrc) setSrc(nextSrc)
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false)
        })
    }

    if (eager) {
      loadImage()
      return () => {
        cancelled = true
      }
    }

    const container = containerRef.current
    if (!container) return undefined
    if (typeof IntersectionObserver === 'undefined') {
      loadImage()
      return () => {
        cancelled = true
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        loadImage()
      },
      { rootMargin: '240px' },
    )

    observer.observe(container)

    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [productId, src, eager])

  return (
    <div ref={containerRef} className="product-image">
      {isLoading && !src && <div className={skeletonClassName} aria-hidden="true" />}
      {src ? (
        <img
          src={src}
          alt=""
          className={`product-image__img ${className}`.trim()}
          loading="lazy"
          decoding="async"
        />
      ) : (
        !isLoading && (
          <div className="product-card__placeholder" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )
      )}
    </div>
  )
}
