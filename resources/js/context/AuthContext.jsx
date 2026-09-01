import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api, { setToken, getToken } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on load if a token is present.
  useEffect(() => {
    if (!getToken()) {
      setLoading(false)
      return
    }
    api
      .me()
      .then((res) => setUser(res.data))
      .catch(() => {
        setToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password, requiredRole = null) => {
    const res = await api.login(email, password)
    const { user: loggedIn, token } = res.data

    if (requiredRole && loggedIn.role !== requiredRole) {
      // Do not persist a session when a specific role was required but not met.
      throw Object.assign(new Error(`This portal is for ${requiredRole} accounts only.`), { status: 403 })
    }

    setToken(token)
    setUser(loggedIn)
    return loggedIn
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.logout()
    } catch {
      // Ignore network/logout errors; clear the local session regardless.
    }
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isCustomer: user?.role === 'customer',
      isVendor: user?.role === 'vendor',
      isAdmin: user?.role === 'admin',
      login,
      logout,
      setUser,
    }),
    [user, loading, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
