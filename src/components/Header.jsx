import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const LOGO_SRC = '/logo.png'
const APP_NAME = 'Spark Mauritius Order Platform'

export default function Header({ searchQuery, onSearchChange, showSearch = true }) {
  const { itemCount, openCart } = useCart()

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__brand" aria-label={`${APP_NAME} home`}>
          <img src={LOGO_SRC} alt={APP_NAME} className="header__logo-img" />
        </Link>

        {showSearch ? (
          <div className="header__center">
            <div className="header__search">
              <svg
                className="header__search-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="search"
                className="header__search-input"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                aria-label="Search products"
              />
            </div>
          </div>
        ) : (
          <div className="header__center" />
        )}

        <div className="header__right">
          <button
            type="button"
            className="header__cart-btn"
            onClick={openCart}
            aria-label={`Open cart, ${itemCount} items`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6h15l-1.5 9H7.5L6 6z" />
              <path d="M6 6 5 3H2" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
            {itemCount > 0 && (
              <span className="header__cart-badge">{itemCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
