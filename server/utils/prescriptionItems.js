/**
 * Normalize prescription lines from DB (legacy strings or { medicine, dosage }).
 * @param {unknown} arr
 * @returns {{ medicine: string, dosage: string }[]}
 */
export function normalizePrescriptionItems(arr) {
  if (!Array.isArray(arr)) return []
  return arr
    .map((item) => {
      if (typeof item === 'string') {
        const medicine = item.trim().slice(0, 200)
        return medicine ? { medicine, dosage: 'As directed' } : null
      }
      if (item && typeof item === 'object') {
        const medicine = String(item.medicine ?? item.name ?? '').trim().slice(0, 200)
        const dosageRaw = String(item.dosage ?? '').trim()
        const dosage = (dosageRaw || 'As directed').slice(0, 200)
        return medicine ? { medicine, dosage } : null
      }
      return null
    })
    .filter(Boolean)
}

/**
 * Coerce incoming body items to { medicine, dosage } for persistence.
 * @param {unknown} arr
 * @returns {{ medicine: string, dosage: string }[]}
 */
export function coercePrescriptionItemsFromBody(arr) {
  return normalizePrescriptionItems(arr)
}
