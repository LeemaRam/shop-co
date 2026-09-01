import { useCallback, useEffect, useState } from 'react'
import { adminApi as api } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import Pagination from '../../components/common/Pagination'
import { formatCurrency, formatDate, resolveImage } from '../../utils/format'

function RejectModal({ product, onCancel, onConfirm, busy }) {
  const [reason, setReason] = useState('')
  if (!product) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">Reject product</h3>
        <p className="mt-1 text-sm text-gray-600">
          Provide a reason for rejecting “{product.name}”. The vendor will see this.
        </p>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          placeholder="e.g. Images are low quality"
        />
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={busy || reason.trim() === ''}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {busy ? 'Rejecting…' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PendingProducts() {
  const [products, setProducts] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [rejecting, setRejecting] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    api
      .pendingProducts(`?page=${page}`)
      .then((res) => {
        setProducts(res.data || [])
        setMeta(res.meta || null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [page])

  useEffect(load, [load])

  const approve = async (product) => {
    setBusyId(product.id)
    try {
      await api.approveProduct(product.id)
      setProducts((prev) => prev.filter((p) => p.id !== product.id))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const reject = async (reason) => {
    if (!rejecting) return
    setBusyId(rejecting.id)
    try {
      await api.rejectProduct(rejecting.id, reason)
      setProducts((prev) => prev.filter((p) => p.id !== rejecting.id))
      setRejecting(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pending Products</h1>
        <p className="mt-1 text-sm text-gray-500">Review and approve or reject vendor submissions.</p>
      </div>

      {error && <ErrorAlert message={error} onRetry={load} />}

      {loading ? (
        <Spinner label="Loading pending products…" />
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-600">
          No products awaiting review. 🎉
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((p) => (
            <div key={p.id} className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {p.image && <img src={resolveImage(p.image)} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">{p.name}</p>
                <p className="text-sm text-gray-500">
                  {p.vendor?.name || 'Unknown vendor'} · {p.category || 'Uncategorized'} · {formatCurrency(p.price)}
                </p>
                <p className="mt-1 text-xs text-gray-400">Submitted {formatDate(p.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => approve(p)}
                  disabled={busyId === p.id}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => setRejecting(p)}
                  disabled={busyId === p.id}
                  className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
          <Pagination meta={meta} onPage={setPage} />
        </div>
      )}

      <RejectModal
        product={rejecting}
        busy={busyId === rejecting?.id}
        onCancel={() => setRejecting(null)}
        onConfirm={reject}
      />
    </div>
  )
}
