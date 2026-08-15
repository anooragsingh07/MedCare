import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Activity, Lock, LogIn } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import { Input, Label } from '../components/ui/Field.jsx'
import { useAuth } from '../lib/auth-context.js'

export default function LoginPage() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [uid, setUid] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!loading && user) {
    const from = location.state?.from?.pathname || '/'
    return <Navigate to={from} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const loggedUser = await login(uid.trim(), password)
      if (loggedUser?.mustChangePassword) {
        navigate('/change-password', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen min-h-dvh items-center justify-center bg-[#eef2f6] px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-hospital-600 text-white shadow-lg shadow-hospital-950/30">
            <Activity className="h-7 w-7" aria-hidden />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">MedCare</h1>
          <p className="mt-1 text-sm text-slate-500">College dispensary · sign in with your UID</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.18)] sm:p-8"
        >
          {error && (
            <div className="mb-4 rounded-2xl border border-red-200/90 bg-red-50/95 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="login-uid">UID / username</Label>
              <Input
                id="login-uid"
                autoComplete="username"
                placeholder="e.g. 2337373, staff, admin"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={busy} className="mt-6 w-full gap-2">
            <LogIn className="h-4 w-4" aria-hidden />
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>

          <p className="mt-4 text-center text-sm text-slate-500">
            New student or teacher?{' '}
            <Link to="/register" className="font-semibold text-hospital-700 hover:underline">
              Create an account
            </Link>
          </p>
        </form>

        <p className="mt-4 text-center text-xs leading-relaxed text-slate-400">
          Demo accounts — admin / admin123 · staff / staff123 · doctor DR-2301 / doctor123 · student 2337373 /
          student123 · teacher EMP-1001 / teacher123
        </p>
      </div>
    </div>
  )
}