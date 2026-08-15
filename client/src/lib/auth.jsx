import { useEffect, useState } from 'react'
import { http } from './http.js'
import { AuthContext } from './auth-context.js'

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('medcare_user') || 'null')
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('medcare_token')))

  useEffect(() => {
    let cancelled = false
    const token = localStorage.getItem('medcare_token')
    if (!token) {
      return () => {
        cancelled = true
      }
    }
    http
      .get('/auth/me')
      .then((res) => {
        if (cancelled) return
        setUser(res.data?.user ?? null)
        localStorage.setItem('medcare_user', JSON.stringify(res.data?.user ?? null))
      })
      .catch(() => {
        if (cancelled) return
        setUser(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null)
    }
    window.addEventListener('medcare:unauthorized', onUnauthorized)
    return () => window.removeEventListener('medcare:unauthorized', onUnauthorized)
  }, [])

  async function login(uid, password) {
    const res = await http.post('/auth/login', { uid, password })
    const { token, user: loggedUser } = res.data
    localStorage.setItem('medcare_token', token)
    localStorage.setItem('medcare_user', JSON.stringify(loggedUser))
    setUser(loggedUser)
    return loggedUser
  }

  async function changePassword(currentPassword, newPassword) {
    const res = await http.patch('/auth/password', { currentPassword, newPassword })
    const updated = res.data?.user
    if (updated) {
      const next = { ...user, ...updated }
      setUser(next)
      localStorage.setItem('medcare_user', JSON.stringify(next))
    }
    return updated
  }

  function logout() {
    localStorage.removeItem('medcare_token')
    localStorage.removeItem('medcare_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, changePassword, logout }}>
      {children}
    </AuthContext.Provider>
  )
}