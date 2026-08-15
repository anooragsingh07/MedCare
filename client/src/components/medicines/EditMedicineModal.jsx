import { useState } from 'react'
import toast from 'react-hot-toast'
import Button from '../ui/Button.jsx'
import { Input, Label } from '../ui/Field.jsx'
import { medicinesApi } from '../../services/medicinesApi.js'

function formFromMedicine(medicine) {
  return {
    name: medicine?.name ?? '',
    category: medicine?.category ?? '',
    unit: medicine?.unit ?? 'strip',
    stock: medicine?.stock ?? 0,
    costPrice: medicine?.costPrice ?? '',
    reorderLevel: medicine?.reorderLevel ?? 0,
  }
}

export default function EditMedicineModal({ medicine, open, onClose, onSaved }) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(() => formFromMedicine(medicine))

  if (!open || !medicine) return null

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await medicinesApi.update(medicine._id, {
        name: form.name,
        category: form.category,
        unit: form.unit,
        stock: Number(form.stock) || 0,
        costPrice: Number(form.costPrice) || 0,
        reorderLevel: Number(form.reorderLevel) || 0,
      })
      toast.success('Medicine updated')
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
        aria-labelledby="edit-medicine-title"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="edit-medicine-title" className="text-lg font-semibold text-slate-900">
              Edit medicine
            </h2>
            <p className="mt-1 text-sm text-slate-500">Update details and save. Use the +/− buttons on the list to fine-tune stock.</p>
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
          <div className="sm:col-span-2">
            <Label htmlFor="em-name">Name</Label>
            <Input id="em-name" required value={form.name} onChange={(e) => setField('name', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="em-cat">Category</Label>
            <Input id="em-cat" value={form.category} onChange={(e) => setField('category', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="em-unit">Unit</Label>
            <Input id="em-unit" value={form.unit} onChange={(e) => setField('unit', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="em-stock">Stock</Label>
            <Input id="em-stock" type="number" min={0} step={1} value={form.stock} onChange={(e) => setField('stock', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="em-cost">Unit cost (₹)</Label>
            <Input id="em-cost" type="number" min={0} step="0.01" value={form.costPrice} onChange={(e) => setField('costPrice', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="em-reorder">Reorder level</Label>
            <Input id="em-reorder" type="number" min={0} step={1} value={form.reorderLevel} onChange={(e) => setField('reorderLevel', e.target.value)} />
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