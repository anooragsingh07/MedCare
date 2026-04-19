import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import PDFDocument from 'pdfkit'
import { normalizePrescriptionItems } from './prescriptionItems.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Matches client `index.css` — hospital (soft blue) theme */
const PRIMARY_STRONG = '#2563eb'
const PRIMARY_DEEP = '#1d4ed8'
const PRIMARY_BAR = '#dbeafe'
const PRIMARY_SOFT = '#eff6ff'
const TEXT = '#0f172a'
const MUTED = '#64748b'

/** Side panel padding & vertical rhythm (prescription + bill) */
const PANEL_PAD = 12
const SP = {
  /** After coloured title bar */
  afterBar: 12,
  /** Between stacked detail lines */
  line: 12,
  /** After multi-line blocks (name, address, etc.) */
  block: 16,
  /** Between major sections (Address → Symptoms) */
  section: 20,
  /** Under main H1 (Prescription / Invoice) */
  titleMeta: 16,
}

/** Helvetica often lacks ₹; use Rs. + grouped decimals for invoice tables */
function formatMoneyPdf(n) {
  const v = Number(n) || 0
  const s = v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `Rs. ${s}`
}

function formatDateTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return '—'
  }
}

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-IN', { dateStyle: 'long' })
  } catch {
    return '—'
  }
}

function resolveBillLogoPath() {
  const envPath = process.env.BILL_LOGO_PATH
  if (envPath && fs.existsSync(envPath)) return envPath
  const bundled = path.join(__dirname, '..', 'assets', 'bill-logo.png')
  if (fs.existsSync(bundled)) return bundled
  return null
}

/** Vector pill + cross (medical mark) when no PNG logo */
function drawMedCareVectorMark(doc, x, y, h = 34) {
  const w = 28
  doc.save()
  doc.roundedRect(x, y, w, h, 9).fill(PRIMARY_STRONG)
  doc.strokeColor('#ffffff').lineWidth(2.2)
  const cx = x + w / 2
  const cy = y + h / 2
  doc.moveTo(cx - 7, cy).lineTo(cx + 7, cy).stroke()
  doc.moveTo(cx, cy - 7).lineTo(cx, cy + 7).stroke()
  doc.restore()
}

function drawInvoiceBackground(doc, pageW, pageH) {
  doc.save()
  doc.fillColor(PRIMARY_SOFT).opacity(0.65)
  doc.circle(70, pageH - 90, 95).fill()
  doc.circle(pageW - 75, 130, 110).fill()
  doc.fillColor(PRIMARY_BAR).opacity(0.45)
  doc.circle(pageW - 40, pageH - 50, 45).fill()
  doc.circle(45, 55, 38).fill()
  doc.restore()
}

function drawBrandRow(doc, margin, y, markH) {
  const logoPath = resolveBillLogoPath()
  if (logoPath) {
    try {
      doc.image(logoPath, margin, y, { height: markH })
    } catch {
      drawMedCareVectorMark(doc, margin, y, markH)
    }
  } else {
    drawMedCareVectorMark(doc, margin, y, markH)
  }
  const textAfterLogo = margin + 38
  doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(17).text('MedCare', textAfterLogo, y + 8)
}

function blockHeight(doc, text, width, options = {}) {
  if (!text) return 0
  try {
    return doc.heightOfString(String(text), { width, ...options })
  } catch {
    return 36
  }
}

function invoiceNumberFromBill(bill) {
  const id = String(bill._id || '')
  const tail = id.replace(/\W/g, '').slice(-8).toUpperCase()
  return tail ? `INV-${tail}` : 'INV-MEDCARE'
}

function prescriptionRef(patient) {
  const id = String(patient._id || '')
  const tail = id.replace(/\W/g, '').slice(-8).toUpperCase()
  return tail ? `RX-${tail}` : 'RX-MEDCARE'
}

/** One line: muted "Label:" then bold value; returns next Y below block (supports wrap). */
function drawPanelLabelValue(doc, x, y, innerW, label, value, valueSize = 10) {
  const vx = String(value ?? '—').trim()
  doc.font('Helvetica-Bold').fontSize(9).fillColor(MUTED).text(`${label}: `, x, y, { continued: true, lineBreak: false })
  doc.font('Helvetica-Bold').fontSize(valueSize).fillColor(TEXT).text(vx, { width: innerW, lineBreak: true, lineGap: 3 })
  const combined = `${label}: ${vx}`
  return y + blockHeight(doc, combined, innerW, { lineGap: 3 })
}

