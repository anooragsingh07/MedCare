/**
 * Inserts demo doctors, patients (with structured prescriptions), appointments, and bills.
 * Removes only documents tagged as demo (roll numbers DEMO-* / demo doctors) so your real rows stay safe.
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

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const DEMO_ROLL = /^DEMO-/i
const DEMO_DOCTOR = /^Demo\s/i
const DEMO_USER = /^(admin|staff|DEMO-)/i

const demoUsersData = [
  { name: 'Demo Administrator', uid: 'admin', role: 'admin', password: 'admin123' },
  { name: 'Demo Staff Nurse', uid: 'staff', role: 'staff', password: 'staff123' },
  { name: 'Arjun Nair', uid: 'DEMO-CS23045', role: 'student', password: 'student123' },
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
    rollNo: 'DEMO-CS23045',
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
    rollNo: 'DEMO-EC23012',
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
    rollNo: 'DEMO-ME23008',
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
    ])
    console.log('[seed] Removed all patients, appointments, bills, doctors, and users (--reset-all).')
  } else {
    const [dp, da, db, dd, du] = await Promise.all([
      Patient.deleteMany({ rollNo: DEMO_ROLL }),
      Appointment.deleteMany({ rollNo: DEMO_ROLL }),
      Billing.deleteMany({ rollNo: DEMO_ROLL }),
      Doctor.deleteMany({ name: DEMO_DOCTOR }),
      User.deleteMany({ uid: DEMO_USER }),
    ])
    console.log(
      `[seed] Cleared prior demo rows: patients ${dp.deletedCount}, appointments ${da.deletedCount}, bills ${db.deletedCount}, doctors ${dd.deletedCount}, users ${du.deletedCount}`,
    )
  }

  const doctors = await Doctor.insertMany(doctorsData)
  console.log(`[seed] Inserted ${doctors.length} demo doctors`)

  const patients = await Patient.insertMany(patientsData)
  console.log(`[seed] Inserted ${patients.length} demo patients`)

  const [p0, p1, p2] = patients
  const [d0, d1] = doctors

  const appointmentsData = [
    {
      patientName: p0.name,
      rollNo: p0.rollNo,
      department: p0.department,
      doctorName: d0.name,
      date: daysFromNow(1),
      time: '10:00',
      status: 'Scheduled',
    },
    {
      patientName: p1.name,
      rollNo: p1.rollNo,
      department: p1.department,
      doctorName: d0.name,
      date: daysFromNow(2),
      time: '14:30',
      status: 'Scheduled',
    },
    {
      patientName: p2.name,
      rollNo: p2.rollNo,
      department: p2.department,
      doctorName: d1.name,
      date: daysFromNow(-2),
      time: '11:00',
      status: 'Completed',
    },
  ]

  await Appointment.insertMany(appointmentsData)
  console.log(`[seed] Inserted ${appointmentsData.length} demo appointments`)

  const billsData = [
    {
      patientName: p0.name,
      rollNo: p0.rollNo,
      department: p0.department,
      medicinesCost: 320,
      consultationFee: 400,
      totalAmount: 720,
      paymentStatus: 'Paid',
    },
    {
      patientName: p1.name,
      rollNo: p1.rollNo,
      department: p1.department,
      medicinesCost: 280,
      consultationFee: 400,
      totalAmount: 680,
      paymentStatus: 'Pending',
    },
    {
      patientName: p2.name,
      rollNo: p2.rollNo,
      department: p2.department,
      medicinesCost: 150,
      consultationFee: 500,
      totalAmount: 650,
      paymentStatus: 'Unpaid',
    },
  ]

  await Billing.insertMany(billsData)
  console.log(`[seed] Inserted ${billsData.length} demo bills`)

  const usersWithHash = await Promise.all(
    demoUsersData.map(async ({ password, ...rest }) => ({
      ...rest,
      passwordHash: await User.hashPassword(password),
    })),
  )
  await User.insertMany(usersWithHash)
  console.log(`[seed] Inserted ${usersWithHash.length} demo user accounts`)

  console.log('[seed] Done. Open the app and filter or scroll for roll numbers starting with DEMO-.')
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error('[seed] Failed:', err)
  process.exit(1)
})
