import { Router } from 'express'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { authorize } from '../middleware/auth.js'
import * as medicineController from '../controllers/medicineController.js'

const router = Router()

router.use(authorize('admin', 'staff'))

router
  .route('/')
  .get(asyncHandler(medicineController.getMedicines))
  .post(asyncHandler(medicineController.createMedicine))

router.post('/:id/stock', asyncHandler(medicineController.adjustStock))
router
  .route('/:id')
  .patch(asyncHandler(medicineController.updateMedicine))
  .delete(asyncHandler(medicineController.deactivateMedicine))

export default router