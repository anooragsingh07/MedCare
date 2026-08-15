import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import { Input, Label } from '../components/ui/Field.jsx'
import { useAuth } from '../lib/auth-context.js'

export default function ChangePasswordPage() {
  const { user, loading, changePassword } = useAuth()
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!loading && !user) return <Navigate to="/login" replace />
  if (!loading && user && !user.mustChangePassword) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      setBusy(false)
      return
    }
    if (newPassword !== confirm) {
      setError('New passwords do not match')
      setBusy(false)
      return
    }
    try {
      await changePassword(currentPassword, newPassword)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not change password')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen min-h-dvh items-center justify-center bg-[#eef2f6] px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-hospital-600 text-white shadow-lg shadow-hospital-950/30">
            <KeyRound className="h-7 w-7" aria-hidden />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Set a new password</h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome {user?.name || user?.uid}. Please choose a personal password to continue.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-md sm:p-8"
        >
          {error && (
            <div className="mb-4 rounded-2xl border border-red-200/90 bg-red-50/95 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="cp-current">Current password</Label>
              <Input
                id="cp-current"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="cp-new">New password</Label>
              <Input
                id="cp-new"
                type="password"
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="cp-confirm">Confirm new password</Label>
              <Input
                id="cp-confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" disabled={busy} className="mt-6 w-full">
            {busy ? 'Saving…' : 'Save new password'}
          </Button>
        </form>
      </div>
    </div>
  )
}