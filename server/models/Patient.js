import mongoose from 'mongoose'

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
      type: [
        {
          type: String,
          trim: true,
          minlength: [1, 'Medicine name cannot be empty'],
          maxlength: [200, 'Medicine name is too long'],
        },
      ],
      default: [],
      validate: {
        validator(arr) {
          return arr.length <= 50
        },
        message: 'Cannot prescribe more than 50 medicines on one visit',
      },
    },
    visitDate: {
      type: Date,
      required: [true, 'Visit date is required'],
    },
  },
  { timestamps: true },
)

patientSchema.index({ visitDate: -1 })
patientSchema.index({ phone: 1 })

export default mongoose.models.Patient || mongoose.model('Patient', patientSchema)
