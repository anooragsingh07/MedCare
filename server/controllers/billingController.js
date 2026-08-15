import Billing from '../models/Billing.js'
import Medicine from '../models/Medicine.js'
import { AppError } from '../utils/AppError.js'
import { requireObjectId } from '../utils/mongoId.js'
import { pipeBillPdf } from '../utils/pdfDocuments.js'
import { assertStudentInMaster } from '../utils/studentDirectory.js'

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Check stock before recording a dispensary issue (throws 409 if insufficient). */
async function assertInventory(medicineItems) {
  if (!Array.isArray(medicineItems) || medicineItems.length === 0) return
  for (const item of medicineItems) {
    const name = String(item.name || '').trim()
    const qty = Number(item.qty) || 0
    if (!name || qty <= 0) continue
    const med = await Medicine.findOne({ name: { $regex: `^${escapeRegex(name)}$`, $options: 'i' } })
    if (!med) continue
    if (med.stock < qty) {
      throw new AppError(`Insufficient stock for "${name}" — available ${med.stock}, requested ${qty}`, 409)
    }
  }
}

/** Deduct dispensed quantities from tracked inventory (untracked names are skipped). */
async function deductInventory(medicineItems) {
  if (!Array.isArray(medicineItems) || medicineItems.length === 0) return
  for (const item of medicineItems) {
    const name = String(item.name || '').trim()
    const qty = Number(item.qty) || 0
    if (!name || qty <= 0) continue
    const med = await Medicine.findOne({ name: { $regex: `^${escapeRegex(name)}$`, $options: 'i' } })
    if (!med) continue
    await Medicine.updateOne({ _id: med._id }, { $inc: { stock: -qty } })
  }
}

export async function createBill(req, res) {
  await assertStudentInMaster(req.body?.rollNo)
  const items = Array.isArray(req.body?.medicineItems) ? req.body.medicineItems : []
  await assertInventory(items)
  const bill = await Billing.create(req.body)
  await deductInventory(items)
  res.status(201).json({ success: true, data: bill })
}

export async function getBills(_req, res) {
  const bills = await Billing.find().sort({ createdAt: -1 }).lean()
  res.json({ success: true, count: bills.length, data: bills })
}

export async function getBill(req, res) {
  const { id } = req.params
  requireObjectId(id, 'Bill')
  const bill = await Billing.findById(id).lean()
  if (!bill) throw new AppError('Bill not found', 404)
  res.json({ success: true, data: bill })
}

export async function getBillPdf(req, res) {
  const { id } = req.params
  requireObjectId(id, 'Bill')
  const bill = await Billing.findById(id).lean()
  if (!bill) throw new AppError('Bill not found', 404)
  pipeBillPdf(bill, res)
}