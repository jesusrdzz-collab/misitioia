export function Stars({ rating, color }: { rating: number; color: string }) {
  const rounded = Math.round(rating)
  return (
    <span className="inline-flex" aria-label={`${rating} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="18" height="18" viewBox="0 0 20 20" aria-hidden>
          <path
            d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.77l-5.2 2.73.99-5.79L1.58 7.62l5.82-.85L10 1.5z"
            fill={i < rounded ? color : 'rgba(0,0,0,0.12)'}
          />
        </svg>
      ))}
    </span>
  )
}