function drawPatientSidePanel(doc, panelX, panelW, y, patient) {
  let yR = y
  const innerW = panelW - 2 * PANEL_PAD
  const xIn = panelX + PANEL_PAD

  doc.save()
  doc.roundedRect(panelX, yR, panelW, 24, 6).fill(PRIMARY_BAR)
  doc.fillColor(PRIMARY_DEEP).font('Helvetica-Bold').fontSize(10).text('Patient', panelX + PANEL_PAD, yR + 7)
  doc.restore()
  yR += 24 + SP.afterBar

  yR = drawPanelLabelValue(doc, xIn, yR, innerW, 'Name', patient.name || '—', 10.5)
  yR += SP.line

  doc.font('Helvetica').fontSize(9.5).fillColor(MUTED).lineGap(3)
  doc.text(`Roll no: ${String(patient.rollNo || '—').trim()}`, xIn, yR, { width: innerW })
  yR += SP.line
  doc.text(`Department: ${String(patient.department || '—').trim()}`, xIn, yR, { width: innerW })
  yR += SP.line
  doc.text(`Phone: ${String(patient.phone || '—').trim()}`, xIn, yR, { width: innerW })
  yR += SP.line
  doc.text(`Age / Gender: ${patient.age ?? '—'} · ${patient.gender ?? '—'}`, xIn, yR, { width: innerW })
  yR += SP.block
  return yR
}

function drawPdfFooter(doc, margin, contentW, pageH) {
  const web = process.env.MEDCARE_WEBSITE || 'www.medcare.example'
  const phone = process.env.MEDCARE_PHONE || '+91 1800-XXX-XXXX'
  const addr = process.env.MEDCARE_ADDRESS || 'MedCare Health Centre'

  doc.font('Helvetica').fontSize(8).fillColor(PRIMARY_STRONG)
  doc.text(`${web}   ·   ${phone}   ·   ${addr}`, margin, pageH - margin - 22, {
    width: contentW,
    align: 'center',
  })
  doc.fillColor(MUTED).fontSize(7.5).text('Thank you for choosing MedCare.', margin, pageH - margin - 10, {
    width: contentW,
    align: 'center',
  })
}

export function pipePrescriptionPdf(patient, res) {
  const meds = normalizePrescriptionItems(patient.prescribedMedicines)
  const margin = 40
  const doc = new PDFDocument({ size: 'A4', margin })
  const filename = `medcare-prescription-${String(patient._id).slice(-8)}.pdf`
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

  doc.pipe(res)

  const pageW = doc.page.width
  const pageH = doc.page.height
  const contentW = pageW - 2 * margin

  drawInvoiceBackground(doc, pageW, pageH)

  const panelW = 208
  const panelX = pageW - margin - panelW
  const markH = 36
  let y = margin

  drawBrandRow(doc, margin, y, markH)

  const yPatientEnd = drawPatientSidePanel(doc, panelX, panelW, y, patient)

  y += markH + 12
  doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(26).text('Prescription', margin, y)
  y += 36
  doc.font('Helvetica').fontSize(10).fillColor(MUTED).lineGap(4)
  doc.text(`Reference: ${prescriptionRef(patient)}`, margin, y)
  y += SP.titleMeta
  doc.text(`Visit date: ${formatDateTime(patient.visitDate)}`, margin, y)
  y += SP.titleMeta + 4

  y = Math.max(y, yPatientEnd) + SP.section

  doc.font('Helvetica-Bold').fontSize(10).fillColor(PRIMARY_DEEP).text('Address', margin, y)
  y += SP.titleMeta
  doc.font('Helvetica').fontSize(10).fillColor('#334155').lineGap(4)
  doc.text(patient.address?.trim() || '—', margin, y, { width: contentW })
  y += blockHeight(doc, patient.address?.trim() || '—', contentW, { lineGap: 4 }) + SP.section

  doc.font('Helvetica-Bold').fontSize(10).fillColor(PRIMARY_DEEP).text('Symptoms', margin, y)
  y += SP.titleMeta
  doc.font('Helvetica').fontSize(10).fillColor('#334155').lineGap(4)
  doc.text(patient.symptoms?.trim() || '—', margin, y, { width: contentW })
  y += blockHeight(doc, patient.symptoms?.trim() || '—', contentW, { lineGap: 4 }) + SP.section

  doc.font('Helvetica-Bold').fontSize(10).fillColor(PRIMARY_DEEP).text('Diagnosis', margin, y)
  y += SP.titleMeta
  doc.font('Helvetica').fontSize(10).fillColor('#334155').lineGap(4)
  doc.text(patient.diagnosis?.trim() || '—', margin, y, { width: contentW })
  y += blockHeight(doc, patient.diagnosis?.trim() || '—', contentW, { lineGap: 4 }) + SP.section

  const headerH = 28
  const rowH = 22
  const colMed = margin
  const colMedW = contentW * 0.58
  const colDose = colMed + colMedW
  const colDoseW = contentW - colMedW

  doc.save()
  doc.roundedRect(margin, y, contentW, headerH, 12).fill(PRIMARY_BAR)
  doc.fillColor(PRIMARY_DEEP).font('Helvetica-Bold').fontSize(8.5)
  doc.text('MEDICINE', colMed + 10, y + 9, { width: colMedW - 18 })
  doc.text('DOSAGE', colDose, y + 9, { width: colDoseW - 10, align: 'right' })
  doc.restore()

  let rowY = y + headerH + 10
  doc.font('Helvetica').fontSize(10).fillColor('#334155')

  if (meds.length === 0) {
    doc.fillColor(MUTED).fontSize(10).text('No medicines recorded on this visit.', margin + 10, rowY, {
      width: contentW - 20,
    })
    rowY += rowH + 4
  } else {
    meds.forEach((m) => {
      doc.fillColor(TEXT).font('Helvetica-Bold').text(m.medicine, colMed + 10, rowY, { width: colMedW - 18 })
      doc.font('Helvetica').fillColor('#475569').text(m.dosage || '—', colDose, rowY, {
        width: colDoseW - 10,
        align: 'right',
      })
      rowY += rowH + 4
    })
  }

  rowY += SP.block + 4
  doc.fontSize(8.5).fillColor(MUTED).text(
    'This document is generated from MedCare records. Follow your clinician’s advice.',
    margin,
    rowY,
    { width: contentW, align: 'center', lineGap: 2 },
  )

  drawPdfFooter(doc, margin, contentW, pageH)

  doc.end()
}

