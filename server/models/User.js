import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const { Schema } = mongoose

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [120, 'Name is too long'],
    },
    uid: {
      type: String,
      required: [true, 'Login UID is required'],
      trim: true,
      unique: true,
      minlength: [2, 'UID must be at least 2 characters'],
      maxlength: [64, 'UID is too long'],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ['admin', 'doctor', 'staff', 'member'],
        message: '{VALUE} is not a valid role',
      },
      default: 'member',
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

userSchema.index({ role: 1 })

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash)
}

userSchema.statics.hashPassword = function hashPassword(plain) {
  return bcrypt.hash(plain, 10)
}

export default mongoose.models.User || mongoose.model('User', userSchema)