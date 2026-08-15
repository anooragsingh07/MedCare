import { Router } from 'express'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { authorize } from '../middleware/auth.js'
import * as studentController from '../controllers/studentController.js'

const router = Router()

router.use(authorize('admin'))

router.post('/import', asyncHandler(studentController.importStudents))
router.get('/lookup', asyncHandler(studentController.lookupStudent))

router
  .route('/')
  .get(asyncHandler(studentController.getStudents))
  .post(asyncHandler(studentController.createStudent))

router
  .route('/:id')
  .patch(asyncHandler(studentController.updateStudent))
  .delete(asyncHandler(studentController.deactivateStudent))

export default router