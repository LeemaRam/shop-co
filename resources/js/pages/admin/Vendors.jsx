import { useCallback, useEffect, useState } from 'react'
import { adminApi as api } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import StatusBadge from '../../components/common/StatusBadge'
import Pagination from '../../components/common/Pagination'

export default function Vendors() {
  const [vendors, setVendors] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    api
      .vendors(`?page=${page}`)
      .then((res) => {
        setVendors(res.data || [])
        setMeta(res.meta || null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [page])

  useEffect(load, [load])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
        <p className="mt-1 text-sm text-gray-500">Registered marketplace vendors.</p>
      </div>

      {error && <ErrorAlert message={error} onRetry={load} />}

      {loading ? (
        <Spinner label="Loading vendors…" />
      ) : vendors.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-600">
          No vendors found.
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Store</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Products</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{v.storeName}</td>
                    <td className="px-4 py-3 text-gray-600">{v.owner?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{v.owner?.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{v.phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{v.productsCount ?? 0}</td>
                    <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
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
