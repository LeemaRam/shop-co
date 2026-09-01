import { useCallback, useEffect, useState } from 'react'
import { adminApi as api } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import StatusBadge from '../../components/common/StatusBadge'
import Pagination from '../../components/common/Pagination'
import { formatCurrency, formatDate, resolveImage } from '../../utils/format'

const FILTERS = ['', 'pending', 'approved', 'rejected']

export default function Products() {
  const [products, setProducts] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    const q = `?page=${page}` + (filter ? `&approval_status=${filter}` : '')
    api
      .products(q)
      .then((res) => {
        setProducts(res.data || [])
        setMeta(res.meta || null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [page, filter])

  useEffect(load, [load])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">All marketplace products across vendors.</p>
        </div>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm capitalize outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
        >
          {FILTERS.map((f) => (
            <option key={f || 'all'} value={f}>
              {f ? f : 'All statuses'}
            </option>
          ))}
        </select>
      </div>

      {error && <ErrorAlert message={error} onRetry={load} />}

      {loading ? (
        <Spinner label="Loading products…" />
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-600">
          No products found.
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Approval</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {p.image && <img src={resolveImage(p.image)} alt="" className="h-full w-full object-cover" />}
                        </div>
                        <span className="font-medium text-gray-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.vendor?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.category || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{formatCurrency(p.price)}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.approvalStatus} /></td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(p.createdAt)}</td>
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
