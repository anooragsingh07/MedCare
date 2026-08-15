import { startTransition, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  CalendarDays,
  IndianRupee,
  PackageX,
  PiggyBank,
  TrendingUp,
  Users,
} from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import TableShell from '../components/ui/TableShell.jsx'
import { tableRoot, theadRow, th, tbodyRow, td } from '../components/ui/tableClasses.js'
import { fetchReportsSnapshot } from '../services/reportsApi.js'

function formatMoney(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    n || 0,
  )
}

function isThisMonth(d) {
  const t = new Date(d)
  if (Number.isNaN(t.getTime())) return false
  const now = new Date()
  return t.getFullYear() === now.getFullYear() && t.getMonth() === now.getMonth()
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [snap, setSnap] = useState({ patients: [], appointments: [], bills: [], medicines: [] })

  useEffect(() => {
    let cancelled = false
    async function load() {
      await Promise.resolve()
      setLoading(true)
      setError('')
      try {
        const s = await fetchReportsSnapshot()
        if (!cancelled) setSnap(s)
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load reports')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    startTransition(() => {
      void load()
    })
    return () => {
      cancelled = true
    }
  }, [])

  const report = useMemo(() => {
    const monthBills = snap.bills.filter((b) => isThisMonth(b.createdAt))
    const costThisMonth = monthBills.reduce((s, b) => s + (Number(b.costAmount) || 0), 0)
    const totalCost = snap.bills.reduce((s, b) => s + (Number(b.costAmount) || 0), 0)
    const lowStock = snap.medicines.filter((m) => m.lowStock)

    const byDepartment = new Map()
    for (const b of snap.bills) {
      const key = b.department?.trim() || 'Unspecified'
      byDepartment.set(key, (byDepartment.get(key) || 0) + (Number(b.costAmount) || 0))
    }
    const deptRows = [...byDepartment.entries()]
      .map(([department, cost]) => ({ department, cost }))
      .sort((a, b) => b.cost - a.cost)

    const byMedicine = new Map()
    for (const b of snap.bills) {
      for (const item of b.medicineItems || []) {
        const key = item.name?.trim() || 'Unspecified'
        byMedicine.set(key, (byMedicine.get(key) || 0) + (Number(item.qty) || 0))
      }
    }
    const topMeds = [...byMedicine.entries()]
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8)

    return { costThisMonth, totalCost, lowStock, deptRows, topMeds }
  }, [snap])

  return (
    <div className="space-y-5 sm:space-y-6">
      {error && (
        <div className="flex gap-3 rounded-3xl border border-amber-200/90 bg-amber-50/95 px-4 py-3 text-sm text-amber-950 shadow-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
          <div>
            <p className="font-semibold">Could not load reports</p>
            <p className="mt-1 leading-relaxed text-amber-900/90">{error}</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total students served" value={loading ? '—' : snap.patients.length} hint="Patient records" icon={Users} />
        <StatCard label="Appointments" value={loading ? '—' : snap.appointments.length} hint="All statuses" icon={CalendarDays} />
        <StatCard
          label="Cost this month"
          value={loading ? '—' : formatMoney(report.costThisMonth)}
          hint="Free care borne by dispensary"
          icon={PiggyBank}
        />
        <StatCard
          label="Low-stock medicines"
          value={loading ? '—' : report.lowStock.length}
          hint={report.lowStock.length ? 'Reorder soon' : 'All above reorder level'}
          icon={PackageX}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" caption="Crunching the numbers…" />
        </div>
      ) : (
        <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
          <Card
            title="Cost by department"
            subtitle="Free-care value dispensed per department (all time)"
            actions={
              <span className="inline-flex items-center gap-1.5 rounded-full bg-hospital-50 px-3 py-1 text-xs font-semibold text-hospital-700">
                <IndianRupee className="h-3.5 w-3.5" aria-hidden />
                {formatMoney(report.totalCost)} total
              </span>
            }
          >
            {report.deptRows.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No dispensary entries yet.</p>
            ) : (
              <ul className="space-y-4">
                {report.deptRows.map((row) => {
                  const pct = report.totalCost ? Math.round((row.cost / report.totalCost) * 100) : 0
                  return (
                    <li key={row.department}>
                      <div className="mb-1 flex items-baseline justify-between gap-3">
                        <span className="truncate text-sm font-medium text-slate-800">{row.department}</span>
                        <span className="text-sm font-semibold text-slate-900">{formatMoney(row.cost)}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-hospital-600" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          <Card title="Top dispensed medicines" subtitle="By total quantity issued">
            {report.topMeds.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No medicines recorded yet.</p>
            ) : (
              <ul className="space-y-3">
                {report.topMeds.map((row) => (
                  <li key={row.name} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-hospital-50 text-hospital-700 ring-1 ring-hospital-100/80">
                      <TrendingUp className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{row.name}</span>
                    <span className="shrink-0 text-sm font-semibold text-slate-900">
                      {row.qty} <span className="text-xs font-normal text-slate-400">units</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      <Card
        title="Low-stock alerts"
        subtitle={report.lowStock.length ? `${report.lowStock.length} medicine(s) at or below reorder level` : 'All stocked medicines are above their reorder level'}
      >
        <TableShell>
          <table className={tableRoot}>
            <thead>
              <tr className={theadRow}>
                <th className={th}>Medicine</th>
                <th className={th}>Category</th>
                <th className={th}>Stock</th>
                <th className={th}>Reorder level</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center">
                    <div className="flex justify-center">
                      <Spinner size="md" caption="Loading inventory…" />
                    </div>
                  </td>
                </tr>
              ) : report.lowStock.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-500">
                    Nothing to reorder right now.
                  </td>
                </tr>
              ) : (
                report.lowStock.map((m) => (
                  <tr key={m._id} className={tbodyRow}>
                    <td className={`${td} font-medium text-slate-900`}>{m.name}</td>
                    <td className={td}>{m.category || '—'}</td>
                    <td className={`${td} font-semibold text-amber-700`}>{m.stock}</td>
                    <td className={td}>{m.reorderLevel}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableShell>
      </Card>
    </div>
  )
}