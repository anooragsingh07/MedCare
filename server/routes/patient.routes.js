import { Router } from 'express'
import { asyncHandler } from '../middleware/asyncHandler.js'
import * as patientController from '../controllers/patientController.js'

const router = Router()

router
  .route('/')
  .get(asyncHandler(patientController.getPatients))
  .post(asyncHandler(patientController.createPatient))

router
  .route('/:id')
  .get(asyncHandler(patientController.getPatient))
  .patch(asyncHandler(patientController.updatePatient))
  .delete(asyncHandler(patientController.deletePatient))

export default router
