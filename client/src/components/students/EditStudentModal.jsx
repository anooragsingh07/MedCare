import { useState } from 'react'
import toast from 'react-hot-toast'
import Button from '../ui/Button.jsx'
import { Input, Label, Select } from '../ui/Field.jsx'
import { studentsApi } from '../../services/studentsApi.js'

function formFromStudent(student) {
  return {
    uid: student?.uid ?? '',
    name: student?.name ?? '',
    department: student?.department ?? '',
    year: student?.year ?? '',
    phone: student?.phone ?? '',
    gender: student?.gender ?? 'Other',
    address: student?.address ?? '',
  }
}

export default function EditStudentModal({ student, open, onClose, onSaved }) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(() => formFromStudent(student))

  if (!open || !student) return null

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await studentsApi.update(student._id, form)
      toast.success('Student updated')
      onSaved?.()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center sm:p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        className="relative z-10 max-h-[min(90vh,100dvh-1.5rem)] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-xl sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-student-title"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="edit-student-title" className="text-lg font-semibold text-slate-900">
              Edit student
            </h2>
            <p className="mt-1 text-sm text-slate-500">Update directory details and save.</p>
          </div>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="es-uid">UID (roll number)</Label>
            <Input id="es-uid" required value={form.uid} onChange={(e) => setField('uid', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="es-name">Full name</Label>
            <Input id="es-name" required value={form.name} onChange={(e) => setField('name', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="es-dept">Department</Label>
            <Input id="es-dept" required value={form.department} onChange={(e) => setField('department', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="es-year">Year</Label>
            <Input id="es-year" value={form.year} onChange={(e) => setField('year', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="es-phone">Phone</Label>
            <Input id="es-phone" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="es-gender">Gender</Label>
            <Select id="es-gender" value={form.gender} onChange={(e) => setField('gender', e.target.value)}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="es-address">Address</Label>
            <Input id="es-address" value={form.address} onChange={(e) => setField('address', e.target.value)} />
          </div>
          <div className="flex justify-end gap-3 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}