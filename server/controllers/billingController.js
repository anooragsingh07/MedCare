import Billing from '../models/Billing.js'

export async function createBill(req, res) {
  const bill = await Billing.create(req.body)
  res.status(201).json({ success: true, data: bill })
}

export async function getBills(_req, res) {
  const bills = await Billing.find().sort({ createdAt: -1 }).lean()
  res.json({ success: true, count: bills.length, data: bills })
}
