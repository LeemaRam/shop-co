import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { PlusIcon, TrashIcon } from './DashboardIcons'
import ErrorAlert from './ErrorAlert'

const STATUS_OPTIONS = ['active', 'inactive', 'draft']

const emptyVariant = () => ({ size: '', color: '', price: '', stock: '' })

function fieldError(errors, key) {
  const msg = errors?.[key]
  if (!msg) return null
  return <p className="mt-1 text-xs text-red-600">{Array.isArray(msg) ? msg[0] : msg}</p>
}

const inputClass =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900'

export default function ProductForm({ initial, submitLabel, onSubmit }) {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(() => ({
    name: '',
    description: '',
    category_id: '',
    style: '',
    tags: '',
    price: '',
    compare_at_price: '',
    discount: '',
    status: 'active',
    ...initial,
  }))
  const [images, setImages] = useState(initial?.images?.length ? initial.images : [{ image: '', is_primary: true }])
  const [variants, setVariants] = useState(initial?.variants?.length ? initial.variants : [emptyVariant()])
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api
      .categories()
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]))
  }, [])

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const updateImage = (i, key, value) =>
    setImages((prev) => prev.map((img, idx) => (idx === i ? { ...img, [key]: value } : img)))
  const setPrimary = (i) =>
    setImages((prev) => prev.map((img, idx) => ({ ...img, is_primary: idx === i })))
  const addImage = () => setImages((prev) => [...prev, { image: '', is_primary: prev.length === 0 }])
  const removeImage = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i))

  const updateVariant = (i, key, value) =>
    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, [key]: value } : v)))
  const addVariant = () => setVariants((prev) => [...prev, emptyVariant()])
  const removeVariant = (i) => setVariants((prev) => prev.filter((_, idx) => idx !== i))

  const buildPayload = () => {
    const cleanImages = images
      .filter((img) => img.image.trim() !== '')
      .map((img) => ({ image: img.image.trim(), is_primary: Boolean(img.is_primary) }))

    const cleanVariants = variants
      .filter((v) => v.size !== '' || v.color !== '' || v.stock !== '' || v.price !== '')
      .map((v) => ({
        size: v.size || null,
        color: v.color || null,
        price: v.price === '' ? null : Number(v.price),
        stock: v.stock === '' ? 0 : Number(v.stock),
      }))

    const payload = {
      name: form.name,
      description: form.description || null,
      category_id: form.category_id ? Number(form.category_id) : null,
      style: form.style || null,
      price: form.price === '' ? null : Number(form.price),
      compare_at_price: form.compare_at_price === '' ? null : Number(form.compare_at_price),
      discount: form.discount === '' ? 0 : Number(form.discount),
      status: form.status,
      tags: form.tags
        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
    }
    if (cleanImages.length) payload.images = cleanImages
    if (cleanVariants.length) payload.variants = cleanVariants
    return payload
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setFormError('')
    setSubmitting(true)
    try {
      await onSubmit(buildPayload())
      navigate('/vendor/products')
    } catch (err) {
      if (err.status === 422) {
        setErrors(err.errors || {})
        setFormError('Please fix the highlighted fields.')
      } else {
        setFormError(err.message || 'Could not save the product.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && <ErrorAlert message={formError} />}

      {/* Basic Information */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900">Basic Information</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Product Name</label>
            <input className={inputClass} value={form.name} onChange={(e) => setField('name', e.target.value)} />
            {fieldError(errors, 'name')}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={4}
              className={inputClass}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
            />
            {fieldError(errors, 'description')}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              className={inputClass}
              value={form.category_id ?? ''}
              onChange={(e) => setField('category_id', e.target.value)}
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {fieldError(errors, 'category_id')}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Style</label>
            <input
              className={inputClass}
              value={form.style}
              onChange={(e) => setField('style', e.target.value)}
              placeholder="Casual, Formalâ€¦"
            />
            {fieldError(errors, 'style')}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Tags</label>
            <input
              className={inputClass}
              value={form.tags}
              onChange={(e) => setField('tags', e.target.value)}
              placeholder="Comma separated e.g. new, top"
            />
            {fieldError(errors, 'tags')}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900">Pricing</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className={inputClass}
              value={form.price}
              onChange={(e) => setField('price', e.target.value)}
            />
            {fieldError(errors, 'price')}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Compare-at Price</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className={inputClass}
              value={form.compare_at_price}
              onChange={(e) => setField('compare_at_price', e.target.value)}
            />
            {fieldError(errors, 'compare_at_price')}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              className={inputClass}
              value={form.discount}
              onChange={(e) => setField('discount', e.target.value)}
            />
            {fieldError(errors, 'discount')}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select className={inputClass} value={form.status} onChange={(e) => setField('status', e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
            {fieldError(errors, 'status')}
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Images</h2>
          <button type="button" onClick={addImage} className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900">
            <PlusIcon className="h-4 w-4" /> Add image
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">Enter an image path served by the storefront, e.g. /images/product2.webp</p>
        <div className="mt-4 space-y-3">
          {images.map((img, i) => (
            <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                className={`${inputClass} mt-0 flex-1`}
                value={img.image}
                onChange={(e) => updateImage(i, 'image', e.target.value)}
                placeholder="/images/example.webp"
              />
              <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                <input type="radio" name="primary" checked={Boolean(img.is_primary)} onChange={() => setPrimary(i)} />
                Primary
              </label>
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
                aria-label="Remove image"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Variants */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Variants</h2>
          <button type="button" onClick={addVariant} className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900">
            <PlusIcon className="h-4 w-4" /> Add variant
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-9 sm:items-center">
              <input
                className={`${inputClass} mt-0 sm:col-span-2`}
                value={v.size}
                onChange={(e) => updateVariant(i, 'size', e.target.value)}
                placeholder="Size"
              />
              <input
                className={`${inputClass} mt-0 sm:col-span-3`}
                value={v.color}
                onChange={(e) => updateVariant(i, 'color', e.target.value)}
                placeholder="Color (e.g. #000000)"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                className={`${inputClass} mt-0 sm:col-span-2`}
                value={v.price}
                onChange={(e) => updateVariant(i, 'price', e.target.value)}
                placeholder="Price"
              />
              <input
                type="number"
                min="0"
                className={`${inputClass} mt-0 sm:col-span-1`}
                value={v.stock}
                onChange={(e) => updateVariant(i, 'stock', e.target.value)}
                placeholder="Stock"
              />
              <button
                type="button"
                onClick={() => removeVariant(i)}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 p-2 text-gray-500 hover:bg-gray-50 sm:col-span-1"
                aria-label="Remove variant"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate('/vendor/products')}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {submitting ? 'Savingâ€¦' : submitLabel}
        </button>
      </div>
    </form>
  )
}
