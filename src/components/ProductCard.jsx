import { useState } from 'react'
import { formatPrice } from '../utils/format'
import { getProductColors, productHasColors } from '../utils/colors'
import { useCart } from '../context/CartContext'
import ColorSelectModal from './ColorSelectModal'
import ProductImage from './ProductImage'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const colors = getProductColors(product)
  const hasColors = productHasColors(product)
  const [modalOpen, setModalOpen] = useState(false)

  const handleAddToCart = () => {
    if (hasColors) {
      setModalOpen(true)
      return
    }
    addToCart(product, null)
  }

  const handleColorConfirm = (selectedColor) => {
    addToCart(product, selectedColor)
  }

  return (
    <>
      <article className="product-card">
        <button
          type="button"
          className="product-card__image-wrap product-card__image-btn"
          onClick={handleAddToCart}
          aria-label={`Add ${product.name} to cart`}
        >
          <ProductImage
            productId={product.id}
            imageBase64={product.image_base64}
            className="product-card__image"
            skeletonClassName="product-card__image-skeleton"
          />
        </button>

        <div className="product-card__body">
          <h3 className="product-card__name">{product.name}</h3>
          <p className="product-card__price">{formatPrice(product.price)}</p>
          {product.description?.trim() && (
            <p className="product-card__description" title={product.description.trim()}>
              {product.description.trim()}
            </p>
          )}
          {hasColors && (
            <p className="product-card__colors-hint">{colors.length} colors available</p>
          )}
          <button
            type="button"
            className="btn btn--primary product-card__btn"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </div>
      </article>

      {hasColors && (
        <ColorSelectModal
          product={product}
          colors={colors}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleColorConfirm}
        />
      )}
    </>
  )
}
