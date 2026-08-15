import { z } from 'zod'

const phoneRegex = /^[\d\s+().-]{7,20}$/

const medLineSchema = z.object({
  medicine: z.string().trim().max(200),
  dosage: z.string().trim().max(200),
})

export const patientFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  age: z
    .string()
    .trim()
    .min(1, 'Age is required')
    .transform((s) => Number(s))
    .refine((n) => Number.isFinite(n), 'Age must be a number')
    .refine((n) => n >= 0 && n <= 130, 'Age must be between 0 and 130'),
  gender: z.enum(['Male', 'Female', 'Other']),
  phone: z.string().trim().regex(phoneRegex, 'Use 7–20 digits, spaces, or + ( ) . -'),
  category: z.enum(['student', 'teacher']),
  collegeId: z.preprocess((v) => (v == null ? '' : String(v)), z.string().trim().min(1, 'College ID is required').max(64)),
  department: z.preprocess(
    (v) => (v == null ? '' : String(v)),
    z.string().trim().min(1, 'Department is required').max(120),
  ),
  address: z.string().trim().min(5, 'Address must be at least 5 characters').max(500),
  symptoms: z.preprocess((v) => (v == null ? '' : String(v)), z.string().max(2000)),
  diagnosis: z.preprocess((v) => (v == null ? '' : String(v)), z.string().max(2000)),
  medications: z.array(medLineSchema).max(50),
  visitDate: z.string().min(1, 'Visit date is required'),
})

function medicationsFromPatient(patient) {
  const arr = patient?.prescribedMedicines
  if (!Array.isArray(arr)) return []
  return arr
    .map((m) => {
      if (typeof m === 'string') {
        const medicine = m.trim()
        return medicine ? { medicine, dosage: 'As directed' } : null
      }
      if (m && typeof m === 'object') {
        const medicine = String(m.medicine ?? m.name ?? '').trim()
        const dosage = String(m.dosage ?? '').trim()
        return medicine ? { medicine, dosage: dosage || 'As directed' } : null
      }
      return null
    })
    .filter(Boolean)
}

export function toPatientPayload(data) {
  const prescribedMedicines = (data.medications ?? [])
    .map((row) => ({
      medicine: String(row.medicine ?? '').trim(),
      dosage: String(row.dosage ?? '').trim() || 'As directed',
    }))
    .filter((row) => row.medicine.length > 0)

  return {
    name: data.name.trim(),
    age: typeof data.age === 'number' ? data.age : Number(data.age),
    gender: data.gender,
    phone: data.phone.trim(),
    category: data.category === 'teacher' ? 'teacher' : 'student',
    collegeId: String(data.collegeId ?? '').trim(),
    department: String(data.department ?? '').trim(),
    address: data.address.trim(),
    symptoms: String(data.symptoms ?? '').trim(),
    diagnosis: String(data.diagnosis ?? '').trim(),
    prescribedMedicines,
    visitDate: new Date(data.visitDate).toISOString(),
  }
}

export function toDatetimeLocalValue(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function patientToFormDefaults(patient) {
  const meds = medicationsFromPatient(patient)
  const medications = meds.length ? meds : [{ medicine: '', dosage: '' }]

  if (!patient) {
    return {
      name: '',
      age: '',
      gender: 'Male',
      phone: '',
      category: 'student',
      collegeId: '',
      department: '',
      address: '',
      symptoms: '',
      diagnosis: '',
      medications,
      visitDate: '',
    }
  }
  return {
    name: patient.name ?? '',
    age: patient.age ?? '',
    gender: patient.gender ?? 'Male',
    phone: patient.phone ?? '',
    category: patient.category ?? 'student',
    collegeId: patient.collegeId ?? '',
    department: patient.department ?? '',
    address: patient.address ?? '',
    symptoms: patient.symptoms ?? '',
    diagnosis: patient.diagnosis ?? '',
    medications,
    visitDate: toDatetimeLocalValue(patient.visitDate),
  }
}
