import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { adminApi as api } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import StatusBadge from '../../components/common/StatusBadge'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { ChevronLeft } from '../../components/common/DashboardIcons'
import { formatCurrency, formatDate } from '../../utils/format'
import { formatColorText } from '../../utils/color'

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [statusError, setStatusError] = useState('')
  const [statusOk, setStatusOk] = useState('')
  const [confirmCancel, setConfirmCancel] = useState(false)

  const load = () => {
    setLoading(true)
    setError('')
    api
      .order(id)
      .then((res) => {
        setOrder(res.data)
        setStatus(res.data.status)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  const persist = async (nextStatus) => {
    setSaving(true)
    setStatusError('')
    setStatusOk('')
    try {
      const res = await api.updateOrderStatus(id, nextStatus)
      setOrder(res.data)
      setStatus(res.data.status)
      setStatusOk('Order status updated.')
    } catch (err) {
      setStatusError(err.message)
      if (order) setStatus(order.status)
    } finally {
      setSaving(false)
      setConfirmCancel(false)
    }
  }

  const saveStatus = () => {
    if (status === 'cancelled') {
      setConfirmCancel(true)
      return
    }
    persist(status)
  }

  if (loading) return <Spinner label="Loading order…" />
  if (error) return <ErrorAlert message={error} onRetry={load} />
  if (!order) return null

  const addr = order.shippingAddress || {}
  // Only surface billing when it differs from shipping (checkout defaults them equal).
  const billing =
    order.billingAddress && JSON.stringify(order.billingAddress) !== JSON.stringify(order.shippingAddress)
      ? order.billingAddress
      : null

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link to="/admin/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" /> Back to orders
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
          <div className="flex items-center gap-2">
            <StatusBadge status={order.paymentStatus} />
            <StatusBadge status={order.status} />
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500">Placed {formatDate(order.createdAt)}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Customer</h2>
          <dl className="mt-3 space-y-1 text-sm text-gray-600">
            <div><span className="text-gray-500">Name:</span> {order.customer?.name || '—'}</div>
            <div><span className="text-gray-500">Email:</span> {order.customer?.email || '—'}</div>
            <div><span className="text-gray-500">Phone:</span> {order.customer?.phone || '—'}</div>
          </dl>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Shipping Address</h2>
          <div className="mt-3 space-y-0.5 text-sm text-gray-600">
            <div>{addr.line1}</div>
            {addr.line2 && <div>{addr.line2}</div>}
            <div>{[addr.city, addr.state, addr.postal_code].filter(Boolean).join(', ')}</div>
            <div>{addr.country}</div>
          </div>
          {billing && (
            <div className="mt-4 border-t border-gray-100 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Billing Address</p>
              <div className="mt-1 space-y-0.5 text-sm text-gray-600">
                <div>{billing.line1}</div>
                {billing.line2 && <div>{billing.line2}</div>}
                <div>{[billing.city, billing.state, billing.postal_code].filter(Boolean).join(', ')}</div>
                <div>{billing.country}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Variant</th>
                <th className="px-5 py-3">Qty</th>
                <th className="px-5 py-3">Unit Price</th>
                <th className="px-5 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(order.items || []).map((it) => (
                <tr key={it.id}>
                  <td className="px-5 py-3 font-medium text-gray-900">{it.name}</td>
                  <td className="px-5 py-3 text-gray-600">{formatColorText(it.variant) || '—'}</td>
                  <td className="px-5 py-3 text-gray-700">{it.quantity}</td>
                  <td className="px-5 py-3 text-gray-700">{formatCurrency(it.unitPrice)}</td>
                  <td className="px-5 py-3 text-gray-700">{formatCurrency(it.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <dl className="space-y-1 border-t border-gray-200 px-5 py-4 text-sm">
          <div className="flex justify-between text-gray-600"><dt>Subtotal</dt><dd>{formatCurrency(order.subtotal)}</dd></div>
          <div className="flex justify-between text-gray-600"><dt>Discount</dt><dd>-{formatCurrency(order.discount)}</dd></div>
          <div className="flex justify-between text-gray-600"><dt>Shipping</dt><dd>{formatCurrency(order.shipping)}</dd></div>
          <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-semibold text-gray-900"><dt>Total</dt><dd>{formatCurrency(order.total)}</dd></div>
        </dl>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Update Order Status</h2>
        {statusError && <div className="mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{statusError}</div>}
        {statusOk && <div className="mt-3 rounded-lg bg-green-50 px-4 py-2.5 text-sm text-green-700">{statusOk}</div>}
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm capitalize outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 sm:w-56"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
          <button
            onClick={saveStatus}
            disabled={saving || status === order.status}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? 'Updating…' : 'Update Status'}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="Cancel order"
        message={`Cancel order ${order.orderNumber}? This marks the whole order as cancelled.`}
        confirmLabel="Cancel order"
        busy={saving}
        onCancel={() => {
          setConfirmCancel(false)
          setStatus(order.status)
        }}
        onConfirm={() => persist('cancelled')}
      />
    </div>
  )
}
