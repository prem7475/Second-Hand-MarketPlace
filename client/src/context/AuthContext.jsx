import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { initializeCsrf, request, setCsrfToken } from '../lib/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    initializeCsrf()
      .then(() => request('/auth/me'))
      .then(({ user: currentUser }) => {
        if (active) setUser(currentUser)
      })
      .catch((error) => {
        if (active && error.status !== 401)
          console.error('Unable to restore the account session:', error)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const signIn = useCallback(async (credentials, isRegistration = false) => {
    const result = await request(`/auth/${isRegistration ? 'register' : 'login'}`, {
      method: 'POST',
      body: credentials,
    })
    setCsrfToken(result.csrfToken)
    setUser(result.user)
    return result.user
  }, [])

  const signOut = useCallback(async () => {
    await request('/auth/logout', { method: 'POST' })
    setUser(null)
    await initializeCsrf()
  }, [])

  const updateUser = useCallback((value) => setUser(value), [])
  const value = useMemo(
    () => ({ user, loading, signIn, signOut, updateUser }),
    [user, loading, signIn, signOut, updateUser],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider.')
  return value
}
