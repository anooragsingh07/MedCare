import { FileDown, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../ui/Button.jsx'
import Spinner from '../ui/Spinner.jsx'
import TableShell from '../ui/TableShell.jsx'
import { tableRoot, theadRow, th, tbodyRow, td } from '../ui/tableClasses.js'
import { downloadPdf } from '../../lib/api.js'

function formatVisit(d) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleString()
  } catch {
    return '—'
  }
}

function dash(s) {
  const t = String(s ?? '').trim()
  return t || '—'
}

export default function PatientTable({ patients, loading, onEdit, onDelete, filterActive, readOnly = false }) {
  const colCount = readOnly ? 8 : 9

  async function handlePdf(p) {
    const t = toast.loading('Preparing PDF…')
    try {
      await downloadPdf(`/api/patients/${p._id}/prescription.pdf`, `prescription-${p._id}.pdf`)
      toast.success('Download started', { id: t })
    } catch (e) {
      toast.error(e.message || 'Could not download PDF', { id: t })
    }
  }

  return (
    <TableShell>
      <table className={tableRoot}>
        <thead>
          <tr className={theadRow}>
            <th className={th}>Name</th>
            <th className={th}>Roll no.</th>
            <th className={th}>Department</th>
            <th className={th}>Age</th>
            <th className={th}>Gender</th>
            <th className={th}>Phone</th>
            <th className={th}>Visit</th>
            <th className={`${th} text-right`}>PDF</th>
            {!readOnly && <th className={`${th} text-right`}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={colCount} className="py-14 text-center">
                <div className="flex justify-center">
                  <Spinner size="md" caption="Loading patient records…" />
                </div>
              </td>
            </tr>
          )}
          {!loading && patients.length === 0 && (
            <tr>
              <td colSpan={colCount} className="px-5 py-12 text-center text-sm text-slate-500">
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
                <td className={`${td} font-mono text-xs text-slate-600`}>{dash(r.rollNo)}</td>
                <td className={td}>{dash(r.department)}</td>
                <td className={td}>{r.age}</td>
                <td className={td}>{r.gender}</td>
                <td className={`${td} whitespace-nowrap font-mono text-xs text-slate-600`}>{r.phone}</td>
                <td className={`${td} whitespace-nowrap text-slate-600`}>{formatVisit(r.visitDate)}</td>
                <td className={`${td} text-right`}>
                  <Button
                    type="button"
                    variant="secondary"
                    className="gap-1 rounded-2xl px-2 py-2 text-[11px] sm:gap-1.5 sm:px-3 sm:text-xs"
                    onClick={() => void handlePdf(r)}
                    aria-label={`Download prescription PDF for ${r.name}`}
                  >
                    <FileDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span className="sm:hidden">PDF</span>
                    <span className="hidden sm:inline">Rx PDF</span>
                  </Button>
                </td>
                {!readOnly && (
                  <td className={`${td} text-right`}>
                    <div className="flex flex-wrap justify-end gap-1.5 sm:gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="gap-1 rounded-2xl px-2 py-2 text-[11px] sm:gap-1.5 sm:px-3 sm:text-xs"
                        onClick={() => onEdit(r)}
                        aria-label={`Edit ${r.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        className="gap-1 rounded-2xl px-2 py-2 text-[11px] sm:gap-1.5 sm:px-3 sm:text-xs"
                        onClick={() => onDelete(r)}
                        aria-label={`Delete ${r.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
        </tbody>
      </table>
    </TableShell>
  )
}
