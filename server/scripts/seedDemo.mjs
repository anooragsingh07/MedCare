/**
 * Inserts demo doctors, patients (with structured prescriptions), appointments, bills,
 * college members, medicines, and user accounts.
 * Removes only documents tagged as demo so your real rows stay safe.
 *
 * Usage (from server/):
 *   npm run seed:demo
 *
 * Full database wipe (destructive — requires ALLOW_FULL_DB_RESET=yes):
 *   ALLOW_FULL_DB_RESET=yes npm run seed:demo -- --reset-all
 */
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Patient from '../models/Patient.js'
import Appointment from '../models/Appointment.js'
import Billing from '../models/Billing.js'
import Doctor from '../models/Doctor.js'
import User from '../models/User.js'
import Member from '../models/Member.js'
import Medicine from '../models/Medicine.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

/** 7-digit college roll numbers + a teacher EMP code used for demo rows. */
const DEMO_MEMBER_UIDS = ['2337373', '2337374', '2337375', 'EMP-1001']
/** Matches demo rows under the old "DEMO-xxxxx" format so a re-seed can clean them up too. */
const DEMO_ROLL_LEGACY = /^DEMO-/i
const DEMO_USER = {
  $or: [{ uid: { $in: DEMO_MEMBER_UIDS } }, { uid: /^(admin|staff|DR-2301|DEMO-)/i }],
}
const DEMO_DOCTOR = /^Demo\s/i
const DEMO_MEDICINE_NAMES = [
  'Paracetamol 500 mg (strip of 10)',
  'Oral rehydration salts (ORS)',
  'Cetirizine 10 mg (strip of 10)',
  'Fluticasone nasal spray',
  'Diclofenac gel 1% (20 g)',
  'Crepe bandage',
  'Ibuprofen 400 mg (strip of 10)',
]

const demoMembersData = [
  {
    uid: '2337373',
    category: 'student',
    name: 'Arjun Nair',
    department: 'Computer Science',
    year: '3rd Year',
    phone: '+91 98765 11101',
    gender: 'Male',
    address: 'Block A, University Hostel, Demo City',
  },
  {
    uid: '2337374',
    category: 'student',
    name: 'Meera Krishnan',
    department: 'Electronics & Communication',
    year: '2nd Year',
    phone: '+91 98765 11102',
    gender: 'Female',
    address: 'PG accommodation, Sector 4, Demo City',
  },
  {
    uid: '2337375',
    category: 'student',
    name: 'Vikram Desai',
    department: 'Mechanical Engineering',
    year: '3rd Year',
    phone: '+91 98765 11103',
    gender: 'Male',
    address: 'Day scholar, Demo City',
  },
  {
    uid: 'EMP-1001',
    category: 'teacher',
    name: 'Prof. Kavitha Raman',
    department: 'Electronics & Communication',
    year: '',
    phone: '+91 98765 11104',
    gender: 'Female',
    address: 'Staff quarters, Demo City',
  },
]

const demoUsersData = [
  { name: 'Demo Administrator', uid: 'admin', role: 'admin', password: 'admin123' },
  { name: 'Demo Staff Nurse', uid: 'staff', role: 'staff', password: 'staff123' },
  { name: 'Demo Dr. Ananya Iyer', uid: 'DR-2301', role: 'doctor', password: 'doctor123' },
  { name: 'Arjun Nair', uid: '2337373', role: 'member', password: 'student123' },
  { name: 'Prof. Kavitha Raman', uid: 'EMP-1001', role: 'member', password: 'teacher123' },
]

function daysFromNow(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  d.setHours(12, 0, 0, 0)
  return d
}

const doctorsData = [
  {
    name: 'Demo Dr. Ananya Iyer',
    specialization: 'General Medicine (Demo)',
    availability: [
      { dayOfWeek: 'Monday', startTime: '09:00', endTime: '12:00' },
      { dayOfWeek: 'Monday', startTime: '14:00', endTime: '17:00' },
      { dayOfWeek: 'Wednesday', startTime: '10:00', endTime: '13:00' },
      { dayOfWeek: 'Friday', startTime: '09:00', endTime: '11:30' },
    ],
  },
  {
    name: 'Demo Dr. Rohan Mehta',
    specialization: 'Orthopedics (Demo)',
    availability: [
      { dayOfWeek: 'Tuesday', startTime: '10:00', endTime: '14:00' },
      { dayOfWeek: 'Thursday', startTime: '09:00', endTime: '12:00' },
      { dayOfWeek: 'Saturday', startTime: '09:00', endTime: '11:00' },
    ],
  },
]

