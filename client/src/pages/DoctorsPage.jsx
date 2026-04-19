import { startTransition, useCallback, useEffect, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { Input, Label, Select } from '../components/ui/Field.jsx'
import { apiJson } from '../lib/api.js'

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const defaultSlot = () => ({ dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' })

export default function DoctorsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [slots, setSlots] = useState([defaultSlot()])
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    await Promise.resolve()
    setLoading(true)
    setError('')
    try {
      const res = await apiJson('/api/doctors')
      setRows(res.data ?? [])
    } catch (e) {
      setError(e.message || 'Failed to load doctors')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    startTransition(() => {
      void load()
    })
  }, [load])

  function updateSlot(i, key, value) {
    setSlots((prev) => prev.map((s, idx) => (idx === i ? { ...s, [key]: value } : s)))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await apiJson('/api/doctors', {
        method: 'POST',
        body: {
          name,
          specialization,
          availability: slots,
        },
      })
      setName('')
      setSpecialization('')
      setSlots([defaultSlot()])
      await load()
    } catch (err) {
      setError(err.message || 'Could not add doctor')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      <Card title="Add doctor" subtitle="Include at least one weekly availability block">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="d-name">Name</Label>
              <Input id="d-name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="d-spec">Specialization</Label>
              <Input id="d-spec" required value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
            </div>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-800">Availability</p>
              <Button
                type="button"
                variant="secondary"
                className="px-3 py-1.5 text-xs"
                onClick={() => setSlots((s) => [...s, defaultSlot()])}
              >
                Add slot
              </Button>
            </div>
            <div className="space-y-3">
              {slots.map((slot, i) => (
                <div key={i} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-4">
                  <div className="sm:col-span-1">
                    <Label htmlFor={`d-day-${i}`}>Day</Label>
                    <Select id={`d-day-${i}`} value={slot.dayOfWeek} onChange={(e) => updateSlot(i, 'dayOfWeek', e.target.value)}>
                      {WEEKDAYS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`d-s-${i}`}>From</Label>
                    <Input id={`d-s-${i}`} required value={slot.startTime} onChange={(e) => updateSlot(i, 'startTime', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor={`d-e-${i}`}>To</Label>
                    <Input id={`d-e-${i}`} required value={slot.endTime} onChange={(e) => updateSlot(i, 'endTime', e.target.value)} />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full px-2 py-2 text-xs"
                      disabled={slots.length <= 1}
                      onClick={() => setSlots((s) => s.filter((_, idx) => idx !== i))}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Add doctor'}
          </Button>
        </form>
      </Card>

      <Card title="Medical staff" subtitle={loading ? 'Loading…' : `${rows.length} doctor(s)`}>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Specialization</th>
                <th className="py-3">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-500">
                    No doctors yet.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r._id} className="align-top text-slate-700">
                  <td className="py-3 pr-4 font-medium text-slate-900">{r.name}</td>
                  <td className="py-3 pr-4">{r.specialization}</td>
                  <td className="py-3 text-slate-600">
                    <ul className="list-inside list-disc space-y-1 text-xs sm:text-sm">
                      {(r.availability || []).map((a, idx) => (
                        <li key={idx}>
                          {a.dayOfWeek}: {a.startTime}–{a.endTime}
                        </li>
                      ))}
                    </ul>
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
