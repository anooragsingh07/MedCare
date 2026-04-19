import { Router } from 'express'
import patientRoutes from './patient.routes.js'
import appointmentRoutes from './appointment.routes.js'
import billingRoutes from './billing.routes.js'
import doctorRoutes from './doctor.routes.js'
import { notFoundHandler } from '../middleware/notFound.js'

const router = Router()

router.use('/patients', patientRoutes)
router.use('/appointments', appointmentRoutes)
router.use('/bills', billingRoutes)
router.use('/doctors', doctorRoutes)

router.use(notFoundHandler)

export default router
