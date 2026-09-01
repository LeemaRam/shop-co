import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  SearchIcon,
  CartIcon,
  UserIcon,
  MenuIcon,
  CloseIcon,
  ChevronDown,
} from './Icons'

const navLinks = [
  { label: 'Shop', to: '/shop', dropdown: true },
  { label: 'On Sale', to: '/shop' },
  { label: 'New Arrivals', to: '/shop' },
  { label: 'Brands', to: '/shop' },
]

function TopBanner({ onClose }) {
  return (
    <div className="bg-black text-white">
      <div className="container-shop relative flex items-center justify-center py-2 text-xs sm:text-sm">
        <p className="pr-6 text-center">
          Sign up and get 20% off to your first order.{' '}
          <Link to="/shop" className="font-medium underline underline-offset-2">
            Sign Up Now
          </Link>
        </p>
        <button
          onClick={onClose}
          aria-label="Close banner"
          className="absolute right-4 sm:right-6 lg:right-8 hidden sm:block"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

export default function Header() {
  const [bannerOpen, setBannerOpen] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-white">
      {bannerOpen && <TopBanner onClose={() => setBannerOpen(false)} />}
      <div className="container-shop flex items-center gap-4 py-4 sm:gap-6 lg:gap-10">
        {/* Mobile menu toggle */}
        <button
          className="lg:hidden"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <MenuIcon className="h-6 w-6" />
        </button>

        <Link
          to="/"
          className="font-display text-[20px] sm:text-[26px] tracking-tight leading-none"
        >
          SHOP.CO
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className="flex items-center gap-1 text-sm text-black/90 hover:text-black"
            >
              {l.label}
              {l.dropdown && <ChevronDown className="h-4 w-4" />}
            </NavLink>
          ))}
        </nav>

        {/* Search (desktop) */}
        <div className="ml-auto hidden flex-1 items-center gap-3 rounded-full bg-[#F0F0F0] px-4 py-2.5 md:flex lg:ml-0">
          <SearchIcon className="h-5 w-5 text-black/40" />
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-black/40"
          />
        </div>

        {/* Icons */}
        <div className="ml-auto flex items-center gap-3 md:ml-0">
          <button className="md:hidden" aria-label="Search">
            <SearchIcon className="h-5 w-5" />
          </button>
          <Link to="/cart" aria-label="Cart">
            <CartIcon className="h-5 w-5" />
          </Link>
          <Link to="/login" aria-label="Account">
            <UserIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
      <div className="border-b border-black/10" />

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[80%] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-display text-2xl">SHOP.CO</span>
              <button aria-label="Close menu" onClick={() => setMenuOpen(false)}>
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-6 flex items-center gap-3 rounded-full bg-[#F0F0F0] px-4 py-3">
              <SearchIcon className="h-5 w-5 text-black/40" />
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-black/40"
              />
            </div>
            <nav className="mt-6 flex flex-col gap-4">
              {navLinks.map((l) => (
                <NavLink
                  key={l.label}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className="text-lg"
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
