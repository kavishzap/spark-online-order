import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/format'
import CartItem from './CartItem'

export default function Cart() {
  const [searchParams] = useSearchParams()
  const sessionToken = searchParams.get('s')
  const checkoutPath = sessionToken
    ? `/checkout?s=${encodeURIComponent(sessionToken)}`
    : '/checkout'

  const {
    items,
    subtotal,
    deliveryFee,
    total,
    showBottleDeliveryNote,
    bottleFreeDeliveryMessage,
    isCartOpen,
    closeCart,
  } = useCart()

  if (!isCartOpen) return null

  return (
    <>
      <div className="cart-overlay" onClick={closeCart} aria-hidden="true" />

      <aside className="cart-drawer" role="dialog" aria-label="Shopping cart">
        <div className="cart-drawer__header">
          <h2 className="cart-drawer__title">Your Cart</h2>
          <button
            type="button"
            className="cart-drawer__close"
            onClick={closeCart}
            aria-label="Close cart"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-drawer__empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M6 6h15l-1.5 9H7.5L6 6z" />
              <path d="M6 6 5 3H2" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
            <p>Your cart is empty</p>
            <button type="button" className="btn btn--secondary" onClick={closeCart}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="cart-drawer__items">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            <div className="cart-drawer__footer">
              {showBottleDeliveryNote && (
                <p className="delivery-note">{bottleFreeDeliveryMessage}</p>
              )}

              <div className="cart-totals">
                <div className="cart-totals__row">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="cart-totals__row">
                    <span>Delivery fee</span>
                    <span>{formatPrice(deliveryFee)}</span>
                  </div>
                )}
                <div className="cart-totals__row cart-totals__row--total">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Link
                to={checkoutPath}
                className="btn btn--primary btn--full"
                onClick={closeCart}
              >
                Proceed to Checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
