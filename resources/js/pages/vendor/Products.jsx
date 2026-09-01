import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { vendorApi as api } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import StatusBadge from '../../components/common/StatusBadge'
import Pagination from '../../components/common/Pagination'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { PlusIcon, EditIcon, TrashIcon } from '../../components/common/DashboardIcons'
import { formatCurrency, formatDate, resolveImage } from '../../utils/format'

export default function Products() {
  const [products, setProducts] = useState([])
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
      .products(`?page=${page}`)
      .then((res) => {
        setProducts(res.data || [])
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
      await api.deleteProduct(toDelete.id)
      setToDelete(null)
      // If the last item on a page was removed, step back a page.
      if (products.length === 1 && page > 1) setPage((p) => p - 1)
      else load()
    } catch (err) {
      setError(err.message)
      setToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your product catalog.</p>
        </div>
        <Link
          to="/vendor/products/create"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
        >
          <PlusIcon className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {error && <ErrorAlert message={error} onRetry={load} />}

      {loading ? (
        <Spinner label="Loading productsâ€¦" />
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-gray-600">No products yet.</p>
          <Link
            to="/vendor/products/create"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            <PlusIcon className="h-4 w-4" /> Add your first product
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Approval</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {prod.image && (
                            <img src={resolveImage(prod.image)} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                        <span className="font-medium text-gray-900">{prod.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{prod.category || 'â€”'}</td>
                    <td className="px-4 py-3 text-gray-700">{formatCurrency(prod.price)}</td>
                    <td className="px-4 py-3 text-gray-700">{prod.stock ?? 'â€”'}</td>
                    <td className="px-4 py-3"><StatusBadge status={prod.approvalStatus} /></td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(prod.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/vendor/products/${prod.id}/edit`}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <EditIcon className="h-4 w-4" /> Edit
                        </Link>
                        <button
                          onClick={() => setToDelete(prod)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    </td>
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

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete product"
        message={`Are you sure you want to delete "${toDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        busy={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
