import { startTransition, useCallback, useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import Card from '../components/ui/Card.jsx'
import EditPatientModal from '../components/patients/EditPatientModal.jsx'
import PatientForm from '../components/patients/PatientForm.jsx'
import PatientSearch from '../components/patients/PatientSearch.jsx'
import PatientTable from '../components/patients/PatientTable.jsx'
import { patientToFormDefaults } from '../lib/patientForm.js'
import { patientsApi } from '../services/patientsApi.js'

export default function PatientsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [createKey, setCreateKey] = useState(0)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const loadPatients = useCallback(async () => {
    await Promise.resolve()
    setLoading(true)
    setLoadError('')
    try {
      const res = await patientsApi.list(debouncedSearch)
      setRows(res.data ?? [])
    } catch (e) {
      setLoadError(e.message || 'Failed to load patients')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch])

  useEffect(() => {
    startTransition(() => {
      void loadPatients()
    })
  }, [loadPatients])

  return (
    <div className="space-y-5 sm:space-y-6">
      {loadError && (
        <div className="flex gap-3 rounded-3xl border border-amber-200/90 bg-amber-50/95 px-4 py-3 text-sm text-amber-950 shadow-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
          <div>
            <p className="font-semibold">Patients list unavailable</p>
            <p className="mt-1 leading-relaxed text-amber-900/90">
              {loadError} · Confirm the API and database are running.
            </p>
          </div>
        </div>
      )}

      <Card title="Register patient">
        <PatientForm
          key={createKey}
          formId="create-patient"
          defaultValues={patientToFormDefaults()}
          submitLabel="Add patient"
          isSubmitting={creating}
          onSubmit={async (payload) => {
            setCreating(true)
            try {
              await patientsApi.create(payload)
              toast.success('Patient added successfully')
              setCreateKey((k) => k + 1)
              await loadPatients()
            } catch (e) {
              toast.error(e.message || 'Could not add patient')
            } finally {
              setCreating(false)
            }
          }}
        />
      </Card>

      <Card
        title="Patient directory"
        subtitle={
          loading
            ? 'Loading…'
            : `${rows.length} record(s)${debouncedSearch ? ` · filter “${debouncedSearch}” (name, roll no., department)` : ''}`
        }
        actions={<PatientSearch value={searchInput} onChange={setSearchInput} disabled={loading} />}
      >
        <PatientTable
          patients={rows}
          loading={loading}
          filterActive={Boolean(debouncedSearch)}
          onEdit={(p) => setEditing(p)}
          onDelete={async (p) => {
            if (!confirm(`Delete patient “${p.name}”? This cannot be undone.`)) return
            const t = toast.loading('Deleting…')
            try {
              await patientsApi.remove(p._id)
              toast.success('Patient deleted', { id: t })
              await loadPatients()
            } catch (e) {
              toast.error(e.message || 'Delete failed', { id: t })
            }
          }}
        />
      </Card>

      <EditPatientModal
        key={editing?._id ?? 'closed'}
        patient={editing}
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        onSaved={loadPatients}
      />
    </div>
  )
}
