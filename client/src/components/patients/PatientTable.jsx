import Button from '../ui/Button.jsx'

function formatVisit(d) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleString()
  } catch {
    return '—'
  }
}

export default function PatientTable({ patients, loading, onEdit, onDelete, filterActive }) {
  return (
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
          {loading && (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-500">
                Loading patients…
              </td>
            </tr>
          )}
          {!loading && patients.length === 0 && (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-500">
                {filterActive
                  ? 'No patients match this search. Try another name or clear the filter.'
                  : 'No patients yet. Register someone using the form above.'}
              </td>
            </tr>
          )}
          {!loading &&
            patients.map((r) => (
              <tr key={r._id} className="text-slate-700">
                <td className="py-3 pr-4 font-medium text-slate-900">{r.name}</td>
                <td className="py-3 pr-4">{r.age}</td>
                <td className="py-3 pr-4">{r.gender}</td>
                <td className="py-3 pr-4 whitespace-nowrap">{r.phone}</td>
                <td className="py-3 pr-4 whitespace-nowrap text-slate-600">{formatVisit(r.visitDate)}</td>
                <td className="py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => onEdit(r)}>
                      Edit
                    </Button>
                    <Button type="button" variant="danger" className="px-3 py-1.5 text-xs" onClick={() => onDelete(r)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
