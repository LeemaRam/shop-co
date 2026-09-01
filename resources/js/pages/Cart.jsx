import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useCart } from '../context/CartContext'
import { humanizeColor } from '../utils/color'
import {
  ChevronRight,
  TrashIcon,
  MinusIcon,
  PlusIcon,
  TagIcon,
  ArrowRight,
} from '../components/Icons'

function CartRow({ item, onQty, onRemove }) {
  return (
    <div className="flex gap-3.5 py-5 sm:gap-4">
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[9px] bg-[#F0F0F0] sm:h-[124px] sm:w-[124px]">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover mix-blend-multiply"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold sm:text-xl">{item.name}</h3>
            <p className="mt-1 text-xs sm:text-sm">
              Size: <span className="text-black/60">{item.size}</span>
            </p>
            <p className="mt-1 text-xs sm:text-sm">
              Color: <span className="text-black/60">{humanizeColor(item.color)}</span>
            </p>
          </div>
          <button
            onClick={() => onRemove(item.uid)}
            aria-label={`Remove ${item.name}`}
            className="text-sale"
          >
            <TrashIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-xl font-bold sm:text-2xl">${item.price}</span>
          <div className="flex items-center justify-between gap-4 rounded-full bg-[#F0F0F0] px-4 py-2 sm:px-5 sm:py-3">
            <button
              onClick={() => onQty(item.uid, -1)}
              aria-label="Decrease quantity"
            >
              <MinusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <span className="w-5 text-center text-sm font-medium">{item.quantity}</span>
            <button onClick={() => onQty(item.uid, 1)} aria-label="Increase quantity">
              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Cart() {
  const { items, loading, updateItem, removeItem, subtotal } = useCart()
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(null)
  const [appliedCode, setAppliedCode] = useState('')
  const [couponError, setCouponError] = useState('')

  const updateQty = (uid, delta) => {
    const item = items.find((it) => it.uid === uid)
    if (!item) return
    const next = Math.max(1, item.quantity + delta)
    if (next === item.quantity) return
    updateItem(item.id, next).catch(() => {})
  }

  const removeCartItem = (uid) => {
    const item = items.find((it) => it.uid === uid)
    if (item) removeItem(item.id).catch(() => {})
  }

  const applyCoupon = async (e) => {
    e.preventDefault()
    setCouponError('')
    if (!couponCode.trim()) return
    try {
      const res = await api.validateCoupon(couponCode.trim(), subtotal)
      setCouponDiscount(res.data.discount)
      setAppliedCode(res.data.code)
    } catch (err) {
      setCouponDiscount(null)
      setAppliedCode('')
      setCouponError(err.message || 'Invalid coupon code.')
    }
  }

  // The design shows a promotional 20% discount by default; a validated coupon
  // (checked server-side) overrides it with the authoritative backend amount.
  const discount = couponDiscount != null ? couponDiscount : Math.round(subtotal * 0.2)
  const delivery = items.length ? 15 : 0
  const total = Math.max(0, subtotal - discount + delivery)

  return (
    <div className="container-shop py-5 sm:py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-black/60">
        <Link to="/" className="hover:text-black">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-black">Cart</span>
      </nav>

      <h1 className="display mt-4 text-[32px] leading-none sm:mt-6 sm:text-[40px]">
        Your cart
      </h1>

      {loading ? (
        <div className="mt-6 rounded-[20px] border border-black/10 p-12 text-center">
          <p className="text-lg text-black/40">Loading…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-[20px] border border-black/10 p-12 text-center">
          <p className="text-lg text-black/60">Your cart is empty.</p>
          <Link
            to="/shop"
            className="mt-6 inline-block rounded-full bg-black px-10 py-3.5 text-sm font-medium text-white"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-5 lg:flex-row">
          {/* Items */}
          <div className="flex-1 divide-y divide-black/10 rounded-[20px] border border-black/10 px-4 sm:px-6">
            {items.map((item) => (
              <CartRow
                key={item.uid}
                item={item}
                onQty={updateQty}
                onRemove={removeCartItem}
              />
            ))}
          </div>

          {/* Summary */}
          <div className="w-full shrink-0 rounded-[20px] border border-black/10 p-5 sm:p-6 lg:w-[400px]">
            <h2 className="text-xl font-bold sm:text-2xl">Order Summary</h2>
            <dl className="mt-5 space-y-5">
              <div className="flex items-center justify-between">
                <dt className="text-base text-black/60 sm:text-lg">Subtotal</dt>
                <dd className="text-lg font-bold sm:text-xl">${subtotal}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-base text-black/60 sm:text-lg">
                  Discount {appliedCode ? `(${appliedCode})` : '(-20%)'}
                </dt>
                <dd className="text-lg font-bold text-sale sm:text-xl">-${discount}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-base text-black/60 sm:text-lg">Delivery Fee</dt>
                <dd className="text-lg font-bold sm:text-xl">${delivery}</dd>
              </div>
              <hr className="border-black/10" />
              <div className="flex items-center justify-between">
                <dt className="text-base sm:text-lg">Total</dt>
                <dd className="text-xl font-bold sm:text-2xl">${total}</dd>
              </div>
            </dl>

            <form
              className="mt-5 flex gap-3"
              onSubmit={applyCoupon}
            >
              <div className="flex flex-1 items-center gap-3 rounded-full bg-[#F0F0F0] px-4 py-3">
                <TagIcon className="h-5 w-5 text-black/40" />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Add promo code"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-black/40"
                />
              </div>
              <button
                type="submit"
                className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-black/90"
              >
                Apply
              </button>
            </form>
            {couponError && <p className="mt-2 text-sm text-sale">{couponError}</p>}
            {appliedCode && !couponError && (
              <p className="mt-2 text-sm text-black/60">Coupon “{appliedCode}” applied.</p>
            )}

            <button className="mt-5 flex w-full items-center justify-center gap-3 rounded-full bg-black py-4 text-sm font-medium text-white transition hover:bg-black/90 sm:text-base">
              Go to Checkout <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
