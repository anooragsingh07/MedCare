import { z } from 'zod'

const phoneRegex = /^[\d\s+().-]{7,20}$/

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
  address: z.string().trim().min(5, 'Address must be at least 5 characters').max(500),
  symptoms: z.preprocess((v) => (v == null ? '' : String(v)), z.string().max(2000)),
  diagnosis: z.preprocess((v) => (v == null ? '' : String(v)), z.string().max(2000)),
  prescribedMedicines: z.preprocess((v) => (v == null ? '' : String(v)), z.string()),
  visitDate: z.string().min(1, 'Visit date is required'),
})

export function toPatientPayload(data) {
  const meds = String(data.prescribedMedicines ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return {
    name: data.name.trim(),
    age: typeof data.age === 'number' ? data.age : Number(data.age),
    gender: data.gender,
    phone: data.phone.trim(),
    address: data.address.trim(),
    symptoms: String(data.symptoms ?? '').trim(),
    diagnosis: String(data.diagnosis ?? '').trim(),
    prescribedMedicines: meds,
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
  if (!patient) {
    return {
      name: '',
      age: '',
      gender: 'Male',
      phone: '',
      address: '',
      symptoms: '',
      diagnosis: '',
      prescribedMedicines: '',
      visitDate: '',
    }
  }
  return {
    name: patient.name ?? '',
    age: patient.age ?? '',
    gender: patient.gender ?? 'Male',
    phone: patient.phone ?? '',
    address: patient.address ?? '',
    symptoms: patient.symptoms ?? '',
    diagnosis: patient.diagnosis ?? '',
    prescribedMedicines: Array.isArray(patient.prescribedMedicines)
      ? patient.prescribedMedicines.join(', ')
      : '',
    visitDate: toDatetimeLocalValue(patient.visitDate),
  }
}
