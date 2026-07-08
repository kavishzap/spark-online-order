export default function ProductCardSkeleton() {
  return (
    <article className="product-card product-card--skeleton" aria-hidden="true">
      <div className="product-card__image-wrap product-card__image-skeleton" />
      <div className="product-card__body">
        <div className="product-card__skeleton-line product-card__skeleton-line--title" />
        <div className="product-card__skeleton-line product-card__skeleton-line--price" />
        <div className="product-card__skeleton-line product-card__skeleton-line--text" />
        <div className="product-card__skeleton-btn" />
      </div>
    </article>
  )
}
