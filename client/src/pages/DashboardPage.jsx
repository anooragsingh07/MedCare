import { startTransition, useEffect, useMemo, useState } from 'react'
import { Users, CalendarDays, IndianRupee } from 'lucide-react'
import StatCard from '../components/ui/StatCard.jsx'
import Card from '../components/ui/Card.jsx'
import DashboardCharts from '../components/dashboard/DashboardCharts.jsx'
import RecentActivity from '../components/dashboard/RecentActivity.jsx'
import {
  buildAppointmentStatusBreakdown,
  buildPatientVolumeByMonth,
  buildRecentActivity,
  buildRevenueByMonth,
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
    const revenue = bills.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0)
    return {
      patients: patients.length,
      appointments: appointments.length,
      revenue,
    }
  }, [patients, appointments, bills])

  const revenueSeries = useMemo(() => buildRevenueByMonth(bills), [bills])
  const patientVolume = useMemo(() => buildPatientVolumeByMonth(patients), [patients])
  const appointmentPie = useMemo(() => buildAppointmentStatusBreakdown(appointments), [appointments])
  const activity = useMemo(
    () => buildRecentActivity(patients, appointments, bills, 14),
    [patients, appointments, bills],
  )

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error} · Ensure the API is running on port 5000 and MongoDB is connected.
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
          label="Revenue summary"
          value={loading ? '—' : formatMoney(stats.revenue)}
          hint="Sum of bill totals"
          icon={IndianRupee}
        />
      </div>

      <DashboardCharts
        revenueSeries={revenueSeries}
        appointmentPie={appointmentPie}
        patientVolume={patientVolume}
        loading={loading}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity items={activity} loading={loading} />
        </div>
        <Card title="Snapshot" subtitle="Data from live APIs">
          <ul className="space-y-3 text-sm text-slate-600">
            <li>
              <span className="font-semibold text-slate-800">GET /api/patients</span> — directory size and monthly
              registrations.
            </li>
            <li>
              <span className="font-semibold text-slate-800">GET /api/appointments</span> — schedule mix for the pie
              chart.
            </li>
            <li>
              <span className="font-semibold text-slate-800">GET /api/bills</span> — revenue trend and payment lines in
              activity.
            </li>
            <li className="text-xs text-slate-500">Refresh this page after changes elsewhere to update charts.</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
