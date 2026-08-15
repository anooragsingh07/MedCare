import mongoose from 'mongoose'

const { Schema } = mongoose

/**
 * College members master directory — every student or teacher who may use the
 * dispensary. `uid` is the college ID (7-digit roll number for students,
 * EMP-… code for teachers) used for login and patient records.
 */
const memberSchema = new Schema(
  {
    uid: {
      type: String,
      required: [true, 'UID is required'],
      unique: true,
      trim: true,
      minlength: [2, 'UID must be at least 2 characters'],
      maxlength: [64, 'UID is too long'],
    },
    category: {
      type: String,
      enum: {
        values: ['student', 'teacher'],
        message: '{VALUE} is not a valid category',
      },
      default: 'student',
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [120, 'Name is too long'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      minlength: [1, 'Department is required'],
      maxlength: [120, 'Department is too long'],
    },
    year: {
      type: String,
      trim: true,
      default: '',
      maxlength: [20, 'Year is too long'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      maxlength: [20, 'Phone is too long'],
    },
    gender: {
      type: String,
      enum: {
        values: ['Male', 'Female', 'Other'],
        message: '{VALUE} is not a supported gender option',
      },
      default: 'Other',
    },
    address: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Address is too long'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

memberSchema.index({ department: 1, uid: 1 })

export default mongoose.models.Member || mongoose.model('Member', memberSchema)