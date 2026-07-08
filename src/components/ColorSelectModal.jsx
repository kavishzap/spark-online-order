import { useEffect, useState } from 'react'
import { formatPrice } from '../utils/format'
import ColorSelector, { getDefaultColor } from './ColorSelector'
import ProductImage from './ProductImage'

export default function ColorSelectModal({ product, colors, isOpen, onClose, onConfirm }) {
  const [selectedColor, setSelectedColor] = useState(() => getDefaultColor(product))
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && product) {
      setSelectedColor(getDefaultColor(product))
      setError('')
    }
  }, [isOpen, product])

  useEffect(() => {
    if (!isOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen || !product) return null

  const handleConfirm = () => {
    if (!selectedColor) {
      setError('Please select a color.')
      return
    }
    onConfirm(selectedColor)
    onClose()
  }

  return (
    <>
      <div className="modal-overlay" onClick={onClose} aria-hidden="true" />
      <div
        className="color-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="color-modal-title"
      >
        <div className="color-modal__header">
          <h2 id="color-modal-title" className="color-modal__title">
            Select a color
          </h2>
          <button
            type="button"
            className="color-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="color-modal__product">
          <ProductImage
            productId={product.id}
            imageBase64={product.image_base64}
            className="color-modal__image"
            skeletonClassName="color-modal__image-skeleton"
            eager
          />
          <div>
            <p className="color-modal__name">{product.name}</p>
            <p className="color-modal__price">{formatPrice(product.price)}</p>
          </div>
        </div>

        <ColorSelector
          colors={colors}
          selected={selectedColor}
          onChange={(color) => {
            setSelectedColor(color)
            setError('')
          }}
          name={product.name}
          variant="modal"
        />

        {error && (
          <p className="color-modal__error" role="alert">
            {error}
          </p>
        )}

        <div className="color-modal__actions">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn--primary" onClick={handleConfirm}>
            Add to Cart
          </button>
        </div>
      </div>
    </>
  )
}
