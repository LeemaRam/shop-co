import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import Rating from '../components/Rating'
import ProductCard from '../components/ProductCard'
import api from '../services/api'
import { adaptProduct, adaptProducts, adaptReview } from '../services/adapters'
import { useCart } from '../context/CartContext'
import { humanizeColor } from '../utils/color'
import {
  ChevronRight,
  MinusIcon,
  PlusIcon,
  CheckIcon,
  CheckBadge,
  DotsIcon,
  SlidersIcon,
  ChevronDown,
} from '../components/Icons'

function Gallery({ images, name }) {
  const [active, setActive] = useState(0)
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:gap-3.5">
      <div className="flex gap-3 sm:flex-col sm:gap-3.5">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-[106px] w-full overflow-hidden rounded-[20px] bg-[#F0F0F0] sm:h-[168px] sm:w-[152px] ${
              active === i ? 'ring-2 ring-black' : ''
            }`}
          >
            <img
              src={img}
              alt={`${name} view ${i + 1}`}
              className="h-full w-full object-cover mix-blend-multiply"
            />
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden rounded-[20px] bg-[#F0F0F0]">
        <img
          src={images[active]}
          alt={name}
          className="h-full max-h-[530px] w-full object-cover mix-blend-multiply"
        />
      </div>
    </div>
  )
}

function ReviewCard({ review }) {
  return (
    <div className="rounded-[20px] border border-black/10 p-6 sm:p-8">
      <div className="flex items-start justify-between">
        <Rating value={review.rating} size={20} showValue={false} />
        <button aria-label="Options" className="text-black/40">
          <DotsIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="mt-3 flex items-center gap-1 text-xl font-bold">
        {review.name}
        <CheckBadge className="h-5 w-5" />
      </div>
      <p className="mt-2 text-sm leading-6 text-black/60">“{review.text}”</p>
      <p className="mt-4 text-sm font-medium text-black/60">
        Posted on {review.date}
      </p>
    </div>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [alsoLike, setAlsoLike] = useState([])
  const [color, setColor] = useState(0)
  const [size, setSize] = useState('Large')
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('reviews')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let active = true
    setProduct(null)
    setNotFound(false)
    setError('')
    setQty(1)

    api
      .product(id)
      .then((r) => {
        if (!active) return
        const p = adaptProduct(r.data)
        setProduct(p)
        setColor(0)
        setSize(p.sizes?.includes('Large') ? 'Large' : p.sizes?.[0] || 'Large')
      })
      .catch(() => active && setNotFound(true))

    api
      .productReviews(id)
      .then((r) => active && setReviews((r.data ?? []).map(adaptReview)))
      .catch(() => {})

    api
      .featured()
      .then((r) => active && setAlsoLike(adaptProducts(r.data).slice(0, 4)))
      .catch(() => {})

    return () => {
      active = false
    }
  }, [id])

  const handleAddToCart = async () => {
    if (!product) return
    setError('')
    const chosenColor = product.colors[color]
    const variant =
      product.variants.find((v) => v.size === size && v.color === chosenColor) ||
      product.variants.find((v) => v.size === size) ||
      product.variants[0]

    if (!variant) {
      setError('This product is currently unavailable.')
      return
    }

    try {
      setAdding(true)
      await addItem({ productId: product.productId, variantId: variant.id, quantity: qty })
      navigate('/cart')
    } catch (e) {
      setError(e.message || 'Could not add to cart.')
    } finally {
      setAdding(false)
    }
  }

  if (notFound) {
    return (
      <div className="container-shop py-20 text-center">
        <p className="text-lg text-black/60">Product not found.</p>
        <Link to="/shop" className="mt-6 inline-block rounded-full bg-black px-10 py-3.5 text-sm font-medium text-white">
          Continue Shopping
        </Link>
      </div>
    )
  }

  if (!product) {
    return <div className="container-shop py-20 text-center text-black/40">Loading…</div>
  }

  const tabs = [
    { key: 'details', label: 'Product Details' },
    { key: 'reviews', label: 'Rating & Reviews' },
    { key: 'faqs', label: 'FAQs' },
  ]

  return (
    <div className="container-shop py-5 sm:py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-black/60">
        <Link to="/" className="hover:text-black">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/shop" className="hover:text-black">Shop</Link>
        <ChevronRight className="h-4 w-4" />
        <span>Men</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-black">T-shirts</span>
      </nav>

      {/* Product */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:gap-10">
        <Gallery images={product.gallery} name={product.name} />

        <div>
          <h1 className="display text-[28px] leading-[1.05] sm:text-[40px]">
            {product.name}
          </h1>
          <div className="mt-3">
            <Rating value={product.rating} size={20} />
          </div>
          <div className="mt-3.5 flex items-center gap-3">
            <span className="text-2xl font-bold sm:text-[32px]">${product.price}</span>
            {product.oldPrice && (
              <span className="text-2xl font-bold text-black/30 line-through sm:text-[32px]">
                ${product.oldPrice}
              </span>
            )}
            {product.discount > 0 && (
              <span className="rounded-full bg-sale/10 px-3 py-1.5 text-sm font-medium text-sale sm:text-base">
                -{product.discount}%
              </span>
            )}
          </div>
          <p className="mt-4 text-sm leading-6 text-black/60 sm:mt-5">
            {product.description}
          </p>

          <hr className="my-5 border-black/10 sm:my-6" />

          {/* Colors */}
          <div>
            <p className="text-sm text-black/60 sm:text-base">Select Colors</p>
            <div className="mt-4 flex gap-3.5">
              {product.colors.map((c, i) => (
                <button
                  key={c}
                  onClick={() => setColor(i)}
                  aria-label={humanizeColor(c)}
                  title={humanizeColor(c)}
                  className="flex h-9 w-9 items-center justify-center rounded-full"
                  style={{ backgroundColor: c }}
                >
                  {color === i && <CheckIcon className="h-4 w-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <hr className="my-5 border-black/10 sm:my-6" />

          {/* Sizes */}
          <div>
            <p className="text-sm text-black/60 sm:text-base">Choose Size</p>
            <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`rounded-full px-5 py-2.5 text-sm transition sm:px-6 sm:py-3 ${
                    size === s
                      ? 'bg-black text-white'
                      : 'bg-[#F0F0F0] text-black/60 hover:bg-black/5'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <hr className="my-5 border-black/10 sm:my-6" />

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex items-center justify-between gap-4 rounded-full bg-[#F0F0F0] px-5 py-3.5 sm:px-6">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <MinusIcon className="h-5 w-5" />
              </button>
              <span className="w-6 text-center font-medium">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="flex-1 rounded-full bg-black py-3.5 text-center text-sm font-medium text-white transition hover:bg-black/90 disabled:opacity-60 sm:text-base"
            >
              {adding ? 'Adding…' : 'Add to Cart'}
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-sale">{error}</p>}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12 sm:mt-16">
        <div className="grid grid-cols-3 border-b border-black/10">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`-mb-px pb-4 text-center text-sm sm:text-xl ${
                tab === t.key
                  ? 'border-b-2 border-black font-medium text-black'
                  : 'text-black/60'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'reviews' && (
          <div className="mt-6 sm:mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold sm:text-2xl">
                All Reviews{' '}
                <span className="text-base font-normal text-black/60">({reviews.length})</span>
              </h2>
              <div className="flex items-center gap-2.5">
                <button className="hidden h-10 w-10 items-center justify-center rounded-full bg-[#F0F0F0] sm:flex">
                  <SlidersIcon className="h-5 w-5" />
                </button>
                <button className="hidden items-center gap-2 rounded-full bg-[#F0F0F0] px-5 py-2.5 text-sm font-medium sm:flex">
                  Latest <ChevronDown className="h-4 w-4" />
                </button>
                <button className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white sm:px-6">
                  Write a Review
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {reviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
            {reviews.length === 0 && (
              <p className="mt-6 text-sm text-black/60">No reviews yet.</p>
            )}

            <div className="mt-9 flex justify-center">
              <button className="rounded-full border border-black/10 px-12 py-3.5 text-sm font-medium transition hover:bg-black/5">
                Load More Reviews
              </button>
            </div>
          </div>
        )}

        {tab === 'details' && (
          <div className="mt-6 text-sm leading-7 text-black/70 sm:mt-8">
            <p>{product.description}</p>
            <ul className="mt-4 list-disc space-y-1 pl-5">
              <li>Material: 100% premium combed cotton</li>
              <li>Regular fit with a classic crew neckline</li>
              <li>Machine washable, pre-shrunk fabric</li>
              <li>Available in {product.colors.length} colors and {product.sizes.length} sizes</li>
            </ul>
          </div>
        )}

        {tab === 'faqs' && (
          <div className="mt-6 space-y-4 text-sm leading-7 text-black/70 sm:mt-8">
            <div>
              <p className="font-bold text-black">What is the delivery time?</p>
              <p>Standard delivery takes 3–5 business days. Express options are available at checkout.</p>
            </div>
            <div>
              <p className="font-bold text-black">Can I return this item?</p>
              <p>Yes, we offer free returns within 30 days of purchase on unworn items with tags attached.</p>
            </div>
            <div>
              <p className="font-bold text-black">How do I choose my size?</p>
              <p>Use the size guide on the product page. If you are between sizes we recommend sizing up.</p>
            </div>
          </div>
        )}
      </div>

      {/* You might also like */}
      <section className="mt-14 sm:mt-20">
        <h2 className="display text-center text-[32px] leading-none sm:text-[46px]">
          You might also like
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:mt-14 lg:grid-cols-4 lg:gap-5">
          {alsoLike.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  )
}
