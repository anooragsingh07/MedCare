import Appointment from '../models/Appointment.js'
import { AppError } from '../utils/AppError.js'
import { requireObjectId } from '../utils/mongoId.js'
import { findMember } from '../utils/memberDirectory.js'

const ALLOWED_STATUS = ['Scheduled', 'Completed']

function scopeFilter(req) {
  if (req.user?.role === 'member') {
    return { collegeId: req.user.uid }
  }
  return {}
}

function assertStaffOrAdmin(req) {
  if (!req.user || !['admin', 'staff'].includes(req.user.role)) {
    throw new AppError('Only dispensary staff can manage appointments', 403)
  }
}

function assertSchedulable(req) {
  if (!req.user || !['admin', 'staff', 'member'].includes(req.user.role)) {
    throw new AppError('You do not have permission to book appointments', 403)
  }
}

export async function bookAppointment(req, res) {
  assertSchedulable(req)

  if (req.user?.role === 'member') {
    const member = await findMember(req.user.uid)
    if (!member) {
      throw new AppError('Your college ID is not in the members directory', 403)
    }
    const { doctorName, date, time } = req.body
    if (typeof doctorName !== 'string' || !doctorName.trim()) {
      throw new AppError('Choose a doctor for your appointment', 400)
    }
    if (typeof date !== 'string' || !date) {
      throw new AppError('Pick an appointment date', 400)
    }
    if (typeof time !== 'string' || !time.trim()) {
      throw new AppError('Pick an appointment time', 400)
    }
    const appointment = await Appointment.create({
      patientName: member.name,
      collegeId: member.uid,
      category: member.category,
      department: member.department,
      doctorName: doctorName.trim(),
      date,
      time,
      status: 'Scheduled',
    })
    res.status(201).json({ success: true, data: appointment })
    return
  }

  const appointment = await Appointment.create(req.body)
  res.status(201).json({ success: true, data: appointment })
}

export async function getAppointments(req, res) {
  const appointments = await Appointment.find(scopeFilter(req)).sort({ date: 1, time: 1 }).lean()
  res.json({ success: true, count: appointments.length, data: appointments })
}

export async function updateAppointmentStatus(req, res) {
  if (!req.user || !['admin', 'staff', 'doctor'].includes(req.user.role)) {
    throw new AppError('You do not have permission to update appointment status', 403)
  }
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

  if (req.user?.role === 'member') {
    const own = await Appointment.findOne({ _id: id, collegeId: req.user.uid }).lean()
    if (!own) throw new AppError('Appointment not found', 404)
    const deleted = await Appointment.findByIdAndDelete(id).lean()
    res.json({ success: true, message: 'Appointment cancelled', data: deleted })
    return
  }

  assertStaffOrAdmin(req)
  const deleted = await Appointment.findByIdAndDelete(id).lean()
  if (!deleted) throw new AppError('Appointment not found', 404)
  res.json({ success: true, message: 'Appointment deleted', data: deleted })
}