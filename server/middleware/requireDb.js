import mongoose from 'mongoose'
import { AppError } from '../utils/AppError.js'

/**
 * Returns 503 immediately when MongoDB is not ready, instead of buffering until timeout.
 */
export function requireDb(_req, _res, next) {
  if (mongoose.connection.readyState !== 1) {
    next(
      new AppError(
        'Database is not connected. Fix MONGODB_URI, confirm your Atlas password (URL-encode special characters), and allow your IP in Network Access.',
        503,
      ),
    )
    return
  }
  next()
}
