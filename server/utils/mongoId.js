import mongoose from 'mongoose'
import { AppError } from './AppError.js'

export function requireObjectId(id, label = 'Resource') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${label} id`, 400)
  }
}
