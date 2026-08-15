import { Router } from 'express'
import authRoutes from './auth.routes.js'
import patientRoutes from './patient.routes.js'
import appointmentRoutes from './appointment.routes.js'
import billingRoutes from './billing.routes.js'
import doctorRoutes from './doctor.routes.js'
import studentRoutes from './student.routes.js'
import medicineRoutes from './medicine.routes.js'
import { notFoundHandler } from '../middleware/notFound.js'
import { requireDb } from '../middleware/requireDb.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(requireDb)

router.use('/auth', authRoutes)
router.use(protect)

router.use('/patients', patientRoutes)
router.use('/students', studentRoutes)
router.use('/medicines', medicineRoutes)
router.use('/appointments', appointmentRoutes)
router.use('/bills', billingRoutes)
router.use('/doctors', doctorRoutes)

router.use(notFoundHandler)

export default router
