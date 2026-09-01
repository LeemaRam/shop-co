import { useCallback, useEffect, useState } from 'react'
import { adminApi as api } from '../../services/api'
import Spinner from '../../components/common/Spinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import StatusBadge from '../../components/common/StatusBadge'
import Pagination from '../../components/common/Pagination'
import { SearchIcon } from '../../components/common/DashboardIcons'
import { formatDate } from '../../utils/format'

const ROLES = ['', 'customer', 'vendor', 'admin']

export default function Users() {
  const [users, setUsers] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [role, setRole] = useState('')
  const [search, setSearch] = useState('')
  const [applied, setApplied] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    const params = new URLSearchParams({ page: String(page) })
    if (role) params.set('role', role)
    if (applied) params.set('search', applied)
    api
      .users(`?${params.toString()}`)
      .then((res) => {
        setUsers(res.data || [])
        setMeta(res.meta || null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [page, role, applied])

  useEffect(load, [load])

  const submitSearch = (e) => {
    e.preventDefault()
    setApplied(search.trim())
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="mt-1 text-sm text-gray-500">All registered accounts.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={submitSearch} className="flex flex-1 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2">
          <SearchIcon className="h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="w-full text-sm outline-none"
          />
        </form>
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm capitalize outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
        >
          {ROLES.map((r) => (
            <option key={r || 'all'} value={r}>
              {r ? r : 'All roles'}
            </option>
          ))}
        </select>
      </div>

      {error && <ErrorAlert message={error} onRetry={load} />}

      {loading ? (
        <Spinner label="Loading users…" />
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-600">
          No users found.
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Store</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3"><StatusBadge status={u.role} /></td>
                    <td className="px-4 py-3 text-gray-600">{u.phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{u.vendor?.storeName || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
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
    </div>
  )
}
