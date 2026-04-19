import { startTransition, useCallback, useEffect, useState } from 'react'
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
    <div className="space-y-6">
      {loadError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {loadError} · Confirm the API and database are running.
        </div>
      )}

      <Card title="Register patient" subtitle="Validated form · POST /api/patients via Axios">
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
        subtitle={loading ? 'Loading…' : `${rows.length} record(s)${debouncedSearch ? ` · filter “${debouncedSearch}”` : ''}`}
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