const patientsData = [
  {
    name: 'Arjun Nair',
    age: 21,
    gender: 'Male',
    phone: '+91 98765 11101',
    collegeId: '2337373',
    category: 'student',
    department: 'Computer Science',
    address: 'Block A, University Hostel, Demo City',
    symptoms: 'Sore throat, low-grade fever for 2 days',
    diagnosis: 'Acute viral pharyngitis (illustrative)',
    prescribedMedicines: [
      { medicine: 'Paracetamol 500 mg', dosage: '1 tablet every 6 hours if temperature > 38°C; max 4 per day' },
      { medicine: 'Warm saline gargles', dosage: '3–4 times daily for 3 days' },
      { medicine: 'Oral rehydration salts (ORS)', dosage: '1 sachet in 200 mL water after each episode of loose stools' },
    ],
    visitDate: daysFromNow(-5),
  },
  {
    name: 'Meera Krishnan',
    age: 20,
    gender: 'Female',
    phone: '+91 98765 11102',
    collegeId: '2337374',
    category: 'student',
    department: 'Electronics & Communication',
    address: 'PG accommodation, Sector 4, Demo City',
    symptoms: 'Itchy eyes, sneezing in mornings',
    diagnosis: 'Allergic rhinitis (illustrative)',
    prescribedMedicines: [
      { medicine: 'Cetirizine 10 mg', dosage: '1 tablet at bedtime for 7 days' },
      { medicine: 'Fluticasone nasal spray', dosage: '1 spray per nostril once daily for 2 weeks' },
    ],
    visitDate: daysFromNow(-3),
  },
  {
    name: 'Vikram Desai',
    age: 22,
    gender: 'Male',
    phone: '+91 98765 11103',
    collegeId: '2337375',
    category: 'student',
    department: 'Mechanical Engineering',
    address: 'Day scholar, Demo City',
    symptoms: 'Right ankle pain after sports; mild swelling',
    diagnosis: 'Grade I lateral ankle sprain (illustrative)',
    prescribedMedicines: [
      { medicine: 'Diclofenac gel 1%', dosage: 'Apply thin layer to affected area twice daily for 5 days' },
      { medicine: 'Rest, ice, compression, elevation (RICE)', dosage: '15 min ice every 2–3 hours for first 48 hours' },
    ],
    visitDate: daysFromNow(-1),
  },
  {
    name: 'Prof. Kavitha Raman',
    age: 45,
    gender: 'Female',
    phone: '+91 98765 11104',
    collegeId: 'EMP-1001',
    category: 'teacher',
    department: 'Electronics & Communication',
    address: 'Staff quarters, Demo City',
    symptoms: 'Recurrent headache episodes, sensitivity to light',
    diagnosis: 'Migraine without aura (illustrative)',
    prescribedMedicines: [
      { medicine: 'Ibuprofen 400 mg', dosage: '1 tablet at onset of headache, max 3 per week' },
      { medicine: 'Adequate hydration and regular sleep', dosage: 'Maintain 7–8 hours sleep, keep a headache diary' },
    ],
    visitDate: daysFromNow(-2),
  },
]

