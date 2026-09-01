import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi as api } from '../../services/api'
import StatCard from '../../components/common/StatCard'
import Spinner from '../../components/common/Spinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import { BoxIcon, OrdersIcon, UserIcon, RevenueIcon } from '../../components/common/DashboardIcons'
import { formatCurrency } from '../../utils/format'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    api
      .dashboard()
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  if (loading) return <Spinner label="Loading dashboard…" />
  if (error) return <ErrorAlert message={error} onRetry={load} />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Marketplace overview.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Users" value={stats?.users ?? 0} icon={<UserIcon />} />
        <StatCard label="Customers" value={stats?.customers ?? 0} />
        <StatCard label="Vendors" value={stats?.vendors ?? 0} />
        <StatCard label="Products" value={stats?.products ?? 0} icon={<BoxIcon />} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Pending Approvals" value={stats?.pendingProducts ?? 0} accent="text-amber-700" />
        <StatCard label="Orders" value={stats?.orders ?? 0} icon={<OrdersIcon />} />
        <StatCard label="Revenue" value={formatCurrency(stats?.revenue ?? 0)} icon={<RevenueIcon />} />
      </div>

      {(stats?.pendingProducts ?? 0) > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm text-amber-800">
            {stats.pendingProducts} product(s) awaiting review.{' '}
            <Link to="/admin/products/pending" className="font-semibold underline">
              Review now
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}
