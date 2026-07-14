import { Link, useLocation, Navigate } from 'react-router-dom'
import Header from '../components/Header'
import Seo from '../components/Seo'
import { PAGE_SEO } from '../config/seo'

export default function OrderSuccess() {
  const location = useLocation()
  const orderRef = location.state?.orderRef

  if (!orderRef) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="page">
      <Seo
        title={PAGE_SEO.orderSuccess.title}
        description={PAGE_SEO.orderSuccess.description}
        path={PAGE_SEO.orderSuccess.path}
        noindex
      />
      <Header showSearch={false} searchQuery="" onSearchChange={() => {}} />

      <main className="checkout checkout--empty">
        <div className="checkout__empty order-success">
          <h1>Order completed</h1>
          <p className="order-success__ref">
            Your order reference is <strong>{orderRef}</strong>
          </p>
          <p>
            Thank you for your order. A sales person will contact you soon for delivery.
          </p>

          <Link to="/" className="btn btn--primary order-success__back">
            Back to store
          </Link>
        </div>
      </main>
    </div>
  )
}
