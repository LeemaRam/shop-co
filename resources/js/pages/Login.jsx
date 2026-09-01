import { useState } from 'react'
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function landingFor(role) {
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'vendor') return '/vendor/dashboard'
  return '/'
}

export default function Login() {
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    const to = location.state?.from?.pathname || landingFor(user?.role)
    return <Navigate to={to} replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const loggedIn = await login(email, password)
      const to = location.state?.from?.pathname || landingFor(loggedIn.role)
      navigate(to, { replace: true })
    } catch (err) {
      setError(err.status === 401 ? 'Invalid email or password.' : err.message || 'Unable to sign in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link to="/" className="text-2xl font-bold tracking-tight">
            SHOP.CO
          </Link>
          <p className="mt-2 text-sm text-gray-500">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            placeholder="you@example.com"
            autoComplete="username"
          />

          <label className="mt-4 block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>

          <p className="mt-4 text-center text-xs text-gray-400">
            Vendors and admins are redirected to their portals automatically.
          </p>
        </form>
      </div>
    </div>
  )
}