const demoMedicinesData = [
  { name: 'Paracetamol 500 mg (strip of 10)', category: 'Analgesics', unit: 'strip', stock: 40, costPrice: 28, reorderLevel: 10 },
  { name: 'Oral rehydration salts (ORS)', category: 'Electrolytes', unit: 'sachet', stock: 60, costPrice: 12, reorderLevel: 20 },
  { name: 'Cetirizine 10 mg (strip of 10)', category: 'Antihistamines', unit: 'strip', stock: 25, costPrice: 45, reorderLevel: 8 },
  { name: 'Fluticasone nasal spray', category: 'Respiratory', unit: 'bottle', stock: 8, costPrice: 235, reorderLevel: 4 },
  { name: 'Diclofenac gel 1% (20 g)', category: 'Topical', unit: 'tube', stock: 30, costPrice: 92, reorderLevel: 10 },
  { name: 'Crepe bandage', category: 'Consumables', unit: 'piece', stock: 18, costPrice: 58, reorderLevel: 6 },
  { name: 'Ibuprofen 400 mg (strip of 10)', category: 'Analgesics', unit: 'strip', stock: 5, costPrice: 35, reorderLevel: 8 },
]

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI is not set. Copy server/.env.example to server/.env and add your connection string.')
    process.exit(1)
  }

  const resetAll = process.argv.includes('--reset-all')
  if (resetAll && process.env.ALLOW_FULL_DB_RESET !== 'yes') {
    console.error('Refusing --reset-all without ALLOW_FULL_DB_RESET=yes (this deletes every row in all collections).')
    process.exit(1)
  }

  await mongoose.connect(uri)
  console.log('[seed] Connected to MongoDB')

  if (resetAll) {
    await Promise.all([
      Patient.deleteMany({}),
      Appointment.deleteMany({}),
      Billing.deleteMany({}),
      Doctor.deleteMany({}),
      User.deleteMany({}),
      Member.deleteMany({}),
      Medicine.deleteMany({}),
    ])
    console.log('[seed] Removed all patients, appointments, bills, doctors, users, members, and medicines (--reset-all).')
  } else {
    const demoUids = { $in: DEMO_MEMBER_UIDS }
    const [dp, da, db, dd, du, dm, dmed] = await Promise.all([
      Patient.deleteMany({ $or: [{ collegeId: demoUids }, { collegeId: DEMO_ROLL_LEGACY }] }),
      Appointment.deleteMany({ $or: [{ collegeId: demoUids }, { collegeId: DEMO_ROLL_LEGACY }] }),
      Billing.deleteMany({ $or: [{ collegeId: demoUids }, { collegeId: DEMO_ROLL_LEGACY }] }),
      Doctor.deleteMany({ name: DEMO_DOCTOR }),
      User.deleteMany({ ...DEMO_USER }),
      Member.deleteMany({ $or: [{ uid: demoUids }, { uid: DEMO_ROLL_LEGACY }] }),
      Medicine.deleteMany({ name: { $in: DEMO_MEDICINE_NAMES } }),
    ])
    console.log(
      `[seed] Cleared prior demo rows: patients ${dp.deletedCount}, appointments ${da.deletedCount}, bills ${db.deletedCount}, doctors ${dd.deletedCount}, users ${du.deletedCount}, members ${dm.deletedCount}, medicines ${dmed.deletedCount}`,
    )
  }

  const doctors = await Doctor.insertMany(doctorsData)
  console.log(`[seed] Inserted ${doctors.length} demo doctors`)

  const patients = await Patient.insertMany(patientsData)
  console.log(`[seed] Inserted ${patients.length} demo patients`)

  const [p0, p1, p2, p3] = patients
  const [d0, d1] = doctors

  const appointmentsData = [
    {
      patientName: p0.name,
      collegeId: p0.collegeId,
      category: p0.category,
      department: p0.department,
      doctorName: d0.name,
      date: daysFromNow(1),
      time: '10:00',
      status: 'Scheduled',
    },
    {
      patientName: p1.name,
      collegeId: p1.collegeId,
      category: p1.category,
      department: p1.department,
      doctorName: d0.name,
      date: daysFromNow(2),
      time: '14:30',
      status: 'Scheduled',
    },
    {
      patientName: p2.name,
      collegeId: p2.collegeId,
      category: p2.category,
      department: p2.department,
      doctorName: d1.name,
      date: daysFromNow(-2),
      time: '11:00',
      status: 'Completed',
    },
    {
      patientName: p3.name,
      collegeId: p3.collegeId,
      category: p3.category,
      department: p3.department,
      doctorName: d0.name,
      date: daysFromNow(0),
      time: '09:30',
      status: 'Scheduled',
    },
  ]

  await Appointment.insertMany(appointmentsData)
  console.log(`[seed] Inserted ${appointmentsData.length} demo appointments`)

  const billsData = [
    {
      patientName: p0.name,
      collegeId: p0.collegeId,
      category: p0.category,
      department: p0.department,
      medicineItems: [
        { name: 'Paracetamol 500 mg (strip of 10)', qty: 2, cost: 28 },
        { name: 'Oral rehydration salts (ORS)', qty: 4, cost: 12 },
      ],
      costAmount: 104,
      note: 'Dispensed free for viral pharyngitis visit',
    },
    {
      patientName: p1.name,
      collegeId: p1.collegeId,
      category: p1.category,
      department: p1.department,
      medicineItems: [
        { name: 'Cetirizine 10 mg (strip of 10)', qty: 1, cost: 45 },
        { name: 'Fluticasone nasal spray', qty: 1, cost: 235 },
      ],
      costAmount: 280,
      note: 'Dispensed free for allergic rhinitis visit',
    },
    {
      patientName: p2.name,
      collegeId: p2.collegeId,
      category: p2.category,
      department: p2.department,
      medicineItems: [
        { name: 'Diclofenac gel 1% (20 g)', qty: 1, cost: 92 },
        { name: 'Crepe bandage', qty: 2, cost: 58 },
      ],
      costAmount: 208,
      note: 'Dispensed free for ankle sprain visit',
    },
  ]

  await Billing.insertMany(billsData)
  console.log(`[seed] Inserted ${billsData.length} demo bills`)

  const members = await Member.insertMany(demoMembersData)
  console.log(`[seed] Inserted ${members.length} demo college members`)

  const medicines = await Medicine.insertMany(demoMedicinesData)
  console.log(`[seed] Inserted ${medicines.length} demo medicines`)

  const usersWithHash = await Promise.all(
    demoUsersData.map(async ({ password, ...rest }) => ({
      ...rest,
      passwordHash: await User.hashPassword(password),
    })),
  )
  await User.insertMany(usersWithHash)
  console.log(`[seed] Inserted ${usersWithHash.length} demo user accounts`)

  console.log(
    '[seed] Done. Demo logins: admin/admin123 · staff/staff123 · doctor DR-2301/doctor123 · student 2337373/student123 · teacher EMP-1001/teacher123',
  )
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error('[seed] Failed:', err)
  process.exit(1)
})