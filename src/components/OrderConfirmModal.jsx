import { useEffect } from 'react'
import { formatPrice } from '../utils/format'

export default function OrderConfirmModal({
  isOpen,
  step,
  total,
  orderRef,
  submitting,
  error,
  onClose,
  onConfirm,
  onBackToStore,
}) {
  useEffect(() => {
    if (!isOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape' && step !== 'success' && !submitting) onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose, step, submitting])

  if (!isOpen) return null

  const isSuccess = step === 'success'

  return (
    <>
      <div
        className="modal-overlay"
        onClick={isSuccess || submitting ? undefined : onClose}
        aria-hidden="true"
      />
      <div
        className={`order-modal${isSuccess ? ' order-modal--success' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modal-title"
      >
        <div className="order-modal__header">
          <h2 id="order-modal-title" className="order-modal__title">
            {isSuccess ? 'Order completed' : 'Confirm your order'}
          </h2>
          {!isSuccess && !submitting && (
            <button
              type="button"
              className="order-modal__close"
              onClick={onClose}
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {isSuccess ? (
          <>
            <div className="order-modal__success-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="m8 12 3 3 5-6" />
              </svg>
            </div>
            <p className="order-modal__message">
              Thank you for your order. A sales person will contact you soon for delivery.
            </p>
            {orderRef && (
              <p className="order-modal__ref">
                Order reference: <strong>{orderRef}</strong>
              </p>
            )}
            <div className="order-modal__actions">
              <button type="button" className="btn btn--primary btn--full" onClick={onBackToStore}>
                Back to store
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="order-modal__message">
              Please review your details. Once confirmed, we&apos;ll save your order and our team
              will follow up with you shortly.
            </p>
            <p className="order-modal__total">
              Total: <strong>{formatPrice(total)}</strong>
            </p>
            {error && (
              <p className="order-modal__error" role="alert">
                {error}
              </p>
            )}
            <div className="order-modal__actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={onConfirm}
                disabled={submitting}
              >
                {submitting ? 'Saving order…' : 'Confirm order'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
