import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi as api } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import StatusBadge from '../../components/common/StatusBadge'
import Pagination from '../../components/common/Pagination'
import { formatCurrency, formatDate } from '../../utils/format'

const STATUSES = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

export default function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    const q = `?page=${page}` + (status ? `&status=${status}` : '')
    api
      .orders(q)
      .then((res) => {
        setOrders(res.data || [])
        setMeta(res.meta || null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [page, status])

  useEffect(load, [load])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">All marketplace orders.</p>
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm capitalize outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
        >
          {STATUSES.map((s) => (
            <option key={s || 'all'} value={s}>
              {s ? s : 'All statuses'}
            </option>
          ))}
        </select>
      </div>

      {error && <ErrorAlert message={error} onRetry={load} />}

      {loading ? (
        <Spinner label="Loading orders…" />
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-600">
          No orders found.
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
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/admin/orders/${o.id}`)}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-gray-600">{o.customer?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{(o.items || []).reduce((n, it) => n + it.quantity, 0)}</td>
                    <td className="px-4 py-3 text-gray-700">{formatCurrency(o.total)}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.paymentStatus} /></td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(o.createdAt)}</td>
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
