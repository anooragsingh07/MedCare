import Doctor from '../models/Doctor.js'

export async function addDoctor(req, res) {
  const doctor = await Doctor.create(req.body)
  res.status(201).json({ success: true, data: doctor })
}

export async function getDoctors(_req, res) {
  const doctors = await Doctor.find().sort({ name: 1 }).lean()
  res.json({ success: true, count: doctors.length, data: doctors })
}