export function pipeBillPdf(bill, res) {
  const margin = 40
  const doc = new PDFDocument({ size: 'A4', margin })
  const filename = `medcare-invoice-${String(bill._id).slice(-8)}.pdf`
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

  doc.pipe(res)

  const pageW = doc.page.width
  const pageH = doc.page.height
  const contentW = pageW - 2 * margin

  drawInvoiceBackground(doc, pageW, pageH)

  const billToW = 208
  const billToX = pageW - margin - billToW
  let y = margin
  const markH = 36

  drawBrandRow(doc, margin, y, markH)

  const billPad = PANEL_PAD
  const billInnerW = billToW - 2 * billPad
  const billXIn = billToX + billPad

  let yR = y
  doc.save()
  doc.roundedRect(billToX, yR, billToW, 24, 6).fill(PRIMARY_BAR)
  doc.fillColor(PRIMARY_DEEP).font('Helvetica-Bold').fontSize(10).text('Bill to', billToX + billPad, yR + 7)
  doc.restore()
  yR += 24 + SP.afterBar

  yR = drawPanelLabelValue(doc, billXIn, yR, billInnerW, 'Name', bill.patientName || '—', 10.5)
  yR += SP.line

  doc.font('Helvetica').fontSize(9.5).fillColor(MUTED).lineGap(3)
  doc.text(`Roll no: ${String(bill.rollNo || '—').trim()}`, billXIn, yR, { width: billInnerW })
  yR += SP.line
  doc.text(`Department: ${String(bill.department || '—').trim()}`, billXIn, yR, { width: billInnerW })
  yR += SP.line
  doc.text('MedCare patient billing', billXIn, yR, { width: billInnerW, lineGap: 3 })
  yR += blockHeight(doc, 'MedCare patient billing', billInnerW, { lineGap: 3 }) + SP.block

  y += markH + 12
  doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(26).text('Invoice', margin, y)
  y += 36
  doc.font('Helvetica').fontSize(10).fillColor(MUTED).lineGap(4)
  doc.text(`Number: ${invoiceNumberFromBill(bill)}`, margin, y)
  y += SP.titleMeta
  doc.text(`Date: ${formatDate(bill.createdAt)}`, margin, y)
  y += SP.titleMeta + 4

  y = Math.max(y, yR) + SP.section

  const headerH = 28
  const rowH = 24
  const colDesc = margin
  const colDescW = contentW * 0.48
  const colQty = colDesc + colDescW
  const colQtyW = contentW * 0.1
  const colPrice = colQty + colQtyW
  const colPriceW = contentW * 0.19
  const colTotal = colPrice + colPriceW
  const colTotalW = contentW - (colTotal - margin)

  doc.save()
  doc.roundedRect(margin, y, contentW, headerH, 12).fill(PRIMARY_BAR)
  doc.fillColor(PRIMARY_DEEP).font('Helvetica-Bold').fontSize(8.5)
  doc.text('DESCRIPTION', colDesc + 10, y + 9, { width: colDescW - 18 })
  doc.text('QTY', colQty, y + 9, { width: colQtyW, align: 'center' })
  doc.text('PRICE', colPrice, y + 9, { width: colPriceW - 4, align: 'right' })
  doc.text('TOTAL', colTotal, y + 9, { width: colTotalW - 8, align: 'right' })
  doc.restore()

  let rowY = y + headerH + 10
  doc.font('Helvetica').fontSize(10).fillColor('#334155')

  const medCost = Number(bill.medicinesCost) || 0
  const consult = Number(bill.consultationFee) || 0
  const lineItems = [
    { desc: 'Medicines & pharmacy charges', qty: 1, price: medCost, total: medCost },
    { desc: 'Consultation fee', qty: 1, price: consult, total: consult },
  ]

  lineItems.forEach((row) => {
    doc.text(row.desc, colDesc + 10, rowY, { width: colDescW - 18 })
    doc.text(String(row.qty), colQty, rowY, { width: colQtyW, align: 'center' })
    doc.text(formatMoneyPdf(row.price), colPrice, rowY, { width: colPriceW - 4, align: 'right' })
    doc.text(formatMoneyPdf(row.total), colTotal, rowY, { width: colTotalW - 8, align: 'right' })
    rowY += rowH + 4
  })

  rowY += SP.block

  const subTotal = medCost + consult
  const tax = 0
  const grand = Number(bill.totalAmount) || subTotal

  const sumValX = colTotal
  const sumValW = colTotalW - 8
  const sumLabelW = 86
  const sumLabelX = sumValX - sumLabelW - 6

  doc.font('Helvetica').fontSize(10).fillColor('#334155')
  doc.text('Sub Total', sumLabelX, rowY, { width: sumLabelW, align: 'right' })
  doc.text(formatMoneyPdf(subTotal), sumValX, rowY, { width: sumValW, align: 'right' })
  rowY += SP.line + 4
  doc.text('Tax', sumLabelX, rowY, { width: sumLabelW, align: 'right' })
  doc.text(formatMoneyPdf(tax), sumValX, rowY, { width: sumValW, align: 'right' })
  rowY += SP.line + 6
  doc.font('Helvetica-Bold').fontSize(12).fillColor(TEXT)
  doc.text('Total', sumLabelX, rowY, { width: sumLabelW, align: 'right' })
  doc.text(formatMoneyPdf(grand), sumValX, rowY, { width: sumValW, align: 'right' })
  rowY += SP.block + 8

  doc.font('Helvetica-Bold').fontSize(9).fillColor(PRIMARY_DEEP)
  doc.text(`Status: ${bill.paymentStatus || '—'}`, margin, rowY)
  rowY += SP.section + 8

  const footGap = 12
  const footW = contentW / 2 - footGap
  const footRight = margin + contentW / 2 + footGap

  doc.fillColor(PRIMARY_STRONG).font('Helvetica-Bold').fontSize(10).text('PAYMENT TERMS', margin, rowY)
  doc.font('Helvetica').fontSize(8.5).fillColor(MUTED).lineGap(4).text(
    'Payment is due within 15 days of the invoice date. Please quote the invoice number on remittance. For billing support, contact the MedCare reception desk.',
    margin,
    rowY + 18,
    { width: footW },
  )

  doc.fillColor(PRIMARY_STRONG).font('Helvetica-Bold').fontSize(10).text('PAYMENT METHOD', footRight, rowY)
  doc.font('Helvetica').fontSize(8.5).fillColor(MUTED).lineGap(4).text(
    'Cash, card, UPI, or bank transfer accepted at campus billing.\nBank details: as provided on your payment receipt or at the desk.',
    footRight,
    rowY + 18,
    { width: footW },
  )

  drawPdfFooter(doc, margin, contentW, pageH)

  doc.end()
}
