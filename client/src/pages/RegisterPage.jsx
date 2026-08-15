import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Activity, Lock, UserPlus } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import { Input, Label, Select } from '../components/ui/Field.jsx'
import { useAuth } from '../lib/auth-context.js'

const emptyForm = {
  uid: '',
  name: '',
  category: 'student',
  department: '',
  password: '',
  confirm: '',
}

export default function RegisterPage() {
  const { user, loading, register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!loading && user) {
    return <Navigate to="/" replace />
  }

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    setBusy(true)
    try {
      await register({
        uid: form.uid.trim(),
        name: form.name.trim(),
        category: form.category,
        department: form.department.trim(),
        password: form.password,
      })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen min-h-dvh items-center justify-center bg-[#eef2f6] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-hospital-600 text-white shadow-lg shadow-hospital-950/30">
            <Activity className="h-7 w-7" aria-hidden />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Students &amp; teachers can register with their college ID
          </p>
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
              <Label htmlFor="reg-uid">College ID</Label>
              <Input
                id="reg-uid"
                required
                placeholder="e.g. 2337373 or EMP-1001"
                value={form.uid}
                onChange={(e) => setField('uid', e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="reg-name">Full name</Label>
              <Input
                id="reg-name"
                required
                placeholder="As listed in the members directory"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reg-category">I am a</Label>
                <Select id="reg-category" value={form.category} onChange={(e) => setField('category', e.target.value)}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="reg-dept">Department</Label>
                <Input
                  id="reg-dept"
                  required
                  placeholder="e.g. Computer Science"
                  value={form.department}
                  onChange={(e) => setField('department', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="reg-password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
                <Input
                  id="reg-password"
                  type="password"
                  autoComplete="new-password"
                  className="pl-10"
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="reg-confirm">Confirm password</Label>
              <Input
                id="reg-confirm"
                type="password"
                autoComplete="new-password"
                value={form.confirm}
                onChange={(e) => setField('confirm', e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" disabled={busy} className="mt-6 w-full gap-2">
            <UserPlus className="h-4 w-4" aria-hidden />
            {busy ? 'Registering…' : 'Create account'}
          </Button>

          <p className="mt-4 text-center text-sm text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-hospital-700 hover:underline">
              Sign in
            </Link>
          </p>
        </form>

        <p className="mt-4 text-center text-xs leading-relaxed text-slate-400">
          Your college ID must already be in the dispensary members directory.
        </p>
      </div>
    </div>
  )
}