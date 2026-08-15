import Member from '../models/Member.js'
import { AppError } from '../utils/AppError.js'
import { requireObjectId } from '../utils/mongoId.js'

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function getMembers(req, res) {
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
  const members = await Member.find(filter).sort({ category: 1, uid: 1 }).lean()
  res.json({ success: true, count: members.length, data: members })
}

export async function lookupMember(req, res) {
  const uid = typeof req.query.uid === 'string' ? req.query.uid.trim() : ''
  if (!uid) {
    res.json({ success: true, found: false, data: null })
    return
  }
  const member = await Member.findOne({ uid, isActive: true }).lean()
  res.json({ success: true, found: Boolean(member), data: member ?? null })
}

export async function createMember(req, res) {
  const member = await Member.create(req.body)
  res.status(201).json({ success: true, data: member })
}

export async function importMembers(req, res) {
  const rows = Array.isArray(req.body?.members) ? req.body.members : []
  if (rows.length === 0) throw new AppError('Provide a members array to import', 400)

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
    const category = row.category === 'teacher' ? 'teacher' : 'student'
    const update = {
      uid,
      category,
      name,
      department,
      year: String(row.year ?? '').trim(),
      phone: String(row.phone ?? '').trim(),
      gender: ['Male', 'Female', 'Other'].includes(row.gender) ? row.gender : 'Other',
      address: String(row.address ?? '').trim(),
      isActive: row.isActive !== false,
    }
    await Member.updateOne({ uid }, { $set: update }, { upsert: true })
    inserted += 1
  }

  res.json({
    success: true,
    message: `Imported ${inserted} member(s)${skipped ? ` (${skipped} invalid row(s) skipped)` : ''}`,
    count: inserted,
    skipped,
  })
}

export async function updateMember(req, res) {
  const { id } = req.params
  requireObjectId(id, 'Member')
  const member = await Member.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).lean()
  if (!member) throw new AppError('Member not found', 404)
  res.json({ success: true, data: member })
}

export async function deactivateMember(req, res) {
  const { id } = req.params
  requireObjectId(id, 'Member')
  const member = await Member.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true, runValidators: true },
  ).lean()
  if (!member) throw new AppError('Member not found', 404)
  res.json({ success: true, message: 'Member deactivated', data: member })
}