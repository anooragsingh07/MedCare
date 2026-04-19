import { http } from '../lib/http.js'

/**
 * Loads patients, appointments, and bills in parallel for the dashboard.
 * Uses the same Axios instance as the rest of the app (base /api).
 */
export async function fetchDashboardSnapshot() {
  const [patientsRes, appointmentsRes, billsRes] = await Promise.all([
    http.get('/patients'),
    http.get('/appointments'),
    http.get('/bills'),
  ])

  return {
    patients: patientsRes.data?.data ?? [],
    appointments: appointmentsRes.data?.data ?? [],
    bills: billsRes.data?.data ?? [],
  }
}
