import { Router } from 'express'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { protect } from '../middleware/auth.js'
import * as authController from '../controllers/authController.js'

const router = Router()

router.post('/login', asyncHandler(authController.login))
router.get('/me', protect, asyncHandler(authController.me))
router.patch('/password', protect, asyncHandler(authController.changePassword))

export default router