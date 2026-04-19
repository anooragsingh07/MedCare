import { startTransition, useCallback, useEffect, useState } from 'react'
import { FileDown, FilePlus2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { Input, Label, Select } from '../components/ui/Field.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import TableShell from '../components/ui/TableShell.jsx'
import { tableRoot, theadRow, th, tbodyRow, td } from '../components/ui/tableClasses.js'
import { apiJson, downloadPdf } from '../lib/api.js'

const emptyForm = {
  patientName: '',
  rollNo: '',
  department: '',
  medicinesCost: '',
  consultationFee: '',
  totalAmount: '',
  paymentStatus: 'Pending',
}

function money(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(n) || 0)
}

export default function BillingPage() {
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
      const res = await apiJson('/api/bills')
      setRows(res.data ?? [])
    } catch (e) {
      setError(e.message || 'Failed to load bills')
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

  /** Auto-fill total when costs change if user hasn't overridden manually — simple sum helper */
  function syncTotal(next) {
    const med = Number(next.medicinesCost)
    const fee = Number(next.consultationFee)
    if (!Number.isNaN(med) && !Number.isNaN(fee)) {
      next.totalAmount = String((med + fee).toFixed(2))
    }
    return next
  }

  async function handleBillPdf(r) {
    const t = toast.loading('Preparing bill PDF…')
    try {
      await downloadPdf(`/api/bills/${r._id}/pdf`, `bill-${r._id}.pdf`)
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
      const medicinesCost = Number(form.medicinesCost)
      const consultationFee = Number(form.consultationFee)
      const totalAmount = Number(form.totalAmount)
      await apiJson('/api/bills', {
        method: 'POST',
        body: {
          patientName: form.patientName,
          rollNo: form.rollNo.trim(),
          department: form.department.trim(),
          medicinesCost,
          consultationFee,
          totalAmount,
          paymentStatus: form.paymentStatus,
        },
      })
      setForm(emptyForm)
      await load()
    } catch (err) {
      setError(err.message || 'Could not create bill')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {error && (
        <div className="rounded-3xl border border-red-200/90 bg-red-50/95 px-4 py-3 text-sm text-red-800 shadow-sm">
          {error}
        </div>
      )}

      <Card title="Create bill">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="b-patient">Patient name</Label>
            <Input id="b-patient" required value={form.patientName} onChange={(e) => updateField('patientName', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="b-roll">Roll no.</Label>
            <Input id="b-roll" required value={form.rollNo} onChange={(e) => updateField('rollNo', e.target.value)} placeholder="e.g. 23CS001" />
          </div>
          <div>
            <Label htmlFor="b-dept">Department</Label>
            <Input id="b-dept" required value={form.department} onChange={(e) => updateField('department', e.target.value)} placeholder="e.g. Computer Science" />
          </div>
          <div>
            <Label htmlFor="b-med">Medicines cost</Label>
            <Input
              id="b-med"
              type="number"
              min={0}
              step="0.01"
              required
              value={form.medicinesCost}
              onChange={(e) => setForm((f) => syncTotal({ ...f, medicinesCost: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="b-fee">Consultation fee</Label>
            <Input
              id="b-fee"
              type="number"
              min={0}
              step="0.01"
              required
              value={form.consultationFee}
              onChange={(e) => setForm((f) => syncTotal({ ...f, consultationFee: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="b-total">Total amount</Label>
            <Input
              id="b-total"
              type="number"
              min={0}
              step="0.01"
              required
              value={form.totalAmount}
              onChange={(e) => updateField('totalAmount', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="b-pay">Payment status</Label>
            <Select id="b-pay" value={form.paymentStatus} onChange={(e) => updateField('paymentStatus', e.target.value)}>
              <option>Pending</option>
              <option>Paid</option>
              <option>Unpaid</option>
            </Select>
          </div>
          <div className="flex items-end md:col-span-2">
            <Button type="submit" disabled={saving} className="gap-2">
              <FilePlus2 className="h-4 w-4" aria-hidden />
              {saving ? 'Saving…' : 'Create bill'}
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Billing ledger" subtitle={loading ? 'Loading…' : `${rows.length} bill(s)`}>
        <TableShell>
          <table className={tableRoot}>
            <thead>
              <tr className={theadRow}>
                <th className={th}>Patient</th>
                <th className={th}>Roll no.</th>
                <th className={th}>Department</th>
                <th className={th}>Medicines</th>
                <th className={th}>Consultation</th>
                <th className={th}>Total</th>
                <th className={th}>Status</th>
                <th className={`${th} text-right`}>PDF</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="py-14 text-center">
                    <div className="flex justify-center">
                      <Spinner size="md" caption="Loading billing ledger…" />
                    </div>
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-500">
                    No bills yet.
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((r) => (
                  <tr key={r._id} className={tbodyRow}>
                    <td className={`${td} font-medium text-slate-900`}>{r.patientName}</td>
                    <td className={`${td} font-mono text-xs text-slate-600`}>{r.rollNo?.trim() || '—'}</td>
                    <td className={td}>{r.department?.trim() || '—'}</td>
                    <td className={td}>{money(r.medicinesCost)}</td>
                    <td className={td}>{money(r.consultationFee)}</td>
                    <td className={`${td} font-semibold text-slate-900`}>{money(r.totalAmount)}</td>
                    <td className={td}>
                      <span className="inline-flex rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {r.paymentStatus}
                      </span>
                    </td>
                    <td className={`${td} text-right`}>
                      <Button
                        type="button"
                        variant="secondary"
                        className="gap-1.5 rounded-2xl px-3 py-2 text-xs"
                        onClick={() => void handleBillPdf(r)}
                      >
                        <FileDown className="h-3.5 w-3.5" aria-hidden />
                        Bill PDF
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
