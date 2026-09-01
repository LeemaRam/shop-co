import { useCallback, useEffect, useState } from 'react'
import { adminApi as api } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import Pagination from '../../components/common/Pagination'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Rating from '../../components/Rating'
import { TrashIcon } from '../../components/common/DashboardIcons'
import { formatDate } from '../../utils/format'

export default function Reviews() {
  const [reviews, setReviews] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    api
      .reviews(`?page=${page}`)
      .then((res) => {
        setReviews(res.data || [])
        setMeta(res.meta || null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [page])

  useEffect(load, [load])

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await api.deleteReview(toDelete.id)
      setReviews((prev) => prev.filter((r) => r.id !== toDelete.id))
      setToDelete(null)
    } catch (err) {
      setError(err.message)
      setToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="mt-1 text-sm text-gray-500">Moderate customer product reviews.</p>
      </div>

      {error && <ErrorAlert message={error} onRetry={load} />}

      {loading ? (
        <Spinner label="Loading reviews…" />
      ) : reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-600">
          No reviews found.
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-gray-900">{r.product?.name || 'Product'}</span>
                    <Rating value={r.rating} size={14} showValue={false} />
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{r.comment || <span className="italic text-gray-400">No comment</span>}</p>
                  <p className="mt-2 text-xs text-gray-400">By {r.name || 'Anonymous'} · {formatDate(r.createdAt)}</p>
                </div>
                <button
                  onClick={() => setToDelete(r)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          ))}
          <Pagination meta={meta} onPage={setPage} />
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete review"
        message="Delete this review? The product rating will be recalculated."
        confirmLabel="Delete"
        busy={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
