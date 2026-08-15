import User from '../models/User.js'
import { AppError } from '../utils/AppError.js'
import { signToken } from '../utils/jwt.js'

function shapeUser(user) {
  if (!user) return user
  const o = typeof user.toObject === 'function' ? user.toObject() : { ...user }
  const { passwordHash, _id, ...rest } = o
  return { ...rest, id: String(_id) }
}

export async function login(req, res) {
  const { uid, password } = req.body
  if (typeof uid !== 'string' || typeof password !== 'string' || !uid.trim() || !password) {
    throw new AppError('UID and password are required', 400)
  }

  const user = await User.findOne({ uid: uid.trim() })
  if (!user) throw new AppError('Invalid UID or password', 401)

  const ok = await user.comparePassword(password)
  if (!ok) throw new AppError('Invalid UID or password', 401)

  const token = signToken(user)
  res.json({ success: true, token, user: shapeUser(user) })
}

export async function me(req, res) {
  const user = await User.findById(req.user._id).lean()
  res.json({ success: true, user: shapeUser(user) })
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    throw new AppError('currentPassword and newPassword are required', 400)
  }
  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters', 400)
  }

  const user = await User.findById(req.user._id)
  if (!user) throw new AppError('This account no longer exists', 401)

  const ok = await user.comparePassword(currentPassword)
  if (!ok) throw new AppError('Current password is incorrect', 400)

  user.passwordHash = await User.hashPassword(newPassword)
  user.mustChangePassword = false
  await user.save()

  res.json({ success: true, message: 'Password updated', user: shapeUser(user) })
}