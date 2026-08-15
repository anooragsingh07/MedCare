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
import { useAuth } from '../lib/auth-context.js'

function formatMoney(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    n || 0,
  )
}

function formatDay(d) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
  } catch {
    return '—'
  }
}

function nextAppointment(appointments) {
  const now = Date.now()
  const upcoming = appointments
    .filter((a) => a.status === 'Scheduled')
    .map((a) => ({ ...a, at: new Date(a.date).getTime() }))
    .filter((a) => a.at >= now)
    .sort((a, b) => a.at - b.at)[0]
  return upcoming ? `${formatDay(upcoming.date)} · ${upcoming.time}` : '—'
}

export default function DashboardPage() {
  const { user } = useAuth()
  const role = user?.role
  const isStaffOrAdmin = role === 'staff' || role === 'admin'
  const isDoctor = role === 'doctor'
  const isMember = role === 'member'

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
        const snap = await fetchDashboardSnapshot(role)
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
  }, [role])

  const costBorne = useMemo(
    () => bills.reduce((sum, b) => sum + (Number(b.costAmount) || 0), 0),
    [bills],
  )
  const lowStock = useMemo(() => medicines.filter((m) => m.lowStock).length, [medicines])

  const costSeries = useMemo(() => (isStaffOrAdmin ? buildCostByMonth(bills) : []), [bills, isStaffOrAdmin])
  const patientVolume = useMemo(() => buildPatientVolumeByMonth(patients), [patients])
  const appointmentPie = useMemo(() => buildAppointmentStatusBreakdown(appointments), [appointments])
  const activity = useMemo(
    () => buildRecentActivity(patients, appointments, bills, 14),
    [patients, appointments, bills],
  )

  const title = isMember ? 'My health' : isDoctor ? 'Clinical overview' : 'Dispensary overview'

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">
          {isMember ? 'Your visits and appointments at the college dispensary' : 'Free-care activity across the college'}
        </p>
      </div>

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

      {isMember ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="My visits" value={loading ? '—' : patients.length} hint="Records under your college ID" icon={Users} />
          <StatCard label="My appointments" value={loading ? '—' : appointments.length} hint="Booked and completed" icon={CalendarDays} />
          <StatCard label="Next appointment" value={loading ? '—' : nextAppointment(appointments)} hint="Upcoming scheduled visit" icon={CalendarDays} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label={isDoctor ? 'Patients on record' : 'Total patients'}
            value={loading ? '—' : patients.length}
            hint="Registered in MedCare"
            icon={Users}
          />
          <StatCard
            label="Total appointments"
            value={loading ? '—' : appointments.length}
            hint="All statuses"
            icon={CalendarDays}
          />
          {isStaffOrAdmin && (
            <StatCard
              label="Cost borne"
              value={loading ? '—' : formatMoney(costBorne)}
              hint="Free-care costs this period"
              icon={IndianRupee}
            />
          )}
          {!isMember && (
            <StatCard
              label="Low-stock medicines"
              value={loading ? '—' : lowStock}
              hint={lowStock ? 'Below reorder level — check inventory' : 'All stocked medicines healthy'}
              icon={PackageX}
            />
          )}
        </div>
      )}

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