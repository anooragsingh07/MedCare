import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'medcare-dev-secret'

export function signToken(user) {
  return jwt.sign(
    { id: String(user._id), role: user.role },
    SECRET,
    { expiresIn: '7d' },
  )
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET)
}