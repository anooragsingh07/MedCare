import { startTransition, useCallback, useEffect, useState } from 'react'
import { FileDown, FilePlus2, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { Input, Label, Textarea } from '../components/ui/Field.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import TableShell from '../components/ui/TableShell.jsx'
import { tableRoot, theadRow, th, tbodyRow, td } from '../components/ui/tableClasses.js'
import { downloadPdf } from '../lib/api.js'
import { useStudentLookup } from '../lib/useStudentLookup.js'
import { billsApi } from '../services/billsApi.js'

const emptyItem = () => ({ name: '', qty: 1, cost: '' })
const emptyForm = {
  patientName: '',
  rollNo: '',
  department: '',
  note: '',
  items: [emptyItem()],
}

function money(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(n) || 0)
}

function itemLineCost(item) {
  return (Number(item.qty) || 0) * (Number(item.cost) || 0)
}

function itemTotal(items) {
  return items.reduce((sum, item) => sum + itemLineCost(item), 0)
}

export default function BillingPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [filledFor, setFilledFor] = useState(null)

  const lookup = useStudentLookup(form.rollNo)

  if (lookup.state === 'found' && lookup.student && lookup.student._id !== filledFor) {
    setFilledFor(lookup.student._id)
    setForm((prev) => ({
      ...prev,
      patientName: lookup.student.name,
      department: lookup.student.department,
    }))
  }

  const load = useCallback(async () => {
    await Promise.resolve()
    setLoading(true)
    setError('')
    try {
      const res = await billsApi.list()
      setRows(res.data ?? [])
    } catch (e) {
      setError(e.message || 'Failed to load cost ledger')
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
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateItem(index, key, value) {
    setForm((prev) => {
      const items = prev.items.map((item, i) => (i === index ? { ...item, [key]: value } : item))
      return { ...prev, items }
    })
  }

  function addItem() {
    setForm((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }))
  }

  function removeItem(index) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  async function handleBillPdf(r) {
    const t = toast.loading('Preparing voucher PDF…')
    try {
      await downloadPdf(`/api/bills/${r._id}/pdf`, `medcare-voucher-${r._id}.pdf`)
      toast.success('Download started', { id: t })
    } catch (e) {
      toast.error(e.message || 'Could not download PDF', { id: t })
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await billsApi.create({
        patientName: form.patientName,
        rollNo: form.rollNo.trim(),
        department: form.department.trim(),
        note: form.note.trim(),
        medicineItems: form.items
          .filter((item) => item.name.trim() && Number(item.qty) > 0)
          .map((item) => ({
            name: item.name.trim(),
            qty: Number(item.qty),
            cost: Number(item.cost) || 0,
          })),
      })
      toast.success('Dispensary entry recorded')
      setForm(emptyForm)
      await load()
    } catch (err) {
      toast.error(err.message || 'Could not record entry')
    } finally {
      setSaving(false)
    }
  }

  const previewTotal = itemTotal(form.items)

  return (
    <div className="space-y-5 sm:space-y-6">
      {error && (
        <div className="rounded-3xl border border-red-200/90 bg-red-50/95 px-4 py-3 text-sm text-red-800 shadow-sm">
          {error}
        </div>
      )}

      <Card title="Record dispensary issue" subtitle="Free care — items dispensed at no charge are logged as cost borne by the dispensary">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="b-roll">Roll no. (UID)</Label>
              <Input
                id="b-roll"
                required
                value={form.rollNo}
                onChange={(e) => updateField('rollNo', e.target.value)}
                placeholder="e.g. 23CS001"
              />
              {lookup.state === 'searching' && <p className="mt-1 text-xs text-slate-500">Looking up student…</p>}
              {lookup.state === 'found' && <p className="mt-1 text-xs text-emerald-700">{lookup.message}</p>}
              {lookup.state === 'missing' && <p className="mt-1 text-xs text-amber-700">{lookup.message}</p>}
            </div>
            <div>
              <Label htmlFor="b-patient">Patient name</Label>
              <Input id="b-patient" required value={form.patientName} onChange={(e) => updateField('patientName', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="b-dept">Department</Label>
              <Input id="b-dept" required value={form.department} onChange={(e) => updateField('department', e.target.value)} placeholder="e.g. Computer Science" />
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200/90 bg-slate-50/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="mb-0">Items dispensed</Label>
              <Button type="button" variant="secondary" className="gap-1.5 rounded-lg px-3 py-2 text-xs" onClick={addItem}>
                <Plus className="h-3.5 w-3.5" aria-hidden />
                Add line
              </Button>
            </div>
            <ul className="space-y-3">
              {form.items.map((item, index) => (
                <li key={index} className="grid gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 sm:grid-cols-[1fr_110px_110px_auto] sm:items-end">
                  <div>
                    <Label htmlFor={`b-item-${index}`}>Item</Label>
                    <Input
                      id={`b-item-${index}`}
                      placeholder="e.g. Paracetamol 500 mg (strip)"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`b-qty-${index}`}>Qty</Label>
                    <Input
                      id={`b-qty-${index}`}
                      type="number"
                      min={1}
                      step={1}
                      value={item.qty}
                      onChange={(e) => updateItem(index, 'qty', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`b-cost-${index}`}>Unit cost (₹)</Label>
                    <Input
                      id={`b-cost-${index}`}
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.cost}
                      onChange={(e) => updateItem(index, 'cost', e.target.value)}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="hidden rounded-lg bg-slate-100 px-2.5 py-2 text-xs font-medium text-slate-600 sm:inline">
                      {money(itemLineCost(item))}
                    </span>
                    <Button
                      type="button"
                      variant="secondary"
                      className="gap-1.5 rounded-lg px-3 py-2 text-xs text-slate-600"
                      disabled={form.items.length <= 1}
                      onClick={() => removeItem(index)}
                      aria-label={`Remove item row ${index + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200/80 pt-3">
              <span className="text-sm text-slate-600">
                Total cost borne by dispensary: <span className="font-semibold text-slate-900">{money(previewTotal)}</span>
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="b-note">Note (optional)</Label>
            <Textarea id="b-note" rows={2} value={form.note} onChange={(e) => updateField('note', e.target.value)} placeholder="e.g. Dispensed for viral pharyngitis visit" />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <span className="text-sm text-emerald-700">No charge to student</span>
            <Button type="submit" disabled={saving} className="gap-2">
              <FilePlus2 className="h-4 w-4" aria-hidden />
              {saving ? 'Saving…' : 'Record issue'}
            </Button>
          </div>
        </form>
      </Card>

      <Card
        title="Cost ledger"
        subtitle={loading ? 'Loading…' : `${rows.length} entry(ies) · free care for students`}
      >
        <TableShell>
          <table className={tableRoot}>
            <thead>
              <tr className={theadRow}>
                <th className={th}>Date</th>
                <th className={th}>Patient</th>
                <th className={th}>Roll no.</th>
                <th className={th}>Department</th>
                <th className={th}>Items</th>
                <th className={th}>Cost borne</th>
                <th className={`${th} text-right`}>Voucher</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="py-14 text-center">
                    <div className="flex justify-center">
                      <Spinner size="md" caption="Loading cost ledger…" />
                    </div>
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-500">
                    No dispensary entries yet.
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((r) => (
                  <tr key={r._id} className={tbodyRow}>
                    <td className={`${td} whitespace-nowrap text-slate-600`}>
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className={`${td} font-medium text-slate-900`}>{r.patientName}</td>
                    <td className={`${td} font-mono text-xs text-slate-600`}>{r.rollNo?.trim() || '—'}</td>
                    <td className={td}>{r.department?.trim() || '—'}</td>
                    <td className={td}>
                      {(r.medicineItems || []).length > 0 ? (
                        <span className="text-xs text-slate-600">
                          {r.medicineItems.length} item(s)
                          <span className="block max-w-[14rem] truncate text-slate-400">
                            {r.medicineItems.map((i) => `${i.name} ×${i.qty}`).join(', ')}
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className={`${td} font-semibold text-slate-900`}>{money(r.costAmount)}</td>
                    <td className={`${td} text-right`}>
                      <Button
                        type="button"
                        variant="secondary"
                        className="gap-1.5 rounded-2xl px-3 py-2 text-xs"
                        onClick={() => void handleBillPdf(r)}
                      >
                        <FileDown className="h-3.5 w-3.5" aria-hidden />
                        Voucher
                      </Button>
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