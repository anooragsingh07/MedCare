import { Pencil, Trash2 } from 'lucide-react'
import Button from '../ui/Button.jsx'
import Spinner from '../ui/Spinner.jsx'
import TableShell from '../ui/TableShell.jsx'
import { tableRoot, theadRow, th, tbodyRow, td } from '../ui/tableClasses.js'

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
    <TableShell>
      <table className={tableRoot}>
        <thead>
          <tr className={theadRow}>
            <th className={th}>Name</th>
            <th className={th}>Age</th>
            <th className={th}>Gender</th>
            <th className={th}>Phone</th>
            <th className={th}>Visit</th>
            <th className={`${th} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={6} className="py-14 text-center">
                <div className="flex justify-center">
                  <Spinner size="md" caption="Loading patient records…" />
                </div>
              </td>
            </tr>
          )}
          {!loading && patients.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">
                {filterActive
                  ? 'No patients match this search. Try another name or clear the filter.'
                  : 'No patients yet. Register someone using the form above.'}
              </td>
            </tr>
          )}
          {!loading &&
            patients.map((r) => (
              <tr key={r._id} className={tbodyRow}>
                <td className={`${td} font-medium text-slate-900`}>{r.name}</td>
                <td className={td}>{r.age}</td>
                <td className={td}>{r.gender}</td>
                <td className={`${td} whitespace-nowrap font-mono text-xs text-slate-600`}>{r.phone}</td>
                <td className={`${td} whitespace-nowrap text-slate-600`}>{formatVisit(r.visitDate)}</td>
                <td className={`${td} text-right`}>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="gap-1.5 rounded-lg px-3 py-2 text-xs"
                      onClick={() => onEdit(r)}
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      className="gap-1.5 rounded-lg px-3 py-2 text-xs"
                      onClick={() => onDelete(r)}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </TableShell>
  )
}
