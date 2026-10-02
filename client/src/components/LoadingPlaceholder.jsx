function LoadingPlaceholder({ label = 'Loading content' }) {
  return (
    <div className="loading-area" role="status" aria-label={label} aria-busy="true">
      <span className="visually-hidden">{label}</span>
      <div className="loading-card loading-card-wide">
        <span className="skeleton skeleton-tag" />
        <span className="skeleton skeleton-line" />
        <span className="skeleton skeleton-line skeleton-line-short" />
      </div>
      <div className="loading-card">
        <span className="skeleton skeleton-image" />
        <span className="skeleton skeleton-line" />
        <span className="skeleton skeleton-line skeleton-line-short" />
      </div>
      <div className="loading-card">
        <span className="skeleton skeleton-image" />
        <span className="skeleton skeleton-line" />
        <span className="skeleton skeleton-line skeleton-line-short" />
      </div>
    </div>
  )
}

export default LoadingPlaceholder