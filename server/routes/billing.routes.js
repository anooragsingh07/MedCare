import { Router } from 'express'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { authorize } from '../middleware/auth.js'
import * as billingController from '../controllers/billingController.js'

const router = Router()

router.use(authorize('admin', 'staff'))

router.post('/', asyncHandler(billingController.createBill))
router.get('/', asyncHandler(billingController.getBills))
router.get('/:id/pdf', asyncHandler(billingController.getBillPdf))
router.get('/:id', asyncHandler(billingController.getBill))

export default router
