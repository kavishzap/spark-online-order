import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductImage from '../components/ProductImage'
import { useCart } from '../context/CartContext'
import { useCheckoutSession } from '../hooks/useCheckoutSession'
import { formatPrice } from '../utils/format'
import { formatPhoneForDisplay } from '../utils/phone'
import { redirectToWhatsAppWithOrderRef } from '../utils/whatsapp'
import { createOrder } from '../services/orders'

export default function Checkout() {
  const navigate = useNavigate()
  const {
    session,
    phone: whatsAppPhone,
    name: whatsAppName,
    fromWhatsApp,
    lockedName,
    lockedPhone,
    loading: sessionLoading,
    error: sessionError,
  } = useCheckoutSession()
  const {
    items,
    subtotal,
    deliveryFee,
    discountAmount,
    showBottleDeliveryNote,
    bottleFreeDeliveryMessage,
    total,
    giftCardCode,
    refillGiftCardCode,
    giftCardMessage,
    applyGiftCard,
    removeGiftCard,
    clearCart,
    updateQuantity,
    removeFromCart,
  } = useCart()

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    notes: '',
  })
  const [errors, setErrors] = useState({})
  const [giftCardInput, setGiftCardInput] = useState('')
  const [showGiftCard, setShowGiftCard] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!session) return
    setForm((prev) => ({
      ...prev,
      fullName: session.name || prev.fullName || '',
      phone: session.phone || prev.phone || '',
    }))
  }, [session])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const next = {}
    if (!form.fullName.trim()) next.fullName = 'Full name is required'
    if (!form.phone.trim()) next.phone = 'Phone number is required'
    if (!form.address.trim()) next.address = 'Address is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleApplyGiftCard = () => {
    if (!giftCardInput.trim()) return
    applyGiftCard(giftCardInput)
  }

  const handleGiftCardToggle = (e) => {
    const checked = e.target.checked
    setShowGiftCard(checked)
    if (!checked) {
      setGiftCardInput('')
      removeGiftCard()
    }
  }

  const handleDecreaseQuantity = (item) => {
    if (item.quantity <= 1) {
      removeFromCart(item.id)
      return
    }
    updateQuantity(item.id, item.quantity - 1)
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (!validate()) return
    if (items.length === 0) return

    setSubmitting(true)
    setErrors((prev) => ({ ...prev, submit: '' }))

    try {
      const { order_ref: orderRef } = await createOrder({
        customer: form,
        items,
        total,
        deliveryFee,
        discountAmount,
      })

      navigate('/', { replace: true })
      clearCart()
      redirectToWhatsAppWithOrderRef(orderRef)
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit: err.message || 'Failed to place order. Please try again.',
      }))
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="page">
        <Header showSearch={false} searchQuery="" onSearchChange={() => {}} />
        <main className="checkout checkout--empty">
          <div className="checkout__empty">
            <h1>Your cart is empty</h1>
            <p>Add some products before checking out.</p>
            <Link to="/" className="btn btn--primary">
              Back to Store
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="page">
      <Header showSearch={false} searchQuery="" onSearchChange={() => {}} />

      <main className="checkout">
        <div className="checkout__header">
          <Link to="/" className="checkout__back">
            ← Continue shopping
          </Link>
          <h1 className="checkout__title">Checkout</h1>
        </div>

        {sessionLoading && (
          <p className="checkout__whatsapp-note">Verifying your WhatsApp checkout link…</p>
        )}

        {sessionError && (
          <p className="checkout__whatsapp-note checkout__whatsapp-note--error" role="alert">
            {sessionError}
          </p>
        )}

        {fromWhatsApp && !sessionLoading && (
          <p className="checkout__whatsapp-note">
            Ordering as {whatsAppName ? `${whatsAppName} · ` : ''}
            {formatPhoneForDisplay(whatsAppPhone)} — finish on WhatsApp after checkout.
          </p>
        )}

        <div className="checkout__layout">
          <section className="checkout__form-section">
            <h2 className="checkout__section-title">Delivery Details</h2>
            <form className="checkout-form" onSubmit={handlePlaceOrder} noValidate>
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className={errors.fullName ? 'input--error' : ''}
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  autoComplete="name"
                  readOnly={lockedName}
                  aria-readonly={lockedName}
                />
                {lockedName && (
                  <span className="form-hint">From your WhatsApp profile — cannot be changed.</span>
                )}
                {errors.fullName && <span className="form-error">{errors.fullName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={errors.phone ? 'input--error' : ''}
                  value={lockedPhone ? formatPhoneForDisplay(form.phone) : form.phone}
                  onChange={handleChange}
                  placeholder="52525252"
                  autoComplete="tel"
                  readOnly={lockedPhone}
                  aria-readonly={lockedPhone}
                />
                {lockedPhone && (
                  <span className="form-hint">From WhatsApp — use the same number to confirm your order.</span>
                )}
                {errors.phone && <span className="form-error">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="address">Address *</label>
                <textarea
                  id="address"
                  name="address"
                  className={errors.address ? 'input--error' : ''}
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Street, city, postal code"
                  autoComplete="street-address"
                  rows={3}
                />
                {errors.address && <span className="form-error">{errors.address}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes (optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Delivery instructions, preferred time, etc."
                  rows={2}
                />
              </div>

              <div className="form-group form-group--checkbox">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={showGiftCard}
                    onChange={handleGiftCardToggle}
                  />
                  <span>Do you have a gift card?</span>
                </label>
              </div>

              {showGiftCard && (
                <div className="form-group checkout-form__gift-card">
                  <div className="gift-card-form">
                    <input
                      type="text"
                      className="gift-card-form__input"
                      placeholder="Gift card code"
                      value={giftCardInput}
                      onChange={(e) => setGiftCardInput(e.target.value)}
                      aria-label="Gift card code"
                    />
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      onClick={handleApplyGiftCard}
                    >
                      Apply
                    </button>
                  </div>

                  {giftCardMessage && (
                    <p
                      className={`gift-card-form__message gift-card-form__message--${giftCardMessage.type}`}
                    >
                      {giftCardMessage.text}
                    </p>
                  )}

                  {giftCardCode && (
                    <div className="gift-card-applied">
                      <span>
                        Code: <strong>{giftCardCode}</strong>
                      </span>
                      <button
                        type="button"
                        className="gift-card-applied__remove"
                        onClick={removeGiftCard}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}

              {errors.submit && (
                <p className="form-error checkout-form__submit-error" role="alert">
                  {errors.submit}
                </p>
              )}

              <button
                type="submit"
                className="btn btn--primary btn--full checkout-form__submit"
                disabled={submitting || sessionLoading}
              >
                {submitting ? 'Saving order…' : 'Save order & continue on WhatsApp'}
              </button>
            </form>
          </section>

          <aside className="checkout__summary">
            <h2 className="checkout__section-title">Order Summary</h2>

            <ul className="summary-items">
              {items.map((item) => (
                <li key={item.id} className="summary-item">
                  <div className="summary-item__image-wrap">
                    <ProductImage
                      productId={item.productId}
                      imageBase64={item.image_base64}
                      className="summary-item__image"
                      skeletonClassName="summary-item__image-skeleton"
                      eager
                    />
                  </div>
                  <div className="summary-item__details">
                    <span className="summary-item__name">
                      {item.name}
                      {item.color && (
                        <span className="summary-item__color"> ({item.color})</span>
                      )}
                    </span>
                    <div className="summary-item__footer">
                      {item.isGiftRefill ? (
                        <span className="summary-item__gift-tag">Qty 1</span>
                      ) : (
                        <div className="quantity-control quantity-control--compact">
                          <button
                            type="button"
                            className="quantity-control__btn"
                            onClick={() => handleDecreaseQuantity(item)}
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            −
                          </button>
                          <span className="quantity-control__value">{item.quantity}</span>
                          <button
                            type="button"
                            className="quantity-control__btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            +
                          </button>
                        </div>
                      )}
                      <span className="summary-item__price">
                        {item.isGiftRefill
                          ? 'Free'
                          : formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {refillGiftCardCode && (
              <div className="gift-card-applied">
                <span>Refill card: <strong>{refillGiftCardCode}</strong></span>
              </div>
            )}

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
              {discountAmount > 0 && (
                <div className="cart-totals__row cart-totals__row--discount">
                  <span>Gift card discount</span>
                  <span>−{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="cart-totals__row cart-totals__row--total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  )
}
