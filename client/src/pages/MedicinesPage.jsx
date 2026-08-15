import { startTransition, useCallback, useEffect, useState } from 'react'
import { AlertTriangle, Minus, PackagePlus, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { Input, Label } from '../components/ui/Field.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import TableShell from '../components/ui/TableShell.jsx'
import { tableRoot, theadRow, th, tbodyRow, td } from '../components/ui/tableClasses.js'
import { medicinesApi } from '../services/medicinesApi.js'
import EditMedicineModal from '../components/medicines/EditMedicineModal.jsx'

const emptyForm = () => ({
  name: '',
  category: '',
  unit: 'strip',
  stock: 0,
  costPrice: '',
  reorderLevel: 0,
})

function money(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n) || 0)
}

export default function MedicinesPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const load = useCallback(async () => {
    await Promise.resolve()
    setLoading(true)
    setError('')
    try {
      const res = await medicinesApi.list(debouncedSearch)
      setRows(res.data ?? [])
    } catch (e) {
      setError(e.message || 'Failed to load medicines')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch])

  useEffect(() => {
    startTransition(() => {
      void load()
    })
  }, [load])

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await medicinesApi.create({
        name: form.name,
        category: form.category,
        unit: form.unit,
        stock: Number(form.stock) || 0,
        costPrice: Number(form.costPrice) || 0,
        reorderLevel: Number(form.reorderLevel) || 0,
      })
      toast.success('Medicine added')
      setForm(emptyForm())
      await load()
    } catch (err) {
      toast.error(err.message || 'Could not add medicine')
    } finally {
      setSaving(false)
    }
  }

  async function handleStock(r, delta) {
    try {
      await medicinesApi.adjustStock(r._id, delta)
      toast.success(`Stock ${delta > 0 ? 'increased' : 'decreased'} by ${Math.abs(delta)}`)
      await load()
    } catch (e) {
      toast.error(e.message || 'Could not adjust stock')
    }
  }

  const lowCount = rows.filter((r) => r.lowStock).length

  return (
    <div className="space-y-5 sm:space-y-6">
      {error && (
        <div className="flex gap-3 rounded-3xl border border-amber-200/90 bg-amber-50/95 px-4 py-3 text-sm text-amber-950 shadow-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
          <div>
            <p className="font-semibold">Medicine list unavailable</p>
            <p className="mt-1 leading-relaxed text-amber-900/90">{error}</p>
          </div>
        </div>
      )}

      <Card title="Add medicine" subtitle="Track stock, unit cost, and reorder alerts">
        <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label htmlFor="m-name">Name</Label>
            <Input id="m-name" required value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="e.g. Paracetamol 500 mg (strip of 10)" />
          </div>
          <div>
            <Label htmlFor="m-cat">Category</Label>
            <Input id="m-cat" value={form.category} onChange={(e) => setField('category', e.target.value)} placeholder="e.g. Analgesics" />
          </div>
          <div>
            <Label htmlFor="m-unit">Unit</Label>
            <Input id="m-unit" value={form.unit} onChange={(e) => setField('unit', e.target.value)} placeholder="e.g. strip, bottle, tube" />
          </div>
          <div>
            <Label htmlFor="m-stock">Stock</Label>
            <Input id="m-stock" type="number" min={0} step={1} value={form.stock} onChange={(e) => setField('stock', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="m-cost">Unit cost (₹)</Label>
            <Input id="m-cost" type="number" min={0} step="0.01" value={form.costPrice} onChange={(e) => setField('costPrice', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="m-reorder">Reorder level</Label>
            <Input id="m-reorder" type="number" min={0} step={1} value={form.reorderLevel} onChange={(e) => setField('reorderLevel', e.target.value)} />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <Button type="submit" disabled={saving} className="gap-2">
              <PackagePlus className="h-4 w-4" aria-hidden />
              {saving ? 'Saving…' : 'Add medicine'}
            </Button>
          </div>
        </form>
      </Card>

      <Card
        title="Inventory"
        subtitle={
          loading
            ? 'Loading…'
            : `${rows.length} medicine(s)${lowCount ? ` · ${lowCount} below reorder level` : ''}${debouncedSearch ? ` · filter “${debouncedSearch}”` : ''}`
        }
        actions={
          <Input
            className="w-full sm:w-64"
            placeholder="Search medicines…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            disabled={loading}
          />
        }
      >
        <TableShell>
          <table className={tableRoot}>
            <thead>
              <tr className={theadRow}>
                <th className={th}>Medicine</th>
                <th className={th}>Category</th>
                <th className={th}>Stock</th>
                <th className={th}>Unit cost</th>
                <th className={th}>Reorder level</th>
                <th className={`${th} w-44 text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <div className="flex justify-center">
                      <Spinner size="md" caption="Loading inventory…" />
                    </div>
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">
                    No medicines found.
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((r) => (
                  <tr key={r._id} className={tbodyRow}>
                    <td className={`${td} font-medium text-slate-900`}>
                      {r.name}
                      {r.unit ? <span className="block text-xs font-normal text-slate-400">per {r.unit}</span> : null}
                    </td>
                    <td className={td}>{r.category || '—'}</td>
                    <td className={td}>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${r.lowStock ? 'text-amber-700' : 'text-slate-900'}`}>
                          {r.stock}
                        </span>
                        {r.lowStock && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                            Low
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={td}>{money(r.costPrice)}</td>
                    <td className={td}>{r.reorderLevel}</td>
                    <td className={`${td} text-right`}>
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="secondary"
                          className="gap-1 rounded-lg px-2 py-1.5 text-xs"
                          onClick={() => void handleStock(r, -1)}
                          aria-label={`Decrease stock of ${r.name}`}
                        >
                          <Minus className="h-3.5 w-3.5" aria-hidden />
                        </Button>
                        <Button
                          variant="secondary"
                          className="gap-1 rounded-lg px-2 py-1.5 text-xs"
                          onClick={() => void handleStock(r, 1)}
                          aria-label={`Increase stock of ${r.name}`}
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden />
                        </Button>
                        <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => setEditing(r)}>
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </TableShell>
      </Card>

      <EditMedicineModal
        key={editing?._id ?? 'closed'}
        medicine={editing}
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        onSaved={load}
      />
    </div>
  )
}