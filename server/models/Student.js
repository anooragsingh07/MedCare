import mongoose from 'mongoose'

const { Schema } = mongoose

const studentSchema = new Schema(
  {
    uid: {
      type: String,
      required: [true, 'UID is required'],
      unique: true,
      trim: true,
      minlength: [2, 'UID must be at least 2 characters'],
      maxlength: [64, 'UID is too long'],
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
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

studentSchema.index({ department: 1, uid: 1 })

export default mongoose.models.Student || mongoose.model('Student', studentSchema)