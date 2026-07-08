import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartToast() {
  const { cartToast, dismissCartToast, openCart } = useCart()

  if (!cartToast) return null

  const handleViewCart = () => {
    openCart()
    dismissCartToast()
  }

  return (
    <div className="cart-toast" role="status" aria-live="polite">
      <div className="cart-toast__body">
        <p className="cart-toast__title">Added to cart</p>
        <p className="cart-toast__name">{cartToast.productName}</p>
      </div>
      <div className="cart-toast__actions">
        <button type="button" className="cart-toast__link" onClick={handleViewCart}>
          View cart
        </button>
        <Link to="/checkout" className="cart-toast__link cart-toast__link--primary" onClick={dismissCartToast}>
          Checkout
        </Link>
      </div>
    </div>
  )
}
