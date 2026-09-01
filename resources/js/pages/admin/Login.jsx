import { useState } from 'react'
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminLogin() {
  const { login, isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated && isAdmin) {
    const to = location.state?.from?.pathname || '/admin/dashboard'
    return <Navigate to={to} replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password, 'admin')
      navigate(location.state?.from?.pathname || '/admin/dashboard', { replace: true })
    } catch (err) {
      if (err.status === 403) setError('This portal is for administrator accounts only.')
      else if (err.status === 401) setError('Invalid email or password.')
      else setError(err.message || 'Unable to sign in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">SHOP.CO</span>
            <span className="rounded bg-indigo-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Admin
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-400">Administrator sign in</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-gray-700 bg-white p-6 shadow-xl">
          {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            placeholder="admin@shop.co"
            autoComplete="username"
          />

          <label className="mt-4 block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>

          <Link to="/" className="mt-4 block text-center text-xs text-gray-400 hover:text-gray-600">
            ← Back to store
          </Link>
        </form>
      </div>
    </div>
  )
}
