import { useEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/ProductCardSkeleton'
import StoreHero from '../components/StoreHero'
import { fetchProducts } from '../services/supabase'
import { loadProductImage } from '../services/productImages'

const SKELETON_COUNT = 6

export default function Store() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchProducts()
        if (!cancelled) setProducts(data)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load products')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadProducts()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (products.length === 0) return
    products.slice(0, 6).forEach((product) => {
      loadProductImage(product.id)
    })
  }, [products])

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return products
    return products.filter((p) => p.name.toLowerCase().includes(query))
  }, [products, searchQuery])

  const showEmpty = !loading && !error && filteredProducts.length === 0
  const showGrid = !error && (loading || filteredProducts.length > 0)

  return (
    <div className="page">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="store-page">
        <StoreHero />

        <div className="store">
          {error && (
            <div className="store__error" role="alert">
              <p>{error}</p>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          )}

          {showEmpty && (
            <div className="store__empty">
              <p>
                {searchQuery
                  ? `No products found for "${searchQuery}"`
                  : 'No products available. Run supabase/setup_rls.sql in Supabase SQL Editor to enable public read access.'}
              </p>
            </div>
          )}

          {showGrid && (
            <>
              <h2 className="store__title">Featured Products</h2>
              <div className="product-grid">
                {loading
                  ? Array.from({ length: SKELETON_COUNT }, (_, index) => (
                      <ProductCardSkeleton key={`skeleton-${index}`} />
                    ))
                  : filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
