import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { vendorApi as api } from '../../services/api'
import StatCard from '../../components/common/StatCard'
import Spinner from '../../components/common/Spinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import StatusBadge from '../../components/common/StatusBadge'
import { formatCurrency, formatDate, resolveImage } from '../../utils/format'
import { BoxIcon, OrdersIcon, RevenueIcon } from '../../components/common/DashboardIcons'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recentProducts, setRecentProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    Promise.all([api.dashboard(), api.products('?per_page=5')])
      .then(([dash, products]) => {
        setStats(dash.data)
        setRecentProducts(products.data || [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  if (loading) return <Spinner label="Loading dashboardâ€¦" />
  if (error) return <ErrorAlert message={error} onRetry={load} />

  const p = stats?.products || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your store performance.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Products" value={p.total ?? 0} icon={<BoxIcon />} />
        <StatCard label="Approved" value={p.approved ?? 0} accent="text-green-700" />
        <StatCard label="Pending" value={p.pending ?? 0} accent="text-amber-700" />
        <StatCard label="Rejected" value={p.rejected ?? 0} accent="text-red-700" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Order Items" value={stats?.orderItems ?? 0} icon={<OrdersIcon />} />
        <StatCard
          label="Revenue"
          value={formatCurrency(stats?.revenue ?? 0)}
          icon={<RevenueIcon />}
          accent="text-gray-900"
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">Recent Products</h2>
          <Link to="/vendor/products" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            View all
          </Link>
        </div>
        {recentProducts.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-500">No products yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentProducts.map((prod) => (
              <li key={prod.id} className="flex items-center gap-4 px-5 py-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {prod.image && (
                    <img src={resolveImage(prod.image)} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{prod.name}</p>
                  <p className="text-xs text-gray-500">{formatDate(prod.createdAt) }</p>
                </div>
                <div className="text-sm font-medium text-gray-700">{formatCurrency(prod.price)}</div>
                <StatusBadge status={prod.approvalStatus} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
