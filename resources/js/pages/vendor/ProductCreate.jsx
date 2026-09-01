import { Link } from 'react-router-dom'
import { vendorApi as api } from '../../services/api'
import ProductForm from '../../components/common/ProductForm'
import { ChevronLeft } from '../../components/common/DashboardIcons'

export default function ProductCreate() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link to="/vendor/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" /> Back to products
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Add Product</h1>
        <p className="mt-1 text-sm text-gray-500">
          New products are submitted for admin approval before appearing in the store.
        </p>
      </div>

      <ProductForm submitLabel="Create Product" onSubmit={(payload) => api.createProduct(payload)} />
    </div>
  )
}
