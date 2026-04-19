import { startTransition, useCallback, useEffect, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { Input, Label, Select } from '../components/ui/Field.jsx'
import { apiJson } from '../lib/api.js'

const emptyForm = {
  patientName: '',
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
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      <Card title="Book appointment" subtitle="POST /api/appointments · time in 24h HH:mm">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="a-patient">Patient name</Label>
            <Input id="a-patient" required value={form.patientName} onChange={(e) => updateField('patientName', e.target.value)} />
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
            <Button type="submit" disabled={saving}>
              {saving ? 'Booking…' : 'Book appointment'}
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Schedule" subtitle={loading ? 'Loading…' : `${rows.length} appointment(s)`}>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="py-3 pr-4">Patient</th>
                <th className="py-3 pr-4">Doctor</th>
                <th className="py-3 pr-4">Date</th>
                <th className="py-3 pr-4">Time</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No appointments yet.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r._id} className="text-slate-700">
                  <td className="py-3 pr-4 font-medium text-slate-900">{r.patientName}</td>
                  <td className="py-3 pr-4">{r.doctorName}</td>
                  <td className="py-3 pr-4 whitespace-nowrap">{formatDate(r.date)}</td>
                  <td className="py-3 pr-4">{r.time}</td>
                  <td className="py-3 pr-4">
                    <Select
                      aria-label={`Status for ${r.patientName}`}
                      className="max-w-[140px] py-1.5 text-xs"
                      value={r.status}
                      onChange={(e) => updateStatus(r._id, e.target.value)}
                    >
                      <option>Scheduled</option>
                      <option>Completed</option>
                    </Select>
                  </td>
                  <td className="py-3 text-right">
                    <Button type="button" variant="danger" className="px-3 py-1.5 text-xs" onClick={() => handleDelete(r._id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
