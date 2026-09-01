import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Spinner from './Spinner'

// Guards a route: requires authentication and, optionally, a specific role.
// Unauthenticated or wrong-role users are sent to the given login page.
export default function ProtectedRoute({ role, loginPath = '/login', children }) {
  const { loading, isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Checking session…" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace state={{ from: location }} />
  }

  if (role && user?.role !== role) {
    return <Navigate to={loginPath} replace state={{ from: location }} />
  }

  return children
}
