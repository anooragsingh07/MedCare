import { useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2 } from 'lucide-react'
import Button from '../ui/Button.jsx'
import { Input, Label, Textarea } from '../ui/Field.jsx'
import { patientsApi } from '../../services/patientsApi.js'

function medsFromPatient(patient) {
  const arr = patient?.prescribedMedicines
  if (!Array.isArray(arr)) return []
  return arr
    .map((m) => {
      if (typeof m === 'string') return { medicine: m, dosage: '' }
      if (m && typeof m === 'object') {
        return {
          medicine: String(m.medicine ?? m.name ?? '').trim(),
          dosage: String(m.dosage ?? '').trim(),
        }
      }
      return { medicine: '', dosage: '' }
    })
    .filter((m) => m.medicine)
}

export default function EditClinicalModal({ patient, open, onClose, onSaved }) {
  const [saving, setSaving] = useState(false)
  const [diagnosis, setDiagnosis] = useState(() => patient?.diagnosis ?? '')
  const [meds, setMeds] = useState(() => {
    const existing = medsFromPatient(patient)
    return existing.length ? existing : [{ medicine: '', dosage: '' }]
  })

  if (!open || !patient) return null

  function setMed(index, key, value) {
    setMeds((prev) => prev.map((m, i) => (i === index ? { ...m, [key]: value } : m)))
  }

  function addMed() {
    setMeds((prev) => [...prev, { medicine: '', dosage: '' }])
  }

  function removeMed(index) {
    setMeds((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const prescribedMedicines = meds
      .map((m) => ({ medicine: m.medicine.trim(), dosage: m.dosage.trim() || 'As directed' }))
      .filter((m) => m.medicine)
    setSaving(true)
    try {
      await patientsApi.update(patient._id, { diagnosis: diagnosis.trim(), prescribedMedicines })
      toast.success('Clinical record updated')
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
        className="relative z-10 max-h-[min(90vh,100dvh-1.5rem)] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-xl sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-clinical-title"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="edit-clinical-title" className="text-lg font-semibold text-slate-900">
              Update clinical record
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {patient.name} · {patient.collegeId} · Diagnosis and prescribed medicines only.
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="ec-diagnosis">Diagnosis</Label>
            <Textarea id="ec-diagnosis" rows={3} value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200/90 bg-slate-50/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="mb-0">Prescribed medicines &amp; dosage</Label>
              <Button
                type="button"
                variant="secondary"
                className="gap-1.5 rounded-lg px-3 py-2 text-xs"
                onClick={addMed}
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
                Add line
              </Button>
            </div>
            <ul className="space-y-3">
              {meds.map((m, index) => (
                <li key={index} className="grid gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                  <div>
                    <Label htmlFor={`ec-med-${index}`}>Medicine</Label>
                    <Input
                      id={`ec-med-${index}`}
                      placeholder="e.g. Paracetamol 500mg"
                      value={m.medicine}
                      onChange={(e) => setMed(index, 'medicine', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`ec-dose-${index}`}>Dosage</Label>
                    <Input
                      id={`ec-dose-${index}`}
                      placeholder="e.g. 1 tablet twice daily after meals"
                      value={m.dosage}
                      onChange={(e) => setMed(index, 'dosage', e.target.value)}
                    />
                  </div>
                  <div className="flex sm:justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      className="gap-1.5 rounded-lg px-3 py-2 text-xs text-slate-600"
                      disabled={meds.length <= 1}
                      onClick={() => removeMed(index)}
                      aria-label={`Remove medicine row ${index + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save clinical record'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}