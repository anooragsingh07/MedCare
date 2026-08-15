const HOSPITAL = '#2563eb'

function monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(d) {
  const m = d.toLocaleString('en-IN', { month: 'short' })
  const y = String(d.getFullYear()).slice(-2)
  return `${m} '${y}`
}

/** Last `span` months including current, oldest first (for charts). */
function rollingMonthKeys(span = 6) {
  const now = new Date()
  const keys = []
  for (let i = span - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    keys.push({ key: monthKey(d), label: monthLabel(d), sort: d.getTime() })
  }
  return keys
}

export function buildCostByMonth(bills, span = 6) {
  const keys = rollingMonthKeys(span)
  const totals = Object.fromEntries(keys.map((k) => [k.key, 0]))
  for (const b of bills) {
    const t = new Date(b.createdAt || b.updatedAt || 0)
    if (Number.isNaN(t.getTime())) continue
    const k = monthKey(t)
    if (Object.prototype.hasOwnProperty.call(totals, k)) {
      totals[k] += Number(b.costAmount) || 0
    }
  }
  return keys.map((k) => ({ name: k.label, cost: Math.round(totals[k.key] * 100) / 100 }))
}

export function buildPatientVolumeByMonth(patients, span = 6) {
  const keys = rollingMonthKeys(span)
  const counts = Object.fromEntries(keys.map((k) => [k.key, 0]))
  for (const p of patients) {
    const t = new Date(p.createdAt || p.updatedAt || 0)
    if (Number.isNaN(t.getTime())) continue
    const k = monthKey(t)
    if (Object.prototype.hasOwnProperty.call(counts, k)) {
      counts[k] += 1
    }
  }
  return keys.map((k) => ({ name: k.label, patients: counts[k.key] }))
}

export function buildAppointmentStatusBreakdown(appointments) {
  let scheduled = 0
  let completed = 0
  for (const a of appointments) {
    if (a.status === 'Completed') completed += 1
    else scheduled += 1
  }
  return [
    { name: 'Scheduled', value: scheduled, fill: HOSPITAL },
    { name: 'Completed', value: completed, fill: '#0ea5e9' },
  ].filter((d) => d.value > 0)
}

export function buildRecentActivity(patients, appointments, bills, limit = 12) {
  const rows = []

  for (const p of patients) {
    const at = new Date(p.createdAt || p.updatedAt || 0)
    if (!Number.isNaN(at.getTime())) {
      rows.push({
        id: `patient-${p._id}`,
        kind: 'patient',
        title: p.name,
        detail: 'Patient record',
        at,
      })
    }
  }

  for (const a of appointments) {
    const at = new Date(a.createdAt || a.updatedAt || 0)
    if (!Number.isNaN(at.getTime())) {
      rows.push({
        id: `appt-${a._id}`,
        kind: 'appointment',
        title: a.patientName,
        detail: `${a.doctorName} · ${a.status}`,
        at,
      })
    }
  }

  for (const b of bills) {
    const at = new Date(b.createdAt || b.updatedAt || 0)
    if (!Number.isNaN(at.getTime())) {
      const amt = Number(b.costAmount) || 0
      rows.push({
        id: `bill-${b._id}`,
        kind: 'billing',
        title: b.patientName,
        detail: `Dispensary issue · free · ₹${amt.toLocaleString('en-IN')}`,
        at,
      })
    }
  }

  return rows.sort((a, b) => b.at - a.at).slice(0, limit)
}

export function formatRelativeTime(date) {
  const d = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(d.getTime())) return '—'
  const diff = Date.now() - d.getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

