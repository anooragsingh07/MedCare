import { http } from '../lib/http.js'

/**
 * Loads the full dataset needed for reports: patients, appointments,
 * dispensary ledger entries, and medicine inventory.
 */
export async function fetchReportsSnapshot() {
  const [patientsRes, appointmentsRes, billsRes, medicinesRes] = await Promise.all([
    http.get('/patients'),
    http.get('/appointments'),
    http.get('/bills'),
    http.get('/medicines'),
  ])

  return {
    patients: patientsRes.data?.data ?? [],
    appointments: appointmentsRes.data?.data ?? [],
    bills: billsRes.data?.data ?? [],
    medicines: medicinesRes.data?.data ?? [],
  }
}