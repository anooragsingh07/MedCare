import { startTransition, useCallback, useEffect, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { Input, Label, Select, Textarea } from '../components/ui/Field.jsx'
import { apiJson } from '../lib/api.js'

const emptyForm = {
  name: '',
  age: '',
  gender: 'Male',
  phone: '',
  address: '',
  symptoms: '',
  diagnosis: '',
  prescribedMedicines: '',
  visitDate: '',
}

function formatVisit(d) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleString()
  } catch {
    return '—'
  }
}

export default function PatientsPage() {
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
      const res = await apiJson('/api/patients')
      setRows(res.data ?? [])
    } catch (e) {
      setError(e.message || 'Failed to load patients')
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
      const meds = form.prescribedMedicines
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      await apiJson('/api/patients', {
        method: 'POST',
        body: {
          name: form.name,
          age: Number(form.age),
          gender: form.gender,
          phone: form.phone,
          address: form.address,
          symptoms: form.symptoms,
          diagnosis: form.diagnosis,
          prescribedMedicines: meds,
          visitDate: form.visitDate ? new Date(form.visitDate).toISOString() : undefined,
        },
      })
      setForm(emptyForm)
      await load()
    } catch (err) {
      setError(err.message || 'Could not save patient')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this patient record?')) return
    try {
      await apiJson(`/api/patients/${id}`, { method: 'DELETE' })
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

      <Card title="Register patient" subtitle="Creates a record via POST /api/patients">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="p-name">Full name</Label>
            <Input id="p-name" required value={form.name} onChange={(e) => updateField('name', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="p-age">Age</Label>
            <Input id="p-age" type="number" min={0} max={130} required value={form.age} onChange={(e) => updateField('age', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="p-gender">Gender</Label>
            <Select id="p-gender" value={form.gender} onChange={(e) => updateField('gender', e.target.value)}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="p-phone">Phone</Label>
            <Input id="p-phone" required value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="p-address">Address</Label>
            <Textarea id="p-address" required rows={2} value={form.address} onChange={(e) => updateField('address', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="p-symptoms">Symptoms</Label>
            <Textarea id="p-symptoms" rows={2} value={form.symptoms} onChange={(e) => updateField('symptoms', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="p-diagnosis">Diagnosis</Label>
            <Textarea id="p-diagnosis" rows={2} value={form.diagnosis} onChange={(e) => updateField('diagnosis', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="p-meds">Prescribed medicines (comma-separated)</Label>
            <Input
              id="p-meds"
              placeholder="e.g. Amlodipine 5mg, Paracetamol 500mg"
              value={form.prescribedMedicines}
              onChange={(e) => updateField('prescribedMedicines', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="p-visit">Visit date &amp; time</Label>
            <Input id="p-visit" type="datetime-local" required value={form.visitDate} onChange={(e) => updateField('visitDate', e.target.value)} />
          </div>
          <div className="flex items-end md:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Add patient'}
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Patient directory" subtitle={loading ? 'Loading…' : `${rows.length} record(s)`}>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Age</th>
                <th className="py-3 pr-4">Gender</th>
                <th className="py-3 pr-4">Phone</th>
                <th className="py-3 pr-4">Visit</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No patients yet. Add one using the form above.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r._id} className="text-slate-700">
                  <td className="py-3 pr-4 font-medium text-slate-900">{r.name}</td>
                  <td className="py-3 pr-4">{r.age}</td>
                  <td className="py-3 pr-4">{r.gender}</td>
                  <td className="py-3 pr-4 whitespace-nowrap">{r.phone}</td>
                  <td className="py-3 pr-4 whitespace-nowrap text-slate-600">{formatVisit(r.visitDate)}</td>
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
