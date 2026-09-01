import { Link } from 'react-router-dom'
import Rating from './Rating'

export default function ProductCard({ product }) {
  const { id, name, image, price, oldPrice, discount, rating } = product
  return (
    <Link to={`/product/${id}`} className="group block">
      <div className="aspect-square w-full overflow-hidden rounded-[13px] sm:rounded-[20px] bg-stone-bg">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover object-center mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <h3 className="mt-3 sm:mt-4 truncate text-base sm:text-xl font-bold">{name}</h3>
      <div className="mt-1 sm:mt-2">
        <Rating value={rating} size={16} />
      </div>
      <div className="mt-1 sm:mt-2 flex items-center gap-1.5 sm:gap-3">
        <span className="text-lg sm:text-2xl font-bold">${price}</span>
        {oldPrice && (
          <span className="text-lg sm:text-2xl font-bold text-black/30 line-through">
            ${oldPrice}
          </span>
        )}
        {discount > 0 && (
          <span className="rounded-full bg-sale/10 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-medium text-sale">
            -{discount}%
          </span>
        )}
      </div>
    </Link>
  )
}
