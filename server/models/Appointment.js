import mongoose from 'mongoose'

const { Schema } = mongoose

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/

const appointmentSchema = new Schema(
  {
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
      minlength: [2, 'Patient name must be at least 2 characters'],
      maxlength: [120, 'Patient name is too long'],
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
    doctorName: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
      minlength: [2, 'Doctor name must be at least 2 characters'],
      maxlength: [120, 'Doctor name is too long'],
    },
    date: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    time: {
      type: String,
      required: [true, 'Appointment time is required'],
      trim: true,
      match: [timeRegex, 'Time must be in 24-hour HH:mm format'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['Scheduled', 'Completed'],
        message: 'Status must be Scheduled or Completed',
      },
      default: 'Scheduled',
    },
  },
  { timestamps: true },
)

appointmentSchema.index({ date: 1, time: 1 })
appointmentSchema.index({ status: 1 })

export default mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema)
