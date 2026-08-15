import { startTransition, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CalendarDays, IndianRupee, PackageX, Users } from 'lucide-react'
import StatCard from '../components/ui/StatCard.jsx'
import DashboardCharts from '../components/dashboard/DashboardCharts.jsx'
import RecentActivity from '../components/dashboard/RecentActivity.jsx'
import {
  buildAppointmentStatusBreakdown,
  buildCostByMonth,
  buildPatientVolumeByMonth,
  buildRecentActivity,
} from '../lib/dashboardTransforms.js'
import { fetchDashboardSnapshot } from '../services/dashboardApi.js'

function formatMoney(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    n || 0,
  )
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [bills, setBills] = useState([])
  const [medicines, setMedicines] = useState([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      await Promise.resolve()
      setLoading(true)
      setError('')
      try {
        const snap = await fetchDashboardSnapshot()
        if (cancelled) return
        setPatients(snap.patients)
        setAppointments(snap.appointments)
        setBills(snap.bills)
        setMedicines(snap.medicines)
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load dashboard data')
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

  const stats = useMemo(() => {
    const costBorne = bills.reduce((sum, b) => sum + (Number(b.costAmount) || 0), 0)
    return {
      patients: patients.length,
      appointments: appointments.length,
      costBorne,
      lowStock: medicines.filter((m) => m.lowStock).length,
    }
  }, [patients, appointments, bills, medicines])

  const costSeries = useMemo(() => buildCostByMonth(bills), [bills])
  const patientVolume = useMemo(() => buildPatientVolumeByMonth(patients), [patients])
  const appointmentPie = useMemo(() => buildAppointmentStatusBreakdown(appointments), [appointments])
  const activity = useMemo(
    () => buildRecentActivity(patients, appointments, bills, 14),
    [patients, appointments, bills],
  )

  return (
    <div className="space-y-5 sm:space-y-6">
      {error && (
        <div className="flex gap-3 rounded-3xl border border-amber-200/90 bg-amber-50/95 px-4 py-3 text-sm text-amber-950 shadow-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
          <div>
            <p className="font-semibold">Could not load dashboard</p>
            <p className="mt-1 leading-relaxed text-amber-900/90">
              {error} · Ensure the API is running on port 5000 and MongoDB is connected.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total patients"
          value={loading ? '—' : stats.patients}
          hint="Registered in MedCare"
          icon={Users}
        />
        <StatCard
          label="Total appointments"
          value={loading ? '—' : stats.appointments}
          hint="All statuses"
          icon={CalendarDays}
        />
        <StatCard
          label="Cost borne"
          value={loading ? '—' : formatMoney(stats.costBorne)}
          hint="Free-care costs this period"
          icon={IndianRupee}
        />
        <StatCard
          label="Low-stock medicines"
          value={loading ? '—' : stats.lowStock}
          hint={stats.lowStock ? 'Below reorder level — check inventory' : 'All stocked medicines healthy'}
          icon={PackageX}
        />
      </div>

      <DashboardCharts
        costSeries={costSeries}
        appointmentPie={appointmentPie}
        patientVolume={patientVolume}
        loading={loading}
      />

      <RecentActivity items={activity} loading={loading} />
    </div>
  )
}
