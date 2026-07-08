import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { CheckoutSessionProvider } from './hooks/useCheckoutSession'
import Cart from './components/Cart'
import CartToast from './components/CartToast'
import ScrollToTop from './components/ScrollToTop'
import SplashScreen from './components/SplashScreen'
import Store from './pages/Store'
import Checkout from './pages/Checkout'
import Contact from './pages/Contact'
import OrderSuccess from './pages/OrderSuccess'

export default function App() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <CartProvider>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <BrowserRouter>
        <ScrollToTop />
        <CheckoutSessionProvider>
          <Routes>
            <Route path="/" element={<Store />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/order-success" element={<OrderSuccess />} />
          </Routes>
          <Cart />
          <CartToast />
        </CheckoutSessionProvider>
      </BrowserRouter>
    </CartProvider>
  )
}
