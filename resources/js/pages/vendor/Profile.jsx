import { useEffect, useState } from 'react'
import { vendorApi as api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/common/Spinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import StatusBadge from '../../components/common/StatusBadge'

const inputClass =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900'

export default function Profile() {
  const { user, setUser } = useAuth()
  const [vendor, setVendor] = useState(null)
  const [form, setForm] = useState({ store_name: '', description: '', phone: '', logo: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const load = () => {
    setLoading(true)
    setError('')
    api
      .profile()
      .then((res) => {
        const v = res.data
        setVendor(v)
        setForm({
          store_name: v.storeName || '',
          description: v.description || '',
          phone: v.phone || '',
          logo: v.logo || '',
        })
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setError('')
    setSaved(false)
    setSaving(true)
    try {
      const res = await api.updateProfile(form)
      setVendor(res.data)
      setSaved(true)
      // Keep the header store name in sync.
      if (user) setUser({ ...user, vendor: { ...(user.vendor || {}), storeName: res.data.storeName } })
    } catch (err) {
      if (err.status === 422) setErrors(err.errors || {})
      else setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner label="Loading profileâ€¦" />
  if (error && !vendor) return <ErrorAlert message={error} onRetry={load} />

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your store details.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Account</p>
            <p className="font-medium text-gray-900">{vendor?.owner?.name || user?.name}</p>
            <p className="text-sm text-gray-500">{vendor?.owner?.email || user?.email}</p>
          </div>
          {vendor?.status && <StatusBadge status={vendor.status} />}
        </div>
        <p className="mt-3 text-xs text-gray-400">
          Your name and email are managed at the account level and cannot be changed here.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        {error && <ErrorAlert message={error} />}
        {saved && (
          <div className="mb-4 rounded-lg bg-green-50 px-4 py-2.5 text-sm text-green-700">Profile updated.</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Store Name</label>
            <input className={inputClass} value={form.store_name} onChange={(e) => setField('store_name', e.target.value)} />
            {errors.store_name && <p className="mt-1 text-xs text-red-600">{errors.store_name[0]}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={4}
              className={inputClass}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
            />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description[0]}</p>}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input className={inputClass} value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Logo URL</label>
              <input className={inputClass} value={form.logo} onChange={(e) => setField('logo', e.target.value)} placeholder="/images/logo.webp" />
              {errors.logo && <p className="mt-1 text-xs text-red-600">{errors.logo[0]}</p>}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {saving ? 'Savingâ€¦' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
