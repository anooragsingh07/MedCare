import mongoose from 'mongoose'
import { AppError } from '../utils/AppError.js'

function validationMessages(err) {
  if (!(err instanceof mongoose.Error.ValidationError)) return null
  return Object.values(err.errors)
    .map((e) => e.message)
    .join('; ')
}

export function errorHandler(err, req, res, _next) {
  let statusCode = 500
  let message = 'Something went wrong'

  if (err instanceof AppError) {
    statusCode = err.statusCode
    message = err.message
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400
    message = validationMessages(err) || err.message
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400
    message = err.path === '_id' || err.kind === 'ObjectId' ? 'Invalid resource id' : err.message
  } else if (err.code === 11000) {
    statusCode = 409
    message = 'Duplicate key — this record already exists'
  } else if (
    err.name === 'MongoServerSelectionError' ||
    err.name === 'MongoNotConnectedError' ||
    err.message?.includes('Client must be connected')
  ) {
    statusCode = 503
    message = 'Database is unavailable. Check MONGODB_URI and that MongoDB is running.'
  } else {
    message = err.message || message
  }

  const body = { success: false, message }

  if (process.env.NODE_ENV === 'development' && statusCode >= 500) {
    body.detail = err.stack
  }

  res.status(statusCode).json(body)
}
