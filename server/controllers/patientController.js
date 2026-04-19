import Patient from '../models/Patient.js'
import { AppError } from '../utils/AppError.js'
import { requireObjectId } from '../utils/mongoId.js'
import { normalizePrescriptionItems } from '../utils/prescriptionItems.js'
import { pipePrescriptionPdf } from '../utils/pdfDocuments.js'

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

export async function createPatient(req, res) {
  const patient = await Patient.create(req.body)
  res.status(201).json({ success: true, data: shapePatient(patient) })
}

export async function getPatients(req, res) {
  const raw = typeof req.query.search === 'string' ? req.query.search.trim() : ''
  const filter = {}
  if (raw) {
    const esc = escapeRegex(raw)
    filter.$or = [
      { name: { $regex: esc, $options: 'i' } },
      { rollNo: { $regex: esc, $options: 'i' } },
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
  const patient = await Patient.findById(id).lean()
  if (!patient) throw new AppError('Patient not found', 404)
  res.json({ success: true, data: shapePatient(patient) })
}

export async function getPrescriptionPdf(req, res) {
  const { id } = req.params
  requireObjectId(id, 'Patient')
  const patient = await Patient.findById(id).lean()
  if (!patient) throw new AppError('Patient not found', 404)
  pipePrescriptionPdf(shapePatient(patient), res)
}

export async function updatePatient(req, res) {
  const { id } = req.params
  requireObjectId(id, 'Patient')
  const patient = await Patient.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).lean()
  if (!patient) throw new AppError('Patient not found', 404)
  res.json({ success: true, data: shapePatient(patient) })
}

export async function deletePatient(req, res) {
  const { id } = req.params
  requireObjectId(id, 'Patient')
  const deleted = await Patient.findByIdAndDelete(id).lean()
  if (!deleted) throw new AppError('Patient not found', 404)
  res.json({ success: true, message: 'Patient deleted', data: shapePatient(deleted) })
}
