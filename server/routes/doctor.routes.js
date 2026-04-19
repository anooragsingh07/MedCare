import { Router } from 'express'
import { asyncHandler } from '../middleware/asyncHandler.js'
import * as doctorController from '../controllers/doctorController.js'

const router = Router()

router.post('/', asyncHandler(doctorController.addDoctor))
router.get('/', asyncHandler(doctorController.getDoctors))

export default router
