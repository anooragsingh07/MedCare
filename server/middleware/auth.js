import User from '../models/User.js'
import { AppError } from '../utils/AppError.js'
import { verifyToken } from '../utils/jwt.js'

/**
 * Requires a valid Bearer token; loads the account and attaches it to req.user.
 */
export async function protect(req, _res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) throw new AppError('Not authorized — log in to continue', 401)

    let payload
    try {
      payload = verifyToken(token)
    } catch {
      throw new AppError('Session expired or invalid — log in again', 401)
    }

    const user = await User.findById(payload.id).lean()
    if (!user) throw new AppError('This account no longer exists', 401)

    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}

/** Restricts the current request to one or more roles. Must run after protect. */
export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError('You do not have permission to do that', 403)
    }
    next()
  }
}