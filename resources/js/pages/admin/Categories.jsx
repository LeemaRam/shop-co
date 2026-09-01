import { useEffect, useState } from 'react'
import { adminApi as api } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { PlusIcon, EditIcon, TrashIcon } from '../../components/common/DashboardIcons'

const inputClass =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900'

const emptyForm = { name: '', description: '', image: '', status: 'active' }

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // null=closed, {}=create, {id..}=edit
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    setError('')
    api
      .categories()
      .then((res) => setCategories(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setForm(emptyForm)
    setFormErrors({})
    setEditing({})
  }

  const openEdit = (cat) => {
    setForm({ name: cat.name || '', description: cat.description || '', image: cat.image || '', status: 'active' })
    setFormErrors({})
    setEditing(cat)
  }

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const save = async (e) => {
    e.preventDefault()
    setFormErrors({})
    setSaving(true)
    try {
      if (editing?.id) await api.updateCategory(editing.id, form)
      else await api.createCategory(form)
      setEditing(null)
      load()
    } catch (err) {
      if (err.status === 422) setFormErrors(err.errors || {})
      else setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await api.deleteCategory(toDelete.id)
      setCategories((prev) => prev.filter((c) => c.id !== toDelete.id))
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-500">Organize the product catalog.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
        >
          <PlusIcon className="h-4 w-4" /> Add Category
        </button>
      </div>

      {error && <ErrorAlert message={error} onRetry={load} />}

      {loading ? (
        <Spinner label="Loading categories…" />
      ) : categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-600">
          No categories yet.
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Products</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-500">{c.slug}</td>
                    <td className="px-4 py-3 text-gray-700">{c.productsCount ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(c)} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                          <EditIcon className="h-4 w-4" /> Edit
                        </button>
                        <button onClick={() => setToDelete(c)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                          <TrashIcon className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={editing !== null}
        title={editing?.id ? 'Edit Category' : 'Add Category'}
        onClose={() => setEditing(null)}
        footer={
          <>
            <button onClick={() => setEditing(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={save} disabled={saving} className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input className={inputClass} value={form.name} onChange={(e) => setField('name', e.target.value)} />
            {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name[0]}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea rows={3} className={inputClass} value={form.description} onChange={(e) => setField('description', e.target.value)} />
            {formErrors.description && <p className="mt-1 text-xs text-red-600">{formErrors.description[0]}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Image path</label>
            <input className={inputClass} value={form.image} onChange={(e) => setField('image', e.target.value)} placeholder="/images/category.webp" />
            {formErrors.image && <p className="mt-1 text-xs text-red-600">{formErrors.image[0]}</p>}
          </div>
          <button type="submit" className="hidden" />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete category"
        message={`Delete category "${toDelete?.name}"? Products in it will be uncategorized.`}
        confirmLabel="Delete"
        busy={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
