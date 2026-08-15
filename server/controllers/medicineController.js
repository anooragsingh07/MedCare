import Medicine from '../models/Medicine.js'
import { AppError } from '../utils/AppError.js'
import { requireObjectId } from '../utils/mongoId.js'

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function isLowStock(medicine) {
  return Number(medicine.stock) <= Number(medicine.reorderLevel)
}

export async function getMedicines(req, res) {
  const raw = typeof req.query.search === 'string' ? req.query.search.trim() : ''
  const filter = {}
  if (raw) {
    const esc = escapeRegex(raw)
    filter.$or = [
      { name: { $regex: esc, $options: 'i' } },
      { category: { $regex: esc, $options: 'i' } },
    ]
  }
  const medicines = await Medicine.find(filter).sort({ name: 1 }).lean()
  res.json({
    success: true,
    count: medicines.length,
    lowStock: medicines.filter(isLowStock).length,
    data: medicines.map((m) => ({ ...m, lowStock: isLowStock(m) })),
  })
}

export async function createMedicine(req, res) {
  const medicine = await Medicine.create(req.body)
  res.status(201).json({ success: true, data: medicine })
}

export async function updateMedicine(req, res) {
  const { id } = req.params
  requireObjectId(id, 'Medicine')
  const medicine = await Medicine.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).lean()
  if (!medicine) throw new AppError('Medicine not found', 404)
  res.json({ success: true, data: { ...medicine, lowStock: isLowStock(medicine) } })
}

export async function adjustStock(req, res) {
  const { id } = req.params
  requireObjectId(id, 'Medicine')
  const delta = Number(req.body?.delta)
  if (!Number.isFinite(delta) || delta === 0) {
    throw new AppError('Provide a non-zero delta to adjust stock', 400)
  }
  const medicine = await Medicine.findByIdAndUpdate(
    id,
    { $inc: { stock: delta } },
    { new: true, runValidators: true },
  ).lean()
  if (!medicine) throw new AppError('Medicine not found', 404)
  res.json({ success: true, data: { ...medicine, lowStock: isLowStock(medicine) } })
}

export async function deactivateMedicine(req, res) {
  const { id } = req.params
  requireObjectId(id, 'Medicine')
  const medicine = await Medicine.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true, runValidators: true },
  ).lean()
  if (!medicine) throw new AppError('Medicine not found', 404)
  res.json({ success: true, message: 'Medicine deactivated', data: medicine })
}