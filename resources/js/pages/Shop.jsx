import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import api from '../services/api'
import { adaptProducts } from '../services/adapters'
import { humanizeColor } from '../utils/color'
import {
  ChevronRight,
  ChevronDown,
  SlidersIcon,
  ArrowLeft,
  ArrowRight,
  CloseIcon,
} from '../components/Icons'

const categories = ['T-shirts', 'Shorts', 'Shirts', 'Hoodie', 'Jeans']
const colorSwatches = [
  '#00C12B', '#F50606', '#F5DD06', '#F57906', '#06CAF5',
  '#063AF5', '#7D06F5', '#F506A4', '#FFFFFF', '#000000',
]
const sizes = [
  'XX-Small', 'X-Small', 'Small', 'Medium', 'Large',
  'X-Large', 'XX-Large', '3X-Large', '4X-Large',
]
const dressStyles = ['Casual', 'Formal', 'Party', 'Gym']

function FilterGroup({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-black/10 py-5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between"
      >
        <span className="text-xl font-bold">{title}</span>
        <ChevronDown
          className={`h-5 w-5 transition-transform ${open ? '' : '-rotate-90'}`}
        />
      </button>
      {open && <div className="mt-5">{children}</div>}
    </div>
  )
}

function LinkList({ items, selected, onSelect }) {
  return (
    <ul className="space-y-5">
      {items.map((c) => (
        <li key={c}>
          <button
            onClick={() => onSelect && onSelect(selected === c ? '' : c)}
            className={`flex w-full items-center justify-between hover:text-black ${
              selected === c ? 'text-black font-medium' : 'text-black/60'
            }`}
          >
            <span>{c}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  )
}

// Dual-thumb price slider built from two overlapping native range inputs so it
// stays accessible and dependency-free while matching the existing track look.
function PriceSlider({ min, max, value, onChange, onCommit }) {
  if (max <= min) {
    return (
      <div className="px-1 text-sm font-medium text-black/60">${min}</div>
    )
  }
  const span = max - min
  const minPct = ((value.min - min) / span) * 100
  const maxPct = ((value.max - min) / span) * 100

  const handleMin = (e) => onChange({ min: Math.min(Number(e.target.value), value.max), max: value.max })
  const handleMax = (e) => onChange({ min: value.min, max: Math.max(Number(e.target.value), value.min) })
  const commit = () => onCommit && onCommit()

  return (
    <div className="px-1">
      <div className="relative h-4">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-black/10" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-black"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
        <input
          type="range" min={min} max={max} value={value.min}
          onChange={handleMin} onMouseUp={commit} onTouchEnd={commit} onKeyUp={commit}
          aria-label="Minimum price" className="price-range"
        />
        <input
          type="range" min={min} max={max} value={value.max}
          onChange={handleMax} onMouseUp={commit} onTouchEnd={commit} onKeyUp={commit}
          aria-label="Maximum price" className="price-range"
        />
      </div>
      <div className="mt-4 flex justify-between text-sm font-medium">
        <span>${value.min}</span>
        <span>${value.max}</span>
      </div>
    </div>
  )
}

function Filters({
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  selectedCategory,
  setSelectedCategory,
  selectedStyle,
  setSelectedStyle,
  priceBounds,
  priceRange,
  setPriceRange,
  onPriceCommit,
  onApply,
}) {
  return (
    <div className="rounded-[20px] border border-black/10 p-5 sm:p-6">
      <div className="flex items-center justify-between pb-5">
        <h2 className="text-xl font-bold">Filters</h2>
        <SlidersIcon className="h-6 w-6 text-black/40" />
      </div>

      <div className="border-t border-black/10 py-5">
        <LinkList items={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      <FilterGroup title="Price">
        <PriceSlider
          min={priceBounds.min}
          max={priceBounds.max}
          value={priceRange}
          onChange={setPriceRange}
          onCommit={onPriceCommit}
        />
      </FilterGroup>

      <FilterGroup title="Colors">
        <div className="grid grid-cols-5 gap-3.5">
          {colorSwatches.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedColor(c)}
              aria-label={humanizeColor(c)}
              title={humanizeColor(c)}
              className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                c === '#FFFFFF' ? 'border-black/20' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            >
              {selectedColor === c && (
                <svg viewBox="0 0 24 24" className="h-4 w-4">
                  <path
                    d="m5 12 4.5 4.5L19 7"
                    fill="none"
                    stroke={c === '#FFFFFF' || c === '#F5DD06' ? '#000' : '#fff'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Size">
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSize(s)}
              className={`rounded-full px-5 py-2.5 text-sm transition ${
                selectedSize === s
                  ? 'bg-black text-white'
                  : 'bg-[#F0F0F0] text-black/60 hover:bg-black/5'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Dress Style">
        <LinkList items={dressStyles} selected={selectedStyle} onSelect={setSelectedStyle} />
      </FilterGroup>

      <button
        onClick={onApply}
        className="mt-2 w-full rounded-full bg-black py-3.5 text-sm font-medium text-white transition hover:bg-black/90"
      >
        Apply Filter
      </button>
    </div>
  )
}

function Pagination({ page, lastPage, onPage }) {
  if (!lastPage || lastPage <= 1) return null
  const pages = Array.from({ length: lastPage }, (_, i) => i + 1)
  return (
    <div className="mt-8 flex items-center justify-between border-t border-black/10 pt-5">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-medium transition hover:bg-black/5 disabled:opacity-40"
      >
        <ArrowLeft className="h-4 w-4" /> Previous
      </button>
      <div className="hidden items-center gap-0.5 sm:flex">
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`h-9 min-w-9 rounded-lg px-2 text-sm ${
              p === page ? 'bg-black/5' : 'text-black/60 hover:bg-black/5'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= lastPage}
        className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-medium transition hover:bg-black/5 disabled:opacity-40"
      >
        Next <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}

export default function Shop() {
  const { slug } = useParams()
  const [selectedColor, setSelectedColor] = useState('#063AF5')
  const [selectedSize, setSelectedSize] = useState('Large')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const [gridProducts, setGridProducts] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 9, total: 0 })
  const [page, setPage] = useState(1)
  const [applied, setApplied] = useState({ category: '', style: '', color: '', size: '', minPrice: null, maxPrice: null })
  const [loading, setLoading] = useState(true)

  // Price range is derived from the actual catalog, not hardcoded.
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 0 })
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 })

  useEffect(() => {
    let active = true
    const params = new URLSearchParams({ per_page: '60' })
    const category = applied.category || slug
    if (category) params.set('category', category)
    api
      .products(`?${params.toString()}`)
      .then((r) => {
        if (!active) return
        const prices = (r.data || []).map((p) => Number(p.price)).filter((n) => !Number.isNaN(n))
        if (!prices.length) return
        const min = Math.floor(Math.min(...prices))
        const max = Math.ceil(Math.max(...prices))
        setPriceBounds({ min, max })
        setPriceRange({ min, max })
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [slug, applied.category])

  useEffect(() => {
    let active = true
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), per_page: '9' })
    const category = applied.category || slug
    if (category) params.set('category', category)
    if (applied.style) params.set('style', applied.style)
    if (applied.color) params.set('color', applied.color)
    if (applied.size) params.set('size', applied.size)
    if (applied.minPrice != null) params.set('min_price', String(applied.minPrice))
    if (applied.maxPrice != null) params.set('max_price', String(applied.maxPrice))
    api
      .products(`?${params.toString()}`)
      .then((r) => {
        if (!active) return
        setGridProducts(adaptProducts(r.data))
        if (r.meta) setMeta(r.meta)
      })
      .catch(() => active && setGridProducts([]))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [applied, page, slug])

  const applyFilters = () => {
    setApplied({
      category: selectedCategory,
      style: selectedStyle,
      color: selectedColor,
      size: selectedSize,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
    })
    setPage(1)
    setMobileFiltersOpen(false)
  }

  // Commit price on handle release so the grid updates immediately, no refresh.
  const commitPrice = () => {
    setApplied((prev) => ({ ...prev, minPrice: priceRange.min, maxPrice: priceRange.max }))
    setPage(1)
  }

  const total = meta.total || 0
  const from = total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1
  const to = Math.min(meta.current_page * meta.per_page, total)

  return (
    <div className="container-shop py-5 sm:py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-black/60">
        <Link to="/" className="hover:text-black">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-black">Casual</span>
      </nav>

      <div className="mt-6 flex gap-6">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-[295px] shrink-0 lg:block">
          <Filters
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedStyle={selectedStyle}
            setSelectedStyle={setSelectedStyle}
            priceBounds={priceBounds}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            onPriceCommit={commitPrice}
            onApply={applyFilters}
          />
        </aside>

        {/* Product area */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="display text-[32px] leading-none">Casual</h1>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <span className="text-sm text-black/60">
                Showing {from}-{to} of {total} Products
              </span>
              <span className="hidden text-sm text-black/60 sm:inline">
                Sort by:{' '}
                <button className="font-medium text-black">
                  Most Popular <ChevronDown className="inline h-4 w-4" />
                </button>
              </span>
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F0F0] lg:hidden"
                aria-label="Open filters"
              >
                <SlidersIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
            {gridProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {!loading && gridProducts.length === 0 && (
            <p className="mt-10 text-center text-black/60">No products match your filters.</p>
          )}

          <Pagination page={meta.current_page} lastPage={meta.last_page} onPage={setPage} />
        </div>
      </div>

      {/* Mobile filters drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-white p-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xl font-bold">Filters</h2>
              <button
                aria-label="Close filters"
                onClick={() => setMobileFiltersOpen(false)}
              >
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>
            <Filters
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedStyle={selectedStyle}
              setSelectedStyle={setSelectedStyle}
              priceBounds={priceBounds}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              onPriceCommit={commitPrice}
              onApply={applyFilters}
            />
          </div>
        </div>
      )}
    </div>
  )
}
