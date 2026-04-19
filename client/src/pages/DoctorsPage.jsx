import { startTransition, useCallback, useEffect, useState } from 'react'
import { Stethoscope } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { Input, Label, Select } from '../components/ui/Field.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import TableShell from '../components/ui/TableShell.jsx'
import { tableRoot, theadRow, th, tbodyRow, td } from '../components/ui/tableClasses.js'
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
        <div className="rounded-2xl border border-red-200/90 bg-red-50/95 px-4 py-3 text-sm text-red-800 shadow-sm">
          {error}
        </div>
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

          <Button type="submit" disabled={saving} className="gap-2">
            <Stethoscope className="h-4 w-4" aria-hidden />
            {saving ? 'Saving…' : 'Add doctor'}
          </Button>
        </form>
      </Card>

      <Card title="Medical staff" subtitle={loading ? 'Loading…' : `${rows.length} doctor(s)`}>
        <TableShell>
          <table className={tableRoot}>
            <thead>
              <tr className={theadRow}>
                <th className={th}>Name</th>
                <th className={th}>Specialization</th>
                <th className={th}>Availability</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={3} className="py-14 text-center">
                    <div className="flex justify-center">
                      <Spinner size="md" caption="Loading medical staff…" />
                    </div>
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-12 text-center text-sm text-slate-500">
                    No doctors yet.
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((r) => (
                  <tr key={r._id} className={`${tbodyRow} align-top`}>
                    <td className={`${td} font-medium text-slate-900`}>{r.name}</td>
                    <td className={td}>{r.specialization}</td>
                    <td className={`${td} text-slate-600`}>
                      <ul className="space-y-1.5 text-xs sm:text-sm">
                        {(r.availability || []).map((a, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-1.5"
                          >
                            <span className="font-medium text-slate-800">{a.dayOfWeek}</span>
                            <span className="text-slate-500">
                              {a.startTime}–{a.endTime}
                            </span>
                          </li>
                        ))}
                      </ul>
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
