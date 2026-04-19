import { Router } from 'express'
import { asyncHandler } from '../middleware/asyncHandler.js'
import * as appointmentController from '../controllers/appointmentController.js'

const router = Router()

router.post('/', asyncHandler(appointmentController.bookAppointment))
router.get('/', asyncHandler(appointmentController.getAppointments))
router.patch('/:id/status', asyncHandler(appointmentController.updateAppointmentStatus))
router.delete('/:id', asyncHandler(appointmentController.deleteAppointment))

export default router
