import Student from '../models/Student.js'
import { AppError } from '../utils/AppError.js'
import { requireObjectId } from '../utils/mongoId.js'

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function getStudents(req, res) {
  const raw = typeof req.query.search === 'string' ? req.query.search.trim() : ''
  const filter = {}
  if (raw) {
    const esc = escapeRegex(raw)
    filter.$or = [
      { uid: { $regex: esc, $options: 'i' } },
      { name: { $regex: esc, $options: 'i' } },
      { department: { $regex: esc, $options: 'i' } },
    ]
  }
  const students = await Student.find(filter).sort({ uid: 1 }).lean()
  res.json({ success: true, count: students.length, data: students })
}

export async function lookupStudent(req, res) {
  const uid = typeof req.query.uid === 'string' ? req.query.uid.trim() : ''
  if (!uid) {
    res.json({ success: true, found: false, data: null })
    return
  }
  const student = await Student.findOne({ uid, isActive: true }).lean()
  res.json({ success: true, found: Boolean(student), data: student ?? null })
}

export async function createStudent(req, res) {
  const student = await Student.create(req.body)
  res.status(201).json({ success: true, data: student })
}

export async function importStudents(req, res) {
  const rows = Array.isArray(req.body?.students) ? req.body.students : []
  if (rows.length === 0) throw new AppError('Provide a students array to import', 400)

  let inserted = 0
  let skipped = 0
  for (const row of rows) {
    const uid = String(row.uid ?? '').trim()
    const name = String(row.name ?? '').trim()
    const department = String(row.department ?? '').trim()
    if (!uid || !name || !department) {
      skipped += 1
      continue
    }
    const update = {
      uid,
      name,
      department,
      year: String(row.year ?? '').trim(),
      phone: String(row.phone ?? '').trim(),
      gender: ['Male', 'Female', 'Other'].includes(row.gender) ? row.gender : 'Other',
      address: String(row.address ?? '').trim(),
      isActive: row.isActive !== false,
    }
    await Student.updateOne(
      { uid },
      { $set: update },
      { upsert: true },
    )
    inserted += 1
  }

  res.json({
    success: true,
    message: `Imported ${inserted} student(s)${skipped ? ` (${skipped} invalid row(s) skipped)` : ''}`,
    count: inserted,
    skipped,
  })
}

export async function updateStudent(req, res) {
  const { id } = req.params
  requireObjectId(id, 'Student')
  const student = await Student.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).lean()
  if (!student) throw new AppError('Student not found', 404)
  res.json({ success: true, data: student })
}

export async function deactivateStudent(req, res) {
  const { id } = req.params
  requireObjectId(id, 'Student')
  const student = await Student.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true, runValidators: true },
  ).lean()
  if (!student) throw new AppError('Student not found', 404)
  res.json({ success: true, message: 'Student deactivated', data: student })
}