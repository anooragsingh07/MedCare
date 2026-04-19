import { Router } from 'express'
import { asyncHandler } from '../middleware/asyncHandler.js'
import * as billingController from '../controllers/billingController.js'

const router = Router()

router.post('/', asyncHandler(billingController.createBill))
router.get('/', asyncHandler(billingController.getBills))

export default router
