import User from '../models/User.js'
import Member from '../models/Member.js'
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

export async function register(req, res) {
  const { uid, name, category, department, password } = req.body
  if (
    typeof uid !== 'string' ||
    typeof name !== 'string' ||
    typeof password !== 'string' ||
    !uid.trim() ||
    !name.trim() ||
    !password
  ) {
    throw new AppError('UID, name and password are required', 400)
  }
  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400)
  }

  const collegeId = uid.trim()
  const member = await Member.findOne({ uid: collegeId, isActive: true })
  if (!member) {
    throw new AppError(
      `"${collegeId}" is not in the college members directory — ask the dispensary admin to add you first`,
      400,
    )
  }
  const nameMatches =
    String(member.name).trim().toLowerCase() === name.trim().toLowerCase()
  if (!nameMatches) {
    throw new AppError(`Name does not match the directory entry for "${collegeId}"`, 400)
  }
  if (category && !['student', 'teacher'].includes(category)) {
    throw new AppError('category must be student or teacher', 400)
  }
  if (member.category !== (category === 'teacher' ? 'teacher' : 'student')) {
    throw new AppError(`"${collegeId}" is listed as a ${member.category}, not a ${category}`, 400)
  }
  if (department && String(department).trim().toLowerCase() !== String(member.department).trim().toLowerCase()) {
    throw new AppError('Department does not match the directory entry', 400)
  }

  const existing = await User.findOne({ uid: collegeId })
  if (existing) throw new AppError('An account for this UID already exists — log in instead', 400)

  const user = await User.create({
    name: member.name,
    uid: collegeId,
    role: 'member',
    passwordHash: await User.hashPassword(password),
  })

  const token = signToken(user)
  res.status(201).json({ success: true, token, user: shapeUser(user) })
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