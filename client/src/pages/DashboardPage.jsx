import { startTransition, useEffect, useState } from 'react'
import { Users, CalendarDays, IndianRupee } from 'lucide-react'
import StatCard from '../components/ui/StatCard.jsx'
import Card from '../components/ui/Card.jsx'
import { apiJson } from '../lib/api.js'

function formatMoney(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    n || 0,
  )
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ patients: 0, appointments: 0, revenue: 0 })

  useEffect(() => {
    let cancelled = false
    async function load() {
      await Promise.resolve()
      setLoading(true)
      setError('')
      try {
        const [pRes, aRes, bRes] = await Promise.all([
          apiJson('/api/patients'),
          apiJson('/api/appointments'),
          apiJson('/api/bills'),
        ])
        if (cancelled) return
        const patients = pRes.data ?? []
        const appointments = aRes.data ?? []
        const bills = bRes.data ?? []
        const revenue = bills.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0)
        setStats({
          patients: patients.length,
          appointments: appointments.length,
          revenue,
        })
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
          label="Appointments"
          value={loading ? '—' : stats.appointments}
          hint="All statuses"
          icon={CalendarDays}
        />
        <StatCard
          label="Revenue (billed)"
          value={loading ? '—' : formatMoney(stats.revenue)}
          hint="Sum of bill totals"
          icon={IndianRupee}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Operations overview" subtitle="Centralized patient flow and scheduling">
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex gap-2">
              <span className="font-medium text-hospital-700">·</span>
              Use the sidebar to manage patients, visits, billing, and doctor rosters.
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-hospital-700">·</span>
              Tables support quick review; forms capture new records aligned with the API.
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-hospital-700">·</span>
              Authentication is not enabled—treat this as an internal admin prototype.
            </li>
          </ul>
        </Card>
        <Card title="Data freshness" subtitle="Dashboard metrics refresh when you open this page">
          <p className="text-sm text-slate-600">
            Navigate to Patients, Appointments, or Billing after changes, then return here to see updated counts and
            revenue.
          </p>
        </Card>
      </div>
    </div>
  )
}
