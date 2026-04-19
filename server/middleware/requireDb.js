import mongoose from 'mongoose'

/**
 * Returns 503 when MongoDB is not connected so clients fail fast instead of hanging
 * until Mongoose operation timeouts.
 */
export function requireDb(req, res, next) {
  if (mongoose.connection.readyState === 1) {
    return next()
  }
  return res.status(503).json({
    success: false,
    message:
      'Database is not connected. Set a valid MONGODB_URI in server/.env, restart the API, and confirm Atlas network access.',
  })
}
