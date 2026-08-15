import Patient from '../models/Patient.js'
import { AppError } from '../utils/AppError.js'
import { requireObjectId } from '../utils/mongoId.js'
import { normalizePrescriptionItems } from '../utils/prescriptionItems.js'
import { pipeCertificatePdf, pipePrescriptionPdf } from '../utils/pdfDocuments.js'
import { assertMemberInMaster } from '../utils/memberDirectory.js'

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function shapePatient(patient) {
  if (!patient) return patient
  const o = typeof patient.toObject === 'function' ? patient.toObject() : { ...patient }
  return {
    ...o,
    prescribedMedicines: normalizePrescriptionItems(o.prescribedMedicines),
  }
}

/** Members only see visits recorded under their own college ID. */
function scopeFilter(req) {
  if (req.user?.role === 'member') {
    return { collegeId: req.user.uid }
  }
  return {}
}

function assertStaffOrAdmin(req) {
  if (!req.user || !['admin', 'staff'].includes(req.user.role)) {
    throw new AppError('Only dispensary staff can manage patient records', 403)
  }
}

/** Fields a doctor may update during a consultation (clinical record only). */
const DOCTOR_WRITABLE_FIELDS = ['diagnosis', 'prescribedMedicines']

function pickFields(body, allowed) {
  return allowed.reduce((acc, key) => {
    if (body[key] !== undefined) acc[key] = body[key]
    return acc
  }, {})
}

export async function createPatient(req, res) {
  assertStaffOrAdmin(req)
  await assertMemberInMaster(req.body?.collegeId)
  const patient = await Patient.create(req.body)
  res.status(201).json({ success: true, data: shapePatient(patient) })
}

export async function getPatients(req, res) {
  const raw = typeof req.query.search === 'string' ? req.query.search.trim() : ''
  const filter = scopeFilter(req)
  if (raw) {
    const esc = escapeRegex(raw)
    filter.$or = [
      { name: { $regex: esc, $options: 'i' } },
      { collegeId: { $regex: esc, $options: 'i' } },
      { department: { $regex: esc, $options: 'i' } },
    ]
  }
  const patients = await Patient.find(filter).sort({ visitDate: -1 }).lean()
  res.json({
    success: true,
    count: patients.length,
    data: patients.map(shapePatient),
  })
}

export async function getPatient(req, res) {
  const { id } = req.params
  requireObjectId(id, 'Patient')
  const patient = await Patient.findOne({ _id: id, ...scopeFilter(req) }).lean()
  if (!patient) throw new AppError('Patient not found', 404)
  res.json({ success: true, data: shapePatient(patient) })
}

export async function getPrescriptionPdf(req, res) {
  const { id } = req.params
  requireObjectId(id, 'Patient')
  const patient = await Patient.findOne({ _id: id, ...scopeFilter(req) }).lean()
  if (!patient) throw new AppError('Patient not found', 404)
  pipePrescriptionPdf(shapePatient(patient), res)
}

export async function getCertificatePdf(req, res) {
  const { id } = req.params
  requireObjectId(id, 'Patient')
  const patient = await Patient.findOne({ _id: id, ...scopeFilter(req) }).lean()
  if (!patient) throw new AppError('Patient not found', 404)
  pipeCertificatePdf(
    shapePatient(patient),
    {
      to: typeof req.query.to === 'string' ? req.query.to : undefined,
      reason: typeof req.query.reason === 'string' ? req.query.reason : undefined,
    },
    res,
  )
}

export async function updatePatient(req, res) {
  const { id } = req.params
  requireObjectId(id, 'Patient')

  if (req.user?.role === 'doctor') {
    const updates = pickFields(req.body, DOCTOR_WRITABLE_FIELDS)
    if (Object.keys(updates).length === 0) {
      throw new AppError('Doctors can only update diagnosis and prescribed medicines', 400)
    }
    const patient = await Patient.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean()
    if (!patient) throw new AppError('Patient not found', 404)
    res.json({ success: true, data: shapePatient(patient) })
    return
  }

  assertStaffOrAdmin(req)
  await assertMemberInMaster(req.body?.collegeId)
  const patient = await Patient.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).lean()
  if (!patient) throw new AppError('Patient not found', 404)
  res.json({ success: true, data: shapePatient(patient) })
}

export async function deletePatient(req, res) {
  assertStaffOrAdmin(req)
  const { id } = req.params
  requireObjectId(id, 'Patient')
  const deleted = await Patient.findByIdAndDelete(id).lean()
  if (!deleted) throw new AppError('Patient not found', 404)
  res.json({ success: true, message: 'Patient deleted', data: shapePatient(deleted) })
}
