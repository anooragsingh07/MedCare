import { startTransition, useCallback, useEffect, useState } from 'react'
import { CalendarPlus, Trash2 } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { Input, Label, Select } from '../components/ui/Field.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import TableShell from '../components/ui/TableShell.jsx'
import { tableRoot, theadRow, th, tbodyRow, td } from '../components/ui/tableClasses.js'
import { apiJson } from '../lib/api.js'

const emptyForm = {
  patientName: '',
  rollNo: '',
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
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
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

  useEffect(() => {
    startTransition(() => {
      void load()
    })
  }, [load])

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await apiJson('/api/appointments', {
        method: 'POST',
        body: {
          patientName: form.patientName,
          rollNo: form.rollNo?.trim() || '',
          department: form.department?.trim() || '',
          doctorName: form.doctorName,
          date: form.date ? new Date(form.date).toISOString() : undefined,
          time: form.time,
          status: form.status,
        },
      })
      setForm(emptyForm)
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
    if (!confirm('Delete this appointment?')) return
    try {
      await apiJson(`/api/appointments/${id}`, { method: 'DELETE' })
      await load()
    } catch (e) {
      setError(e.message || 'Delete failed')
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {error && (
        <div className="rounded-3xl border border-red-200/90 bg-red-50/95 px-4 py-3 text-sm text-red-800 shadow-sm">
          {error}
        </div>
      )}

      <Card title="Book appointment">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="a-patient">Patient name</Label>
            <Input id="a-patient" required value={form.patientName} onChange={(e) => updateField('patientName', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="a-roll">Roll no.</Label>
            <Input id="a-roll" required value={form.rollNo} onChange={(e) => updateField('rollNo', e.target.value)} placeholder="e.g. 23ME012" />
          </div>
          <div>
            <Label htmlFor="a-dept">Department</Label>
            <Input id="a-dept" required value={form.department} onChange={(e) => updateField('department', e.target.value)} placeholder="e.g. Mechanical" />
          </div>
          <div>
            <Label htmlFor="a-doctor">Doctor name</Label>
            <Input id="a-doctor" required value={form.doctorName} onChange={(e) => updateField('doctorName', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="a-date">Date</Label>
            <Input id="a-date" type="date" required value={form.date} onChange={(e) => updateField('date', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="a-time">Time (HH:mm)</Label>
            <Input id="a-time" required placeholder="14:30" pattern="^([01]\\d|2[0-3]):[0-5]\\d$" value={form.time} onChange={(e) => updateField('time', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="a-status">Status</Label>
            <Select id="a-status" value={form.status} onChange={(e) => updateField('status', e.target.value)}>
              <option>Scheduled</option>
              <option>Completed</option>
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={saving} className="gap-2">
              <CalendarPlus className="h-4 w-4" aria-hidden />
              {saving ? 'Booking…' : 'Book appointment'}
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Schedule" subtitle={loading ? 'Loading…' : `${rows.length} appointment(s)`}>
        <TableShell>
          <table className={tableRoot}>
            <thead>
              <tr className={theadRow}>
                <th className={th}>Patient</th>
                <th className={th}>Roll no.</th>
                <th className={th}>Department</th>
                <th className={th}>Doctor</th>
                <th className={th}>Date</th>
                <th className={th}>Time</th>
                <th className={th}>Status</th>
                <th className={`${th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="py-14 text-center">
                    <div className="flex justify-center">
                      <Spinner size="md" caption="Loading schedule…" />
                    </div>
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-500">
                    No appointments yet.
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((r) => (
                  <tr key={r._id} className={tbodyRow}>
                    <td className={`${td} font-medium text-slate-900`}>{r.patientName}</td>
                    <td className={`${td} font-mono text-xs text-slate-600`}>{r.rollNo?.trim() || '—'}</td>
                    <td className={td}>{r.department?.trim() || '—'}</td>
                    <td className={td}>{r.doctorName}</td>
                    <td className={`${td} whitespace-nowrap`}>{formatDate(r.date)}</td>
                    <td className={`${td} font-mono text-xs`}>{r.time}</td>
                    <td className={td}>
                      <Select
                        aria-label={`Status for ${r.patientName}`}
                        className="max-w-[160px] rounded-2xl py-2 text-xs"
                        value={r.status}
                        onChange={(e) => updateStatus(r._id, e.target.value)}
                      >
                        <option>Scheduled</option>
                        <option>Completed</option>
                      </Select>
                    </td>
                    <td className={`${td} text-right`}>
                      <Button
                        type="button"
                        variant="danger"
                        className="gap-1.5 rounded-2xl px-3 py-2 text-xs"
                        onClick={() => handleDelete(r._id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </TableShell>
      </Card>
    </div>
  )
}
