import { startTransition, useCallback, useEffect, useState } from 'react'
import { CalendarPlus, Trash2 } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { Input, Label, Select } from '../components/ui/Field.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import TableShell from '../components/ui/TableShell.jsx'
import { tableRoot, theadRow, th, tbodyRow, td } from '../components/ui/tableClasses.js'
import { apiJson } from '../lib/api.js'
import { useAuth } from '../lib/auth-context.js'

const emptyStaffForm = {
  patientName: '',
  collegeId: '',
  category: 'student',
  department: '',
  doctorName: '',
  date: '',
  time: '',
  status: 'Scheduled',
}

function formatDate(d) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString()
  } catch {
    return '—'
  }
}

export default function AppointmentsPage() {
  const { user } = useAuth()
  const role = user?.role
  const isStaff = role === 'admin' || role === 'staff'
  const isDoctor = role === 'doctor'
  const isMember = role === 'member'
  const [rows, setRows] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyStaffForm)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    await Promise.resolve()
    setLoading(true)
    setError('')
    try {
      const res = await apiJson('/api/appointments')
      setRows(res.data ?? [])
    } catch (e) {
      setError(e.message || 'Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadDoctors = useCallback(async () => {
    try {
      const res = await apiJson('/api/doctors')
      setDoctors(res.data ?? [])
    } catch {
      setDoctors([])
    }
  }, [])

  useEffect(() => {
    startTransition(() => {
      void load()
      if (isMember) void loadDoctors()
    })
  }, [load, loadDoctors, isMember])

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (isMember) {
        await apiJson('/api/appointments', {
          method: 'POST',
          body: {
            doctorName: form.doctorName,
            date: form.date ? new Date(form.date).toISOString() : undefined,
            time: form.time,
          },
        })
      } else {
        await apiJson('/api/appointments', {
          method: 'POST',
          body: {
            patientName: form.patientName,
            collegeId: form.collegeId?.trim() || '',
            category: form.category,
            department: form.department?.trim() || '',
            doctorName: form.doctorName,
            date: form.date ? new Date(form.date).toISOString() : undefined,
            time: form.time,
            status: form.status,
          },
        })
      }
      setForm(emptyStaffForm)
      await load()
    } catch (err) {
      setError(err.message || 'Could not book appointment')
    } finally {
      setSaving(false)
    }
  }

  async function updateStatus(id, status) {
    setError('')
    try {
      await apiJson(`/api/appointments/${id}/status`, {
        method: 'PATCH',
        body: { status },
      })
      await load()
    } catch (e) {
      setError(e.message || 'Status update failed')
    }
  }

  async function handleDelete(id) {
    const message = isMember ? 'Cancel this appointment?' : 'Delete this appointment?'
    if (!confirm(message)) return
    try {
      await apiJson(`/api/appointments/${id}`, { method: 'DELETE' })
      await load()
    } catch (e) {
      setError(e.message || (isMember ? 'Cancel failed' : 'Delete failed'))
    }
  }

  const canManage = isStaff || isDoctor
  const canBook = isStaff || isMember

  return (
    <div className="space-y-5 sm:space-y-6">
      {error && (
        <div className="rounded-3xl border border-red-200/90 bg-red-50/95 px-4 py-3 text-sm text-red-800 shadow-sm">
          {error}
        </div>
      )}

      {canBook && (
        <Card title={isMember ? 'Book an appointment' : 'Book appointment'}>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            {!isMember && (
              <>
                <div>
                  <Label htmlFor="a-patient">Patient name</Label>
                  <Input id="a-patient" required value={form.patientName} onChange={(e) => updateField('patientName', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="a-college">College ID</Label>
                  <Input id="a-college" required value={form.collegeId} onChange={(e) => updateField('collegeId', e.target.value)} placeholder="e.g. 2337373 or EMP-1001" />
                </div>
                <div>
                  <Label htmlFor="a-category">Category</Label>
                  <Select id="a-category" value={form.category} onChange={(e) => updateField('category', e.target.value)}>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="a-dept">Department</Label>
                  <Input id="a-dept" required value={form.department} onChange={(e) => updateField('department', e.target.value)} placeholder="e.g. Mechanical" />
                </div>
              </>
            )}
            <div className={isMember ? 'md:col-span-2' : ''}>
              <Label htmlFor="a-doctor">Doctor</Label>
              {isMember ? (
                <Select id="a-doctor" required value={form.doctorName} onChange={(e) => updateField('doctorName', e.target.value)}>
                  <option value="">Choose a doctor…</option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d.name}>
                      {d.name} · {d.specialization}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input id="a-doctor" required value={form.doctorName} onChange={(e) => updateField('doctorName', e.target.value)} />
              )}
            </div>
            <div>
              <Label htmlFor="a-date">Date</Label>
              <Input id="a-date" type="date" required value={form.date} onChange={(e) => updateField('date', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="a-time">Time (HH:mm)</Label>
              <Input id="a-time" required placeholder="14:30" pattern="^([01]\\d|2[0-3]):[0-5]\\d$" value={form.time} onChange={(e) => updateField('time', e.target.value)} />
            </div>
            {!isMember && (
              <div>
                <Label htmlFor="a-status">Status</Label>
                <Select id="a-status" value={form.status} onChange={(e) => updateField('status', e.target.value)}>
                  <option>Scheduled</option>
                  <option>Completed</option>
                </Select>
              </div>
            )}
            <div className="flex items-end">
              <Button type="submit" disabled={saving} className="gap-2">
                <CalendarPlus className="h-4 w-4" aria-hidden />
                {saving ? 'Booking…' : isMember ? 'Book my appointment' : 'Book appointment'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card
        title={isMember ? 'My appointments' : isDoctor ? 'Consultation schedule' : 'Schedule'}
        subtitle={loading ? 'Loading…' : `${rows.length} appointment(s)`}
      >
        <TableShell>
          <table className={tableRoot}>
            <thead>
              <tr className={theadRow}>
                <th className={th}>Patient</th>
                <th className={th}>College ID</th>
                <th className={th}>Department</th>
                <th className={th}>Doctor</th>
                <th className={th}>Date</th>
                <th className={th}>Time</th>
                <th className={th}>Status</th>
                {(canManage || isMember) && <th className={`${th} text-right`}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={canManage || isMember ? 8 : 7} className="py-14 text-center">
                    <div className="flex justify-center">
                      <Spinner size="md" caption="Loading schedule…" />
                    </div>
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={canManage || isMember ? 8 : 7} className="px-5 py-12 text-center text-sm text-slate-500">
                    No appointments yet.
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((r) => (
                  <tr key={r._id} className={tbodyRow}>
                    <td className={`${td} font-medium text-slate-900`}>{r.patientName}</td>
                    <td className={`${td} font-mono text-xs text-slate-600`}>{r.collegeId?.trim() || '—'}</td>
                    <td className={td}>{r.department?.trim() || '—'}</td>
                    <td className={td}>{r.doctorName}</td>
                    <td className={`${td} whitespace-nowrap`}>{formatDate(r.date)}</td>
                    <td className={`${td} font-mono text-xs`}>{r.time}</td>
                    <td className={td}>
                      {canManage ? (
                        <Select
                          aria-label={`Status for ${r.patientName}`}
                          className="max-w-[160px] rounded-2xl py-2 text-xs"
                          value={r.status}
                          onChange={(e) => updateStatus(r._id, e.target.value)}
                        >
                          <option>Scheduled</option>
                          <option>Completed</option>
                        </Select>
                      ) : (
                        <span className="inline-flex rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {r.status}
                        </span>
                      )}
                    </td>
                    {canManage && (
                      <td className={`${td} text-right`}>
                        {isDoctor ? (
                          <Button
                            type="button"
                            variant="secondary"
                            className="gap-1.5 rounded-2xl px-3 py-2 text-xs"
                            onClick={() => updateStatus(r._id, r.status === 'Completed' ? 'Scheduled' : 'Completed')}
                          >
                            {r.status === 'Completed' ? 'Mark scheduled' : 'Complete'}
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="danger"
                            className="gap-1.5 rounded-2xl px-3 py-2 text-xs"
                            onClick={() => handleDelete(r._id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                            Delete
                          </Button>
                        )}
                      </td>
                    )}
                    {isMember && (
                      <td className={`${td} text-right`}>
                        {r.status === 'Scheduled' && (
                          <Button
                            type="button"
                            variant="danger"
                            className="gap-1.5 rounded-2xl px-3 py-2 text-xs"
                            onClick={() => handleDelete(r._id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                            Cancel
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </TableShell>
      </Card>
    </div>
  )
}