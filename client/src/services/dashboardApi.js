import { http } from '../lib/http.js'

/**
 * Loads the dashboard snapshot for the current role.
 * Members and doctors never fetch restricted endpoints (/bills), which would 403.
 */
export async function fetchDashboardSnapshot(role) {
  const isStaffOrAdmin = role === 'staff' || role === 'admin'
  const isDoctor = role === 'doctor'

  const calls = [http.get('/patients'), http.get('/appointments')]
  if (isStaffOrAdmin) calls.push(http.get('/bills'))
  if (isStaffOrAdmin || isDoctor) calls.push(http.get('/medicines'))

  const results = await Promise.all(calls)

  return {
    patients: results[0].data?.data ?? [],
    appointments: results[1].data?.data ?? [],
    bills: results[2]?.data?.data ?? [],
    medicines: results[3]?.data?.data ?? [],
  }
}