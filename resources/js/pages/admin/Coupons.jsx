import { useEffect, useState } from 'react'
import { adminApi as api } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import StatusBadge from '../../components/common/StatusBadge'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { PlusIcon, EditIcon, TrashIcon } from '../../components/common/DashboardIcons'
import { formatCurrency } from '../../utils/format'

const inputClass =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900'

const emptyForm = {
  code: '',
  type: 'percentage',
  value: '',
  minimum_order_amount: '',
  maximum_discount: '',
  usage_limit: '',
  expires_at: '',
  status: 'active',
}

export default function Coupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    setError('')
    api
      .coupons()
      .then((res) => setCoupons(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setForm(emptyForm)
    setFormErrors({})
    setEditing({})
  }

  const openEdit = (c) => {
    setForm({
      code: c.code || '',
      type: c.type || 'percentage',
      value: c.value ?? '',
      minimum_order_amount: c.minimumOrderAmount ?? '',
      maximum_discount: c.maximumDiscount ?? '',
      usage_limit: c.usageLimit ?? '',
      expires_at: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
      status: c.status || 'active',
    })
    setFormErrors({})
    setEditing(c)
  }

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const buildPayload = () => ({
    code: form.code,
    type: form.type,
    value: form.value === '' ? null : Number(form.value),
    minimum_order_amount: form.minimum_order_amount === '' ? null : Number(form.minimum_order_amount),
    maximum_discount: form.maximum_discount === '' ? null : Number(form.maximum_discount),
    usage_limit: form.usage_limit === '' ? null : Number(form.usage_limit),
    expires_at: form.expires_at || null,
    status: form.status,
  })

  const save = async (e) => {
    e.preventDefault()
    setFormErrors({})
    setSaving(true)
    try {
      if (editing?.id) await api.updateCoupon(editing.id, buildPayload())
      else await api.createCoupon(buildPayload())
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
      await api.deleteCoupon(toDelete.id)
      setCoupons((prev) => prev.filter((c) => c.id !== toDelete.id))
      setToDelete(null)
    } catch (err) {
      setError(err.message)
      setToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  const fieldErr = (k) => formErrors[k] && <p className="mt-1 text-xs text-red-600">{formErrors[k][0]}</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="mt-1 text-sm text-gray-500">Manage discount codes.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
        >
          <PlusIcon className="h-4 w-4" /> Add Coupon
        </button>
      </div>

      {error && <ErrorAlert message={error} onRetry={load} />}

      {loading ? (
        <Spinner label="Loading coupons…" />
      ) : coupons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-600">
          No coupons yet.
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Min Order</th>
                  <th className="px-4 py-3">Used</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.code}</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{c.type}</td>
                    <td className="px-4 py-3 text-gray-700">{c.type === 'percentage' ? `${c.value}%` : formatCurrency(c.value)}</td>
                    <td className="px-4 py-3 text-gray-700">{c.minimumOrderAmount != null ? formatCurrency(c.minimumOrderAmount) : '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{c.usedCount}{c.usageLimit != null ? ` / ${c.usageLimit}` : ''}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
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
        title={editing?.id ? 'Edit Coupon' : 'Add Coupon'}
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
        <form onSubmit={save} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Code</label>
            <input className={inputClass} value={form.code} onChange={(e) => setField('code', e.target.value)} />
            {fieldErr('code')}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select className={inputClass} value={form.type} onChange={(e) => setField('type', e.target.value)}>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Value</label>
            <input type="number" step="0.01" min="0" className={inputClass} value={form.value} onChange={(e) => setField('value', e.target.value)} />
            {fieldErr('value')}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Minimum Order</label>
            <input type="number" step="0.01" min="0" className={inputClass} value={form.minimum_order_amount} onChange={(e) => setField('minimum_order_amount', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Discount</label>
            <input type="number" step="0.01" min="0" className={inputClass} value={form.maximum_discount} onChange={(e) => setField('maximum_discount', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Usage Limit</label>
            <input type="number" min="1" className={inputClass} value={form.usage_limit} onChange={(e) => setField('usage_limit', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Expires</label>
            <input type="date" className={inputClass} value={form.expires_at} onChange={(e) => setField('expires_at', e.target.value)} />
            {fieldErr('expires_at')}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select className={inputClass} value={form.status} onChange={(e) => setField('status', e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button type="submit" className="hidden" />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete coupon"
        message={`Delete coupon "${toDelete?.code}"? This cannot be undone.`}
        confirmLabel="Delete"
        busy={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
