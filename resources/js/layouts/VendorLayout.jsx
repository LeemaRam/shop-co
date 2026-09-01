import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  DashboardIcon,
  BoxIcon,
  OrdersIcon,
  UserIcon,
  LogoutIcon,
  MenuIcon,
  CloseIcon,
} from '../components/common/DashboardIcons'

const NAV = [
  { to: '/vendor/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { to: '/vendor/products', label: 'Products', icon: BoxIcon },
  { to: '/vendor/orders', label: 'Orders', icon: OrdersIcon },
  { to: '/vendor/profile', label: 'Profile', icon: UserIcon },
]

function SidebarContent({ onNavigate, onLogout }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
        <span className="text-lg font-bold tracking-tight">SHOP.CO</span>
        <span className="rounded bg-gray-900 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          Vendor
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-gray-200 p-3">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          <LogoutIcon className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  )
}

export default function VendorLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const storeName = user?.vendor?.storeName || user?.name || 'Vendor'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-gray-200 bg-white lg:block">
        <SidebarContent onLogout={handleLogout} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
            <SidebarContent onNavigate={() => setDrawerOpen(false)} onLogout={handleLogout} />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 sm:px-6">
          <button
            className="lg:hidden"
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon className="h-6 w-6" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{storeName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
              {storeName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
