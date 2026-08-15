import Billing from '../models/Billing.js'
import { AppError } from '../utils/AppError.js'
import { requireObjectId } from '../utils/mongoId.js'
import { pipeBillPdf } from '../utils/pdfDocuments.js'
import { assertStudentInMaster } from '../utils/studentDirectory.js'

export async function createBill(req, res) {
  await assertStudentInMaster(req.body?.rollNo)
  const bill = await Billing.create(req.body)
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