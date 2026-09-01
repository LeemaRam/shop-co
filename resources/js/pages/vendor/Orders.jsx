import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { vendorApi as api } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import StatusBadge from '../../components/common/StatusBadge'
import Pagination from '../../components/common/Pagination'
import { formatCurrency, formatDate } from '../../utils/format'

function vendorTotal(order) {
  return (order.items || []).reduce((sum, it) => sum + Number(it.total || 0), 0)
}

export default function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    api
      .orders(`?page=${page}`)
      .then((res) => {
        setOrders(res.data || [])
        setMeta(res.meta || null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [page])

  useEffect(load, [load])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="mt-1 text-sm text-gray-500">Orders containing your products.</p>
      </div>

      {error && <ErrorAlert message={error} onRetry={load} />}

      {loading ? (
        <Spinner label="Loading ordersâ€¦" />
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-600">
          No orders yet.
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Your Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/vendor/orders/${order.id}`)}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-gray-600">{order.customer?.name || 'â€”'}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {(order.items || []).reduce((n, it) => n + it.quantity, 0)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{formatCurrency(vendorTotal(order))}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-4">
            <Pagination meta={meta} onPage={setPage} />
          </div>
        </div>
      )}
    </div>
  )
}
