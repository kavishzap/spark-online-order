import { useEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/ProductCardSkeleton'
import Seo from '../components/Seo'
import StoreHero from '../components/StoreHero'
import { PAGE_SEO } from '../config/seo'
import { fetchProducts } from '../services/supabase'
import { prefetchProductImages } from '../services/productImages'

const SKELETON_COUNT = 6
const PREFETCH_COUNT = 24

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
    prefetchProductImages(products.slice(0, PREFETCH_COUNT).map((product) => product.id))
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
      <Seo
        title={PAGE_SEO.home.title}
        description={PAGE_SEO.home.description}
        path={PAGE_SEO.home.path}
      />
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="store-page">
        <StoreHero />

        <section className="store-intro" aria-labelledby="store-intro-title">
          <h1 id="store-intro-title" className="store-intro__title">
            Spark Mauritius — Online Store &amp; One-Stop Shop in Mauritius
          </h1>
          <p className="store-intro__text">
            Welcome to Spark Mauritius, your one-stop online shop for a wide range of high-quality
            products delivered right to your doorstep. Shop online across Mauritius with fast WhatsApp
            support from our Curepipe base.
          </p>
        </section>

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
                  : filteredProducts.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        priority={index < 4}
                      />
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
