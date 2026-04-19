import Appointment from '../models/Appointment.js'
import { AppError } from '../utils/AppError.js'
import { requireObjectId } from '../utils/mongoId.js'

const ALLOWED_STATUS = ['Scheduled', 'Completed']

export async function bookAppointment(req, res) {
  const appointment = await Appointment.create(req.body)
  res.status(201).json({ success: true, data: appointment })
}

export async function getAppointments(_req, res) {
  const appointments = await Appointment.find().sort({ date: 1, time: 1 }).lean()
  res.json({ success: true, count: appointments.length, data: appointments })
}

export async function updateAppointmentStatus(req, res) {
  const { id } = req.params
  requireObjectId(id, 'Appointment')
  const { status } = req.body
  if (status == null || typeof status !== 'string') {
    throw new AppError('Body must include status (string)', 400)
  }
  if (!ALLOWED_STATUS.includes(status)) {
    throw new AppError(`status must be one of: ${ALLOWED_STATUS.join(', ')}`, 400)
  }

  const appointment = await Appointment.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true },
  ).lean()

  if (!appointment) throw new AppError('Appointment not found', 404)
  res.json({ success: true, data: appointment })
}

export async function deleteAppointment(req, res) {
  const { id } = req.params
  requireObjectId(id, 'Appointment')
  const deleted = await Appointment.findByIdAndDelete(id).lean()
  if (!deleted) throw new AppError('Appointment not found', 404)
  res.json({ success: true, message: 'Appointment deleted', data: deleted })
}
