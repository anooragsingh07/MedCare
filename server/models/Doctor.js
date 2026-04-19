import mongoose from 'mongoose'

const { Schema } = mongoose

const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const slotTimeRegex = /^([01]\d|2[0-3]):[0-5]\d$/

const availabilitySchema = new Schema(
  {
    dayOfWeek: {
      type: String,
      required: true,
      enum: {
        values: days,
        message: '{VALUE} is not a valid weekday',
      },
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      trim: true,
      match: [slotTimeRegex, 'startTime must be HH:mm (24h)'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      trim: true,
      match: [slotTimeRegex, 'endTime must be HH:mm (24h)'],
    },
  },
  { _id: false },
)

const doctorSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [120, 'Name is too long'],
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
      minlength: [2, 'Specialization is too short'],
      maxlength: [100, 'Specialization is too long'],
    },
    availability: {
      type: [availabilitySchema],
      required: [true, 'Availability is required'],
      validate: [
        {
          validator(slots) {
            return Array.isArray(slots) && slots.length > 0
          },
          message: 'Add at least one availability slot',
        },
        {
          validator(slots) {
            return (slots || []).every((s) => !s.startTime || !s.endTime || s.startTime < s.endTime)
          },
          message: 'Each slot needs endTime after startTime',
        },
      ],
    },
  },
  { timestamps: true },
)

doctorSchema.index({ specialization: 1, name: 1 })

export default mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema)
