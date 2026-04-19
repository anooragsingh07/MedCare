import { useState } from 'react'
import toast from 'react-hot-toast'
import PatientForm from './PatientForm.jsx'
import { patientToFormDefaults } from '../../lib/patientForm.js'
import { patientsApi } from '../../services/patientsApi.js'

export default function EditPatientModal({ patient, open, onClose, onSaved }) {
  const [saving, setSaving] = useState(false)

  if (!open || !patient) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-patient-title"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="edit-patient-title" className="text-lg font-semibold text-slate-900">
              Edit patient
            </h2>
            <p className="mt-1 text-sm text-slate-500">Update chart details and save to the server.</p>
          </div>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <PatientForm
          key={patient._id}
          formId="edit-patient"
          defaultValues={patientToFormDefaults(patient)}
          submitLabel="Save changes"
          isSubmitting={saving}
          onSubmit={async (payload) => {
            setSaving(true)
            try {
              await patientsApi.update(patient._id, payload)
              toast.success('Patient updated')
              onSaved?.()
              onClose()
            } catch (e) {
              toast.error(e.message || 'Update failed')
            } finally {
              setSaving(false)
            }
          }}
        />
      </div>
    </div>
  )
}
