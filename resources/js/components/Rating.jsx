// Star rating row using yellow stars, supports half stars.

function Star({ fill = 'full', size = 18 }) {
  const id = `star-${Math.random().toString(36).slice(2)}`
  const yellow = '#FFC633'
  const empty = '#FFC633'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="shrink-0">
      {fill === 'half' && (
        <defs>
          <linearGradient id={id}>
            <stop offset="50%" stopColor={yellow} />
            <stop offset="50%" stopColor="rgba(255,198,51,0.25)" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M12 2.5l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.4 6.2 20.4l1.1-6.45-4.7-4.6 6.5-.95L12 2.5z"
        fill={
          fill === 'full'
            ? yellow
            : fill === 'half'
            ? `url(#${id})`
            : 'rgba(255,198,51,0.25)'
        }
      />
    </svg>
  )
}

export default function Rating({ value = 0, size = 18, showValue = true, className = '' }) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    if (value >= i) stars.push('full')
    else if (value >= i - 0.5) stars.push('half')
    else stars.push('empty')
  }
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-0.5">
        {stars.map((f, i) => (
          <Star key={i} fill={f} size={size} />
        ))}
      </div>
      {showValue && (
        <span className="text-sm text-black/60">
          <span className="text-black">{value.toFixed(1)}</span>/5
        </span>
      )}
    </div>
  )
}
