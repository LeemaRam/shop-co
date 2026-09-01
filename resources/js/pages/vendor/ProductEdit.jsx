import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { vendorApi as api } from '../../services/api'
import ProductForm from '../../components/common/ProductForm'
import Spinner from '../../components/common/Spinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import StatusBadge from '../../components/common/StatusBadge'
import { ChevronLeft } from '../../components/common/DashboardIcons'

export default function ProductEdit() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    api
      .product(id)
      .then((res) => setProduct(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  const initial = product
    ? {
        name: product.name || '',
        description: product.description || '',
        category_id: product.categoryId ?? '',
        style: product.style || '',
        tags: (product.tags || []).join(', '),
        price: product.price ?? '',
        compare_at_price: product.oldPrice ?? '',
        discount: product.discount ?? '',
        status: product.status || 'active',
        images: (product.gallery || []).map((image) => ({
          image,
          is_primary: image === product.image,
        })),
        variants: (product.variants || []).map((v) => ({
          size: v.size || '',
          color: v.color || '',
          price: v.price ?? '',
          stock: v.stock ?? '',
        })),
      }
    : null

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link to="/vendor/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" /> Back to products
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          {product && <StatusBadge status={product.approvalStatus} />}
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Saving changes resubmits the product for admin approval.
        </p>
        {product?.approvalStatus === 'rejected' && product?.rejectionReason && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="font-medium">Rejection reason:</span> {product.rejectionReason}
          </div>
        )}
      </div>

      {loading ? (
        <Spinner label="Loading productâ€¦" />
      ) : error ? (
        <ErrorAlert message={error} onRetry={load} />
      ) : (
        <ProductForm
          initial={initial}
          submitLabel="Save Changes"
          onSubmit={(payload) => api.updateProduct(id, payload)}
        />
      )}
    </div>
  )
}
