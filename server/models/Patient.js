import mongoose from 'mongoose'
import { coercePrescriptionItemsFromBody } from '../utils/prescriptionItems.js'

const { Schema } = mongoose

const phoneRegex = /^[\d\s+().-]{7,20}$/

const patientSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [0, 'Age cannot be negative'],
      max: [130, 'Age looks invalid'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: {
        values: ['Male', 'Female', 'Other'],
        message: '{VALUE} is not a supported gender option',
      },
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
      match: [phoneRegex, 'Enter a valid phone number (7–20 digits/symbols)'],
    },
    collegeId: {
      type: String,
      required: [true, 'College ID is required'],
      trim: true,
      minlength: [1, 'College ID is required'],
      maxlength: [64, 'College ID is too long'],
    },
    category: {
      type: String,
      enum: {
        values: ['student', 'teacher'],
        message: '{VALUE} is not a valid category',
      },
      default: 'student',
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      minlength: [1, 'Department is required'],
      maxlength: [120, 'Department name is too long'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      minlength: [5, 'Address is too short'],
      maxlength: [500, 'Address is too long'],
    },
    symptoms: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Symptoms description is too long'],
    },
    diagnosis: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Diagnosis text is too long'],
    },
    prescribedMedicines: {
      type: [Schema.Types.Mixed],
      default: [],
      validate: {
        validator(arr) {
          if (!Array.isArray(arr) || arr.length > 50) return false
          return arr.every((item) => {
            if (typeof item === 'string') return item.trim().length > 0 && item.length <= 200
            if (item && typeof item === 'object') {
              const name = String(item.medicine ?? item.name ?? '').trim()
              return name.length > 0 && name.length <= 200
            }
            return false
          })
        },
        message: 'Each medicine must have a name (max 200 chars); max 50 lines',
      },
    },
    visitDate: {
      type: Date,
      required: [true, 'Visit date is required'],
    },
  },
  { timestamps: true },
)

patientSchema.pre('validate', function patientNormalizeMeds(next) {
  if (this.prescribedMedicines != null) {
    this.prescribedMedicines = coercePrescriptionItemsFromBody(this.prescribedMedicines)
  }
  next()
})

patientSchema.index({ visitDate: -1 })
patientSchema.index({ collegeId: 1 })
patientSchema.index({ phone: 1 })

export default mongoose.models.Patient || mongoose.model('Patient', patientSchema)
