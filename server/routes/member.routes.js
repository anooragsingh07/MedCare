import { Router } from 'express'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { authorize } from '../middleware/auth.js'
import * as memberController from '../controllers/memberController.js'

const router = Router()

router.use(authorize('admin'))

router.post('/import', asyncHandler(memberController.importMembers))
router.get('/lookup', asyncHandler(memberController.lookupMember))

router
  .route('/')
  .get(asyncHandler(memberController.getMembers))
  .post(asyncHandler(memberController.createMember))

router
  .route('/:id')
  .patch(asyncHandler(memberController.updateMember))
  .delete(asyncHandler(memberController.deactivateMember))

export default router